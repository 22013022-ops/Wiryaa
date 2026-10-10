const ContactRequest = require('../models/ContactRequest')
const Notification = require('../models/Notification')
const HireTalentsJobPost = require('../models/HireTalentsJobPost')
const JPMatchedCandidates = require('../models/JPMatchedCandidates')
const JSMatchedJobs = require('../models/JSMatchedJobs')
const Connection = require('../models/Connection')
const AppError = require('../utils/AppError')
const FindJobsProfile = require('../models/FindJobsProfile')
const User = require('../models/User')
const { normalizeLanguage, translateFieldsForViewer } = require('../services/translationService')

async function createRequest(req, res) {
  const { jobPostId, candidateId, type } = req.body
  if (!['contact_request', 'connect_invite'].includes(type) || !jobPostId) throw new AppError('A valid recommendation is required.', 400)
  const jobPost = await HireTalentsJobPost.findById(jobPostId).select('user jobTitle').lean()
  if (!jobPost) throw new AppError('The recommended job is no longer available.', 404)
  let toUser
  if (type === 'contact_request') {
    const [match, legacyMatch] = await Promise.all([
      JSMatchedJobs.findOne({ user: req.user.id, 'jobs.job': jobPost._id }).select('_id').lean(),
      JPMatchedCandidates.findOne({ jobPost: jobPost._id, 'candidates.user': req.user.id }).select('_id').lean(),
    ])
    if (!match && !legacyMatch) throw new AppError('This job is not in your recommendations.', 403)
    toUser = jobPost.user
  } else {
    if (!candidateId || String(jobPost.user) !== String(req.user.id)) throw new AppError('You cannot invite this candidate.', 403)
    const match = await JPMatchedCandidates.findOne({ jobPost: jobPost._id, 'candidates.user': candidateId }).select('_id').lean()
    if (!match) throw new AppError('This candidate is not in your recommendations.', 403)
    toUser = candidateId
  }
  if (String(toUser) === String(req.user.id)) throw new AppError('You cannot send a request to yourself.', 400)
  const requestFilter = { fromUser: req.user.id, toUser, jobPost: jobPost._id, type }
  let request = await ContactRequest.findOne({ ...requestFilter, status: { $in: ['pending', 'accepted'] } }).sort({ updatedAt: -1 })
  let created = false
  if (!request) {
    try {
      request = await ContactRequest.create(requestFilter)
      created = true
    } catch (error) {
      if (error.code !== 11000) throw error
      request = await ContactRequest.findOne({ ...requestFilter, status: 'pending' })
    }
  }
  if (created) await Notification.create({ user: toUser, sender: req.user.id, request: request._id, type })
  res.status(created ? 201 : 200).json({ status: 'success', data: { request, sent: true } })
}

async function listNotifications(req, res) {
  const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(100)
    .populate('sender', 'fullName').populate({ path: 'request', populate: { path: 'jobPost', select: 'jobTitle jobTitleEnglish companyName' } }).lean()
  const unreadCount = await Notification.countDocuments({ user: req.user.id, isRead: false })
  res.json({ status: 'success', data: { notifications, unreadCount } })
}

async function sentRequests(req, res) {
  const ids = String(req.query.ids || '').split(',').filter((id) => /^[a-f\d]{24}$/i.test(id))
  const filter = { fromUser: req.user.id, type: req.query.type }
  if (!['contact_request', 'connect_invite'].includes(filter.type)) throw new AppError('A valid request type is required.', 400)
  if (filter.type === 'contact_request') filter.jobPost = { $in: ids }
  else { filter.toUser = { $in: ids }; if (req.query.jobPostId) filter.jobPost = req.query.jobPostId }
  const requests = await ContactRequest.find({ ...filter, status: { $in: ['pending', 'accepted'] } }).select('jobPost toUser status').lean()
  res.json({ status: 'success', data: { requests } })
}

async function markRead(req, res) {
  const notification = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, { $set: { isRead: true } }, { new: true })
  if (!notification) throw new AppError('Notification not found.', 404)
  res.json({ status: 'success', data: { notification } })
}

async function decideRequest(req, res) {
  const { decision } = req.body
  if (!['accepted', 'rejected'].includes(decision)) throw new AppError('Choose accept or reject.', 400)
  const request = await ContactRequest.findOneAndUpdate({ _id: req.params.id, toUser: req.user.id, status: 'pending' }, { $set: { status: decision } }, { new: true })
  if (!request) {
    const exists = await ContactRequest.exists({ _id: req.params.id, toUser: req.user.id })
    if (!exists) throw new AppError('Request not found.', 404)
    throw new AppError('This request has already been handled.', 409)
  }
  await Notification.updateMany({ request: request._id, user: req.user.id, type: { $in: ['contact_request', 'connect_invite'] } }, { $set: { isRead: true } })
  if (decision === 'accepted') {
    const [userA, userB] = [String(request.fromUser), String(request.toUser)].sort()
    await Connection.findOneAndUpdate({ userA, userB }, { $setOnInsert: { userA, userB, request: request._id } }, { upsert: true, new: true })
    await Notification.create([
      { user: request.fromUser, sender: req.user.id, request: request._id, type: 'request_accepted' },
      { user: request.toUser, sender: request.fromUser, request: request._id, type: 'connection_created' },
    ])
  } else {
    await Notification.create({ user: request.fromUser, sender: req.user.id, request: request._id, type: 'request_rejected' })
  }
  res.json({ status: 'success', data: { request } })
}

async function cancelRequest(req, res) {
  const request = await ContactRequest.findOneAndUpdate({ _id: req.params.id, fromUser: req.user.id, status: 'pending' }, { $set: { status: 'cancelled' } }, { new: true })
  if (!request) {
    const exists = await ContactRequest.exists({ _id: req.params.id, fromUser: req.user.id })
    if (!exists) throw new AppError('Request not found.', 404)
    throw new AppError('Only pending requests can be cancelled.', 409)
  }
  await Notification.updateMany({ request: request._id, user: request.toUser, type: { $in: ['contact_request', 'connect_invite'] } }, { $set: { isRead: true } })
  await Notification.create({ user: request.toUser, sender: req.user.id, request: request._id, type: 'request_cancelled' })
  res.json({ status: 'success', data: { request } })
}

async function profileSummary(userId, viewerIsCandidate, language) {
  if (viewerIsCandidate) {
    const post = await HireTalentsJobPost.findOne({ user: userId }).select('jobTitle jobTitleEnglish companyName location locationEnglish').lean()
    const localized = await translateFieldsForViewer(post, ['jobTitle', 'companyName', 'location'], language)
    return { summary: [localized?.jobTitle, localized?.companyName, localized?.location].filter(Boolean).join(' · '), jobPostId: post?._id }
  }
  const profile = await FindJobsProfile.findOne({ user: userId }).select('name skills previousJobs qualification city state').lean()
  const localized = await translateFieldsForViewer(profile, ['name', 'skills', 'previousJobs', 'qualification', 'city', 'state'], language)
  return { summary: [localized?.skills, localized?.previousJobs, localized?.qualification].filter(Boolean).join(' · ') }
}

async function listConnections(req, res) {
  const { tab } = req.query
  if (!['received', 'sent', 'connected'].includes(tab)) throw new AppError('Choose a valid connections tab.', 400)
  const viewerIsCandidate = req.user.gender === 'Female'
  const language = normalizeLanguage(req.query.language)
  let rows
  if (tab === 'connected') {
    const acceptedRequests = await ContactRequest.find({ status: 'accepted', $or: [{ fromUser: req.user.id }, { toUser: req.user.id }] }).select('_id fromUser toUser').lean()
    await Promise.all(acceptedRequests.map((request) => {
      const [userA, userB] = [String(request.fromUser), String(request.toUser)].sort()
      return Connection.updateOne({ userA, userB }, { $setOnInsert: { userA, userB, request: request._id } }, { upsert: true })
    }))
    const connections = await Connection.find({ $or: [{ userA: req.user.id }, { userB: req.user.id }] }).sort({ createdAt: -1 }).populate({ path: 'request', populate: { path: 'jobPost', select: 'jobTitle jobTitleEnglish companyName' } }).lean()
    rows = await Promise.all(connections.map(async (connection) => {
      const otherUserId = String(connection.userA) === String(req.user.id) ? connection.userB : connection.userA
      const person = await User.findById(otherUserId).select('fullName').lean()
      const detail = await profileSummary(otherUserId, viewerIsCandidate, language)
      return { _id: connection._id, requestId: connection.request?._id, status: 'accepted', createdAt: connection.createdAt, user: person, ...detail, profilePath: viewerIsCandidate ? `/find-jobs?jobId=${detail.jobPostId || connection.request?.jobPost?._id || ''}` : `/hire-talents?candidateId=${otherUserId}` }
    }))
  } else {
    const incoming = tab === 'received'
    const requests = await ContactRequest.find({ [incoming ? 'toUser' : 'fromUser']: req.user.id, status: { $ne: 'accepted' } }).sort({ updatedAt: -1 })
      .populate(incoming ? 'fromUser' : 'toUser', 'fullName').populate('jobPost', 'jobTitle jobTitleEnglish companyName').lean()
    rows = await Promise.all(requests.map(async (request) => {
      const person = incoming ? request.fromUser : request.toUser
      const personId = person?._id
      const summary = await profileSummary(personId, viewerIsCandidate, language)
      return { _id: request._id, requestId: request._id, status: request.status, type: request.type, jobPost: request.jobPost, createdAt: request.createdAt, updatedAt: request.updatedAt, user: person, ...summary, profilePath: viewerIsCandidate ? `/find-jobs?jobId=${request.jobPost?._id || summary.jobPostId || ''}` : `/hire-talents?candidateId=${personId}` }
    }))
  }
  res.json({ status: 'success', data: { entries: rows } })
}

module.exports = { createRequest, listNotifications, sentRequests, markRead, decideRequest, cancelRequest, listConnections }

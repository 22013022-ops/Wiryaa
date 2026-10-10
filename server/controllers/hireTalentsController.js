const HireTalentsJobPost = require('../models/HireTalentsJobPost')
const AppError = require('../utils/AppError')
const { structureText } = require('../services/llmService')
const { translateToEnglish } = require('../services/translationService')
const { queueJobPostEmbedding, jobPostEmbeddingSourceChanged } = require('../services/embeddingService')
const JPMatchedCandidates = require('../models/JPMatchedCandidates')
const FindJobsProfile = require('../models/FindJobsProfile')
const User = require('../models/User')

const loggedRecommendationViews = new Map()

function shouldLogRecommendationScores(req) {
  const viewId = req.query.recommendationViewId
  if (!viewId || viewId.length > 120) return false
  const now = Date.now()
  for (const [key, expiresAt] of loggedRecommendationViews) {
    if (expiresAt <= now) loggedRecommendationViews.delete(key)
  }
  const key = `${req.user.id}:${viewId}`
  if (loggedRecommendationViews.has(key)) return false
  loggedRecommendationViews.set(key, now + 30 * 60 * 1000)
  if (loggedRecommendationViews.size > 5000) loggedRecommendationViews.delete(loggedRecommendationViews.keys().next().value)
  return true
}

const fields = ['name', 'email', 'phone', 'companyName', 'jobTitle', 'category', 'jobType', 'location', 'address', 'description', 'experience', 'salary', 'benefits', 'qualifications']

async function getJobPost(req, res) {
  const jobPost = await HireTalentsJobPost.findOne({ user: req.user.id }).lean()
  if (!jobPost) throw new AppError('Create a job post before viewing it.', 404)
  res.status(200).json({ status: 'success', data: { jobPost } })
}

async function saveJobPost(req, res) {
  const requiredFields = ['name', 'phone', 'companyName', 'jobTitle', 'category', 'jobType', 'location', 'description', 'qualifications']
  const missingField = requiredFields.find((field) => !String(req.body[field] || '').trim())
  if (missingField) throw new AppError(`${missingField} is required.`, 400)
  const jobPostData = Object.fromEntries(fields.filter((field) => req.body[field] !== undefined).map((field) => [field, req.body[field]]))
  const existingJobPost = await HireTalentsJobPost.findOne({ user: req.user.id }).select('jobTitle category jobType location description benefits qualifications jobTitleEnglish categoryEnglish jobTypeEnglish locationEnglish descriptionStructured benefitsStructured qualificationsEnglish').lean()
  const translatedFields = [
    { originalField: 'jobTitle', englishField: 'jobTitleEnglish' },
    { originalField: 'category', englishField: 'categoryEnglish' },
    { originalField: 'jobType', englishField: 'jobTypeEnglish' },
    { originalField: 'location', englishField: 'locationEnglish' },
    { originalField: 'description', englishField: 'descriptionEnglish', structuredField: 'descriptionStructured', outputType: 'description' },
    { originalField: 'benefits', englishField: 'benefitsEnglish', structuredField: 'benefitsStructured', outputType: 'benefits' },
    { originalField: 'qualifications', englishField: 'qualificationsEnglish' },
  ]

  await Promise.all(translatedFields.map(async ({ originalField, englishField, structuredField, outputType }) => {
    if (req.body[originalField] === undefined) return
    const newOriginalInput = String(req.body[originalField] || '')
    const previousOriginalInput = String(existingJobPost?.[originalField] || '')
    if (newOriginalInput === previousOriginalInput) return
    const englishText = await translateToEnglish(newOriginalInput, req.body.inputLanguage)
    jobPostData[englishField] = englishText
    if (structuredField) jobPostData[structuredField] = await structureText(englishText, outputType)
  }))
  const jobPost = await HireTalentsJobPost.findOneAndUpdate(
    { user: req.user.id },
    { $set: jobPostData },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  )
  if (!existingJobPost || jobPostEmbeddingSourceChanged(existingJobPost, jobPost)) queueJobPostEmbedding(jobPost._id)
  res.status(200).json({ status: 'success', data: { jobPost } })
}

async function getMatchedCandidates(req, res) {
  const jobPost = await HireTalentsJobPost.findOne({ user: req.user.id }).lean()
  if (!jobPost) throw new AppError('Create a job post before viewing candidates.', 404)
  const record = await JPMatchedCandidates.findOne({ jobPost: jobPost._id }).populate('candidates.user', 'fullName email mobile').lean()
  const candidates = (record?.candidates || []).sort((a, b) => b.finalScore - a.finalScore)
  const profileIds = candidates.map(({ user }) => user?._id).filter(Boolean)
  const profiles = await FindJobsProfile.find({ user: { $in: profileIds } }).select('user name skills previousJobs roles qualification').lean()
  const profileByUserId = new Map(profiles.map((profile) => [String(profile.user), profile]))
  const recommendations = candidates.map((candidate) => ({ ...candidate, profile: profileByUserId.get(String(candidate.user?._id)) || null }))
  if (shouldLogRecommendationScores(req)) {
    const employer = await User.findById(req.user.id).select('fullName').lean()
    console.log(`[Hire Talents] Candidate recommendations for user "${employer?.fullName || req.user.id}" and job "${jobPost.jobTitle}". Scores:`, JSON.stringify(recommendations.map(({ user, finalScore, skillScore, constraintScore, locationScore, conflictPenalty }) => ({
      candidate: user?.fullName || 'Unknown candidate',
      finalScore,
      skillScore,
      constraintScore,
      locationScore,
      conflictPenalty,
    })), null, 2))
  }
  res.status(200).json({ status: 'success', data: { candidates: recommendations } })
}

async function getMatchedCandidateProfile(req, res) {
  const jobPost = await HireTalentsJobPost.findOne({ user: req.user.id }).select('_id').lean()
  if (!jobPost) throw new AppError('Create a job post before viewing candidates.', 404)
  const matchRecord = await JPMatchedCandidates.findOne({ jobPost: jobPost._id, 'candidates.user': req.params.userId }).select('_id').lean()
  if (!matchRecord) throw new AppError('This candidate is not in your recommendations.', 404)
  const profile = await FindJobsProfile.findOne({ user: req.params.userId }).lean()
  if (!profile) throw new AppError('Candidate profile not found.', 404)
  res.status(200).json({ status: 'success', data: { profile } })
}

module.exports = { getJobPost, saveJobPost, getMatchedCandidates, getMatchedCandidateProfile }

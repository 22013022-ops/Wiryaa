const FindJobsProfile = require('../models/FindJobsProfile')
const AppError = require('../utils/AppError')
const { uploadProfileFiles } = require('../services/cloudinaryService')
const { structureText } = require('../services/llmService')

async function getFindJobsAccess(req, res) {
  res.status(200).json({ status: 'success', data: { message: 'Find Jobs access granted.' } })
}

async function getFindJobsProfile(req, res) {
  const profile = await FindJobsProfile.findOne({ user: req.user.id }).lean()
  if (!profile) throw new AppError('Create your profile before viewing it.', 404)
  res.status(200).json({ status: 'success', data: { profile } })
}

async function saveFindJobsProfile(req, res) {
  const requiredFields = ['name', 'phone', 'age']
  const missingField = requiredFields.find((field) => !String(req.body[field] || '').trim())
  if (missingField) throw new AppError(`${missingField} is required.`, 400)

  const fields = ['name', 'email', 'phone', 'age', 'state', 'city', 'pincode', 'qualification', 'portfolio', 'skills', 'previousJobs', 'roles', 'skillsApplied', 'certifications', 'preferences']
  const profileData = Object.fromEntries(fields.filter((field) => req.body[field] !== undefined).map((field) => [field, req.body[field]]))
  const existingProfile = await FindJobsProfile.findOne({ user: req.user.id }).select('skills preferences').lean()
  const llmFields = [
    { originalField: 'skills', structuredField: 'skillsStructured', outputType: 'skills' },
    { originalField: 'preferences', structuredField: 'constraintsStructured', outputType: 'constraints' },
  ]

  await Promise.all(llmFields.map(async ({ originalField, structuredField, outputType }) => {
    if (req.body[originalField] === undefined) return
    const newOriginalInput = String(req.body[originalField] || '')
    const previousOriginalInput = String(existingProfile?.[originalField] || '')
    if (newOriginalInput === previousOriginalInput) return
    profileData[structuredField] = await structureText(newOriginalInput, outputType)
  }))
  const assets = await uploadProfileFiles(req.files)
  const profile = await FindJobsProfile.findOneAndUpdate(
    { user: req.user.id },
    { $set: { ...profileData, ...assets } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  )
  res.status(200).json({ status: 'success', data: { profile } })
}

module.exports = { getFindJobsAccess, getFindJobsProfile, saveFindJobsProfile }

const FindJobsProfile = require('../models/FindJobsProfile')
const AppError = require('../utils/AppError')
const { uploadProfileFiles } = require('../services/cloudinaryService')

async function getFindJobsAccess(req, res) {
  res.status(200).json({ status: 'success', data: { message: 'Find Jobs access granted.' } })
}

async function saveFindJobsProfile(req, res) {
  const requiredFields = ['name', 'phone', 'age']
  const missingField = requiredFields.find((field) => !String(req.body[field] || '').trim())
  if (missingField) throw new AppError(`${missingField} is required.`, 400)

  const fields = ['name', 'email', 'phone', 'age', 'state', 'city', 'pincode', 'qualification', 'portfolio', 'skills', 'previousJobs', 'roles', 'skillsApplied', 'certifications', 'preferences']
  const profileData = Object.fromEntries(fields.filter((field) => req.body[field] !== undefined).map((field) => [field, req.body[field]]))
  const assets = await uploadProfileFiles(req.files)
  const profile = await FindJobsProfile.findOneAndUpdate(
    { user: req.user.id },
    { $set: { ...profileData, ...assets } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  )
  res.status(200).json({ status: 'success', data: { profile } })
}

module.exports = { getFindJobsAccess, saveFindJobsProfile }

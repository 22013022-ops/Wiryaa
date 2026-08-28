const HireTalentsJobPost = require('../models/HireTalentsJobPost')
const AppError = require('../utils/AppError')

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
  const jobPost = await HireTalentsJobPost.findOneAndUpdate(
    { user: req.user.id },
    { $set: jobPostData },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  )
  res.status(200).json({ status: 'success', data: { jobPost } })
}

module.exports = { getJobPost, saveJobPost }

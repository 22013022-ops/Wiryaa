const HireTalentsJobPost = require('../models/HireTalentsJobPost')
const AppError = require('../utils/AppError')
const { structureText } = require('../services/llmService')
const { translateToEnglish } = require('../services/translationService')

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
  const existingJobPost = await HireTalentsJobPost.findOne({ user: req.user.id }).select('jobTitle category jobType location description benefits qualifications').lean()
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
  res.status(200).json({ status: 'success', data: { jobPost } })
}

module.exports = { getJobPost, saveJobPost }

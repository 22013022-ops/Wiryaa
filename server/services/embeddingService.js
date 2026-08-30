const FindJobsProfile = require('../models/FindJobsProfile')
const HireTalentsJobPost = require('../models/HireTalentsJobPost')
const FindJobsEmbedding = require('../models/FindJobsEmbedding')
const HireTalentsJobPostEmbedding = require('../models/HireTalentsJobPostEmbedding')

const MODEL_NAME = 'all-MiniLM-L6-v2'
const MODEL_ID = 'Xenova/all-MiniLM-L6-v2'
let extractorPromise

// Transformers.js is ESM-only, so importing it lazily keeps model setup out of server startup.
async function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = import('@huggingface/transformers')
      .then(({ pipeline }) => pipeline('feature-extraction', MODEL_ID, { dtype: 'q8' }))
      .catch((error) => {
        extractorPromise = null
        throw error
      })
  }
  return extractorPromise
}

function text(value) {
  const normalized = String(value || '').trim()
  return normalized || null
}

function structuredTexts(items, property) {
  return (items || []).map((item) => text(item?.[property])).filter(Boolean)
}

function profileEmbeddingSource(profile) {
  return {
    stateEnglish: text(profile?.stateEnglish),
    cityEnglish: text(profile?.cityEnglish),
    qualificationEnglish: text(profile?.qualificationEnglish),
    skillsStructured: structuredTexts(profile?.skillsStructured, 'skill_name'),
    constraintsStructured: structuredTexts(profile?.constraintsStructured, 'constraint_text'),
  }
}

function jobPostEmbeddingSource(jobPost) {
  return {
    jobTitleEnglish: text(jobPost?.jobTitleEnglish),
    categoryEnglish: text(jobPost?.categoryEnglish),
    jobTypeEnglish: text(jobPost?.jobTypeEnglish),
    locationEnglish: text(jobPost?.locationEnglish),
    descriptionStructured: structuredTexts(jobPost?.descriptionStructured, 'description'),
    benefitsStructured: structuredTexts(jobPost?.benefitsStructured, 'benefit'),
    qualificationsEnglish: text(jobPost?.qualificationsEnglish),
  }
}

function embeddingSourceChanged(before, after, sourceBuilder) {
  return JSON.stringify(sourceBuilder(before)) !== JSON.stringify(sourceBuilder(after))
}

function profileEmbeddingSourceChanged(before, after) {
  return embeddingSourceChanged(before, after, profileEmbeddingSource)
}

function jobPostEmbeddingSourceChanged(before, after) {
  return embeddingSourceChanged(before, after, jobPostEmbeddingSource)
}

async function generateEmbeddings(source) {
  const entries = Object.entries(source)
  const requests = entries.flatMap(([field, value]) => Array.isArray(value)
    ? value.map((sourceText, index) => ({ field, index, sourceText }))
    : value ? [{ field, sourceText: value }] : [])

  if (!requests.length) return Object.fromEntries(entries.map(([field, value]) => [field, Array.isArray(value) ? [] : null]))
  console.log(`🧠 Generating ${requests.length} embeddings using ${MODEL_NAME}...`)
  const extractor = await getExtractor()
  const result = await extractor(requests.map(({ sourceText }) => sourceText), { pooling: 'mean', normalize: true })
  const vectors = result.tolist()
  const embeddings = Object.fromEntries(entries.map(([field, value]) => [field, Array.isArray(value) ? [] : null]))

  requests.forEach(({ field, sourceText }, index) => {
    const item = { sourceText, embedding: vectors[index] }
    if (Array.isArray(embeddings[field])) embeddings[field].push(item)
    else embeddings[field] = item
  })
  return embeddings
}

async function updateEmbedding({ sourceDocument, embeddingModel, ownerField, ownerId, user, sourceBuilder }) {
  const lookup = { [ownerField]: ownerId }
  await embeddingModel.findOneAndUpdate(lookup, {
    $set: { [ownerField]: ownerId, user, model: MODEL_NAME, status: 'pending', error: null },
  }, { upsert: true, new: true, setDefaultsOnInsert: true })

  try {
    const embeddings = await generateEmbeddings(sourceBuilder(sourceDocument))
    await embeddingModel.findOneAndUpdate(lookup, {
      $set: { user, model: MODEL_NAME, status: 'completed', error: null, embeddings },
    }, { upsert: true, new: true, setDefaultsOnInsert: true })
  } catch (error) {
    console.error(`Embedding generation failed for ${ownerField} ${ownerId}:`, error)
    await embeddingModel.findOneAndUpdate(lookup, {
      $set: { user, model: MODEL_NAME, status: 'failed', error: error.message || 'Unknown embedding error' },
    }, { upsert: true, new: true, setDefaultsOnInsert: true })
  }
}

async function generateProfileEmbeddings(profileId) {
  const profile = await FindJobsProfile.findById(profileId).lean()
  if (!profile) return
  await updateEmbedding({ sourceDocument: profile, embeddingModel: FindJobsEmbedding, ownerField: 'profile', ownerId: profile._id, user: profile.user, sourceBuilder: profileEmbeddingSource })
}

async function generateJobPostEmbeddings(jobPostId) {
  const jobPost = await HireTalentsJobPost.findById(jobPostId).lean()
  if (!jobPost) return
  await updateEmbedding({ sourceDocument: jobPost, embeddingModel: HireTalentsJobPostEmbedding, ownerField: 'jobPost', ownerId: jobPost._id, user: jobPost.user, sourceBuilder: jobPostEmbeddingSource })
}

function queueProfileEmbedding(profileId) {
  setImmediate(() => generateProfileEmbeddings(profileId).catch((error) => console.error('Profile embedding job failed:', error)))
}

function queueJobPostEmbedding(jobPostId) {
  setImmediate(() => generateJobPostEmbeddings(jobPostId).catch((error) => console.error('Job post embedding job failed:', error)))
}

module.exports = {
  queueProfileEmbedding,
  queueJobPostEmbedding,
  profileEmbeddingSourceChanged,
  jobPostEmbeddingSourceChanged,
}

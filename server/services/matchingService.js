const FindJobsProfile = require('../models/FindJobsProfile')
const HireTalentsJobPost = require('../models/HireTalentsJobPost')
const FindJobsEmbedding = require('../models/FindJobsEmbedding')
const HireTalentsJobPostEmbedding = require('../models/HireTalentsJobPostEmbedding')
const JSMatchedJobs = require('../models/JSMatchedJobs')
const JPMatchedCandidates = require('../models/JPMatchedCandidates')

const ALGORITHM_VERSION = '1.0.0'
const CANDIDATE_LIMIT = positiveInteger(process.env.MATCHING_CANDIDATE_LIMIT, 100)
const RESULTS_PER_SKILL = positiveInteger(process.env.MATCHING_RESULTS_PER_SKILL, 30)
const VECTOR_INDEX = process.env.MATCHING_VECTOR_INDEX || 'job_description_embeddings'
const NLI_MODEL_ID = process.env.MATCHING_NLI_MODEL || 'Xenova/nli-deberta-v3-xsmall'
const CONFLICT_RELEVANCE_THRESHOLD = 0.5
let nliPipelinePromise

function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

function clamp(value) {
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0
}

function vector(value) {
  return Array.isArray(value) && value.length && value.every(Number.isFinite) ? value : null
}

function cosineSimilarity(left, right) {
  const a = vector(left); const b = vector(right)
  if (!a || !b || a.length !== b.length) return 0
  try {
    let dot = 0; let leftMagnitude = 0; let rightMagnitude = 0
    for (let index = 0; index < a.length; index += 1) {
      dot += a[index] * b[index]
      leftMagnitude += a[index] ** 2
      rightMagnitude += b[index] ** 2
    }
    return leftMagnitude && rightMagnitude ? clamp(dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude))) : 0
  } catch (_) { return 0 }
}

function embeddings(items) {
  return (Array.isArray(items) ? items : []).map((item) => item?.embedding).filter(vector)
}

function texts(items, key) {
  return (Array.isArray(items) ? items : []).map((item) => String(item?.[key] || '').trim()).filter(Boolean)
}

function values(...items) { return items.filter(vector) }

function scoreSkills(userSkills, jobEmbeddings) {
  if (!userSkills.length) return 0
  const targets = values(
    ...embeddings(jobEmbeddings.descriptionStructured), jobEmbeddings.jobTitleEnglish?.embedding,
    jobEmbeddings.categoryEnglish?.embedding, jobEmbeddings.qualificationsEnglish?.embedding,
  )
  return clamp(userSkills.reduce((sum, skill) => sum + Math.max(0, ...targets.map((target) => cosineSimilarity(skill, target))), 0) / userSkills.length)
}

function hasNightAdjustment(constraintText, jobDescription) {
  return /\b(after|before|evening|night|morning)\b/i.test(constraintText || '')
    && /\b(night|shift|evening|24\/7)\b/i.test(jobDescription || '')
}

function scoreConstraints(constraints, jobEmbeddings, jobPost, constraintTexts) {
  if (!constraints.length) return 0.5
  const targets = values(...embeddings(jobEmbeddings.descriptionStructured), ...embeddings(jobEmbeddings.benefitsStructured), jobEmbeddings.locationEnglish?.embedding, jobEmbeddings.jobTypeEnglish?.embedding)
  const jobDescription = [jobPost.descriptionEnglish, ...texts(jobPost.descriptionStructured, 'description')].join(' ')
  return clamp(constraints.reduce((total, constraint, index) => {
    const similarities = targets.map((target) => {
      const raw = cosineSimilarity(constraint, target)
      return hasNightAdjustment(constraintTexts[index], jobDescription) ? clamp(raw - 0.3) : raw
    }).filter((similarity) => similarity >= 0.3)
    return total + (similarities.length ? similarities.reduce((sum, value) => sum + value, 0) / similarities.length : 0.1)
  }, 0) / constraints.length)
}

function scoreLocation(profileEmbeddings, jobEmbeddings) {
  return clamp((cosineSimilarity(profileEmbeddings.cityEnglish?.embedding, jobEmbeddings.locationEnglish?.embedding)
    + cosineSimilarity(profileEmbeddings.stateEnglish?.embedding, jobEmbeddings.locationEnglish?.embedding)) / 2)
}

async function getNliPipeline() {
  if (!nliPipelinePromise) {
    nliPipelinePromise = import('@huggingface/transformers')
      .then(({ pipeline }) => pipeline('text-classification', NLI_MODEL_ID, { dtype: 'q8' }))
      .catch((error) => { nliPipelinePromise = null; throw error })
  }
  return nliPipelinePromise
}

async function contradictionProbability(constraint, feature) {
  if (!constraint || !feature) return 0
  try {
    const classifier = await getNliPipeline()
    const premise = `The job requires or offers the following working condition: ${feature}`
    const hypothesis = `The worker has the following work constraint or preference: ${constraint}`
    // The text-classification pipeline accepts one text only, so tokenize the
    // premise/hypothesis pair directly before invoking the cross-encoder.
    const inputs = classifier.tokenizer(premise, { text_pair: hypothesis, padding: true, truncation: true })
    const output = await classifier.model(inputs)
    const logits = Array.from(output.logits.data)
    const highest = Math.max(...logits)
    const probabilities = logits.map((value) => Math.exp(value - highest))
    const denominator = probabilities.reduce((sum, value) => sum + value, 0)
    const labels = classifier.model.config.id2label || {}
    const contradictionIndex = Object.entries(labels).find(([, label]) => /contradiction/i.test(label))?.[0] ?? '0'
    // Most MNLI exports map class 0 to contradiction when semantic labels are absent.
    const probability = clamp(probabilities[Number(contradictionIndex)] / denominator)
    console.log('NLI formatted conflict pair:', { constraint, feature, premise, hypothesis, contradictionProbability: probability })
    return probability
  } catch (error) {
    console.error('NLI conflict detection failed; treating this pair as non-conflicting:', error.message)
    return 0
  }
}

async function scoreConflicts(constraintTexts, constraintEmbeddings, jobEmbeddings) {
  if (!constraintTexts.length) return 0
  const descriptionFeatures = (jobEmbeddings?.descriptionStructured || [])
    .map(({ sourceText, embedding }) => ({ feature: String(sourceText || '').trim(), embedding }))
    .filter(({ feature, embedding }) => feature && vector(embedding))
  if (!descriptionFeatures.length) return 0
  const conflicts = await Promise.all(constraintTexts.map(async (constraint, index) => {
    const constraintEmbedding = constraintEmbeddings?.find(({ sourceText }) => sourceText === constraint)?.embedding
      || constraintEmbeddings?.[index]?.embedding
    const relevantFeatures = vector(constraintEmbedding)
      ? descriptionFeatures.filter(({ embedding }) => cosineSimilarity(constraintEmbedding, embedding) >= CONFLICT_RELEVANCE_THRESHOLD)
      : []
    if (!relevantFeatures.length) {
      console.log('NLI constraint-level conflict:', { constraint, constraintConflict: 0 })
      return 0
    }
    const pairs = await Promise.all(relevantFeatures.map(async ({ feature }) => ({
      feature,
      contradictionProbability: await contradictionProbability(constraint, feature),
    })))
    pairs.forEach(({ feature, contradictionProbability: probability }) => console.log('NLI conflict pair:', {
      constraint,
      descriptionFeature: feature,
      contradictionProbability: probability,
    }))
    const constraintConflict = Math.max(0, ...pairs.map(({ contradictionProbability: probability }) => probability))
    console.log('NLI constraint-level conflict:', { constraint, constraintConflict })
    return constraintConflict
  }))
  const conflictPenalty = clamp(conflicts.reduce((sum, score) => sum + score, 0) / conflicts.length)
  console.log('NLI overall conflict penalty:', { conflictPenalty })
  return conflictPenalty
}

async function retrieveCandidateJobIds(skillEmbeddings) {
  if (!skillEmbeddings.length) return []
  try {
    const searches = await Promise.all(skillEmbeddings.map((queryVector) => HireTalentsJobPostEmbedding.aggregate([
      { $vectorSearch: { index: VECTOR_INDEX, path: 'embeddings.descriptionStructured.embedding', queryVector, numCandidates: RESULTS_PER_SKILL * 10, limit: RESULTS_PER_SKILL } },
      { $project: { jobPost: 1, retrievalScore: { $meta: 'vectorSearchScore' } } },
    ])))
    const bestScoreByJob = new Map()
    searches.flat().forEach(({ jobPost, retrievalScore }) => {
      const jobId = String(jobPost)
      const score = Number.isFinite(retrievalScore) ? retrievalScore : 0
      bestScoreByJob.set(jobId, Math.max(bestScoreByJob.get(jobId) ?? 0, score))
    })
    return [...bestScoreByJob.entries()]
      .sort(([, leftScore], [, rightScore]) => rightScore - leftScore)
      .slice(0, CANDIDATE_LIMIT)
      .map(([jobId]) => jobId)
  } catch (error) {
    const message = `Vector candidate retrieval failed. Create Atlas vector index "${VECTOR_INDEX}" on JP_embeddings.embeddings.descriptionStructured.embedding. ${error.message}`
    const retrievalError = new Error(message)
    retrievalError.statusCode = 503
    retrievalError.isOperational = true
    throw retrievalError
  }
}

async function upsertScore(model, parentFilter, arrayField, referenceField, referenceId, score) {
  const filter = { ...parentFilter, [`${arrayField}.${referenceField}`]: referenceId }
  const set = Object.fromEntries(Object.entries(score).map(([key, value]) => [`${arrayField}.$.${key}`, value]))
  const existing = await model.findOneAndUpdate(filter, { $set: set }, { new: true })
  if (!existing) await model.findOneAndUpdate(parentFilter, { $push: { [arrayField]: { [referenceField]: referenceId, ...score } } }, { upsert: true, setDefaultsOnInsert: true })
}

async function persistMatch(userId, jobId, scores) {
  const match = { ...scores, generatedAt: new Date(), algorithmVersion: ALGORITHM_VERSION }
  await Promise.all([
    upsertScore(JSMatchedJobs, { user: userId }, 'jobs', 'job', jobId, match),
    upsertScore(JPMatchedCandidates, { jobPost: jobId }, 'candidates', 'user', userId, match),
  ])
}

async function generateRecommendations(userId) {
  const [profile, profileEmbeddings] = await Promise.all([
    FindJobsProfile.findOne({ user: userId }).lean(),
    FindJobsEmbedding.findOne({ user: userId, status: 'completed' }).lean(),
  ])
  if (!profile) { const error = new Error('Create your Find Jobs profile before requesting recommendations.'); error.statusCode = 404; error.isOperational = true; throw error }
  if (!profileEmbeddings) { const error = new Error('Your profile embeddings are still being prepared. Please try again shortly.'); error.statusCode = 409; error.isOperational = true; throw error }
  const userSkills = embeddings(profileEmbeddings.embeddings?.skillsStructured)
  if (!userSkills.length) { const error = new Error('Add at least one skill before requesting recommendations.'); error.statusCode = 400; error.isOperational = true; throw error }
  const candidateIds = await retrieveCandidateJobIds(userSkills)
  console.log('Candidate job IDs:', candidateIds)
  console.log('Number of candidate jobs:', candidateIds.length)
  if (!candidateIds.length) return []
  const [jobs, jobEmbeddings] = await Promise.all([
    HireTalentsJobPost.find({ _id: { $in: candidateIds } }).lean(),
    HireTalentsJobPostEmbedding.find({ jobPost: { $in: candidateIds }, status: 'completed' }).lean(),
  ])
  const jobEmbeddingById = new Map(jobEmbeddings.map((item) => [String(item.jobPost), item.embeddings || {}]))
  const constraints = embeddings(profileEmbeddings.embeddings?.constraintsStructured)
  const constraintTexts = texts(profile.constraintsStructured, 'constraint_text')
  const recommendations = await Promise.all(jobs.filter((job) => jobEmbeddingById.has(String(job._id))).map(async (job) => {
    const jobEmbedding = jobEmbeddingById.get(String(job._id))
    const skillScore = scoreSkills(userSkills, jobEmbedding)
    const constraintScore = scoreConstraints(constraints, jobEmbedding, job, constraintTexts)
    const locationScore = scoreLocation(profileEmbeddings.embeddings || {}, jobEmbedding)
    const conflictPenalty = await scoreConflicts(constraintTexts, profileEmbeddings.embeddings?.constraintsStructured, jobEmbedding)
    const finalScore = clamp((0.6 * skillScore + 0.3 * constraintScore + 0.1 * locationScore) * (1 - conflictPenalty))
    const scores = { finalScore, skillScore, constraintScore, locationScore, conflictPenalty }
    await persistMatch(userId, job._id, scores)
    return { job, ...scores }
  }))
  return recommendations.sort((a, b) => b.finalScore - a.finalScore)
}

module.exports = { generateRecommendations, cosineSimilarity, ALGORITHM_VERSION, CANDIDATE_LIMIT, RESULTS_PER_SKILL }

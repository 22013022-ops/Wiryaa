const mongoose = require('mongoose')

const scoreSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  finalScore: { type: Number, required: true, min: 0, max: 1 },
  skillScore: { type: Number, required: true, min: 0, max: 1 },
  constraintScore: { type: Number, required: true, min: 0, max: 1 },
  locationScore: { type: Number, required: true, min: 0, max: 1 },
  conflictPenalty: { type: Number, required: true, min: 0, max: 1 },
  generatedAt: { type: Date, required: true },
  algorithmVersion: { type: String, required: true },
}, { _id: false })

const schema = new mongoose.Schema({
  jobPost: { type: mongoose.Schema.Types.ObjectId, ref: 'HireTalentsJobPost', required: true, unique: true, index: true },
  candidates: { type: [scoreSchema], default: [] },
}, { collection: 'JP_matched_candidates', timestamps: true })

module.exports = mongoose.model('JPMatchedCandidates', schema)

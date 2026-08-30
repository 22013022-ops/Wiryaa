const mongoose = require('mongoose')

const findJobsEmbeddingSchema = new mongoose.Schema({
  profile: { type: mongoose.Schema.Types.ObjectId, ref: 'FindJobsProfile', required: true, unique: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  model: { type: String, required: true, default: 'all-MiniLM-L6-v2' },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending', index: true },
  error: { type: String, default: null },
  embeddings: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { collection: 'JS_embeddings', timestamps: true })

module.exports = mongoose.model('FindJobsEmbedding', findJobsEmbeddingSchema)

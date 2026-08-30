const mongoose = require('mongoose')

const hireTalentsJobPostEmbeddingSchema = new mongoose.Schema({
  jobPost: { type: mongoose.Schema.Types.ObjectId, ref: 'HireTalentsJobPost', required: true, unique: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  model: { type: String, required: true, default: 'all-MiniLM-L6-v2' },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending', index: true },
  error: { type: String, default: null },
  embeddings: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { collection: 'JP_embeddings', timestamps: true })

module.exports = mongoose.model('HireTalentsJobPostEmbedding', hireTalentsJobPostEmbeddingSchema)

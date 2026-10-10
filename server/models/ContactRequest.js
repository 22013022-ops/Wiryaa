const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  jobPost: { type: mongoose.Schema.Types.ObjectId, ref: 'HireTalentsJobPost', required: true },
  type: { type: String, enum: ['contact_request', 'connect_invite'], required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'cancelled'], default: 'pending', index: true },
}, { timestamps: true })

schema.index({ fromUser: 1, toUser: 1, jobPost: 1, type: 1 }, {
  name: 'contact_request_pending_unique',
  unique: true,
  partialFilterExpression: { status: 'pending' },
})
module.exports = mongoose.model('ContactRequest', schema)

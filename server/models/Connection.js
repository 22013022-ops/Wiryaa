const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  userA: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  userB: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'ContactRequest', required: true, unique: true },
}, { timestamps: true })

schema.index({ userA: 1, userB: 1 }, { unique: true })
module.exports = mongoose.model('Connection', schema)

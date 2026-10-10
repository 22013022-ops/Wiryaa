const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'ContactRequest', required: true },
  type: { type: String, enum: ['contact_request', 'connect_invite', 'request_accepted', 'request_rejected', 'connection_created', 'request_cancelled'], required: true },
  isRead: { type: Boolean, default: false, index: true },
}, { timestamps: true })

module.exports = mongoose.model('Notification', schema)

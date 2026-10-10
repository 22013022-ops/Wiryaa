const mongoose = require('mongoose')
const ContactRequest = require('../models/ContactRequest')

async function connectDatabase() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not configured.')
  await mongoose.connect(process.env.MONGO_URI)
  try {
    await ContactRequest.collection.dropIndex('fromUser_1_toUser_1_jobPost_1_type_1')
  } catch (error) {
    if (![26, 27].includes(error.code)) throw error
  }
  await ContactRequest.collection.createIndex(
    { fromUser: 1, toUser: 1, jobPost: 1, type: 1 },
    { name: 'contact_request_pending_unique', unique: true, partialFilterExpression: { status: 'pending' } },
  )
  console.log(`MongoDB connected: ${mongoose.connection.name}`)
}

module.exports = connectDatabase

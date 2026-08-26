const User = require('../models/User')
const AppError = require('../utils/AppError')
const { publicUser } = require('../services/authService')

async function getMe(req, res) {
  const user = await User.findById(req.user.id)
  if (!user) throw new AppError('User not found.', 404)
  res.status(200).json({ status: 'success', data: { user: publicUser(user) } })
}

async function updateMe(req, res) {
  const allowed = ['fullName', 'email', 'mobile']
  const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)))
  if (Object.keys(updates).length === 0) throw new AppError('No permitted profile fields were provided.', 400)
  const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true })
  res.status(200).json({ status: 'success', data: { user: publicUser(user) } })
}

module.exports = { getMe, updateMe }

const User = require('../models/User')
const AppError = require('../utils/AppError')
const { signToken } = require('../utils/jwt')

function publicUser(user) {
  return { id: user.id, fullName: user.fullName, email: user.email, mobile: user.mobile, gender: user.gender }
}

async function registerUser({ fullName, email, mobile, password, gender }) {
  const normalizedEmail = email?.trim().toLowerCase() || undefined
  const normalizedMobile = mobile?.trim() || undefined
  if (!normalizedEmail && !normalizedMobile) throw new AppError('Enter an email address or mobile number.', 400)

  const duplicate = await User.findOne({ $or: [
    ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
    ...(normalizedMobile ? [{ mobile: normalizedMobile }] : []),
  ] })
  if (duplicate) throw new AppError('An account with that email address or mobile number already exists.', 409)

  const user = await User.create({ fullName, email: normalizedEmail, mobile: normalizedMobile, password, gender })
  return { token: signToken(user), user: publicUser(user) }
}

async function loginUser(contact, password) {
  const value = contact?.trim()
  if (!value || !password) throw new AppError('Email or mobile number and password are required.', 400)
  const isEmail = value.includes('@')
  const user = await User.findOne(isEmail ? { email: value.toLowerCase() } : { mobile: value }).select('+password')
  if (!user || !(await user.comparePassword(password))) throw new AppError('Invalid email/mobile number or password.', 401)
  return { token: signToken(user), user: publicUser(user) }
}

module.exports = { registerUser, loginUser, publicUser }

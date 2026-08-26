const jwt = require('jsonwebtoken')
const AppError = require('../utils/AppError')

function protect(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return next(new AppError('Authentication is required.', 401))
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET)
    return next()
  } catch {
    return next(new AppError('Your session is invalid or has expired. Please log in again.', 401))
  }
}

module.exports = { protect }

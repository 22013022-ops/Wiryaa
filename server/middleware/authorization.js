const AppError = require('../utils/AppError')

function requireFemale(req, res, next) {
  if (req.user.gender !== 'Female') return next(new AppError('Find Jobs is dedicated to women candidates. You can use Hire Talents to create opportunities.', 403))
  return next()
}

module.exports = { requireFemale }

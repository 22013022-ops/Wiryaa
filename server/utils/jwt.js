const jwt = require('jsonwebtoken')

function signToken(user) {
  return jwt.sign(
    { id: user.id, gender: user.gender },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN },
  )
}

module.exports = { signToken }

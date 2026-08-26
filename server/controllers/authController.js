const { registerUser, loginUser } = require('../services/authService')

async function signup(req, res) {
  const auth = await registerUser(req.body)
  res.status(201).json({ status: 'success', data: auth })
}

async function login(req, res) {
  const auth = await loginUser(req.body.contact, req.body.password)
  res.status(200).json({ status: 'success', data: auth })
}

module.exports = { signup, login }

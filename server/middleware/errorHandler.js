function notFound(req, res) {
  res.status(404).json({ status: 'error', message: `Route ${req.method} ${req.originalUrl} was not found.` })
}

function errorHandler(error, req, res, next) { // eslint-disable-line no-unused-vars
  if (error.code === 11000) return res.status(409).json({ status: 'error', message: 'That email address or mobile number is already registered.' })
  if (error.name === 'MulterError') return res.status(400).json({ status: 'error', message: error.code === 'LIMIT_FILE_SIZE' ? 'Each uploaded file must be 10 MB or smaller.' : error.message })
  if (error.name === 'ValidationError') return res.status(400).json({ status: 'error', message: Object.values(error.errors).map((item) => item.message).join(' ') })
  const statusCode = error.statusCode || 500
  if (statusCode >= 500) console.error(error)
  return res.status(statusCode).json({ status: 'error', message: error.isOperational ? error.message : 'Something went wrong. Please try again.' })
}

module.exports = { notFound, errorHandler }

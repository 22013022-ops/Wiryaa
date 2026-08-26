async function getFindJobsAccess(req, res) {
  res.status(200).json({ status: 'success', data: { message: 'Find Jobs access granted.' } })
}

module.exports = { getFindJobsAccess }

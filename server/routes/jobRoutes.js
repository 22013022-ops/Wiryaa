const express = require('express')
const { protect } = require('../middleware/auth')
const { requireFemale } = require('../middleware/authorization')
const { getFindJobsAccess } = require('../controllers/jobController')

const router = express.Router()
router.get('/access', protect, requireFemale, getFindJobsAccess)
module.exports = router

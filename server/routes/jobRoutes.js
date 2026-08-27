const express = require('express')
const { protect } = require('../middleware/auth')
const { requireFemale } = require('../middleware/authorization')
const { getFindJobsAccess, saveFindJobsProfile } = require('../controllers/jobController')
const { uploadFindJobsFiles } = require('../middleware/upload')

const router = express.Router()
router.get('/access', protect, requireFemale, getFindJobsAccess)
router.post('/profile', protect, requireFemale, uploadFindJobsFiles, saveFindJobsProfile)
module.exports = router

const express = require('express')
const { protect } = require('../middleware/auth')
const { requireFemale } = require('../middleware/authorization')
const { getFindJobsAccess, getFindJobsProfile, saveFindJobsProfile, getRecommendations } = require('../controllers/jobController')
const { uploadFindJobsFiles } = require('../middleware/upload')

const router = express.Router()
router.get('/access', protect, requireFemale, getFindJobsAccess)
router.get('/profile', protect, requireFemale, getFindJobsProfile)
router.post('/profile', protect, requireFemale, uploadFindJobsFiles, saveFindJobsProfile)
router.get('/recommendations', protect, requireFemale, getRecommendations)
module.exports = router

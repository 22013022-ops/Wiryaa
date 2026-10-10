const express = require('express')
const { protect } = require('../middleware/auth')
const { getJobPost, saveJobPost, getMatchedCandidates, getMatchedCandidateProfile } = require('../controllers/hireTalentsController')

const router = express.Router()
router.use(protect)
router.route('/job-post').get(getJobPost).post(saveJobPost)
router.get('/job-post/candidates', getMatchedCandidates)
router.get('/job-post/candidates/:userId/profile', getMatchedCandidateProfile)

module.exports = router

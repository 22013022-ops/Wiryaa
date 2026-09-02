const express = require('express')
const { protect } = require('../middleware/auth')
const { getJobPost, saveJobPost, getMatchedCandidates } = require('../controllers/hireTalentsController')

const router = express.Router()
router.use(protect)
router.route('/job-post').get(getJobPost).post(saveJobPost)
router.get('/job-post/candidates', getMatchedCandidates)

module.exports = router

const express = require('express')
const { protect } = require('../middleware/auth')
const { getJobPost, saveJobPost } = require('../controllers/hireTalentsController')

const router = express.Router()
router.use(protect)
router.route('/job-post').get(getJobPost).post(saveJobPost)

module.exports = router

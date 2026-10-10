const express = require('express')
const { protect } = require('../middleware/auth')
const { createRequest, listNotifications, sentRequests, markRead, decideRequest, cancelRequest, listConnections } = require('../controllers/notificationController')

const router = express.Router()
router.use(protect)
router.get('/', listNotifications)
router.get('/requests/sent', sentRequests)
router.get('/connections', listConnections)
router.post('/requests', createRequest)
router.delete('/requests/:id', cancelRequest)
router.patch('/:id/read', markRead)
router.patch('/requests/:id/decision', decideRequest)
module.exports = router

const express = require('express')
const router = express.Router()

const notificationController = require('../controllers/notificationController')
const authController = require('../controllers/authController')

router
  .route('/')
  .get(authController.protect, notificationController.getNotification)
  .post(authController.protect, notificationController.postNotification)
router
  .route('/updateNotification')
  .post(authController.protect, notificationController.updateNotification)
router
  .route('/updateAdminNotification')
  .post(authController.protect, notificationController.updateAdminNotification)

module.exports = router

const express = require('express')
const router = express.Router()
const reportFeedController = require('../controllers/reportFeedController')
const authController = require('../controllers/authController')

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('customer-care', 'business-development', 'admin'),
    reportFeedController.getAllReportFeeds
  )
  .post(
    authController.protect,
    // authController.restrictTo('user', 'agent', 'admin'),
    reportFeedController.createReportFeed
  )

router
  .route('/:id')
  .get(reportFeedController.getReportFeed)
  .patch(
    authController.protect,
    authController.restrictTo('customer-care', 'business-development', 'admin'),
    reportFeedController.updateReportFeed
  )
  .delete(
    authController.protect,
    authController.restrictTo('customer-care', 'business-development', 'admin'),
    reportFeedController.deleteReportFeed
  )

module.exports = router

const express = require('express')
const router = express.Router()
const jobController = require('../controllers/jobsController')
const authController = require('../controllers/authController')

router.route('/popular').get(jobController.popularJobs)

router
  .route('/')
  .get(jobController.getAllJobs)
  .post(
    authController.protect,
    authController.restrictTo('vendor', 'agent', 'admin'),
    jobController.createJob
  )

router
  .route('/:id')
  .get(jobController.getJob)
  .patch(
    authController.protect,
    authController.restrictTo('vendor', 'agent', 'admin'),
    jobController.updateJob
  )
  .delete(
    authController.protect,
    authController.restrictTo('vendor', 'agent', 'admin'),
    jobController.deleteJob
  )

module.exports = router

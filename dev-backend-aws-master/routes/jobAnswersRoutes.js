const express = require('express')
const router = express.Router()
const jobAnswerController = require('../controllers/jobAnswersController')
const authController = require('../controllers/authController')

router.route('/').get(jobAnswerController.getAllJobAnswers).post(
  // authController.protect,
  // authController.restrictTo('vendor', 'agent', 'admin'),
  jobAnswerController.createJobAnswer
)

router
  .route('/:id')
  .get(jobAnswerController.getJobAnswer)
  .patch(
    authController.protect,
    authController.restrictTo('vendor', 'agent', 'admin'),
    jobAnswerController.updateJobAnswer
  )
  .delete(
    authController.protect,
    authController.restrictTo('vendor', 'agent', 'admin'),
    jobAnswerController.deleteJobAnswer
  )

module.exports = router

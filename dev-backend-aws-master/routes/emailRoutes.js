const express = require('express')
const router = express.Router()
const emailController = require('../controllers/emailController')
const authController = require('../controllers/authController')

router.route('/').get(emailController.getAllEmails).post(
  authController.protect,
  // authController.restrictTo('admin'),
  emailController.createEmail
)

router
  .route('/:id')
  .get(emailController.getEmail)
  .patch(
    authController.protect,
    authController.restrictTo('customer-care', 'business-development', 'admin'),
    emailController.updateEmail
  )
  .delete(
    authController.protect,
    authController.restrictTo('customer-care', 'business-development', 'admin'),
    emailController.deleteEmail
  )

module.exports = router

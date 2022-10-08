const express = require('express')
const router = express.Router()
const contactController = require('../controllers/contactController')
const authController = require('../controllers/authController')

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('customer-care', 'business-development', 'admin'),
    contactController.getAllContacts
  )
  .post(
    // authController.protect,
    // authController.restrictTo('user', 'agent', 'admin'),
    contactController.createContact
  )

router.route('/:id').get(contactController.getContact)

module.exports = router

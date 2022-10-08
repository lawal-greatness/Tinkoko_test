const express = require('express')
const router = express.Router()
const quoteController = require('../controllers/quoteController')
const authController = require('../controllers/authController')

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('customer-care', 'business-development', 'admin'),
    quoteController.getAllQuotes
  )
  .post(quoteController.createQuote)

router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('customer-care', 'business-development', 'admin')
  )
  .patch(
    authController.protect,
    authController.restrictTo('customer-care', 'business-development', 'admin'),
    quoteController.updateQuote
  )
  .delete(
    authController.protect,
    authController.restrictTo('customer-care', 'business-development', 'admin'),
    quoteController.deleteQuote
  )

module.exports = router

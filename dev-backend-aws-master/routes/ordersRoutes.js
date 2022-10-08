const express = require('express')
const router = express.Router()
const ordersController = require('../controllers/ordersController')
const authController = require('../controllers/authController')

router
  .route('/')
  .get(
    authController.protect,
    // authController.restrictTo('customer-care', 'business-development', 'admin'),
    ordersController.getAllOrders
  )
  .post(authController.protect, ordersController.createOrder)

router
  .route('/:id')
  .get(authController.protect, ordersController.getOrder)
  .patch(
    authController.protect,
    // authController.restrictTo('customer-care', 'business-development', 'admin')
    ordersController.updateOrder
  )
  .delete(
    authController.protect,
    // authController.restrictTo('customer-care', 'business-development', 'admin'),
    ordersController.deleteOrder
  )

module.exports = router

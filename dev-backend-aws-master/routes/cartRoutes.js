const express = require('express')
const router = express.Router()
const cartController = require('../controllers/cartController')
const authController = require('../controllers/authController')

router.route('/add').post(authController.protect, cartController.userCart)
router.route('/getCart').get(authController.protect, cartController.getUserCart)
router.route('/empty').delete(authController.protect, cartController.emptyCart)

// router
//   .route('/:id')
//   .get(farmerController.getFarmer)
//   .patch(
//     // authController.protect,
//     // authController.restrictTo('user', 'agent', 'admin'),
//     farmerController.updateFarmer
//   )
//   .delete(
//     // authController.protect,
//     // authController.restrictTo('user', 'agent', 'admin'),
//     farmerController.deleteFarmer
//   )

module.exports = router

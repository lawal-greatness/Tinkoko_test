const express = require('express')
const router = express.Router()
const farmerProductController = require('../controllers/farmerProductController')
const authController = require('../controllers/authController')

router.route('/').get(farmerProductController.getAllFarmerProducts).post(
  // authController.protect,
  // authController.restrictTo('user', 'agent', 'admin'),
  farmerProductController.createFarmerProduct
)

router
  .route('/:id')
  .get(farmerProductController.getFarmerProduct)
  .patch(
    // authController.protect,
    // authController.restrictTo('user', 'agent', 'admin'),
    farmerProductController.updateFarmerProduct
  )
  .delete(
    // authController.protect,
    // authController.restrictTo('user', 'agent', 'admin'),
    farmerProductController.deleteFarmerProduct
  )

module.exports = router

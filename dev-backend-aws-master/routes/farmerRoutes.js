const express = require('express')
const router = express.Router()
const farmerController = require('../controllers/farmerController')
// const authController = require('../controllers/authController')

router.route('/').get(farmerController.getAllFarmers).post(
  // authController.protect,
  // authController.restrictTo('user', 'agent', 'admin'),
  farmerController.createFarmer
)

router
  .route('/:id')
  .get(farmerController.getFarmer)
  .patch(
    // authController.protect,
    // authController.restrictTo('user', 'agent', 'admin'),
    farmerController.updateFarmer
  )
  .delete(
    // authController.protect,
    // authController.restrictTo('user', 'agent', 'admin'),
    farmerController.deleteFarmer
  )

module.exports = router

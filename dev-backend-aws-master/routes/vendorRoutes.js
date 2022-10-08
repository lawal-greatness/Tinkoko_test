const express = require('express')
const router = express.Router()
const vendorController = require('../controllers/vendorController')
const authController = require('../controllers/authController')

router.route('/').get(vendorController.getAllVendors).post(
  // authController.protect,
  // authController.restrictTo('user', 'agent', 'admin'),
  vendorController.createVendor
)

router
  .route('/:id')
  .get(vendorController.getVendor)
  .patch(
    // authController.protect,
    // authController.restrictTo('user', 'agent', 'admin'),
    vendorController.updateVendor
  )
  .delete(
    // authController.protect,
    // authController.restrictTo('user', 'agent', 'admin'),
    vendorController.deleteVendor
  )

router.route('/findVendor/:userId').get(vendorController.findVendor)
router
  .route('/updateVendor')
  .post(authController.protect, vendorController.updateVendor)

module.exports = router

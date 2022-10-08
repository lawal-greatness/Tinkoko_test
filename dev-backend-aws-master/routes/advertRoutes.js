const express = require('express')
const router = express.Router()
const advertController = require('../controllers/advertController')
const authController = require('../controllers/authController')

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('customer-care', 'admin'),
    advertController.getAllAdverts
  )
  .post(advertController.createAdvert)

router.route('/:id').get(advertController.getAdvert)

module.exports = router

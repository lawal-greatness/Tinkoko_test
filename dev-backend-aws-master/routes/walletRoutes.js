const express = require('express')
const router = express.Router()

const authController = require('../controllers/authController')
const depositController = require('../controllers/depositController')
const withdrawController = require('../controllers/withdrawController')
const inAppTransactionController = require('../controllers/inAppTransactionController')

router
  .route('/deposit')
  .post(authController.protect, depositController.depositFund)

router
  .route('/createBeneficiary')
  .post(authController.protect, withdrawController.createBeneficiary)

router
  .route('/withdraw')
  .post(authController.protect, withdrawController.withdrawFund)

router
  .route('/getUser/:username')
  .get(authController.protect, inAppTransactionController.getUser)

router
  .route('/transfer')
  .post(
    authController.protect,
    inAppTransactionController.createInAppTransaction
  )
router
  .route('/confirm')
  .post(
    authController.protect,
    inAppTransactionController.successfulInAppTransaction
  )
router
  .route('/cancel')
  .post(
    authController.protect,
    inAppTransactionController.cancelInAppTransaction
  )

router
  .route('/myTransactions')
  .get(authController.protect, inAppTransactionController.getUserTransactions)

router.route('/getBanks/:country').get(depositController.getBank)

module.exports = router

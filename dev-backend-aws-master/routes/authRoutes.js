const express = require('express')
const router = express.Router()

const authController = require('../controllers/authController')

router.post('/register', authController.register)
router.get('/register/:username', authController.checkUserName)

router.post('/forgotPassword', authController.forgotPassword)
router.patch('/resetPassword/:token', authController.resetPassword)

router.post('/login', authController.login)
router.post('/logout', authController.logout)

// router.patch('/activateAccount/:token', authController.activateAccount)

router.use(authController.protect)
router.patch('/activateAccount', authController.activateAccount)
router.post('/correctPassword', authController.checkCorrectPassword)
router.post('/saveSecurityQuestions', authController.saveSecurityQuestions)
router.post('/sendOtp', authController.createOTP)

router.patch('/saveMyInterests', authController.saveInterests)
router.patch('/updateMyPassword', authController.updatePassword)
router.patch('/createActivationEmail', authController.createActivateToken)

router.get('/getNotifications', authController.getNotifications)
router.post('/updateNotifications', authController.updateNotifications)
router.get('/getInterests', authController.getInterests)

module.exports = router

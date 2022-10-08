const express = require('express')
const router = express.Router()
const chatController = require('../controllers/chatController')
const authController = require('../controllers/authController')

router
  .route('/')
  .get(authController.protect, chatController.getAllChats)
  .post(authController.protect, chatController.createMessage)

router
  .route('/user/:userToFindId')
  .get(authController.protect, chatController.getUserInfo)

router
  .route('/seen-message')
  .post(authController.protect, chatController.seenMessage)

router
  .route('/delivered-message')
  .post(authController.protect, chatController.deliveredMessage)

router
  .route('/:messagesWith')
  .get(authController.protect, chatController.getChat)
  .delete(authController.protect, chatController.deleteChat)

module.exports = router

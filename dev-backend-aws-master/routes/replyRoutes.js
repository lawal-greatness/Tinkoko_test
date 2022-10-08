const express = require('express')
const replyController = require('../controllers/replyController')
const authController = require('../controllers/authController')

const router = express.Router({ mergeParams: true })

router
  .route('/')
  .get(replyController.getAllReplies)
  .post(
    authController.protect,
    replyController.setPostUserIds,
    replyController.createReply
  )

router
  .route('/:id')
  .get(replyController.getReply)
  .patch(authController.protect, replyController.updateReply)
  .delete(authController.protect, replyController.deleteReply)

module.exports = router

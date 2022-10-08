const express = require('express')
const router = express.Router()
const postController = require('../controllers/postController')
const authController = require('../controllers/authController')

router
  .route('/')
  .get(postController.getAllPosts)
  .post(
    authController.protect,
    authController.restrictTo(
      'user',
      'vendor',
      'agent',
      'customer-care',
      'business-development',
      'admin'
    ),
    postController.createPost
  )

router
  .route('/:postId')
  .get(postController.getPost)
  .patch(
    authController.protect,
    authController.restrictTo(
      'user',
      'vendor',
      'agent',
      'customer-care',
      'business-development',
      'admin'
    ),
    postController.updatePost
  )
  .delete(
    authController.protect,
    authController.restrictTo(
      'user',
      'vendor',
      'agent',
      'customer-care',
      'business-development',
      'admin'
    ),
    postController.deletePost
  )

// LIKE AND UNLIKE POSTS
router
  .route('/like/:postId')
  .post(authController.protect, postController.likePost)
  .get(postController.getAllLikes)

router
  .route('/unlike/:postId')
  .put(authController.protect, postController.unlikePost)

// COMMENTS
router
  .route('/comment/:postId')
  .post(authController.protect, postController.createComment)

// DELETE COMMENT
router
  .route('/:postId/:commentId')
  .post(authController.protect, postController.deleteComment)

module.exports = router

const express = require('express')
const reviewController = require('../controllers/reviewController')
const authController = require('../controllers/authController')

const router = express.Router({ mergeParams: true })

router.use(authController.protect)

router.route('/').get(reviewController.getAllReviews).post(
  authController.restrictTo('user', 'vendor', 'agent'),
  // TODO: UPDATE TO ONLY USER
  reviewController.setReviewUserIds,
  reviewController.createReview
)

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo(
      'user',
      'customer-care',
      'business-development',
      'admin'
    ),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo(
      'user',
      'customer-care',
      'business-development',
      'admin'
    ),
    reviewController.deleteReview
  )

module.exports = router

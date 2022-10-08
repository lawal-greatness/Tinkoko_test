const express = require('express')
const router = express.Router()

const userController = require('../controllers/userController')
const authController = require('../controllers/authController')

router
  .route('/getNoPaginate')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'customer-care'),
    userController.getAllNoPaginate
  )

router
  .route('/me')
  .get(authController.protect, userController.getMe, userController.getUser)

router.delete('/deleteMe', authController.protect, userController.deleteMe)
router.delete(
  '/deleteUser/:id',
  authController.protect,
  userController.deleteUser
)

router.route('/search').post(userController.searchUser)

router.route('/posts/:id').get(userController.getUserPosts)

// GET FOLLOWERS and FOLLOWING OF USER
router
  .route('/followers/:userId')
  .get(authController.protect, userController.getFollowers)
router
  .route('/following/:userId')
  .get(authController.protect, userController.getFollowing)

// FOLLOW A USER
router
  .route('/follow/:userToFollowId')
  .post(authController.protect, userController.followUser)
router
  .route('/unfollow/:userToUnfollowId')
  .put(authController.protect, userController.unfollowUser)

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)

// SAVE USER PRODUCT TO CART
router
  .route('/address')
  .post(authController.protect, userController.saveAddress)

router.use(authController.protect)
router.use(authController.restrictTo('admin', 'customer-care'))

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser)

router.route('/verified').get(userController.getVerifiedUsers)

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
// .delete(userController.deleteUser)

module.exports = router

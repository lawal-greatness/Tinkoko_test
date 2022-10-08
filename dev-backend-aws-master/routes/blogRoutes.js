const express = require('express')
const router = express.Router()
const blogController = require('../controllers/blogController')
const authController = require('../controllers/authController')

router
  .route('/')
  .get(blogController.getAllBlogs)
  .post(
    authController.protect,
    authController.restrictTo('customer-care', 'business-development', 'admin'),
    blogController.createBlog
  )

router
  .route('/:id')
  .get(blogController.getBlog)
  .patch(
    authController.protect,
    authController.restrictTo('customer-care', 'business-development', 'admin'),
    blogController.updateBlog
  )
  .delete(
    authController.protect,
    authController.restrictTo('customer-care', 'business-development', 'admin'),
    blogController.deleteBlog
  )

module.exports = router

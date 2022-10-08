const express = require('express')
const router = express.Router()
const authController = require('./../controllers/authController')

// controller
const {
  createCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  getSubCategories,
} = require('../controllers/categoryController')

// routes
// router.post("/category", authCheck, adminCheck, createCategory);
// router.get("/categories", getAllCategories);
// router.get("/category/:slug", getCategory);
// router.put("/category/:slug", authCheck, adminCheck, updateCategory);
// router.delete("/category/:slug", authCheck, adminCheck, deleteCategory);
// router.get("/category/subs/:_id", getSubs);
// routes
router.post(
  '/',
  authController.protect,
  authController.restrictTo('business-development', 'admin'),
  createCategory
)
router.get('/', getAllCategories)
router.get('/:slug', getCategory)
router.patch(
  '/:slug',
  authController.protect,
  authController.restrictTo('business-development', 'admin'),
  updateCategory
)
router.delete(
  '/:slug',
  authController.protect,
  authController.restrictTo('business-development', 'admin'),
  deleteCategory
)
router.get('/subCategories/:_id', getSubCategories)

module.exports = router

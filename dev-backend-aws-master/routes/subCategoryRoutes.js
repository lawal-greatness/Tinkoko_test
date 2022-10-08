const express = require('express')
const router = express.Router()
const authController = require('./../controllers/authController')

// middlewares
// const { authCheck, adminCheck } = require('../middlewares/auth')

// controller
const {
  createSubCategory,
  getAllSubCategories,
  getSubCategory,
  updateSubCategory,
  deleteSubCategory,
} = require('../controllers/subCategoryController')

// routes
// router.post("/category", authCheck, adminCheck, createCategory);
// router.get("/categories", getAllCategories);
// router.get("/category/:slug", getCategory);
// router.put("/category/:slug", authCheck, adminCheck, updateCategory);
// router.delete("/category/:slug", authCheck, adminCheck, deleteCategory);
// router.get("/category/subs/:_id", getSubs);
// routes
router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('business-development', 'admin'),
    createSubCategory
  )
  .get(getAllSubCategories)
router
  .route('/:slug')
  .get(getSubCategory)
  .patch(
    authController.protect,
    authController.restrictTo('business-development', 'admin'),
    updateSubCategory
  )
  .delete(
    authController.protect,
    authController.restrictTo('business-development', 'admin'),
    deleteSubCategory
  )

module.exports = router

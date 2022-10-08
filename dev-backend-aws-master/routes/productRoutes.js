const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const productController = require('../controllers/productController')

// middlewares
// const { authCheck, adminCheck } = require('../middlewares/auth')

router.route('/getNoPaginate').get(productController.getAllNoPaginate)
//test
// controller
const {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  popularProducts,
  productsCount,
  searchFilters,
  getVendorProducts,
  getVendorProduct,
  getVendorProductsCount,
  userProductCount,
  getProductPage,
} = require('../controllers/productController')

// routes
router
  .route('/')
  .post(authController.protect, createProduct)
  .get(getAllProducts)

router.route('/popular').get(popularProducts)
router.route('/productCount/:userId').get(getVendorProductsCount)
router.route('/total').get(productsCount)
router.route('/getVendorProducts').get(getVendorProducts)
router.route('/getVendorProduct').get(getVendorProduct)
router.route('/count/:user').get(userProductCount)
router.route('/page').get(getProductPage)

router
  .route('/:slug')
  .get(getProduct)
  .patch(authController.protect, updateProduct)
  // .patch(authController.protect, updateProduct)
  .delete(authController.protect, deleteProduct)

router.post('/search/filters', searchFilters)

module.exports = router

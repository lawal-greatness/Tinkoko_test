const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const SubCategory = require('../models/subCategoryModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const slugify = require('slugify')

exports.createCategory = catchAsync(async (req, res, next) => {
  const { name } = req.body
  const category = await Category.create({ name, slug: slugify(name) })

  res.status(201).json(category)

  // }
})

exports.getAllCategories = catchAsync(async (req, res, next) => {
  const category = await Category.find({}).sort({ name: 1 }).exec()

  return res.json({ category, length: category.length })
  // return res.json({ category })
})

exports.getCategory = catchAsync(async (req, res, next) => {
  let category = await Category.findOne({ slug: req.params.slug }).exec()
  if (!category) {
    return next(new AppError('No Category Found', 404))
  }
  const products = await Product.find({ category }).populate('category').exec()
  const subCategories = await SubCategory.find({ parent: category })
    .populate()
    .exec()

  res.json({
    category,
    products,
    subCategories,
  })
})

exports.updateCategory = catchAsync(async (req, res, next) => {
  console.log('Hello');
  console.log(req.params, req.body );
  const { name } = req.body

  const updated = await Category.findOneAndUpdate(
    { slug: req.params.slug },
    { name, slug: slugify(name) },
    { new: true }
  )

  if (!updated) {
    return next(new AppError('No Category Found', 404))
  }
  res.json(updated)
})

exports.deleteCategory = catchAsync(async (req, res, next) => {
  const deleted = await Category.findOneAndDelete({ slug: req.params.slug })
  await SubCategory.deleteMany({ parent: deleted._id })
  if (!deleted) {
    return next(new AppError('No Category Found', 404))
  }
  res.json(deleted)
})

exports.getSubCategories = catchAsync(async (req, res, next) => {
  const subCategories = await SubCategory.find({
    parent: req.params._id,
  }).exec()

  res.json(subCategories)
})

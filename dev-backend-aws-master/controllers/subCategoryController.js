const SubCategory = require('../models/subCategoryModel')
const Product = require('../models/productModel')
const slugify = require('slugify')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

exports.createSubCategory = catchAsync(async (req, res) => {
  const { name, parent } = req.body
  const category = await SubCategory.create({
    name,
    parent,
    slug: slugify(name),
  })
  res.json(category)
})

exports.getAllSubCategories = async (req, res) => {
  const subCategory = await SubCategory.find({}).sort({ name: 1 }).exec()
  return res.json({ subCategory, length: subCategory.length })
}

exports.getSubCategory = async (req, res) => {
  let subCategory = await SubCategory.findOne({ slug: req.params.slug }).exec()
  const products = await Product.find({ subCategory })
    .populate('category')
    .exec()

  res.json({
    subCategory,
    products,
  })
}

exports.updateSubCategory = catchAsync(async (req, res, next) => {
  const { name, parent } = req.body
    const updated = await SubCategory.findOneAndUpdate(
      { slug: req.params.slug },
      { name, parent, slug: slugify(name) },
      { new: true }
    )

    if (!updated) {
      return next(new AppError('No Category Found', 404))
    }

    res.json(updated)
  
})

exports.deleteSubCategory = catchAsync(async (req, res, next) => {
  try {
    const deleted = await SubCategory.findOneAndDelete({
      slug: req.params.slug,
    })
    if (!deleted) {
      return next(new AppError('No subCategory Found', 404))
    }
    res.json(deleted)
  } catch (err) {
    res.status(400).send('Sub delete failed')
  }
})

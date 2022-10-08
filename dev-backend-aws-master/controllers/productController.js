const Product = require('../models/productModel')
const Post = require('../models/postModel')
const User = require('../models/userModel')
const Trail = require('../models/trailModel')
const slugify = require('slugify')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const factory = require('./handlerFactory')
const { uuid } = require('uuidv4')
const TrailManager = require('./trailController')

exports.createProduct = catchAsync(async (req, res) => {
  const {
    productName,
    weight,
    metrics,
    price,
    images,
    user,
    description,
    category,
  } = req.body

  req.body.slug = slugify(
    `${productName}-${weight}${metrics}-${price}-${uuid()}`
  )

  const newProduct = await Product.create(req.body)
  const post = await Post.create({
    poster: user,
    category,
    post: `<h3>${productName}</h3><p>${description}</p>`,
    images,
    productSlug: req.body.slug.toLowerCase(),
  })
  TrailManager(
    user,
    `created a new product and post ${newProduct.productName}`,
    'success'
  )

  res.json(newProduct)
})

// exports.getAllProducts = catchAsync(async (req, res) => {
//   let products = await Product.find({})
//     .limit(parseInt(req.params.count))
//     .populate('category')
//     .populate('subCategory')
//     .populate('user')
//     .sort([['createdAt', 'desc']])
//     .exec()
//   res.json(products)
// })

// WITH PAGINATION
exports.getAllProducts = async (req, res) => {
  // console.table(req.body);
  try {
    // createdAt/updatedAt, desc/asc, 3
    const { sort, order, page } = req.body
    const currentPage = page || 1
    const perPage = 20

    const products = await Product.find({})
      .skip((currentPage - 1) * perPage)
      .populate('category')
      .populate('subCategory')
      .populate('user')
      .sort([[sort, order]])
      .limit(perPage)
      .exec()

    res.json(products)
  } catch (err) {
    console.log(err)
  }
}

exports.getAllNoPaginate = catchAsync(async (req, res, next) => {
  const doc = await Product.find()

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: doc.length,
    data: {
      data: doc,
    },
  })
})

exports.getProductPage = factory.getAll(Product)

exports.getVendorProduct = factory.getAll(Product, {
  path: 'subCategory category user',
})

exports.deleteProduct = catchAsync(async (req, res) => {
  const deleted = await Product.findOneAndRemove({
    slug: req.params.slug,
  }).exec()

  if (!deleted) {
    return next(new AppError('No document found with that ID', 404))
  }

  TrailManager(
    req.user._id,
    `Deleted a product ${deleted.productName}`,
    'success'
  )

  res.json(deleted)
})

exports.userProductCount = catchAsync(async (req, res) => {
  const products = await Product.find({
    user: req.params.user,
  }).exec()

  const count = products.length

  res.status(200).json({ count })
})

exports.getProduct = catchAsync(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate('category')
    .populate('subCategory')
    .populate('user')
    .populate('reviews')
    .exec()
  res.json(product)
})

exports.updateProduct = catchAsync(async (req, res) => {
  req.body.slug = slugify(
    `${req.body.productName}-${req.body.weight}${req.body.metrics}-${
      req.body.price
    }-${uuid()}`
  )

  try {
    const postSlug = await Post.findOne({ productSlug: req.params.slug })

    if (postSlug) {
      postSlug.poster = req.user._id
      postSlug.category = req.body.category
      postSlug.post = `<h3>${req.body.productName}</h3><p>${req.body.description}</p>`
      postSlug.images = req.body.images
      postSlug.productSlug = req.body.slug.toLowerCase()
      await postSlug.save()
    }

    const updated = await Product.findOneAndUpdate(
      { slug: req.params.slug },
      req.body,
      { new: true }
    )

    TrailManager(
      req.user._id,
      `updated  product ${updated.productName}`,
      'success'
    )

    res.json(updated)
  } catch (err) {
    console.log('PRODUCT UPDATE ERROR ----> ', err)
    // return res.status(400).send("Product update failed");
    res.status(400).json({
      err: err.message,
    })
  }
})

exports.popularProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find().limit(6)
  res.json(products)
})

exports.getVendorProductsCount = catchAsync(async (req, res, next) => {
  const countProducts = await Product.countDocuments({
    user: req.params.userId,
  })
  res.json({
    status: 'success',
    count: countProducts,
  })
})

// WITHOUT PAGINATION
// exports.list = async (req, res) => {
//   try {
//     // createdAt/updatedAt, desc/asc, 3
//     const { sort, order, limit } = req.body;
//     const products = await Product.find({})
//       .populate("category")
//       .populate("subs")
//       .sort([[sort, order]])
//       .limit(limit)
//       .exec();

//     res.json(products);
//   } catch (err) {
//     console.log(err);
//   }
// };

// WITH PAGINATION
// exports.list = async (req, res) => {
//   // console.table(req.body);
//   try {
//     // createdAt/updatedAt, desc/asc, 3
//     const { sort, order, page } = req.body
//     const currentPage = page || 1
//     const perPage = 3 // 3

//     const products = await Product.find({})
//       .skip((currentPage - 1) * perPage)
//       .populate('category')
//       .populate('subs')
//       .sort([[sort, order]])
//       .limit(perPage)
//       .exec()

//     res.json(products)
//   } catch (err) {
//     console.log(err)
//   }
// }

exports.getVendorProducts = async (req, res) => {
  // console.table(req.body);
  try {
    // createdAt/updatedAt, desc/asc, 3
    const { sort, order, page } = req.body
    const currentPage = page || 1
    const perPage = 3 // 3

    const products = await Product.find({ user: req.body.user })
      .skip((currentPage - 1) * perPage)
      .populate('category')
      .populate('subCategory')
      .sort([[sort, order]])
      .limit(perPage)
      .exec()

    res.json(products)
  } catch (err) {
    console.log(err)
  }
}

exports.productsCount = async (req, res) => {
  let total = await Product.find({}).estimatedDocumentCount().exec()
  res.json(total)
}

exports.productStar = async (req, res) => {
  const product = await Product.findById(req.params.productId).exec()
  const user = await User.findOne({ email: req.user.email }).exec()
  const { star } = req.body

  // who is updating?
  // check if currently logged in user have already added rating to this product?
  let existingRatingObject = product.ratings.find(
    (ele) => ele.postedBy.toString() === user._id.toString()
  )

  // if user haven't left rating yet, push it
  if (existingRatingObject === undefined) {
    let ratingAdded = await Product.findByIdAndUpdate(
      product._id,
      {
        $push: { ratings: { star, postedBy: user._id } },
      },
      { new: true }
    ).exec()
    console.log('ratingAdded', ratingAdded)
    res.json(ratingAdded)
  } else {
    // if user have already left rating, update it
    const ratingUpdated = await Product.updateOne(
      {
        ratings: { $elemMatch: existingRatingObject },
      },
      { $set: { 'ratings.$.star': star } },
      { new: true }
    ).exec()
    console.log('ratingUpdated', ratingUpdated)
    res.json(ratingUpdated)
  }
}

exports.listRelated = async (req, res) => {
  const product = await Product.findById(req.params.productId).exec()

  const related = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
  })
    .limit(3)
    .populate('category')
    .populate('subCategory')
    .populate('postedBy')
    .exec()

  res.json(related)
}

// SERACH / FILTER

const handleQuery = async (req, res, query) => {
  const products = await Product.find({ $text: { $search: query } })
    .populate('category', '_id name')
    .populate('subCategory', '_id name')
    .populate('user', '_id firstName, lastName')
    .exec()

  res.json(products)
}

const handlePrice = async (req, res, price) => {
  try {
    let products = await Product.find({
      price: {
        $gte: price[0],
        $lte: price[1],
      },
    })
      .populate('category', '_id name')
      .populate('subCategory', '_id name')
      .populate('user', '_id firstName lastName')
      .exec()

    res.json(products)
  } catch (err) {
    console.log(err)
  }
}

const handleCategory = async (req, res, category) => {
  try {
    let products = await Product.find({ category })
      .populate('category', '_id name')
      .populate('subCategory', '_id name')
      .populate('user', '_id firstName lastName')
      .exec()

    res.json(products)
  } catch (err) {
    console.log(err)
  }
}

const handleStar = (req, res, stars) => {
  Product.aggregate([
    {
      $project: {
        document: '$$ROOT',
        // title: "$title",
        floorAverage: {
          $floor: { $avg: '$ratingsAverage' }, // floor value of 3.33 will be 3
        },
      },
    },
    { $match: { floorAverage: stars } },
  ])
    .limit(12)
    .exec((err, aggregates) => {
      if (err) console.log('AGGREGATE ERROR', err)
      Product.find({ _id: aggregates })
        .populate('category', '_id name')
        .populate('subCategory', '_id name')
        .populate('user', '_id firstName lastName')
        .exec((err, products) => {
          if (err) console.log('PRODUCT AGGREGATE ERROR', err)
          res.json(products)
        })
    })
}

const handleSub = async (req, res, sub) => {
  const products = await Product.find({ subCategory: sub })
    .populate('category', '_id name')
    .populate('subCategory', '_id name')
    .populate('user', '_id firstName lastName')
    .exec()

  res.json(products)
}

const handleShipping = async (req, res, shipping) => {
  const products = await Product.find({ shipping })
    .populate('category', '_id name')
    .populate('subCategory', '_id name')
    .populate('user', '_id firstName lastName')
    .exec()

  res.json(products)
}

exports.searchFilters = async (req, res) => {
  const { query, price, category, stars, sub, shipping, color, brand } =
    req.body

  if (query) {
    console.log('query --->', query)
    await handleQuery(req, res, query)
  }

  // price [20, 200]
  if (price !== undefined) {
    console.log('price ---> ', price)
    await handlePrice(req, res, price)
  }

  if (category) {
    console.log('category ---> ', category)
    await handleCategory(req, res, category)
  }

  if (stars) {
    console.log('stars ---> ', stars)
    await handleStar(req, res, stars)
  }

  if (sub) {
    console.log('sub ---> ', sub)
    await handleSub(req, res, sub)
  }

  if (shipping) {
    console.log('shipping ---> ', shipping)
    await handleShipping(req, res, shipping)
  }

  if (color) {
    console.log('color ---> ', color)
    await handleColor(req, res, color)
  }

  if (brand) {
    console.log('brand ---> ', brand)
    await handleBrand(req, res, brand)
  }
}

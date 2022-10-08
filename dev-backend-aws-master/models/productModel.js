const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
      text: true,
    },
    user: {
      type: ObjectId,
      ref: 'User',
      required: true,
    },
    farmer: {
      type: mongoose.Schema.ObjectId,
      ref: 'Farmer',
    },
    deliveryType: {
      type: Array,
    },
    paymentType: {
      type: String,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
      text: true,
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      trim: true,
      maxlength: 32,
    },
    category: {
      type: ObjectId,
      ref: 'Category',
      required: true,
    },
    metrics: {
      type: String,
    },
    subCategory: [
      {
        type: ObjectId,
        ref: 'SubCategory',
        required: true,
      },
    ],
    location: {
      type: String,
    },
    quantity: { type: Number, required: true },
    weight: { type: Number },
    sold: {
      type: Number,
      default: 0,
    },
    images: {
      type: Array,
    },
    published: {
      type: Boolean,
      default: false,
    },
    // ratings: [
    //   {
    //     star: Number,
    //     postedBy: { type: ObjectId, ref: 'User' },
    //   },
    // ],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

productSchema.index({user: 1})
productSchema.index({productName: 1})
productSchema.index({slug: 1})


productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id',
})

productSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
  })
  next()
})

productSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'category',
  })
  next()
})

const Product = mongoose.model('Product', productSchema)

module.exports = Product

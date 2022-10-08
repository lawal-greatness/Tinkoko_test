const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const ordersSchema = new mongoose.Schema(
  {
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      default: 1,
    },
    status: {
      type: String,
      enum: ['paid', 'unpaid', 'processing'],
    },

    product: { type: ObjectId, ref: 'Product', required: true },
    vendor: { type: ObjectId, ref: 'User', required: true },
    buyer: { type: ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

ordersSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'buyer',
  })
  next()
})
ordersSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'vendor',
  })
  next()
})
ordersSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'product',
    populate: { path: 'category' },
  })
  next()
})

// Virtual populate
// postSchema.virtual('comments', {
//   ref: 'Comment',
//   foreignField: 'post',
//   localField: '_id',
// })

const Orders = mongoose.model('Orders', ordersSchema)

module.exports = Orders

const mongoose = require('mongoose')
const { ObjectId } = mongoose

const farmerProductSchema = new mongoose.Schema(
  {
    agent: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    farmer: {
      type: mongoose.Schema.ObjectId,
      ref: 'Farmer',
    },
    productName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: ObjectId,
      ref: 'Category',
      required: true,
    },
    deliveryType: {
      type: String,
    },
    images: {
      type: Array,
    },
    subCategory: [
      {
        type: ObjectId,
        ref: 'SubCategory',
      },
    ],
  },
  {
    timestamps: true,
  }
)

const FarmerProduct = mongoose.model('FarmerProduct', farmerProductSchema)
module.exports = FarmerProduct

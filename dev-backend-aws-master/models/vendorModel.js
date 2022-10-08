const mongoose = require('mongoose')

const vendorSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    storeName: {
      type: String,
    },
    country: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    address: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

const Vendor = mongoose.model('Vendor', vendorSchema)
module.exports = Vendor

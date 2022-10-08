const mongoose = require('mongoose')

const quoteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    description: {
      type: String,
    },
    quote: {
      type: Array,
    },
    adminResponse: String,
    date: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

const Quote = mongoose.model('Quote', quoteSchema)
module.exports = Quote

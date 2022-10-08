const mongoose = require('mongoose')

const advertSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    industry: {
      type: String,
    },
    country: {
      type: String,
    },
    lga: {
      type: String,
    },
    companyName: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

const Advert = mongoose.model('Advert', advertSchema)
module.exports = Advert

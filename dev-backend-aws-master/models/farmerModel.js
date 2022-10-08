const mongoose = require('mongoose')

const farmerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
    },
    address: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    nextOfKin: {
      type: String,
      required: true,
    },
    nextOfKinPhone: {
      type: Number,
      required: true,
    },
    photo: {
      type: Object,
    },

    agent: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

const Farmer = mongoose.model('Farmer', farmerSchema)
module.exports = Farmer

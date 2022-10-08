const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const referralSchema = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      ref: 'User',
    },
    referrer: {
      type: ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
)

const Referral = mongoose.model('Referral', referralSchema)

module.exports = Referral

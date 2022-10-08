const mongoose = require('mongoose')

const reportFeedSchema = new mongoose.Schema(
  {
    text: {
      type: String,
    },

    feedId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Post',
      required: true,
    },
    slug: {
      type: String,
      default: ''
    },
    reportType: {
      type: String,
      enum: ['post', 'product']
    }
  },
  {
    timestamps: true,
  }
)

const ReportFeed = mongoose.model('ReportFeed', reportFeedSchema)
module.exports = ReportFeed

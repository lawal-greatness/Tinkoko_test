const mongoose = require('mongoose')

const emailSchema = new mongoose.Schema(
  {
    emailTitle: {
      type: String,
      trim: true,
      required: 'Title is required',
      minlength: [2, 'Too short'],
      maxlength: [200, 'Too long'],
    },
    emailDetail: {
      type: String,
      required: 'Detail is required',
    },
    emailFrom: {
      type: String,
      required: 'Sender is required',
    },
    emailRecipients: {
      type: Array,
    },
    sentBy: {
      ref: 'User',
      type: mongoose.Schema.ObjectId,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Email', emailSchema)

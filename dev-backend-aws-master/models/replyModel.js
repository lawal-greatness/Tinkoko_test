const mongoose = require('mongoose')

const replySchema = new mongoose.Schema(
  {
    comment: {
      type: mongoose.Schema.ObjectId,
      ref: 'Comment',
      required: true,
    },
    reply: {
      type: String,
      required: true,
    },
    user: {
      type: Object,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// replySchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'post',
//     select: 'post poster',
//   }).populate({
//     path: 'user',
//     select: 'firstName lastName profilePicUrl role storeName',
//   })
//   next()
// })

const Reply = mongoose.model('Reply', replySchema)
module.exports = Reply

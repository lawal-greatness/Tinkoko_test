const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    post: {
      type: mongoose.Schema.ObjectId,
      ref: 'Post',
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

commentSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'post',
    select: 'post poster',
  }).populate({
    path: 'user',
    select: 'firstName lastName profilePicUrl role storeName',
  })
  next()
})

const Comment = mongoose.model('Comment', commentSchema)
module.exports = Comment

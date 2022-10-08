const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const postSchema = new mongoose.Schema(
  {
    post: {
      type: String,
      trim: true,
      required: 'post is required',
    },
    likes: [{ user: { type: ObjectId, ref: 'User' } }],
    images: {
      type: Array,
      required: [true, 'Upload at least 1 photo'],
    },
    productSlug: {
      type: String,
    },
    category: { type: ObjectId, ref: 'Category', required: true },
    poster: { type: ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Virtual populate
postSchema.virtual('comments', {
  ref: 'Comment',
  foreignField: 'post',
  localField: '_id',
})

const Post = mongoose.model('Post', postSchema)

module.exports = Post

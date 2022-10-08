const Comment = require('../models/commentModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const factory = require('./handlerFactory')
const {
  newCommentNotification,
  removeCommentNotification,
} = require('../utils/notificationActions')

exports.setPostUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.post) req.body.post = req.params.postId
  if (!req.body.user) req.body.user = req.user._id

  next()
}

exports.getAllComments = factory.getAll(Comment)
exports.getComment = factory.getOne(Comment, { path: 'user' })

exports.createComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.create(req.body)
  const doc = await Comment.findById(comment._id).populate('user')

  if (doc.post.poster.toString() !== req.user._id.toString()) {
    await newCommentNotification(
      doc.post._id.toString(),
      doc._id.toString(),
      doc.user._id.toString(),
      doc.post.poster.toString(),
      doc.comment
    )
  }
  res.status(201).json({
    status: 'success',
    doc,
  })
})

// exports.createComment = factory.createOne(Comment)
exports.updateComment = factory.updateOne(Comment)
// exports.deleteComment = factory.deleteOne(Comment)
exports.deleteComment = catchAsync(async (req, res, next) => {
  const doc = await Comment.findByIdAndDelete(req.params.id)

  if (!doc) {
    return next(new AppError('No document found with that ID', 404))
  }

  if (doc.post.poster.toString() !== req.user._id.toString()) {
    await removeCommentNotification(
      doc.post._id.toString(),
      doc._id.toString(),
      doc.user._id.toString(),
      doc.post.poster.toString()
    )
  }

  res.status(204).json({
    status: 'success',
    data: null,
  })
})

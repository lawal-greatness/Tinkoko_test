const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const Reply = require('../models/replyModel')
const factory = require('./handlerFactory')
const {
  newCommentNotification,
  removeCommentNotification,
} = require('../utils/notificationActions')

exports.setPostUserIds = (req, res, next) => {
  // Allow nested routes
  // if (!req.body.post) req.body.post = req.params.postId
  // if (!req.body.user) req.body.user = req.user._id

  next()
}

// exports.getAllReplies = factory.getAll(Reply)

exports.getAllReplies = catchAsync(async (req, res, next) => {
  const doc = await Reply.find()

  // SEND RESPONSE
  res.status(200).json(doc)
})
exports.getReply = factory.getOne(Reply, { path: 'user' })

exports.createReply = catchAsync(async (req, res, next) => {
  const reply = await Reply.create(req.body)
  // const doc = await Reply.findById(reply._id).populate('user')

  // if (doc.post.poster.toString() !== req.user._id.toString()) {
  //   await newReplyNotification(
  //     doc.post._id.toString(),
  //     doc._id.toString(),
  //     doc.user._id.toString(),
  //     doc.post.poster.toString(),
  //     doc.comment
  //   )
  // }
  res.status(201).json({
    status: 'success',
    reply,
  })

})

// exports.createComment = factory.createOne(Comment)
exports.updateReply = factory.updateOne(Reply)
// exports.deleteComment = factory.deleteOne(Comment)
exports.deleteReply = catchAsync(async (req, res, next) => {
  const doc = await Reply.findByIdAndDelete(req.params.id)

  if (!doc) {
    return next(new AppError('No document found with that ID', 404))
  }

  // if (doc.post.poster.toString() !== req.user._id.toString()) {
  //   await removeReplyNotification(
  //     doc.post._id.toString(),
  //     doc._id.toString(),
  //     doc.user._id.toString(),
  //     doc.post.poster.toString()
  //   )
  // }

  res.status(204).json({
    status: 'success',
    data: null,
  })
})

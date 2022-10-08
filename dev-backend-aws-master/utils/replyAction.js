const Reply = require('../models/replyModel')
const catchAsync = require('./catchAsync')
const { newCommentNotification } = require('./notificationActions')

// exports.createComment = catchAsync(async (req, res, next) => {
//   const comment = await Comment.create(req.body)
//   const doc = await Comment.findById(comment._id).populate('user')

//   if (doc.post.poster.toString() !== req.user._id.toString()) {
//     await newCommentNotification(
//       doc.post._id.toString(),
//       doc._id.toString(),
//       doc.user._id.toString(),
//       doc.post.poster.toString(),
//       doc.comment
//     )
//   }
//   res.status(201).json({
//     status: 'success',
//     doc,
//   })
// })

const newReplyCreate = async ( comment, reply ) => {
  try {
    const newReply = await Reply.create({ comment, reply })

    const doc = await Reply.findById(newReply._id).populate('user')

    // if (doc.post.poster.toString() !== user.toString()) {
    //   await newCommentNotification(
    //     doc.post._id.toString(),
    //     doc._id.toString(),
    //     doc.user._id.toString(),
    //     doc.post.poster.toString(),
    //     doc.comment
    //   )
    // }

    return {
      success: true,
      doc,
    }
  } catch (error) {
    console.log('Something went wrong')
  }
}

module.exports = { newReplyCreate }

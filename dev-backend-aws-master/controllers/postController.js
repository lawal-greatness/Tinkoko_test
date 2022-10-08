const Post = require('../models/postModel')
const Follower = require('../models/followerModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const factory = require('./handlerFactory')
const uuid = require('uuid').v4
const {
  newLikeNotification,
  removeLikeNotification,
  newCommentNotification,
  removeCommentNotification,
} = require('../utils/notificationActions')
const TrailManager = require('./trailController')

// exports.getPost = factory.getOne(Post)
// exports.createPost = factory.createOne(Post)
exports.updatePost = factory.updateOne(Post)
exports.deletePost = factory.deleteOne(Post)

exports.createPost = catchAsync(async (req, res, next) => {
  const { post, images, category } = req.body
  const newPost = {
    post,
    images,
    category,
    poster: req.user,
  }

  const feed = await new Post(newPost).save()
  TrailManager(req.user._id, `created post ${post.post}`, 'success')

  const postCreated = await Post.findById(feed._id).populate('poster')

  return res.json(postCreated)
})

exports.getAllPosts = factory.getAll(Post, { path: 'poster comments' })

// exports.getAllPosts = catchAsync(async (req, res, next) => {
//   const posts = await Post.find()
//     .sort({ createdAt: -1 })
//     .populate('poster')
//     // .populate('comments.user')
//     .populate('comments')

//   return res.json(posts)
// })

// GET FEED
exports.getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.postId)
    .populate('poster')
    .populate('comments')

  if (!post) {
    return next(new AppError('Post Not Found', 404))
  }

  return res.json(post)
})

// DELETE FEED
exports.deletePost = catchAsync(async (req, res, next) => {
  const { user } = req
  const post = await Post.findById(req.params.postId)

  if (!post) {
    return next(new AppError('Post Not Found', 404))
  }

  if (post.poster.toString() !== user._id.toString()) {
    if (user.role === 'admin') {
      const deletedPost = await post.remove()
      TrailManager(req.user._id, `deleted post ${deletedPost.post}`, 'success')
      return res.status(200).json('Post deleted Successfully')
    } else {
      return next(new AppError('Unauthorized', 401))
    }
  }

  await post.remove()
  return res.status(200).json('Post deleted Successfully')
})

// LIKE A POST
exports.likePost = catchAsync(async (req, res, next) => {
  const { postId } = req.params
  const { user } = req

  console.log('postID', postId)

  const post = await Post.findById(postId)

  if (!post) {
    return next(new AppError('Post Not Found', 404))
  }

  const isLiked =
    post.likes.filter((like) => like.user.toString() === user._id.toString())
      .length > 0

  if (isLiked) {
    return next(new AppError('Post already liked', 401))
  }

  await post.likes.unshift({ user: user._id })
  await post.save()

  if (post.poster.toString() !== user._id.toString()) {
    await newLikeNotification(
      user._id.toString(),
      postId,
      post.poster.toString()
    )
  }

  return res.status(200).json('Post liked')
})

// UNLIKE A POST
exports.unlikePost = catchAsync(async (req, res, next) => {
  const { postId } = req.params
  const { user } = req

  const post = await Post.findById(postId)
  if (!post) {
    return next(new AppError('Post Not Found', 404))
  }

  const isLiked =
    post.likes.filter((like) => like.user.toString() === user._id.toString())
      .length === 0

  if (isLiked) {
    return next(new AppError('Post not liked before', 401))
  }

  const index = post.likes
    .map((like) => like.user.toString())
    .indexOf(user._id.toString())

  await post.likes.splice(index, 1)

  await post.save()

  if (post.poster.toString() !== user._id.toString()) {
    await removeLikeNotification(
      user._id.toString(),
      postId,
      post.poster.toString()
    )
  }

  return res.status(200).json('Post Unliked')
})

// GET ALL LIKES
exports.getAllLikes = catchAsync(async (req, res, next) => {
  const { postId } = req.params

  const post = await Post.findById(postId).populate('likes.user')
  if (!post) {
    return next(new AppError('No Post Found', 404))
  }

  return res.status(200).json(post.likes)
})

// CREATE COMMENT
exports.createComment = catchAsync(async (req, res, next) => {
  const { postId } = req.params
  const { text } = req.body

  if (text.length < 1)
    return next(new AppError('Comment should be atleast 1 character', 401))

  const post = await Post.findById(postId)

  if (!post) return next(new AppError('Post Not Found', 404))

  const newComment = {
    _id: uuid(),
    text,
    user: req.user,
    date: Date.now(),
  }

  await post.comments.unshift(newComment)
  await post.save()

  return res.status(200).json(newComment._id)
})

// DELETE COMMENT
exports.deleteComment = catchAsync(async (req, res, next) => {
  const { commentId, postId } = req.params

  const post = await PostModel.findById(postId)
  if (!post) return next(new AppError('Post Not Found', 404))

  const comment = post.comments.find((comment) => comment._id === commentId)
  if (!comment) return next(new AppError('Comment Not Found', 404))

  const deleteComment = async () => {
    const indexOf = post.comments
      .map((comment) => comment._id)
      .indexOf(commentId)

    await post.comments.splice(indexOf, 1)

    await post.save()

    // if (post.user.toString() !== userId) {
    //   await removeCommentNotification(
    //     postId,
    //     commentId,
    //     userId,
    //     post.user.toString()
    //   )
    // }

    return res.status(200).send('Deleted Successfully')
  }

  if (comment.user.toString() !== user._id.toString()) {
    if (user.role === 'admin') {
      await deleteComment()
    } else {
      return res.status(401).send('Unauthorized')
    }
  }

  await deleteComment()
})

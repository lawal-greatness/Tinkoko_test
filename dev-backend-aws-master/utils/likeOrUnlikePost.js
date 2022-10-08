const User = require('../models/userModel')
const Post = require('../models/postModel')
const {
  newLikeNotification,
  removeLikeNotification,
} = require('../utils/notificationActions')

const likeOrUnlikePost = async (postId, userId, like) => {
  try {
    const post = await Post.findById(postId)

    if (!post) return { error: 'No post found' }

    if (like) {
      const isLiked =
        post.likes.filter((like) => like.user.toString() === userId).length > 0

      if (isLiked) return { error: 'Post liked before' }

      await post.likes.unshift({ user: userId })

      const res = await post.save()

      if (post.poster.toString() !== userId) {
        await newLikeNotification(userId, postId, post.poster.toString())
      }
    }
    //
    else {
      const isLiked =
        post.likes.filter((like) => like.user.toString() === userId).length ===
        0

      if (isLiked) return { error: 'Post not liked before' }

      const indexOf = post.likes
        .map((like) => like.user.toString())
        .indexOf(userId)

      await post.likes.splice(indexOf, 1)

      await post.save()

      if (post.poster.toString() !== userId) {
        await removeLikeNotification(userId, postId, post.poster.toString())
      }
    }

    const user = await User.findById(userId)

    const { firstName, lastName, profilePicUrl } = user

    return {
      success: true,
      firstName,
      lastName,
      profilePicUrl,
      postByUserId: post.poster.toString(),
    }
  } catch (error) {
    return { error: 'Server error' }
  }
}

module.exports = { likeOrUnlikePost }

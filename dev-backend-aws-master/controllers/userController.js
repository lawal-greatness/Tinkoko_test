const User = require('../models/userModel')
const Follower = require('../models/followerModel')
const Post = require('../models/postModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const factory = require('./handlerFactory')
const {
  newFollowerNotification,
  removeFollowerNotification,
} = require('../utils/notificationActions')

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id
  next()
}

exports.updateMe = catchAsync(async (req, res, next) => {
  // Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    )
  }

  // Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email')

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    status: 'success',
    user: updatedUser,
  })
})

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false })

  res.status(204).json({
    status: 'success',
    data: null,
  })
})

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead',
  })
}

exports.getAllUsers = factory.getAll(User)

exports.getAllNoPaginate = catchAsync(async (req, res, next) => {
  const doc = await User.find()

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: doc.length,
    data: {
      data: doc,
    },
  })
})

exports.getAllNoPaginate = catchAsync(async (req, res, next) => {
  const doc = await User.find()

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: doc.length,
    data: {
      data: doc,
    },
  })
})

exports.getVerifiedUsers = catchAsync(async (req, res, next) => {
  const user = await User.find({ verification: 'verification' })
  // console.log('THE USERRRRRR', user)

  res.json(user)

  // if (!user) {
  //   return next(new AppError("No User Found", 404));
  // }

  // const followStats = await Follower.findOne({ user: user._id });
  // const postStats = await Post.find({ poster: user._id });

  // return res.json({
  //   user,
  //   followStats,

  //   followersLength:
  //     followStats.followers.length > 0 ? followStats.followers.length : 0,

  //   followingLength:
  //     followStats.following.length > 0 ? followStats.following.length : 0,

  //   postLength: postStats.length > 0 ? postStats.length : 0,
  // });
})
// exports.getUser = factory.getOne(User)
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return next(new AppError('No User Found', 404))
  }

  const followStats = await Follower.findOne({ user: user._id })
  const postStats = await Post.find({ poster: user._id })

  return res.json({
    user,
    followStats,

    followersLength:
      followStats.followers.length > 0 ? followStats.followers.length : 0,

    followingLength:
      followStats.following.length > 0 ? followStats.following.length : 0,

    postLength: postStats.length > 0 ? postStats.length : 0,
  })
})

// GET USER POST
exports.getUserPosts = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return next(new AppError('No User Found', 404))
  }

  const posts = await Post.find({ poster: user._id })
    .populate('poster')
    .populate('comments')

  return res.json({
    posts,
  })
})

// GET FOLLOWERS OF USER
exports.getFollowers = catchAsync(async (req, res, next) => {
  const { userId } = req.params

  const user = await Follower.findOne({ user: userId }).populate(
    'followers.user'
  )

  return res.json(user.followers)
})

exports.getFollowing = catchAsync(async (req, res, next) => {
  const { userId } = req.params

  const user = await Follower.findOne({ user: userId }).populate(
    'following.user'
  )

  return res.json(user.following)
})

// FOLLOW A USER
exports.followUser = catchAsync(async (req, res, next) => {
  const { user } = req
  const { userToFollowId } = req.params

  const activeUser = await Follower.findOne({ user })
  const userToFollow = await Follower.findOne({ user: userToFollowId })

  if (!activeUser || !userToFollow) {
    return next(new AppError('User not found', 404))
  }

  const isFollowing =
    activeUser.following.length > 0 &&
    activeUser.following.filter(
      (following) => following.user.toString() === userToFollowId
    ).length > 0

  if (isFollowing) {
    return next(new AppError('User already Followed', 401))
  }

  await activeUser.following.unshift({ user: userToFollowId })
  await activeUser.save()

  await userToFollow.followers.unshift({ user })
  await userToFollow.save()

  await newFollowerNotification(user._id, userToFollowId)

  return res.status(200).send('User Followed')
})

// UNFOLLOW A USER
exports.unfollowUser = catchAsync(async (req, res, next) => {
  const { user } = req
  const { userToUnfollowId } = req.params

  const activeUser = await Follower.findOne({ user })
  const userToUnfollow = await Follower.findOne({ user: userToUnfollowId })

  if (!activeUser || !userToUnfollow) {
    return next(new AppError('User not found', 404))
  }

  const isFollowing =
    activeUser.following.length > 0 &&
    activeUser.following.filter(
      (following) => following.user.toString() === userToUnfollowId
    ).length === 0

  if (isFollowing) {
    return next(new AppError('User Not Followed Before', 401))
  }

  const removeFollowing = await activeUser.following
    .map((following) => following.user.toString())
    .indexOf(userToUnfollowId)

  await activeUser.following.splice(removeFollowing, 1)
  await activeUser.save()

  const removeFollower = await userToUnfollow.followers
    .map((follower) => follower.user.toString())
    .indexOf(user)

  await userToUnfollow.followers.splice(removeFollower, 1)
  await userToUnfollow.save()

  await removeFollowerNotification(user._id, userToUnfollowId)

  return res.status(200).send('User Unfollowed')
})

// Do NOT update passwords with this!
exports.updateUser = factory.updateOne(User)
// exports.deleteUser = factory.deleteOne(User);

exports.deleteUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.params.id, { active: false })

  res.status(204).json({
    status: 'success',
    data: null,
  })
  // console.log(req.params.id)
})

//SEARCH USER

exports.searchUser = async (req, res) => {
  const { query, price, category, stars, sub, shipping, color, brand } =
    req.body

  if (query) {
    console.log('query --->', query)
    await handleQuery(req, res, query)
  }
}

const handleQuery = async (req, res, query) => {
  const foundUser = await User.find({ userId: query })
  // const foundUserLastName = await User.find({ lastName: query })
  // .populate('category', '_id name')
  // .populate('subCategory', '_id name')
  // .populate('user', '_id firstName, lastName')
  // .exec()
  // console.log("checking", foundUserFirstName === true)
  // console.log("list!!!!!!", foundUserFirstName)

  // foundUserFirstName.length >= 1 ? res.json(foundUserFirstName) : res.json(foundUserLastName)
  res.json(foundUser)
}

// SAVE ADDRESS ON CHECKOUT
exports.saveAddress = async (req, res) => {
  const userAddress = await User.findOneAndUpdate(
    { email: req.user.email },
    {
      deliveryAddress: req.body.address,
      deliveryCity: req.body.city,
      deliveryState: req.body.state,
    }
  ).exec()

  res.json({ ok: true })
}

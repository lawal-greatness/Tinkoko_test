const Notification = require('../models/notificationModel')
const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

exports.getNotification = catchAsync(async (req, res, next) => {
  const user = await Notification.findOne({ user: req.user.id })
    .populate('notifications.user')
    .populate('notifications.deposit')
    .populate('notifications.post')
    .populate('notifications.inApp')
    .populate('notifications.inAppConfirm')
    .populate('notifications.inAppCancel')
    .populate('notifications.withdraw')
    .populate('notifications.quote')
    .populate('notifications.reportFeed')
    .populate('notifications.advert')
    .populate('notifications.contact')

  const { notifications } = user
  let notificationLength = notifications.filter(
    (el) => el.status === 'unread'
  ).length

  const { unreadNotification } = await User.findById(req.user.id)

  return res.json({
    notification: user.notifications,
    unreadNotification: notificationLength,
  })
})
exports.updateNotification = catchAsync(async (req, res, next) => {
  const user = await Notification.findOne({ user: req.user.id })

  for (let i = 0; i < user.notifications.length; i++) {
    if ((user.notifications[i].status = 'unread')) {
      user.notifications[i].status = 'read'
    }
  }

  await user.save()

  return res.json({ unreadNotification: 0 })
})

exports.postNotification = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id)

  if (user.unreadNotification) {
    user.unreadNotification = false
    await user.save()
  }
  return res.status(200).send('Updated')
})

exports.updateAdminNotification = catchAsync(async (req, res, next) => {
  const user = await Notification.findOne({ user: req.user.id })
  const notificationId = req.body.notificationId

  user.notifications.find((o, i) => {
    if (o._id.toString() === notificationId) {
      o.status = 'read'
    }
  })
  const savedUser = await user.save()

  const { notifications } = savedUser
  let notificationLength = notifications.filter(
    (el) => el.status === 'unread'
  ).length

  return res.json({
    notification: user.notifications,
    unreadNotification: notificationLength,
  })

  // const user = await User.findById(req.user.id)

  // if (!user) {
  //   return next(new AppError('No user found', 404))
  // }

  // user.unreadNotification = false
  // await user.save()

  // return res.json({ unreadNotification: 0 })
})

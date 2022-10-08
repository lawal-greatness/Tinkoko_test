const UserModel = require('../models/userModel')
const NotificationModel = require('../models/notificationModel')
const catchAsync = require('./catchAsync')
const res = require('express/lib/response')
const User = require('../models/userModel')

const setNotificationToUnread = async (userId) => {
  try {
    const user = await UserModel.findById(userId)

    if (!user.unreadNotification) {
      user.unreadNotification = true
      await user.save()
    }

    return
  } catch (error) {
    res.send(error)
    console.log(error)
  }
}

const newLikeNotification = async (userId, postId, userToNotifyId) => {
  try {
    const userToNotify = await NotificationModel.findOne({
      user: userToNotifyId,
    })

    const newNotification = {
      type: 'newLike',
      user: userId,
      post: postId,
      date: Date.now(),
      status: 'unread',
    }

    await userToNotify.notifications.unshift(newNotification)
    await userToNotify.save()

    await setNotificationToUnread(userToNotifyId)
    return
  } catch (error) {
    res.send(error)
    console.log(error)
  }
}

const removeLikeNotification = async (userId, postId, userToNotifyId) => {
  try {
    const user = await NotificationModel.findOne({ user: userToNotifyId })

    const notificationToRemove = await user.notifications.find(
      (notification) =>
        notification.type === 'newLike' &&
        notification.user.toString() === userId &&
        notification.post.toString() === postId
    )

    const indexOf = user.notifications
      .map((notification) => notification._id.toString())
      .indexOf(notificationToRemove._id.toString())

    await user.notifications.splice(indexOf, 1)
    await user.save()

    return
  } catch (error) {
    // res.send(error)
    console.log(error)
  }
}

const newCommentNotification = async (
  postId,
  commentId,
  userId,
  userToNotifyId,
  text
) => {
  try {
    const userToNotify = await NotificationModel.findOne({
      user: userToNotifyId,
    })

    const newNotification = {
      type: 'newComment',
      user: userId,
      post: postId,
      comment: commentId,
      text,
      date: Date.now(),
      status: 'unread',
    }

    await userToNotify.notifications.unshift(newNotification)

    await userToNotify.save()

    await setNotificationToUnread(userToNotifyId)
    return
  } catch (error) {
    console.log(error)
    res.send(error)
  }
}

const removeCommentNotification = async (
  postId,
  commentId,
  userId,
  userToNotifyId
) => {
  try {
    const user = await NotificationModel.findOne({ user: userToNotifyId })

    const notificationToRemove = await user.notifications.find(
      (notification) =>
        notification.type === 'newComment' &&
        notification.user.toString() === userId &&
        notification.post.toString() === postId &&
        notification.comment.toString() === commentId
    )

    const indexOf = await user.notifications
      .map((notification) => notification._id.toString())
      .indexOf(notificationToRemove._id.toString())

    await user.notifications.splice(indexOf, 1)
    await user.save()
  } catch (error) {
    console.log(error)
    res.send(error)
  }
}

const newFollowerNotification = async (userId, userToNotifyId) => {
  try {
    const user = await NotificationModel.findOne({ user: userToNotifyId })

    const newNotification = {
      type: 'newFollower',
      user: userId,
      date: Date.now(),
      status: 'unread',
    }

    await user.notifications.unshift(newNotification)

    await user.save()

    await setNotificationToUnread(userToNotifyId)
    return
  } catch (error) {
    res.send(error)
    console.log(error)
  }
}

const removeFollowerNotification = async (userId, userToNotifyId) => {
  try {
    const user = await NotificationModel.findOne({ user: userToNotifyId })

    const notificationToRemove = await user.notifications.find(
      (notification) =>
        notification.type === 'newFollower' &&
        notification.user.toString() === userId
    )

    const indexOf = await user.notifications
      .map((notification) => notification._id.toString())
      .indexOf(notificationToRemove._id.toString())

    await user.notifications.splice(indexOf, 1)

    await user.save()
    return
  } catch (error) {
    res.send(error)
    console.log(error)
  }
}

const newOrderNotification = async (userId, orderId, userToNotifyId) => {
  try {
    const userToNotify = await NotificationModel.findOne({
      user: userToNotifyId,
    })

    const newNotification = {
      type: 'newOrder',
      user: userId,
      order: orderId,
      date: Date.now(),
      status: 'unread',
    }

    await userToNotify.notifications.unshift(newNotification)
    await userToNotify.save()

    await setNotificationToUnread(userToNotifyId)
    return
  } catch (error) {
    res.send(error)
    console.log(error)
  }
}

const newDepositNotification = async (userId, depositId) => {
  try {
    const userToNotify = await NotificationModel.findOne({
      user: userId,
    })

    const newNotification = {
      type: 'newDeposit',
      user: userId,
      deposit: depositId,
      date: Date.now(),
      status: 'unread',
    }

    await userToNotify.notifications.unshift(newNotification)
    await userToNotify.save()

    await setNotificationToUnread(userId)
    return
  } catch (error) {
    res.send(error)
    console.log(error)
  }
}

const newInAppNotification = async (userId, inAppId, userToNotifyId) => {
  try {
    const userToNotify = await NotificationModel.findOne({
      user: userToNotifyId,
    })

    const newNotification = {
      type: 'newInappTransfer',
      user: userId,
      inApp: inAppId,
      date: Date.now(),
      status: 'unread',
    }

    await userToNotify.notifications.unshift(newNotification)
    await userToNotify.save()

    await setNotificationToUnread(userToNotifyId)
    return
  } catch (error) {
    res.send(error)
    console.log(error)
  }
}

const confirmInAppNotification = async (userId, inAppId, userToNotifyId) => {
  try {
    const userToNotify = await NotificationModel.findOne({
      user: userToNotifyId,
    })

    const newNotification = {
      type: 'confirmInappTransfer',
      user: userId,
      inAppConfirm: inAppId,
      date: Date.now(),
      status: 'unread',
    }

    await userToNotify.notifications.unshift(newNotification)
    await userToNotify.save()

    await setNotificationToUnread(userToNotifyId)
    return
  } catch (error) {
    res.send(error)
    console.log(error)
  }
}

const cancelInAppNotification = async (userId, inAppId, userToNotifyId) => {
  try {
    const userToNotify = await NotificationModel.findOne({
      user: userToNotifyId,
    })

    const newNotification = {
      type: 'cancelInappTransfer',
      user: userId,
      inAppCancel: inAppId,
      date: Date.now(),
      status: 'unread',
    }

    await userToNotify.notifications.unshift(newNotification)
    await userToNotify.save()

    await setNotificationToUnread(userToNotifyId)
    return
  } catch (error) {
    res.send(error)
    console.log(error)
  }
}

const newWithdrawalNotification = async (userId, withdrawId) => {
  try {
    const userToNotify = await NotificationModel.findOne({
      user: userId,
    })

    const newNotification = {
      type: 'newWithdrawal',
      user: userId,
      withdraw: withdrawId,
      date: Date.now(),
      status: 'unread',
    }

    await userToNotify.notifications.unshift(newNotification)
    await userToNotify.save()

    await setNotificationToUnread(userId)
    return
  } catch (error) {
    res.send(error)
    console.log(error)
  }
}

const newQuoteNotification = async (quoteId) => {
  try {
    const adminToNotify = await User.find({
      $or: [
        { role: 'admin' },
        { role: 'business-development' },
        { role: 'customer-care' },
      ],
    })

    // console.log('ADMIN to notify', adminToNotify)

    const adminToNotifyId = adminToNotify.map((user) => user._id.toString())

    for (let i = 0; i < adminToNotifyId.length; i++) {
      const userToNotify = await NotificationModel.findOne({
        user: adminToNotifyId[i],
      })

      const newNotification = {
        type: 'newQuote',
        // user: adminToNotifyId[i],
        quote: quoteId,
        date: Date.now(),
        status: 'unread',
      }

      await userToNotify.notifications.unshift(newNotification)
      await userToNotify.save()
    }

    return
  } catch (error) {
    res.send(error)
    console.log(error)
  }
}
const newReportFeedNotification = async (reportId) => {
  try {
    const adminToNotify = await User.find({
      $or: [{ role: 'admin' }, { role: 'customer-care' }],
    })

    const adminToNotifyId = adminToNotify.map((user) => user._id.toString())

    for (let i = 0; i < adminToNotifyId.length; i++) {
      const userToNotify = await NotificationModel.findOne({
        user: adminToNotifyId[i],
      })
      const newNotification = {
        type: 'newReportFeed',
        // user: adminToNotifyId[i],
        reportFeed: reportId,
        date: Date.now(),
        status: 'unread',
      }

      await userToNotify.notifications.unshift(newNotification)
      await userToNotify.save()
    }

    return
  } catch (error) {
    res.send(error)
    console.log(error)
  }
}
const newAdvertNotification = async (advertId) => {
  try {
    const adminToNotify = await User.find({
      $or: [
        { role: 'admin' },
        { role: 'business-development' },
        { role: 'customer-care' },
      ],
    })

    const adminToNotifyId = adminToNotify.map((user) => user._id.toString())

    for (let i = 0; i < adminToNotifyId.length; i++) {
      const userToNotify = await NotificationModel.findOne({
        user: adminToNotifyId[i],
      })
      const newNotification = {
        type: 'newAdvert',
        // user: adminToNotifyId[i],
        advert: advertId,
        date: Date.now(),
        status: 'unread',
      }

      await userToNotify.notifications.unshift(newNotification)
      await userToNotify.save()
    }

    return
  } catch (error) {
    res.send(error)
    console.log(error)
  }
}
const newContactUsNotification = async (contactId) => {
  try {
    const adminToNotify = await User.find({
      $or: [
        { role: 'admin' },
        { role: 'business-development' },
        { role: 'customer-care' },
      ],
    })

    const adminToNotifyId = adminToNotify.map((user) => user._id.toString())

    for (let i = 0; i < adminToNotifyId.length; i++) {
      const userToNotify = await NotificationModel.findOne({
        user: adminToNotifyId[i],
      })
      const newNotification = {
        type: 'newContact',
        // user: adminToNotifyId[i],
        contact: contactId,
        date: Date.now(),
        status: 'unread',
      }

      await userToNotify.notifications.unshift(newNotification)
      await userToNotify.save()
    }

    return
  } catch (error) {
    res.send(error)
    console.log(error)
  }
}
module.exports = {
  newLikeNotification,
  removeLikeNotification,
  newCommentNotification,
  removeCommentNotification,
  newFollowerNotification,
  removeFollowerNotification,
  newOrderNotification,
  newDepositNotification,
  newInAppNotification,
  confirmInAppNotification,
  cancelInAppNotification,
  newWithdrawalNotification,
  newQuoteNotification,
  newReportFeedNotification,
  newAdvertNotification,
  newContactUsNotification,
}

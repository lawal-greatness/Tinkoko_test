const Chat = require('../models/chatModel')
const User = require('../models/userModel')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')

// GET ALL CHATS

exports.getAllChats = catchAsync(async (req, res, next) => {
  const user = await Chat.findOne({ user: req.user._id })
    .populate('chats.messagesWith')
    .sort({ date: 1 })

  let chatsToBeSent = []

  if (user.chats.length > 0) {
    chatsToBeSent = await user.chats.map((chat) => ({
      messagesWith: chat.messagesWith._id,
      firstName: chat.messagesWith.firstName,
      lastName: chat.messagesWith.lastName,
      profilePicUrl: chat.messagesWith.profilePicUrl,
      status: chat.messages[chat.messages.length - 1].status,
      sender: chat.messages[chat.messages.length - 1].sender,
      receiver: chat.messages[chat.messages.length - 1].receiver,
      lastMessage: chat.messages[chat.messages.length - 1].msg,
      date: chat.messages[chat.messages.length - 1].date,
      status: chat.messages[chat.messages.length - 1].status,
    }))
  }
  const sentChat = chatsToBeSent.sort((a, b) => b.date - a.date)
  // console.log(chatsToBeSent)

  return res.json(chatsToBeSent)
  // return res.json(chatsToBeSent)
})

exports.createMessage = async (req, res, next) => {
  const { userId, msgSendToUserId, msg, senderName, status, sender, receiver } =
    req.body

  try {
    // LOGGED IN USER (SENDER)
    const user = await Chat.findOne({ user: userId })

    // RECEIVER
    const msgSendToUser = await Chat.findOne({ user: msgSendToUserId })

    const newMsg = {
      sender,
      receiver,
      senderName,
      status,
      msg,
      date: Date.now(),
    }

    const previousChat = user.chats.find(
      (chat) => chat.messagesWith.toString() === msgSendToUserId
    )

    if (previousChat) {
      previousChat.messages.push(newMsg)
      await user.save()
    }
    //
    else {
      const newChat = { messagesWith: msgSendToUserId, messages: [newMsg] }
      user.chats.unshift(newChat)
      await user.save()
    }

    const previousChatForReceiver = msgSendToUser.chats.find(
      (chat) => chat.messagesWith.toString() === userId
    )

    if (previousChatForReceiver) {
      previousChatForReceiver.messages.push(newMsg)
      await msgSendToUser.save()
    }
    //
    else {
      const newChat = { messagesWith: userId, messages: [newMsg] }
      msgSendToUser.chats.unshift(newChat)
      await msgSendToUser.save()
    }

    res.status(200).json({ newMsg })
    // return { newMsg }
  } catch (error) {
    console.error(error)
    return { error }
  }
}

exports.getChat = async (req, res, next) => {
  const messagesWith = req.params.messagesWith
  const userId = req.user.id

  try {
    const user = await Chat.findOne({ user: userId }).populate(
      'chats.messagesWith'
    )

    const chat = user.chats.find(
      (chat) => chat.messagesWith._id.toString() === messagesWith
    )

    if (!chat) {
      // return { error: 'No chat found' }
      res.status(200).json({ messages: [] })
    } else {
      // console.log(chat)
      res.status(200).json(chat)
      // return { chat }
    }
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
    // return { error }
  }
}

// GET USER INFO
exports.getUserInfo = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userToFindId)

  if (!user) {
    return next(new AppError('No User Found', 404))
  }

  return res.json({
    firstName: user.firstName,
    lastName: user.lastName,
    profilePicUrl: user.profilePicUrl,
  })
})

exports.deliveredMessage = async (req, res) => {
  try {
    const user = await Chat.findOne({ user: req.user._id }).populate(
      'chats.messagesWith'
    )
    const messagesWith = req.body.sender

    const { messages } = user.chats.find(
      (chat) => chat.messagesWith._id.toString() === messagesWith
    )

    messages[messages.length - 1].status = 'delivered'
    await user.save()

    const receiver = await Chat.findOne({ user: req.body.receiver }).populate(
      'chats.messagesWith'
    )

    const { messages: newChat } = receiver.chats.find(
      (chat) => chat.messagesWith._id.toString() === req.body.sender
    )

    newChat[newChat.length - 1].status = 'delivered'
    await receiver.save()

    res.status(200).json({
      success: true,
    })
  } catch (error) {
    res.status(500).json({
      error: {
        errorMessage: 'Internal Server Error',
      },
    })
  }
  // console.log(user)
  // const messageId = req.body._id

  // await messageModel
  //   .findByIdAndUpdate(messageId, {
  //     status: 'delivared',
  //   })
  //   .then(() => {
  //     res.status(200).json({
  //       success: true,
  //     })
  //   })
  //   .catch(() => {
  //     res.status(500).json({
  //       error: {
  //         errorMessage: 'Internal Server Error',
  //       },
  //     })
  //   })
}

exports.seenMessage = async (req, res) => {
  // console.log('USER', req.user)
  try {
    const user = await Chat.findOne({ user: req.user._id }).populate(
      'chats.messagesWith'
    )
    const messagesWith = req.body.sender

    const { messages } = user.chats.find(
      (chat) => chat.messagesWith._id.toString() === messagesWith
    )

    messages[messages.length - 1].status = 'seen'
    await user.save()

    const receiver = await Chat.findOne({ user: req.body.receiver }).populate(
      'chats.messagesWith'
    )

    const { messages: newChat } = receiver.chats.find(
      (chat) => chat.messagesWith._id.toString() === req.body.sender
    )

    newChat[newChat.length - 1].status = 'seen'
    await receiver.save()

    res.status(200).json({
      success: true,
    })
  } catch (error) {
    res.status(500).json({
      error: {
        errorMessage: 'Internal Server Error',
      },
    })
  }

  // console.log('USER', user)
  // console.log('receiverID', req.body)

  // console.log('MESSAGE', message[message.length - 1])
  // console.log('CHAT', messages[messages.length - 1])
  // const messageId = req.body._id

  // await messageModel
  //   .findByIdAndUpdate(messageId, {
  //     status: 'delivared',
  //   })
  //   .then(() => {
  //     res.status(200).json({
  //       success: true,
  //     })
  //   })
  //   .catch(() => {
  //     res.status(500).json({
  //       error: {
  //         errorMessage: 'Internal Server Error',
  //       },
  //     })
  //   })
}

// Delete a chat
exports.deleteChat = catchAsync(async (req, res, next) => {
  const user = await Chat.findOne({ user: req.user._id })

  const { messagesWith } = req.params

  const chatToDelete = user.chats.find(
    (chat) => chat.messagesWith.toString() === messagesWith
  )

  if (!chatToDelete) {
    return next(new AppError('Chat not found', 404))
  }

  const indexOf = user.chats
    .map((chat) => chat.messagesWith.toString())
    .indexOf(messagesWith)

  user.chats.splice(indexOf, 1)

  await user.save()

  return res.status(200).send('Chat deleted')
})

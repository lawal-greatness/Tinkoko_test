// process.on('uncaughtException', (err) => {
//   console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...')
//   console.log(err.name, err.message)
//   process.exit(1)
// })

require('dotenv').config('.env')
const app = require('./app')
require('./config/db')
const http = require('http')
const fs = require('fs')
const path = require('path')

const port = process.env.PORT || 8000
const cors = require('cors')

const {
  loadMessages,
  sendMsg,
  setMsgToUnread,
  deleteMsg,
} = require('./utils/messageActions')
const { likeOrUnlikePost } = require('./utils/likeOrUnlikePost')
const { newCommentCreate } = require('./utils/commentAction')

const httpServer = http.createServer(app)

const io = require('socket.io')(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET, POST'],
    credentials: true,
    allowedHeaders: ['custom-header'],
  },
})

httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

// const server = app.listen(port, () =>
//   console.log(`Server running on port ${port}`)
// )
// const io = require('socket.io')(server, {
//   cors: {
//     origin: '*',
//   },
// })

// io.on('connection', (socket) => {
//   socket.on('join', async ({ userId }) => {
//     const users = await addUser(userId, socket.id)

//     setInterval(() => {
//       socket.emit('connectedUsers', {
//         users: users.filter((user) => user.userId !== userId),
//       })
//     }, 10000)
//   })

//   socket.on('loadMessages', async ({ userId, messagesWith }) => {
//     const { chat, error } = await loadMessages(userId, messagesWith)

//     !error
//       ? socket.emit('messagesLoaded', { chat })
//       : socket.emit('noChatFound')
//   })

//   socket.on('sendNewMsg', async ({ userId, msgSendToUserId, msg }) => {
//     const { newMsg, error } = await sendMsg(userId, msgSendToUserId, msg)

//     // console.log(newMsg)

//     // socket.emit('helloUser', newMsg)

//     const receiverSocket = findConnectedUser(msgSendToUserId)

//     // console.log(receiverSocket)

//     if (receiverSocket) {
//       // WHEN YOU WANT TO SEND MESSAGE TO A PARTICULAR SOCKET
//       io.to(receiverSocket.socketId).emit('newMsgReceived', { newMsg })
//     }
//     //
//     else {
//       await setMsgToUnread(msgSendToUserId)
//     }

//     !error && socket.emit('msgSent', { newMsg })
//   })

//   socket.on('logout', () => removeUser(socket.id))
// })

let users = []

const addUser = (userId, socketId, userInfo) => {
  const checkUser = users.some((u) => u.userId === userId)

  if (!checkUser) {
    users.push({ userId, socketId, userInfo })
  }
}
const userRemove = (socketId) => {
  users = users.filter((u) => u.socketId !== socketId)
}

const findFriend = (id) => {
  return users.find((u) => u.userId === id)
}

const userLogout = (userId) => {
  users = users.filter((u) => u.userId !== userId)
}

io.on('connection', (socket) => {
  socket.on('addUser', (userId, userInfo) => {
    addUser(userId, socket.id, userInfo)
    io.emit('getUser', users)

    const us = users.filter((u) => u.userId !== userId)
    const con = 'new_user_add'
    for (var i = 0; i < us.length; i++) {
      socket.to(us[i].socketId).emit('new_user_add', con)
    }
  })

  socket.on('sendAddMessage', (data) => {
    const user = findFriend(data.receiver)
    const con = 'new_user_add'
    if (user !== undefined) {
      socket.to(user.socketId).emit('getMessage', data)
      socket.to(user.socketId).emit('new_user_add', con)
    }
  })
  socket.on('sendMessage', (data) => {
    const user = findFriend(data.receiver)

    if (user !== undefined) {
      socket.to(user.socketId).emit('getMessage', data)
    }
  })

  socket.on('messageSeen', (msg) => {
    const user = findFriend(msg.sender)
    if (user !== undefined) {
      socket.to(user.socketId).emit('msgSeenResponse', msg)
    }
  })

  socket.on('delivaredMessage', (msg) => {
    const user = findFriend(msg.sender)
    if (user !== undefined) {
      socket.to(user.socketId).emit('msgDelivaredResponse', msg)
    }
  })
  socket.on('seen', (data) => {
    const user = findFriend(data.sender)
    if (user !== undefined) {
      socket.to(user.socketId).emit('seenSuccess', data)
    }
  })

  socket.on('typingMessage', (data) => {
    const user = findFriend(data.receiver)

    if (user !== undefined) {
      socket.to(user.socketId).emit('typingMessageGet', {
        sender: data.sender,
        receiver: data.receiver,
        senderName: data.senderName,
        msg: data.msg,
      })
    }
  })

  socket.on('newComment', async ({ postId, poster, userId, comment }) => {
    const user = findFriend(poster)
    const commentPoster = findFriend(userId)

    const { success, doc } = await newCommentCreate(userId, postId, comment)

    if (success) {
      if (commentPoster !== undefined) {
        socket.to(commentPoster.socketId).emit('commentSuccess', { doc })
      }
      if (user !== undefined) {
        socket.to(user.socketId).emit('commentNotify', {
          post: postId,
          firstName: doc.user.firstName,
          lastName: doc.user.lastName,
          user: doc.user._id,
        })
      }
    }
  })

  socket.on('likePost', async ({ postId, userId, like }) => {
    // console.log(postId, userId, like)
    const { success, firstName, lastName, profilePicUrl, postByUserId, error } =
      await likeOrUnlikePost(postId, userId, like)

    // console.log('SUCCESS', res)

    if (success) {
      socket.emit('postLiked')
      // const user = findFriend(msg.sender)
      // if (user !== undefined) {
      //   socket.to(user.socketId).emit('msgDelivaredResponse', msg)
      // }

      if (postByUserId !== userId) {
        const receiverSocket = findFriend(postByUserId)
        if (receiverSocket !== undefined) {
          if (receiverSocket && like) {
            // WHEN YOU WANT TO SEND DATA TO ONE PARTICULAR CLIENT
            io.to(receiverSocket.socketId).emit('newNotificationReceived', {
              firstName,
              lastName,
              profilePicUrl,
              postId,
            })
          }
        }
      }
    }
  })

  socket.on('logout', (userId) => {
    userLogout(userId)
  })

  socket.on('connect_error', (err) => {
    console.log(`connect_error due to ${err.message}`)
  })

  socket.on('disconnect', () => {
    // console.log('user is disconnected... ')
    userRemove(socket.id)
    io.emit('getUser', users)
  })
})

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...')
  console.log(err.name, err.message)
  httpServer.close(() => {
    process.exit(1)
  })
})

// process.on('SIGTERM', () => {
//   console.log('👋 SIGTERM RECEIVED. Shutting down gracefully')
//   server.close(() => {
//     console.log('💥 Process terminated!')
//   })
// })

const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const chatSchema = new mongoose.Schema(
  {
    user: { type: ObjectId, ref: 'User' },
    // senderId: { type: ObjectId, ref: 'User' },
    // senderName: { type: String },
    // receiverId: {
    //   type: ObjectId,
    //   ref: 'User',
    //   required: true,
    // },
    // message: {
    //   text: {
    //     type: String,
    //     default: '',
    //   },
    //   image: {
    //     type: String,
    //     default: '',
    //   },
    // },
    // status: {
    //   type: String,
    //   default: 'unseen',
    // },
    chats: [
      {
        messagesWith: { type: ObjectId, ref: 'User' },
        messages: [
          {
            // image: {
            //   type: String,
            //   default: '',
            // },
            status: {
              type: String,
              default: 'unseen',
            },
            msg: { type: String },
            sender: { type: ObjectId, ref: 'User', required: true },
            receiver: { type: ObjectId, ref: 'User', required: true },
            date: { type: Date },
          },
        ],
      },
    ],
  },
  { timestamps: true }
)

module.exports = mongoose.model('Chat', chatSchema)

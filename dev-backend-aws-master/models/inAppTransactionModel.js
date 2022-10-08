const mongoose = require('mongoose')
const { decryptFee } = require('../utils/encryptData')
const User = require('./userModel')

const inAppTransactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      default: 'transfer',
    },
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'canceled', 'completed'],
      default: 'pending',
    },
    usedPromo: {
      type: Boolean,
      default: false,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    decAmount: {
      type: Number,
      required: true,
    },
    reasonForTransfer: {
      type: String,
    },
    updatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
)

inAppTransactionSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'sender',
    select: 'firstName lastName photo userId',
  })

  this.populate({
    path: 'receiver',
    select: 'firstName lastName photo userId',
  })
  next()
})

// inAppTransactionSchema.pre(/^find/, async function (next) {
//   this.amount = await decryptFee(this.amount)
//   next()
// })

// inAppTransactionSchema.statics.calculateBalance = async function (
//   senderId,
//   receiverId
// ) {
//   const senderStats = await this.aggregate([
//     {
//       // $match: { sender: senderId },
//       $match: { $or: [{ sender: senderId }, { receiver: senderId }] },
//     },
//     // {
//     //   $match: { status: 'pending' },
//     // },
//     {
//       $group: {
//         _id: '$status',
//         totalPending: { $sum: '$amount' },
//       },
//     },
//   ])

// const receiverStats = await this.aggregate([
//   {
//     $match: { $or: [{ sender: receiverId }, { receiver: receiverId }] },
//     // $match: { receiver: receiverId },
//   },
//   // {
//   //   $match: { status: 'pending' },
//   // },
//   {
//     $group: {
//       _id: '$status',
//       totalPending: { $sum: '$amount' },
//     },
//   },
// ])

// console.log('SENDER', senderStats)
// console.log('RECEIVER', receiverStats)

// if (receiverStats.length > 0) {
//   const user = await User.findById(receiverId)
//   const pending = receiverStats.find((i) => i._id === 'pending')
//   const completed = receiverStats.find((i) => i._id === 'completed')
//   console.log(pending)
//   user.pendingBalance = pending.totalPending
//   await user.save()

// const res = await User.findByIdAndUpdate(receiverId, {
//   // balance: user.balance - senderStats[0].totalPending,
//   pendingBalance: senderStats[0].totalPending,
// })
// console.log('RECEIVER', res)
// }
// else {
//   // await User.findByIdAndUpdate(receiverId, {
//   //   balance: 0,
//   //   pendingBalance: 0,
//   // })
// }

// if (senderStats.length > 0) {
//   const user = await User.findById(senderId)
//   const pending = receiverStats.find((i) => i._id === 'pending')
//   const completed = receiverStats.find((i) => i._id === 'completed')
//   console.log(pending)
//   user.pendingBalance = pending.totalPending
// user.balance -= pending.totalPending
// await user.save()
// const user = await User.findById(senderId)
// const res = await User.findByIdAndUpdate(senderId, {
//   balance: user.balance - senderStats[0].totalPending,
//   pendingBalance: senderStats[0].totalPending,
// })
// }
// else {
//   await User.findByIdAndUpdate(senderId, {
//     balance: 0,
//     pendingBalance: 0,
//   })
// }
// }

// inAppTransactionSchema.post('save', function () {
//   // this points to current deposit
//   this.constructor.calculateBalance(this.sender, this.receiver)
// })

const InAppTransactions = mongoose.model(
  'InAppTransactions',
  inAppTransactionSchema
)
module.exports = InAppTransactions

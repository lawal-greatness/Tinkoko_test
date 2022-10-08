const mongoose = require('mongoose')
const User = require('./userModel')

const depositSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      default: 'deposit',
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    amount: {
      type: String,
      required: true,
    },
    decAmount: {
      type: Number,
      required: true,
    },
    bankName: {
      type: String,
    },
    accountNumber: {
      type: Number,
    },
    transactionType: {
      type: String,
      enum: ['Deposit', 'Withdraw'],
    },
    transactionId: {
      type: String,
    },
    transactionRef: {
      type: String,
    },

    flutterwaveRef: {
      type: String,
    },

    paymentGateway: {
      type: String,
      required: true,
      enum: ['flutterwave'],
    },
    paymentStatus: {
      type: String,
      enum: ['successful', 'success', 'pending', 'failed'],
    },
    currency: {
      type: String,
      enum: ['NGN', 'EUR', 'GBP', 'USD'],
    },
  },
  {
    timestamps: true,
  }
)

// depositSchema.statics.calculateBalance = async function (userId) {
//   const stats = await this.aggregate([
//     {
//       $match: { user: userId },
//     },
//     {
//       $group: {
//         _id: '$user',
//         totalBalance: { $sum: '$amount' },
//       },
//     },
//   ])

//   if (stats.length > 0) {
//     await User.findByIdAndUpdate(userId, {
//       balance: stats[0].totalBalance,
//     })
//   } else {
//     await User.findByIdAndUpdate(userId, {
//       balance: 0,
//     })
//   }
// }

// depositSchema.post('save', function () {
//   // this points to current deposit
//   this.constructor.calculateBalance(this.user)
// })

const Deposit = mongoose.model('DepositWithdraw', depositSchema)
module.exports = Deposit

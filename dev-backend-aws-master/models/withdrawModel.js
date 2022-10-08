const mongoose = require('mongoose')

const withdrawSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      default: 'withdraw',
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
    fee: {
      type: Number,
      required: true,
    },
    bankName: {
      type: String,
    },
    accountNumber: {
      type: Number,
    },
    reference: {
      type: String,
    },
    currency: {
      type: String,
    },
    date: {
      type: String,
    },
    transactionId: {
      type: String,
    },

    // flutterwaveRef: {
    //   type: String,
    // },

    // paymentGateway: {
    //   type: String,
    //   required: true,
    //   enum: ['flutterwave'],
    // },
    // paymentStatus: {
    //   type: String,
    //   enum: ['successful', 'pending', 'failed'],
    // },
    // currency: {
    //   type: String,
    //   enum: ['NGN', 'EUR', 'GBP', 'USD'],
    // },
  },
  {
    timestamps: true,
  }
)

const Withdraw = mongoose.model('Withdraw', withdrawSchema)
module.exports = Withdraw

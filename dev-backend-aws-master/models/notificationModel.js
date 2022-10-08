const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const notificationSchema = new mongoose.Schema({
  user: { type: ObjectId, ref: 'User' },

  notifications: [
    {
      type: {
        type: String,
        enum: [
          'newLike',
          'newComment',
          'newFollower',
          'newOrder',
          'newDeposit',
          'newInappTransfer',
          'newWithdrawal',
          'confirmInappTransfer',
          'cancelInappTransfer',
          'newQuote',
          'newReportFeed',
          'newAdvert',
          'newContact',
        ],
      },
      user: { type: ObjectId, ref: 'User' },
      post: { type: ObjectId, ref: 'Post' },
      comment: { type: ObjectId, ref: 'Comment' },
      order: { type: ObjectId, ref: 'Orders' },
      deposit: { type: ObjectId, ref: 'DepositWithdraw' },
      inApp: { type: ObjectId, ref: 'InAppTransactions' },
      inAppConfirm: { type: ObjectId, ref: 'InAppTransactions' },
      inAppCancel: { type: ObjectId, ref: 'InAppTransactions' },
      withdraw: { type: ObjectId, ref: 'Withdraw' },
      quote: { type: ObjectId, ref: 'Quote' },
      reportFeed: { type: ObjectId, ref: 'ReportFeed' },
      advert: { type: ObjectId, ref: 'Advert' },
      contact: { type: ObjectId, ref: 'Contact' },
      text: { type: String },
      date: { type: Date, default: Date.now },
      status: {
        type: String,
        required: true,
        default: 'unread',
        enum: ['read', 'unread'],
      },
    },
  ],
})

module.exports = mongoose.model('Notification', notificationSchema)

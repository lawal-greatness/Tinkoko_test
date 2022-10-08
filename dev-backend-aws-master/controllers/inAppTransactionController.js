const InAppTransaction = require('../models/inAppTransactionModel')
const User = require('../models/userModel')
const Deposit = require('../models/depositModel')
const Orders = require('../models/ordersModel')
const Product = require('../models/productModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const { compareToken, decryptFee, encryptFee } = require('../utils/encryptData')
const TrailManager = require('./trailController')
const {
  newInAppNotification,
  confirmInAppNotification,
  cancelInAppNotification,
} = require('../utils/notificationActions')
const Withdraw = require('../models/withdrawModel')

// bodyData  username

// exports.compareOTP = catchAsync(async (req, res, next) => {
//   const user = await User.findById(req.user._id)

//   if (!user) {
//     return next(new AppError('No user found', 404))
//   }

//   const checkOtp = await compareToken(req.otp, user.otpToken)

//   if (checkOtp) {

//   } else {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Incorrect or Expired Token',
//     })
//   }
// })

exports.createInAppTransaction = async (req, res, next) => {
  const session = await InAppTransaction.startSession()

  try {
    session.startTransaction()
    const {
      username,
      amount: receivedAmount,
      description,
      order,
      product,
      count,
      // otp,
    } = req.body

    const amount = parseFloat(receivedAmount)
    const sender = await User.findOne({
      _id: req.user._id,
      // otpExpires: { $gt: Date.now() },
    })

    // const sender = await User.findById(req.user)
    if (!sender) {
      // return next(new AppError('OTP is invalid or expired', 400))
      return next(new AppError('Something went wrong, Please try again later', 400))
    }

    const receiver = await User.findOne({ userId: username.toLowerCase() })

    if (!receiver) {
      return next(new AppError('User does not exist', 404))
    }

    // const checkOtp = await compareToken(otp, sender.otpToken)

    const senderPromoBalance = parseFloat(await decryptFee(sender.promoBalance))

    const senderPendingPromoBalance = parseFloat(
      await decryptFee(sender.pendingPromoBalance)
    )

    const senderBalance = parseFloat(await decryptFee(sender.balance))

    const senderPendingBalance = parseFloat(
      await decryptFee(sender.pendingBalance)
    )

    const receiverPendingBalance = parseFloat(
      await decryptFee(sender.pendingBalance)
    )

    // if (checkOtp) {
      if (senderPromoBalance >= 100) {
        // if (amount > senderBalance + senderPromoBalance) {
        if (amount > senderBalance + 100) {
          return next(new AppError('Insufficient Fund.', 409))
        }
      } else {
        if (amount > senderBalance) {
          return next(new AppError('Insufficient Fund.', 409))
        }
      }

      const inAppAmount = await encryptFee(amount)

      const data = await new InAppTransaction({
        sender: sender._id,
        receiver: receiver._id,
        amount: inAppAmount,
        usedPromo: senderPromoBalance >= 100 ? true : false,
        reasonForTransfer: description,
        decAmount: amount,
      }).save()

      if (data) {
        if (senderPromoBalance >= 100) {
          const newSenderPromoBalance = await encryptFee(
            senderPromoBalance - 100
          )
          sender.promoBalance = newSenderPromoBalance

          const newSenderBalance = await encryptFee(
            senderBalance + 100 - amount
          )

          sender.balance = newSenderBalance

          const newSenderPendingPromoBalance = await encryptFee(
            senderPendingPromoBalance + 100
          )
          sender.pendingPromoBalance = newSenderPendingPromoBalance

          // const senderPendingBalance = parseFloat(
          //   await decryptFee(sender.pendingBalance)
          // )
          const newSenderPendingBalance = await encryptFee(
            senderPendingBalance + (amount - 100)
          )
          sender.pendingBalance = newSenderPendingBalance

          sender.otpToken = undefined
          sender.otpExpires = undefined

          await sender.save()

          // const receiverPendingBalance =
          //   parseFloat(await decryptFee(receiver.pendingBalance)) +
          //   parseFloat(amount)

          const newReceiverPendingBalance = await encryptFee(
            receiverPendingBalance + amount
          )
          receiver.pendingBalance = newReceiverPendingBalance
          await receiver.save()
        } else {
          const newSenderBalance = await encryptFee(senderBalance - amount)
          sender.balance = newSenderBalance

          const senderPendingBalance = parseFloat(
            await decryptFee(sender.pendingBalance)
          )
          const newSenderPendingBalance = await encryptFee(
            senderPendingBalance + amount
          )
          sender.pendingBalance = newSenderPendingBalance
          // sender.pendingBalance += parseFloat(amount)

          sender.otpToken = undefined
          sender.otpExpires = undefined
          await sender.save()

          const receiverPendingBalance = parseFloat(
            await decryptFee(receiver.pendingBalance)
          )

          const newReceiverPendingBalance = await encryptFee(
            receiverPendingBalance + amount
          )
          receiver.pendingBalance = newReceiverPendingBalance

          // receiver.pendingBalance += parseFloat(amount)
          await receiver.save()
        }

        if (order) {
          const updateOrder = await Orders.findById(order)
          updateOrder.status = 'paid'
          await updateOrder.save()
        }

        if (product) {
          const updateProductCount = await Product.findOne({ slug: product })
          updateProductCount.sold += parseInt(count)
          await updateProductCount.save()
        }

        TrailManager(
          req.user._id,
          `initiated a T-Transfer of ${amount} to ${username}`,
          'success'
        )

        await newInAppNotification(
          req.user._id.toString(),
          data._id.toString(),
          receiver._id.toString()
        )

        return res
          .status(200)
          .json({ status: 'success', message: 'Transfer Successful' })
      }
    // } else {
    //   return res.status(400).json({
    //     status: 'fail',
    //     message: 'OTP is invalid or expired',
    //   })
    // }
    await session.commitTransaction()
    session.endSession()
  } catch (error) {
    console.log(error)
    await session.commitTransaction()
    session.endSession()
  }
}

exports.successfulInAppTransaction = async (req, res, next) => {
  const session = await InAppTransaction.startSession()
  try {
    session.startTransaction()
    const { transactionId } = req.body

    const transaction = await InAppTransaction.findById(transactionId)

    if (!transaction) {
      return res.status(404).json({
        status: 'fail',
        message: 'Transaction does not exist',
      })
    }

    const sender = await User.findById(transaction.sender)
    const receiver = await User.findById(transaction.receiver)

    // const senderPromoBalance = parseFloat(await decryptFee(sender.promoBalance))

    const senderPendingPromoBalance = parseFloat(
      await decryptFee(sender.pendingPromoBalance)
    )

    // const senderBalance = parseFloat(await decryptFee(sender.balance))

    const senderPendingBalance = parseFloat(
      await decryptFee(sender.pendingBalance)
    )

    const receiverPendingBalance = parseFloat(
      await decryptFee(receiver.pendingBalance)
    )

    const receiverBalance = parseFloat(await decryptFee(receiver.balance))
    const transactionAmount = parseFloat(await decryptFee(transaction.amount))

    transaction.status = 'completed'
    transaction.updatedBy = req.user._id

    const data = await transaction.save()

    if (data) {
      if (transaction.usedPromo) {
        const newSenderPendingBalance = await encryptFee(
          senderPendingBalance + 100 - transactionAmount
        )
        const newSenderPromoBalance = await encryptFee(
          senderPendingPromoBalance - 100
        )
        sender.pendingBalance = newSenderPendingBalance
        sender.pendingPromoBalance = newSenderPromoBalance
        // sender.pendingBalance =
        //   sender.pendingBalance + 100 - parseFloat(transaction.amount)
        // sender.pendingPromoBalance -= 100
        await sender.save()

        const newReceiverPendingBalance = await encryptFee(
          receiverPendingBalance - transactionAmount
        )
        const newReceiverBalance = await encryptFee(
          receiverBalance + transactionAmount
        )
        receiver.pendingBalance = newReceiverPendingBalance
        receiver.balance = newReceiverBalance
        // receiver.pendingBalance -= parseFloat(transaction.amount)
        // receiver.balance += parseFloat(transaction.amount)
        await receiver.save()
      } else {
        const newSenderPendingBalance = await encryptFee(
          senderPendingBalance - transactionAmount
        )

        sender.pendingBalance = newSenderPendingBalance

        // sender.pendingBalance -= parseFloat(transaction.amount)
        await sender.save()

        const newReceiverPendingBalance = await encryptFee(
          receiverPendingBalance - transactionAmount
        )
        const newReceiverBalance = await encryptFee(
          receiverBalance + transactionAmount
        )
        receiver.pendingBalance = newReceiverPendingBalance
        receiver.balance = newReceiverBalance

        // receiver.pendingBalance -= parseFloat(transaction.amount)
        // receiver.balance += parseFloat(transaction.amount)
        await receiver.save()
      }

      TrailManager(
        req.user._id,
        `completed a T-Transfer of ${transaction.amount} to ${receiver.userId}`,
        'success'
      )

      await confirmInAppNotification(
        req.user._id.toString(),
        data._id.toString(),
        receiver._id.toString()
      )

      return res
        .status(200)
        .json({ status: 'success', message: 'Transaction Completed' })
    }
    await session.commitTransaction()
    session.endSession()
  } catch (error) {
    await session.commitTransaction()
    session.endSession()
  }
}

exports.cancelInAppTransaction = catchAsync(async (req, res, next) => {
  const session = await InAppTransaction.startSession()
  try {
    session.startTransaction()
    const { transactionId } = req.body

    const transaction = await InAppTransaction.findById(transactionId)

    // if (!transaction) {
    //   return next(new AppError('Transaction does not exist', 404))
    // }
    if (!transaction) {
      return res.status(400).json({
        status: 'fail',
        message: 'Transaction does not exist',
      })
    }

    const sender = await User.findById(transaction.sender)
    const receiver = await User.findById(transaction.receiver)

    const senderPromoBalance = parseFloat(await decryptFee(sender.promoBalance))

    const senderPendingPromoBalance = parseFloat(
      await decryptFee(sender.pendingPromoBalance)
    )

    const senderBalance = parseFloat(await decryptFee(sender.balance))

    const senderPendingBalance = parseFloat(
      await decryptFee(sender.pendingBalance)
    )

    const receiverPendingBalance = parseFloat(
      await decryptFee(receiver.pendingBalance)
    )
    const receiverBalance = parseFloat(await decryptFee(receiver.balance))
    const transactionAmount = parseFloat(await decryptFee(transaction.amount))

    transaction.status = 'canceled'
    transaction.updatedBy = req.user._id

    const data = await transaction.save()

    if (data) {
      if (transaction.usedPromo) {
        const newSenderPendingBalance = await encryptFee(
          senderPendingBalance + 100 - transactionAmount
        )
        sender.pendingBalance = newSenderPendingBalance
        // sender.pendingBalance =
        //   sender.pendingBalance + 100 - parseFloat(transaction.amount)
        const newSenderPendingPromoBalance = await encryptFee(
          senderPendingPromoBalance - 100
        )
        sender.pendingPromoBalance = newSenderPendingPromoBalance
        // sender.pendingPromoBalance -= 100
        const newSenderPromoBalance = await encryptFee(senderPromoBalance + 100)
        sender.promoBalance = newSenderPromoBalance
        // sender.promoBalance += 100
        const newSenderBalance = await encryptFee(
          senderBalance + transactionAmount - 100
        )
        sender.balance = newSenderBalance
        // sender.balance = sender.balance + (parseFloat(transaction.amount) - 100)
        await sender.save()

        const newReceiverPendingBalance = await encryptFee(
          receiverBalance - transactionAmount
        )
        receiver.pendingBalance = newReceiverPendingBalance
        // receiver.pendingBalance -= parseFloat(transaction.amount)
        await receiver.save()
      } else {
        const newSenderPendingBalance = await encryptFee(
          senderPendingBalance - transactionAmount
        )
        sender.pendingBalance = newSenderPendingBalance

        // sender.pendingBalance -= parseFloat(transaction.amount)
        const newSenderBalance = await encryptFee(
          senderBalance + transactionAmount
        )
        sender.balance = newSenderBalance
        // sender.balance += parseFloat(transaction.amount)
        await sender.save()

        const newReceiverPendingBalance = await encryptFee(
          receiverBalance - transactionAmount
        )
        receiver.pendingBalance = newReceiverPendingBalance

        // receiver.pendingBalance -= parseFloat(transaction.amount)
        await receiver.save()
      }

      TrailManager(
        req.user._id,
        `canceled a T-Transfer of ${transaction.amount} from ${sender.userId}`,
        'success'
      )

      await cancelInAppNotification(
        req.user._id.toString(),
        data._id.toString(),
        sender._id.toString()
      )

      return res.status(200).json({
        status: 'success',
        message: 'Transaction Canceled Successfully',
      })
    }
    await session.commitTransaction()
    session.endSession()
  } catch (error) {
    await session.commitTransaction()
    session.endSession()
  }
})

// GET ALL USER TRANSACTIONS
exports.getUserTransactions = catchAsync(async (req, res, next) => {
  const isSender = await InAppTransaction.find({ sender: req.user._id })
  const isReceiver = await InAppTransaction.find({ receiver: req.user._id })
  const isDeposit = await Deposit.find({ user: req.user._id })
  const isWithdraw = await Withdraw.find({ user: req.user._id })
  const user = await User.findById(req.user._id)

  const transactions = [...isSender, ...isReceiver, ...isDeposit, ...isWithdraw]

  const allTransactions = transactions.sort((a, b) => b.updatedAt - a.updatedAt)

  const amountList = []

  allTransactions.map((transaction) => {
    amountList.push(decryptFee(transaction.amount))
  })

  const balance = await decryptFee(user.balance)
  const pendingBalance = await decryptFee(user.pendingBalance)
  const promoBalance = await decryptFee(user.promoBalance)
  const pendingPromoBalance = await decryptFee(user.pendingPromoBalance)

  const reformattedArray = allTransactions.map((item) => ({
    ...item,
    amount: parseFloat(decryptFee(item._doc.amount)),
  }))

  return res.status(200).json({
    status: 'success',
    allTransactions,
    amountList,
    balance,
    pendingBalance,
    promoBalance,
    pendingPromoBalance,
    reformattedArray,
  })

  // if (!transaction) {
  //   return next(new AppError('Transaction does not exist', 404))
  // }

  // const sender = await User.findById(transaction.sender)
  // const receiver = await User.findById(transaction.receiver)

  // transaction.status = 'canceled'
  // transaction.updatedBy = req.user._id

  // const data = await transaction.save()

  // if (data) {
  //   sender.pendingBalance -= transaction.amount
  //   sender.balance += transaction.amount
  //   await sender.save()

  //   receiver.pendingBalance -= transaction.amount
  //   await receiver.save()

  //   return res
  //     .status(200)
  //     .json({ status: 'success', message: 'Transaction Canceled Successfully' })
  // }
})

// GET ALL USER TRANSACTIONS
exports.getUser = async (req, res, next) => {
  const userId = req.params.username.toLowerCase()

  const user = await User.findOne({ userId })
  try {
    if (!user) {
      return res.status(404).json({ message: 'User not Found' })
    }
    const { firstName, lastName, currency, notificationToken } = user

    return res.status(200).json({
      status: 'success',
      firstName,
      lastName,
      currency,
      notificationToken,
    })
  } catch (error) {}
}

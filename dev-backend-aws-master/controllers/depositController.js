const axios = require('axios')
const User = require('../models/userModel')
const Deposit = require('../models/depositModel')
const AppError = require('../utils/appError')
const factory = require('./handlerFactory')
const catchAsync = require('../utils/catchAsync')
const Ravepay = require('flutterwave-node')
const { encryptFee, decryptFee } = require('../utils/encryptData')
const { newDepositNotification } = require('../utils/notificationActions')
const TrailManager = require('./trailController')
const rave = new Ravepay(
  `${process.env.FLUTTERWAVE_V3_PUBLIC_KEY_test}`,
  `${process.env.FLUTTERWAVE_V3_SECRET_KEY_test}`,
  true
)

exports.depositFund = async (req, res) => {
  const { transaction_id } = req.body.response
  const url = `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`
  try {
    const response = await axios({
      url,
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `${process.env.FLUTTERWAVE_V3_SECRET_KEY}`,
        // Authorization: `${process.env.FLUTTERWAVE_V3_SECRET_KEY_test}`,
      },
    })

    const { status, customer, tx_ref, flw_ref, amount, currency } =
      response.data.data

    if (status === 'success' || status === 'successful') {
      const user = await User.findOne({ email: customer.email })

      if (!user) {
        // TODO save data in issuesModel
        return res.status(404).json({ message: 'User not found' })
      }
      const transactionExist = await Deposit.findOne({
        transactionId: transaction_id,
      })
      if (transactionExist) {
        return res.status(409).send('Transaction Already Exist')
      }

      const encryptAmount = await encryptFee(amount)

      const newDeposit = await new Deposit({
        user: user._id,
        amount: encryptAmount,
        decAmount: amount,
        transactionRef: tx_ref,
        flutterwaveRef: flw_ref,
        paymentGateway: 'flutterwave',
        paymentStatus: status,
        transactionid: transaction_id,
        currency,
        transactionType: 'Deposit',
      }).save()

      const userBalance = parseFloat(await decryptFee(user.balance))
      // console.log('USER BALANCE', userBalance)
      const newBalance = await encryptFee(userBalance + amount)
      // console.log('NEW BALANCE', newBalance)

      user.balance = newBalance
      await user.save()

      await newDepositNotification(
        req.user._id.toString(),
        newDeposit._id.toString()
      )

      TrailManager(req.user._id, `deposited ${amount} to wallet`, 'success')

      return res.status(200).json({
        status: 'success',
        message: 'Account Successfully Funded',
      })
    }
    // const url = `https://api.flutterwave.com/v3/transactions/${req.body.txref.transaction_id}/verify`
    // const response = await axios({
    //   url,
    //   method: 'get',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Accept: 'application/json',
    //     Authorization: `${process.env.FLUTTERWAVE_V3_SECRET_KEY}`,
    //   },
    // })
    // const { status, currency, id, amount, customer, transactionType } =
    //   response.data.data
    // // check if transaction id already exist
    // const transactionExist = await Transaction.findOne({ transactionId: id })
    // if (transactionExist) {
    //   return res.status(409).send('Transaction Already Exist')
    // }
    // // check if customer exist in our database
    // const user = await User.findOne({ email: customer.email })
    // // check if user have a wallet, else create wallet
    // // const wallet = await validateUserWallet(user._id)
    // // create wallet transaction
    // // const walletTransaction = await createWalletTransaction(
    // //   user._id,
    // //   status,
    // //   currency,
    // //   amount
    // // )
    // // create transaction
    // const transactions = await DepositWithdraw(
    //   user._id,
    //   id,
    //   status,
    //   currency,
    //   amount,
    //   customer,
    //   transactionType
    // )
    // // await updateWallet(user._id, amount)
    // res.status(200).send({
    //   response: 'wallet funded successfully',
    //   data: (wallet, walletTransaction, transactions),
    // })
  } catch (error) {}
}

exports.getBank = async (req, res) => {
  const { country } = req.params

  const url = `https://api.flutterwave.com/v3/banks/${country}`
  try {
    const response = await axios({
      url,
      method: 'get',
      headers: {
        // 'Content-Type': 'application/json',
        // Accept: 'application/json',
        Authorization: `${process.env.FLUTTERWAVE_V3_SECRET_KEY}`,
        // Authorization: `${process.env.FLUTTERWAVE_V3_SECRET_KEY_test}`,
      },
    })

    return res.status(200).json({
      status: 'success',
      banks: response.data.data,
    })
  } catch (error) {}
}

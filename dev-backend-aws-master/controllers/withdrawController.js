const axios = require('axios')
const User = require('../models/userModel')
const Withdraw = require('../models/withdrawModel')
const AppError = require('../utils/appError')
const factory = require('./handlerFactory')
const catchAsync = require('../utils/catchAsync')
const Flutterwave = require('flutterwave-node-v3')
const Ravepay = require('flutterwave-node')
const TrailManager = require('./trailController')
const { compareToken, decryptFee, encryptFee } = require('../utils/encryptData')
const { newWithdrawalNotification } = require('../utils/notificationActions')
const rave = new Ravepay(
  `${process.env.FLUTTERWAVE_V3_PUBLIC_KEY_test}`,
  `${process.env.FLUTTERWAVE_V3_SECRET_KEY_test}`,
  true
)

const flw = new Flutterwave(
  process.env.FLUTTERWAVE_V3_PUBLIC_KEY,
  process.env.FLUTTERWAVE_V3_SECRET_KEY
)

exports.createBeneficiary = async (req, res, next) => {
  const { account_number, account_bank } = req.body
  console.log(account_number, account_bank)
  try {
    const payload = {
      account_number,
      account_bank,
    }
    const response = await flw.Beneficiary.create(payload)
    if (response && response.status === 'success') {
      return res.json({
        status: 'success',
        data: response.data,
      })
    }
  } catch (error) {
    console.log(error)
  }
}

exports.withdrawFund = catchAsync(async (req, res, next) => {
  const {
    account_bank,
    account_number,
    amount,
    narration,
    currency,
    reference,
    debit_currency,
    // otp,
  } = req.body

  const amountToWithdraw = parseFloat(amount)
  let fee = 0

  if (amountToWithdraw <= 5000) {
    fee = 50
  } else if (amountToWithdraw > 5000 && amountToWithdraw <= 50000) {
    fee = 70
  } else if (amountToWithdraw > 50000) {
    fee = 100
  }

  const currentUser = await User.findOne({
    _id: req.user.id,
    // otpExpires: { $gt: Date.now() },
  })

  if (!currentUser) {
    return next(
      // new AppError('OTP is invalid or expired. Please Check Credentials', 404)
      new AppError('Something went wrong, Please try again later', 404)
    )
  }

  // const checkOtp = await compareToken(otp, currentUser.otpToken)

  const currentUserBalance = parseFloat(await decryptFee(currentUser.balance))

  // if (checkOtp) {
    if (amountToWithdraw + fee > currentUserBalance) {
      return next(new AppError('Insufficient Balance', 400))
    }

    // DEBIT FROM BALANCE

    currentUser.balance = await encryptFee(
      currentUserBalance - (amountToWithdraw + fee)
    )

    await currentUser.save()

    // DEBIT FROM BANK
    const payload = {
      account_bank,
      account_number: account_number.toString(),
      amount: amountToWithdraw,
      narration,
      currency,
      reference,
      callback_url: 'https://www.tinkoko.com/wallet',
      debit_currency,
    }

    const response = await flw.Transfer.initiate(payload)

    if (response.status === 'success') {
      const encryptAmount = await encryptFee(response.data.amount)

      const newData = {
        accountNumber: response.data.account_number,
        bankName: response.data.bank_name,
        amount: encryptAmount,
        reference: response.data.reference,
        currency: response.data.currency,
        fullName: response.data.full_name,
        transactionId: response.data.id,
        date: response.data.created_at,
        user: currentUser._id,
        decAmount: amountToWithdraw,
        fee,
      }

      TrailManager(
        req.user._id,
        `made a withdrawal of ${amount} from wallet`,
        'success'
      )
      const withdrawn = await Withdraw.create(newData)

      await newWithdrawalNotification(
        currentUser._id.toString(),
        withdrawn._id.toString()
      )

      return res.status(200).json({
        status: 'success',
        message: `Withdrawal of ${amountToWithdraw + 50} was successful`,
      })
    }
  // } else {
  //   return res.status(400).json({
  //     status: 'fail',
  //     message: 'OTP is invalid or expired',
  //   })
  // }
})

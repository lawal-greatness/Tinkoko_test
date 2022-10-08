const crypto = require('crypto')
const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
// const customId = require('custom-id')

const User = require('../models/userModel')
const Notification = require('../models/notificationModel')
const Follower = require('../models/followerModel')
const Vendor = require('../models/vendorModel')
const Agent = require('../models/agentModel')
const Chat = require('../models/chatModel')
const Referral = require('../models/referralModel')

const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const Email = require('../utils/email')
// const { verify } = require('hcaptcha')

const {
  encryptToken,
  compareToken,
  encryptFee,
  decryptFee,
} = require('../utils/encryptData')
const TrailManager = require('./trailController')

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN
const twilioClient = require('twilio')(twilioAccountSid, twilioAuthToken)

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

const signToken = (
  id,
  username,
  firstName,
  lastName,
  role,
  storeName,
  interests,
  email,
  profilePicUrl,
  countryCode,
  phone,
  activateUser,
  currency
) => {
  return jwt.sign(
    {
      id,
      username,
      firstName,
      lastName,
      role,
      storeName,
      interests,
      email,
      profilePicUrl,
      countryCode,
      phone,
      activateUser,
      currency,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  )
}

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(
    user._id,
    user.userId,
    user.firstName,
    user.lastName,
    user.role,
    user.storeName,
    user.interests,
    user.email,
    user.profilePicUrl,
    user.countryCode,
    user.phone,
    user.activateUser,
    user.currency
  )

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  })

  user.password = undefined
  // const {
  //   interests,
  // } = user

  res.status(statusCode).json({
    status: 'success',
    token,
    // interests,
  })
}

const regexUserName = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/

exports.checkUserName = async (req, res) => {
  const { username } = req.params

  try {
    if (username.length < 3) return res.status(401).json({ message: 'Invalid' })

    if (!regexUserName.test(username))
      return res.status(401).json({ message: 'Invalid' })

    const user = await User.findOne({ userId: username.toLowerCase() })

    if (user) return res.status(401).json({ message: 'Username already taken' })

    return res.status(200).json({ message: 'Username Available' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server Error' })
  }
}

// exports.login = catchAsync(async (req, res, next) => {
//   const { email, password } = req.body

//   if (!email || !password) {
//     res.status(400).json({
//       status: 'fail',
//       message: 'Please provide email and password',
//     })
//     // return next(new AppError('Please provide email and password!', 400))
//   }

//   const user = await User.findOne({
//     $or: [
//       {
//         email: email,
//       },
//       {
//         userId: email,
//       },
//     ],
//   }).select('+password')
//   // const user = await User.findOne({ email })

//   if (!user || !(await user.comparePassword(password, user.password))) {
//     // return next(new AppError('Incorrect email or password', 401))
//     res.status(401).json({
//       status: 'fail',
//       message: 'Incorrect email or password',
//     })
//   } else {
//     createSendToken(user, 200, req, res)
//   }
// })

exports.checkCorrectPassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password')

  if (
    !user ||
    !(await user.comparePassword(req.body.password, user.password))
  ) {
    return next(new AppError('Incorrect password, Please try again', 401))
    // res.status(401).json({
    //   status: 'fail',
    //   message: 'Incorrect email or password',
    // })
  } else {
    return res.status(200).json({
      status: 'success',
    })
  }
})

// Register/Signup User

exports.register = catchAsync(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    role,
    password,
    storeName,
    country,
    city,
    countryState,
    address,
    description,
    username,
    countryCode,
    referralCode,
    // capchaToken,
  } = req.body

  if (
    !email ||
    !password ||
    !firstName ||
    !lastName ||
    !username
    // !capchaToken
  ) {
    return next(new AppError('Please provide necessary Information', 400))
  }

  // let { success } = await verify(process.env.HCAPTCHA_SECRET, capchaToken)

  // if (!success) {
  //   return next(new AppError('Please verify you are human', 400))
  // }

  const existingUser = await User.findOne({ userId: username.toLowerCase() })
  const existingEmail = await User.findOne({ email })

  if (existingEmail) {
    return next(new AppError('Email already exists. Please use another', 400))
  }
  if (existingUser) {
    return next(
      new AppError('Username already exists. Please use another', 400)
    )
  }

  const balance = await encryptFee(0)
  const promoBalance = await encryptFee(0)
  const pendingPromoBalance = await encryptFee(0)
  const pendingBalance = await encryptFee(0)

  const newUser = await User.create({
    firstName: capitalizeFirstLetter(firstName),
    lastName: capitalizeFirstLetter(lastName),
    email,
    phone,
    role,
    password,
    storeName,
    country,
    city,
    countryState,
    address,
    description,
    userId: username.toLowerCase(),
    countryCode,
    currency: countryCode === '234' ? 'NGN' : 'USD',
    balance,
    promoBalance,
    pendingPromoBalance,
    pendingBalance,
  })

  await new Follower({ user: newUser._id }).save()
  await new Notification({ user: newUser._id }).save()
  await new Chat({ user: newUser._id, chats: [] }).save()
  TrailManager(newUser._id, `registered as a ${newUser.role}`, 'success')

  let refCode = referralCode

  if (refCode === 'null') {
    refCode = null
  }

  if (refCode) {
    const referree = await User.findOne({ userId: refCode })
    await new Referral({ user: newUser._id, referrer: referree._id }).save()
  }

  if (newUser.role === 'vendor') {
    await new Vendor({ user: newUser._id }).save()
  }

  if (newUser.role === 'agent') {
    await new Agent({ user: newUser._id }).save()
  }

  // const activateToken = newUser.createToken('activate')
  const otp = Math.floor(Math.random() * (999999 - 100000) + 100000).toString()

  const hashedOtp = await encryptToken(otp)

  newUser.userActivateOtp = hashedOtp
  newUser.userActivateOtpExpires = Date.now() + 10 * 60 * 1000

  await newUser.save({ validateBeforeSave: false })

  try {
    // let activateURL

    // if (process.env.NODE_ENV === 'development') {
    //   activateURL = `http://localhost:3000/activate-account/${activateToken}`
    // } else if (process.env.NODE_ENV === 'production') {
    //   activateURL = `https://www.tinkoko.com/activate-account/${activateToken}`
    // }

    // twilioClient.messages
    //   .create({
    //     body: `Hello ${newUser.firstName}, Your Activation token for tinkoko.com is ${otp}. It is valid for 10 mins`,
    //     from: 'Tinkoko',
    //     to: `+${newUser.countryCode}${newUser.phone}`,
    //   })
    //   .then((message) => {
    //     res.status(200).json({
    //       status: 'success',
    //       message: 'OTP sent successfully',
    //     })
    //   })

    await new Email(newUser, otp).sendEmailVerification()

    createSendToken(newUser, 200, req, res)

    // res.status(200).json({
    //   status: 'success',
    //   message:
    //     'Account Created Successfully. To login, activate account from your email',
    // })
  } catch (error) {
    await User.findByIdAndDelete(newUser._id)
    await Follower.findByIdAndDelete(newUser._id)
    await Notification.findByIdAndDelete(newUser._id)
    await Agent.findByIdAndDelete(newUser._id)
    await Vendor.findByIdAndDelete(newUser._id)
    await Chat.findByIdAndDelete(newUser._id)

    res.status(400).json({
      status: 'fail',
      message: 'Account not successfully created. Please try again',
    })
  }
})

// TODO Prevent access to routes when active is false
exports.activateAccount = catchAsync(async (req, res, next) => {
  // const hashedToken = crypto
  //   .createHash('sha256')
  //   .update(req.params.token)
  //   .digest('hex')

  // const user = await User.findOne({
  //   userActivateToken: hashedToken,
  // })

  const user = await User.findOne({
    user: req.user._id,
    userActivateOtpExpires: { $gt: Date.now() },
  })

  if (!user) {
    return next(new AppError('Invalid Token', 400))
  }

  const checkToken = await compareToken(req.body.otp, user.userActivateOtp)

  if (!user || !checkToken) {
    // return next(new AppError('Token is invalid or Expired', 400))
    res.status(400).json({
      status: 'fail',
      message: 'Token is invalid or Expired. Please Request for another',
    })
  } else {
    const referral = await Referral.findOne({ user: user._id })

    if (referral) {
      const newUser = await User.findById(referral.referrer)
      const promoBalance = parseFloat(await decryptFee(newUser.promoBalance))

      if (newUser.currency === 'NGN') {
        const newBalance = await encryptFee(promoBalance + 500)
        newUser.promoBalance = newBalance
        TrailManager(newUser._id, `received a referral fee of N500`, 'success')

        await newUser.save()
      } else {
        const newBalance = await encryptFee(promoBalance + 500)
        newUser.promoBalance = newBalance
        TrailManager(newUser._id, `received a referral fee of N500`, 'success')
        await newUser.save()
      }

      await new Email(
        newUser,
        'https://www.tinkoko.com/wallet'
      ).sendReferralEmail()
    }

    user.activateUser = true
    user.userActivateOtpExpires = undefined
    user.userActivateOtp = undefined
    const activatedUser = await user.save()
    TrailManager(user._id, `Activated account from email`, 'success')

    if (user.role === 'vendor') {
      await new Email(
        user,
        'https://www.tinkoko.com/login'
      ).sellerWelcomeEmail()
    } else if (user.role === 'user') {
      await new Email(user, 'https://www.tinkoko.com/login').buyerWelcomeEmail()
    }

    createSendToken(activatedUser, 200, req, res)

    // res.status(200).json({
    //   status: 'success',
    //   message: 'Welcome to Tinkoko. Your Account has been activated.',
    // })
  }
})

exports.createActivateToken = async (req, res, next) => {
  // send email to user
  try {
    const user = await User.findById(req.user.id)

    const otp = Math.floor(
      Math.random() * (999999 - 100000) + 100000
    ).toString()

    const hashedOtp = await encryptToken(otp)

    user.userActivateOtp = hashedOtp
    user.userActivateOtpExpires = Date.now() + 10 * 60 * 1000

    // if (!user) {
    //   return next(new AppError('No user found', 404))
    // }

    // const activateToken = user.createToken('activate')
    await user.save({ validateBeforeSave: false })

    // let activateURL

    // if (process.env.NODE_ENV === 'development') {
    //   activateURL = `http://localhost:3000/activate-account/${activateToken}`
    // } else if (process.env.NODE_ENV === 'production') {
    //   activateURL = `https://www.tinkoko.com/activate-account/${activateToken}`
    // }

    twilioClient.messages
      .create({
        body: `Hello ${user.firstName}, Your Activation token for tinkoko.com is ${otp}. It is valid for 10 mins`,
        from: 'Tinkoko',
        to: `+${user.countryCode}${user.phone}`,
      })
      .then((message) => {
        res.status(200).json({
          status: 'success',
          message: 'OTP sent successfully',
        })
      })

    await new Email(user, otp).sendEmailVerification()

    res.status(200).json({
      status: 'success',
      message: 'Activation Email has been sent. Check your email',
    })
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: 'Email Not Sent successfully',
    })
  }
}

// Login User
exports.login = catchAsync(async (req, res, next) => {
  // const { email, password, capchaToken } = req.body
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({
      status: 'fail',
      message: 'Please provide email and password',
    })
    // return next(new AppError('Please provide email and password!', 400))
  }

  // let { success } = await verify(process.env.HCAPTCHA_SECRET, capchaToken)

  // if (!success) {
  //   return next(new AppError('Please verify you are human', 400))
  // }

  const user = await User.findOne({
    $or: [
      {
        email: email.toLowerCase(),
      },
      {
        userId: email.toLowerCase(),
      },
    ],
  }).select('+password')
  // const user = await User.findOne({ email })

  if (!user || !(await user.comparePassword(password, user.password))) {
    // return next(new AppError('Incorrect email or password', 401))
    res.status(401).json({
      status: 'fail',
      message: 'Incorrect email or password',
    })
  } else {
    createSendToken(user, 200, req, res)
    TrailManager(user._id, 'Logged in', 'success')
  }
})

// Logout User
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  })

  res.status(200).json({ status: 'success' })
}

// PROTECT ROUTE
exports.protect = catchAsync(async (req, res, next) => {
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    )
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
  const currentUser = await User.findById(decoded.id)
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    )
  }
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    )
  }
  req.user = currentUser
  res.locals.user = currentUser
  next()
})

// Restrict Access
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      )
    }

    next()
  }
}

// Forgot Password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // const user = await User.findOne({ $or: [{ email }, { username: email }] })

  const user = await User.findOne({ email: req.body.email })
  if (!user) {
    return next(new AppError('There is no user with email address.', 404))
  }

  const resetToken = user.createToken('reset')
  await user.save({ validateBeforeSave: false })

  try {
    let resetURL

    if (process.env.NODE_ENV === 'development') {
      resetURL = `http://localhost:3000/reset-password/${resetToken}`
    } else if (process.env.NODE_ENV === 'production') {
      resetURL = `https://www.tinkoko.com/reset-password/${resetToken}`
    }
    // const resetURL = `${req.protocol}://${req.get(
    //   'host'
    // )}/reset-password/${resetToken}`
    await new Email(user, resetURL).sendPasswordReset()

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    })
  } catch (err) {
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({ validateBeforeSave: false })

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    )
  }
})

// Reset password
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex')

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  })

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400))
  }
  user.password = req.body.password
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  await user.save()

  res.status(200).json('success')
  // createSendToken(user, 200, req, res)
})

// Update password
exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password')

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401))
  }

  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  await user.save()

  createSendToken(user, 200, req, res)
})

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password')

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401))
  }

  // 3) If so, update password
  user.password = req.body.password
  await user.save()

  // 4) Log user in, send JWT
  createSendToken(user, 200, req, res)
})

exports.saveInterests = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id)

  if (!user) {
    return next(new AppError('No user found', 404))
  }

  user.interests = req.body.interests
  await user.save()

  createSendToken(user, 200, req, res)
})

exports.getNotifications = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id)

  if (!user) {
    return next(new AppError('No user found', 404))
  }

  res.status(200).json({
    status: 'success',
    notification: user.unreadNotification,
  })
})

exports.updateNotifications = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id)

  if (!user) {
    return next(new AppError('No user found', 404))
  }

  user.unreadNotification = false
  await user.save()

  res.status(200).json({
    status: 'success',
    notification: user.unreadNotification,
  })
})

exports.getInterests = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id)

  if (!user) {
    return next(new AppError('No user found', 404))
  }

  res.status(200).json({
    status: 'success',
    interests: user.interests,
  })
})

exports.saveSecurityQuestions = catchAsync(async (req, res, next) => {
  const {
    securityQuestionOne,
    securityAnswerOne,
    securityQuestionTwo,
    securityAnswerTwo,
  } = req.body

  if (
    !securityAnswerOne ||
    !securityAnswerTwo ||
    !securityQuestionOne ||
    !securityQuestionTwo
  ) {
    return next(
      new AppError('Please provide required questions and answers', 400)
    )
  }

  const user = await User.findOne({
    _id: req.user.id,
  })

  if (!user) {
    return next(new AppError('User does not exist', 404))
  }
  console.log(user)
})

// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next()

//   this.password = await bcrypt.hash(this.password, 12)

//   next()
// })

exports.createOTP = catchAsync(async (req, res) => {
  const otp = Math.floor(Math.random() * (999999 - 100000) + 100000).toString()

  const hashedOtp = await encryptToken(otp)

  const user = await User.findById(req.user._id)

  if (!user) {
    return next(new AppError('No user found', 404))
  }

  user.otpToken = hashedOtp
  user.otpExpires = Date.now() + 5 * 60 * 1000

  await user.save()

  twilioClient.messages
    .create({
      body: `Do not share this code with anyone. Your OTP is ${otp}, valid for 5mins`,
      from: 'Tinkoko',
      to: `+${user.countryCode}${user.phone}`,
    })
    .then((message) => {
      res.status(200).json({
        status: 'success',
        message: 'OTP sent successfully',
      })
    })
  // console.log('ERROR', error)
})

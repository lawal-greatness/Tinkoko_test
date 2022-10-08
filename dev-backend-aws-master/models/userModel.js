const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please provide your name!'],
      minlength: [3, 'First Name should be more than 3 characters.'],
    },
    lastName: {
      type: String,
      required: [true, 'Please provide your name!'],
      minlength: [3, 'Last Name should be more than 3 characters.'],
    },
    // userId: { type: String, required: true, maxlength: 8, unique: true },
    userId: {
      type: String,
      required: [true, 'Please provide a unique username'],
      unique: true,
      trim: true,
      minlength: [3, 'Username should be more than 3 characters.'],
      maxlength: [20, 'Username should be not exceed 10 characters'],
    },
    profilePicUrl: { type: Object },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      // validate: [validator.isEmail, 'Please provide a valid email'],
    },
    phone: {
      type: Number,
      required: [true, 'Phone number is required'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password should have at least 8 characters'],
      select: false,
    },
    gender: {
      type: String,
    },
    role: {
      type: String,
      enum: [
        'user',
        'vendor',
        'agent',
        'staff',
        'admin',
        'customer-care',
        'business-development',
        'super-admin',
      ],
      default: 'user',
    },

    balance: {
      type: String,
      // default: 0,
    },
    promoBalance: {
      type: String,
      // default: 0,
    },
    pendingPromoBalance: {
      type: String,
      // default: 0,
    },
    pendingBalance: {
      type: String,
      // default: 0,
    },

    interests: {
      type: Array,
    },
    countryCode: {
      type: Number,
    },
    storeName: {
      type: String,
      minlength: [3, 'Must be more than 3 Characters'],
      maxlength: [100, 'Must be less than 100 Characters'],
    },
    address: {
      type: String,
      minlength: [5, 'Must be more than 5 Characters'],
      maxlength: [100, 'Must be less than 100 Characters'],
    },
    city: {
      type: String,
      // minlength: [3, 'Must be more than 5 Characters'],
      maxlength: [100, 'Must be less than 100 Characters'],
    },
    state: {
      type: String,
      // minlength: [3, 'Must be more than 5 Characters'],
      maxlength: [100, 'Must be less than 100 Characters'],
    },

    country: {
      type: String,
    },

    reason: { type: String },

    kycPhoto: { type: Object },

    docType: { type: String },

    nin: { type: String },


    description: {
      type: String,
    },

    lastLoginDate: {
      type: Date,
      default: Date.now,
    },
    securityQuestions: {
      type: [Object],
    },

    newMessagePopup: { type: Boolean, default: true },
    unreadMessage: { type: Boolean, default: false },
    unreadNotification: { type: Boolean, default: false },
    activateUser: {
      type: Boolean,
      default: false,
      // select: false,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    cart: {
      type: Array,
      default: [],
    },
    history: {
      type: Array,
      default: [],
    },
    isVendor: {
      type: Boolean,
      default: false,
    },

    deliveryAddress: {
      type: String,
      // minlength: [5, 'Must be more than 5 Characters'],
      maxlength: [100, 'Must be less than 100 Characters'],
    },
    deliveryCity: {
      type: String,
      // minlength: [3, 'Must be more than 5 Characters'],
      maxlength: [100, 'Must be less than 100 Characters'],
    },
    deliveryState: {
      type: String,
      // minlength: [3, 'Must be more than 5 Characters'],
      maxlength: [100, 'Must be less than 100 Characters'],
    },
    bankCountry: {
      type: String,
    },
    currency: {
      type: String,
      enum: ['NGN', 'USD'],
    },
    bankName: {
      type: String,
    },
    notificationToken: {
      type: String,
    },
    accountNumber: {
      type: Number,
    },
    bankFullName: {
      type: String,
    },
    verification: { type: String },
    accountInformation: { type: String },
    userActivateToken: String,
    userActivateExpires: Date,

    userActivateOtp: String,
    userActivateOtpExpires: Date,

    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

    otpToken: String,
    otpExpires: Date,
  },
  {
    timestamps: true,
  }
)

// Hash Password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()

  this.password = await bcrypt.hash(this.password, 12)

  next()
})

// Store date password changed
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next()

  this.passwordChangedAt = Date.now() - 1000
  next()
})

// Check and only return users with active:true
// userSchema.pre(/^findById/, function (next) {
//   if (this.activateUser === false) {
//     next(new ErrorHandler('Account not active. Please activate account', 400))
//   }
// })

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } })
  next()
})

// Compare passwords
userSchema.methods.comparePassword = async function (
  otherPassword,
  userPassword
) {
  return await bcrypt.compare(otherPassword, userPassword)
}

/*
Check if Password has been changed after successful login. 
returns true or false
*/
userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    )
    return JWTTimestamp < changedTimestamp
  }
  return false
}

// Create password reset token
userSchema.methods.createToken = function (tokenType) {
  const token = crypto.randomBytes(32).toString('hex')

  if (tokenType === 'activate') {
    this.userActivateToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex')
  } else if (tokenType === 'reset') {
    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex')

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000
  }

  return token
}

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword)
}

// set last login date
userSchema.statics.login = function login(id, callback) {
  return this.findByIdAndUpdate(
    id,
    { $set: { lastLoginDate: Date.now() } },
    { new: true },
    callback
  )
}

const User = mongoose.model('User', userSchema)

module.exports = User

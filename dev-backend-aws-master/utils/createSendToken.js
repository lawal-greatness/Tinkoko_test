const jwt = require('jsonwebtoken')

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
  activateUser
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
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  )
}

exports.createSendToken = (user, statusCode, req, res) => {
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
    user.activateUser
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

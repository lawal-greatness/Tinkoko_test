const AppError = require('../utils/appError')

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`
  return new AppError(message, 400)
}

const handleDuplicateFieldsDB = (err) => {
  const value = err.message.match(/(["'])(\\?.)*?\1/)[0]
  console.log(value)
  const message = ` Duplicate field value: ${value}. Please use another value!`
  return new AppError(message, 400)
}

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message)

  const message = `Invalid input data. ${errors.join('. ')}`
  return new AppError(message, 400)
}

const handleJWTError = () => {
  new AppError('Invalid Token. Please, login again', 401)
}
const handleJWTExpiredError = () => {
  new AppError('Your Token has expired. Please, login again', 401)
}

// const sendErrorDev = (err, res) => {
//   return res.status(err.statusCode).json({
//     status: err.status,
//     error: err,
//     message: err.message,
//     stack: err.stack,
//   })
// }
// const sendErrorProd = (err, res) => {
//   if (err.isOperational) {
//     // console.error('ERROR', err)
//     return res.status(err.statusCode).json({
//       status: err.status,
//       message: err.message,
//     })
//   } else {
//     console.error('ERROR Message', err)
//     return res.status(500).json({
//       status: 'error',
//       message: 'Something went very wrong!',
//     })
//   }
// }

const sendErrorDev = (err, req, res) => {
  //  API

  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    })
  }

  // RENDERED WEBSITE
  console.error('ERROR 💥', err)
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  })
}

const sendErrorProd = (err, req, res) => {
  //  API
  if (req.originalUrl.startsWith('/api')) {
    //  Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      })
    }
    //  Programming or other unknown error: don't leak error details

    console.error('ERROR 💥', err)

    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    })
  }

  // B) RENDERED WEBSITE
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    })
  }
  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error('ERROR 💥', err)
  // 2) Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  })
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  if (process.env.NODE_ENV === 'development') {
    // sendErrorDev(err, res)
    sendErrorDev(err, req, res)
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err }
    if (err.name === 'CastError') error = handleCastErrorDB(error)
    if (err.code === 11000) error = handleDuplicateFieldsDB(err)
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err)
    if (err.name === 'JsonWebTokenError') error = handleJWTError(err)
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError(err)

    // sendErrorProd(error, res)
    sendErrorProd(error, req, res)
  }
}

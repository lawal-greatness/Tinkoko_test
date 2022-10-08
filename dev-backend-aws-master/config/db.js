const mongoose = require('mongoose')
// let mongoURL

// if (process.env.NODE_ENV === 'development') {
//   mongoURL = process.env.DB_LOCAL
// } else {
//   mongoURL = process.env.DB_PROD
// }

const mongoURL = process.env.DB_PROD

mongoose.connect(mongoURL, { useUnifiedTopology: true, useNewUrlParser: true })

const db = mongoose.connection

db.on('connected', () => {
  console.log(`DB connection Successful`)
})

db.on('error', () => {
  console.log(`DB connection Failed`)
})

module.exports = mongoose

const bcrypt = require('bcryptjs')
const Cryptr = require('cryptr')

const cryptr = new Cryptr(process.env.FEE_ENCRYPTION_KEY)

exports.encryptToken = (token) => {
  return bcrypt.hash(token, 12)
}

exports.compareToken = (token, dbToken) => {
  return bcrypt.compare(token, dbToken)
}

exports.encryptFee = (data) => {
  return (encryptedString = cryptr.encrypt(data))
}

exports.decryptFee = (data) => {
  return (encryptedString = cryptr.decrypt(data))
}

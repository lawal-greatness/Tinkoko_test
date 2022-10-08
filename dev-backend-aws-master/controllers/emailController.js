require('dotenv').config()

const EmailModel = require('../models/emailModel')
const factory = require('./handlerFactory')
const catchAsync = require('../utils/catchAsync')
const sgMail = require('@sendgrid/mail')
const { convert } = require('html-to-text')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)
// const AppError = require('../utils/appError')
// const Email = require('../utils/email')

exports.getAllEmails = factory.getAll(EmailModel)
exports.getEmail = factory.getOne(EmailModel)
// exports.createEmail = factory.createOne(EmailModel)
exports.updateEmail = factory.updateOne(EmailModel)
exports.deleteEmail = factory.deleteOne(EmailModel)

exports.createEmail = catchAsync(async (req, res, next) => {
  const { senderName, senderEmail, receiverEmails, subject, body } = req.body

  const msg = {
    to: receiverEmails,
    from: `${senderName} <${senderEmail}>`,
    subject,
    html: body,
    text: convert(body, {
      wordwrap: 130,
    }),
  }

  sgMail
    .sendMultiple(msg)
    .then((response) => {
      EmailModel.create({
        emailFrom: senderEmail,
        emailDetail: body,
        emailTitle: subject,
        emailRecipients: receiverEmails,
        sentBy: req.user._id,
      }).then((doc) => {
        res.status(201).json({
          status: 'success',
          doc,
        })
      })
    })
    .catch((error) => {
      console.error(error)
    })
  // console.log(senderEmail, receiverEmails, subject, body)
  // const doc = await EmailModel.create(req.body)

  // res.status(201).json({
  //   status: 'success',
  //   doc,
  // })
})

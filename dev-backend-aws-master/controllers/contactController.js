const Contact = require('../models/contactModel')
const factory = require('./handlerFactory')
const Email = require('../utils/tinkokoInternalEmail')
const catchAsync = require('../utils/catchAsync')
const { newContactUsNotification } = require('../utils/notificationActions')

exports.getAllContacts = factory.getAll(Contact)
exports.getContact = factory.getOne(Contact)
// exports.createContact = factory.createOne(Contact)

exports.createContact = catchAsync(async (req, res, next) => {
  const contact = await Contact.create(req.body)

  await new Email(contact, 'customercare@tinkoko.com').sendContactEmail()

  await newContactUsNotification(contact._id)

  res.status(201).json({
    status: 'success',
    contact,
  })
})

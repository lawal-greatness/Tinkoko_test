const Quote = require('../models/quoteModel')
const catchAsync = require('../utils/catchAsync')
const factory = require('./handlerFactory')
const Email = require('../utils/tinkokoInternalEmail')
const { newQuoteNotification } = require('../utils/notificationActions')

exports.getAllQuotes = factory.getAll(Quote)
exports.getQuote = factory.getOne(Quote)
// exports.createQuote = factory.createOne(Quote)

exports.createQuote = catchAsync(async (req, res, next) => {
  const quote = await Quote.create(req.body)

  await new Email(quote, 'customercare@tinkoko.com').sendQuoteEmail()

  const done = await newQuoteNotification(quote._id)

  console.log('DONE', done)

  res.status(201).json({
    status: 'success',
    quote,
  })
})

exports.updateQuote = factory.updateOne(Quote)
exports.deleteQuote = factory.deleteOne(Quote)

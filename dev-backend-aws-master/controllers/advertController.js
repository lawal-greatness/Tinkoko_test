const Advert = require('../models/advertModel')
const factory = require('./handlerFactory')
const Email = require('../utils/tinkokoInternalEmail')
const catchAsync = require('../utils/catchAsync')
const { newAdvertNotification } = require('../utils/notificationActions')

exports.getAllAdverts = factory.getAll(Advert)
exports.getAdvert = factory.getOne(Advert)
// exports.createAdvert = factory.createOne(Advert)

exports.createAdvert = catchAsync(async (req, res, next) => {
  const advert = await Advert.create(req.body)

  await new Email(advert, 'customercare@tinkoko.com').sendAdvertEmail()

  await newAdvertNotification(advert._id)

  res.status(201).json({
    status: 'success',
    advert,
  })
})

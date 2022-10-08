const Vendor = require('../models/vendorModel')
const factory = require('./handlerFactory')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

exports.getAllVendors = factory.getAll(Vendor)
exports.getVendor = factory.getOne(Vendor)
exports.createVendor = factory.createOne(Vendor)
exports.updateVendor = factory.updateOne(Vendor)
exports.deleteVendor = factory.deleteOne(Vendor)

exports.findVendor = catchAsync(async (req, res, next) => {
  const { userId } = req

  const user = await Vendor.findOne({ user: userId })
  if (!user) {
    return next(new AppError('User not found'))
  }

  res.status(200).json(user)
})

exports.updateVendor = catchAsync(async (req, res, next) => {
  const { user } = req
  const { storeName, country, city, state, address } = req.body

  const data = await Vendor.findOneAndUpdate(
    { user },
    { storeName, country, city, state, address },
    { new: true }
  )

  res.status(200).json(data)
})

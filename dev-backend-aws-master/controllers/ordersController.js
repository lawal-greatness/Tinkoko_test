const Orders = require('../models/ordersModel')
const catchAsync = require('../utils/catchAsync')
const { newOrderNotification } = require('../utils/notificationActions')
const factory = require('./handlerFactory')

exports.getAllOrders = factory.getAll(Orders)
exports.getOrder = factory.getOne(Orders)

exports.createOrder = catchAsync(async (req, res, next) => {
  const order = await Orders.create(req.body)

  const doc = await Orders.findById(order._id).populate('vendor')

  if (doc) {
    if (doc.vendor._id.toString() !== req.user.id.toString()) {
      await newOrderNotification(
        doc.buyer._id.toString(),
        doc._id.toString(),
        doc.vendor._id.toString()
      )
    }
  }

  res.status(201).json({
    status: 'success',
    doc,
  })
})

// exports.createOrder = factory.createOne(Orders)
exports.updateOrder = factory.updateOne(Orders)
exports.deleteOrder = factory.deleteOne(Orders)

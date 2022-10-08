const FarmerProduct = require('../models/farmerProductModel')
const factory = require('./handlerFactory')

exports.getAllFarmerProducts = factory.getAll(FarmerProduct, {
  path: 'agent farmer',
})
exports.getFarmerProduct = factory.getOne(FarmerProduct)
exports.createFarmerProduct = factory.createOne(FarmerProduct)
exports.updateFarmerProduct = factory.updateOne(FarmerProduct)
exports.deleteFarmerProduct = factory.deleteOne(FarmerProduct)

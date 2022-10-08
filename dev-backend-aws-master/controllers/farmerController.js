const Farmer = require('../models/farmerModel')
const factory = require('./handlerFactory')

exports.getAllFarmers = factory.getAll(Farmer)
exports.getFarmer = factory.getOne(Farmer)
exports.createFarmer = factory.createOne(Farmer)
exports.updateFarmer = factory.updateOne(Farmer)
exports.deleteFarmer = factory.deleteOne(Farmer)

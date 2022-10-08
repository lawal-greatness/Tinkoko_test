const Agent = require('../models/agentModel')
const factory = require('./handlerFactory')

exports.getAllAgents = factory.getAll(Agent)
exports.getAgent = factory.getOne(Agent)
exports.createAgent = factory.createOne(Agent)
exports.updateAgent = factory.updateOne(Agent)
exports.deleteAgent = factory.deleteOne(Agent)

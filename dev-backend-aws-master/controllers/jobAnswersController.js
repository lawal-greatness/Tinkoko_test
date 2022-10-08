const JobAnswer = require('../models/jobAnswersModel')
const factory = require('./handlerFactory')

exports.getAllJobAnswers = factory.getAll(JobAnswer, {
  path: 'job',
})
exports.getJobAnswer = factory.getOne(JobAnswer, {
  path: 'job',
})
exports.createJobAnswer = factory.createOne(JobAnswer)

exports.updateJobAnswer = factory.updateOne(JobAnswer)
exports.deleteJobAnswer = factory.deleteOne(JobAnswer)

const Job = require('../models/jobsModel')
const catchAsync = require('../utils/catchAsync')
const factory = require('./handlerFactory')

exports.popularJobs = catchAsync(async (req, res, next) => {
  const jobs = await Job.find().limit(5)
  res.json(jobs)
})

exports.getAllJobs = factory.getAll(Job, {
  path: 'user',
})
exports.getJob = factory.getOne(Job, {
  path: 'user',
})
exports.createJob = factory.createOne(Job)
exports.updateJob = factory.updateOne(Job)
exports.deleteJob = factory.deleteOne(Job)

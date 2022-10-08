const ReportFeed = require('../models/reportFeedModel')
const { newReportFeedNotification } = require('../utils/notificationActions')
const catchAsync = require('../utils/catchAsync')
const factory = require('./handlerFactory')

exports.getAllReportFeeds = factory.getAll(ReportFeed)
exports.getReportFeed = factory.getOne(ReportFeed)
// exports.createReportFeed = factory.createOne(ReportFeed)
exports.createReportFeed = catchAsync(async (req, res, next) => {
  const report = await ReportFeed.create(req.body)

  await newReportFeedNotification(report._id)

  res.status(201).json({
    status: 'success',
    report,
  })
})
exports.updateReportFeed = factory.updateOne(ReportFeed)
exports.deleteReportFeed = factory.deleteOne(ReportFeed)

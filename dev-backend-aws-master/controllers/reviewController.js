const Review = require('../models/reviewModel')
const factory = require('./handlerFactory')
// const catchAsync = require('./../utils/catchAsync');

exports.setReviewUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.review) req.body.review = req.params.tourId
  if (!req.body.user) req.body.user = req.user.id
  next()
}

exports.getAllReviews = factory.getAll(Review)
exports.getReview = factory.getOne(Review)
exports.createReview = factory.createOne(Review)
exports.updateReview = factory.updateOne(Review)
exports.deleteReview = factory.deleteOne(Review)

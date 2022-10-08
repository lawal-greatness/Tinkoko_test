const Blog = require('../models/blogModel')
const factory = require('./handlerFactory')

exports.getAllBlogs = factory.getAll(Blog)
exports.getBlog = factory.getOne(Blog)
exports.createBlog = factory.createOne(Blog)
exports.updateBlog = factory.updateOne(Blog)
exports.deleteBlog = factory.deleteOne(Blog)

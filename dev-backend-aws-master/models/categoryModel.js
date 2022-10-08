const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Name is required'],
      minlength: [2, 'Too short'],
      maxlength: [32, 'Too long'],
      unique: [true, 'Value already exists'],
    },
    slug: {
      type: String,
      unique: [true, 'Value already exists'],
      lowercase: true,
      // index: true,
    },
  },
  { timestamps: true }
)

const Category = mongoose.model('Category', categorySchema)
module.exports = Category

const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const jobsSchema = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    workLocation: {
      type: String,
      required: true,
    },
    jobType: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
      text: true,
    },
    minSalary: {
      type: Number,
    },
    maxSalary: {
      type: Number,
    },

    salary: { type: Number },

    active: {
      type: Boolean,
      default: true,
    },

    screeningQuestions: [
      {
        id: String,
        questionType: String,
        question: String,
        answer: String,
        requiredQuestion: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  { timestamps: true }
)

const Jobs = mongoose.model('Jobs', jobsSchema)

module.exports = Jobs

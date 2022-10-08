const mongoose = require('mongoose')

const jobAnswersSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.ObjectId,
      ref: 'Jobs',
    },
    jobPoster: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    name: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
    city: {
      type: String,
    },
    coverLetter: {
      type: String,
    },
    answers: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
)

jobAnswersSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'job',
    // select: 'post poster',
  })
  next()
})

const JobAnswers = mongoose.model('JobAnswers', jobAnswersSchema)
module.exports = JobAnswers

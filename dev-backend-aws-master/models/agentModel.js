const mongoose = require('mongoose')

const agentSchema = new mongoose.Schema(
  {
    agent: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    country: {
      type: String,
      required: true,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

const Agent = mongoose.model('Agent', agentSchema)
module.exports = Agent

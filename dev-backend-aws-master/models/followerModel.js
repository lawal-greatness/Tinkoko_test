const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const followerSchema = new mongoose.Schema({
  user: { type: ObjectId, ref: 'User' },

  followers: [
    {
      user: { type: ObjectId, ref: 'User' },
    },
  ],

  following: [
    {
      user: { type: ObjectId, ref: 'User' },
    },
  ],
})

module.exports = mongoose.model('Follower', followerSchema)

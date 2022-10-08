const Trail = require('../models/trailModel')

const TrailManager = async (actor, action, type) => {
  await new Trail({
    actor,
    action,
    type,
  }).save()
}

module.exports = TrailManager

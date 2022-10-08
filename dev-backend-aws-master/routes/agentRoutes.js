const express = require('express')
const router = express.Router()
const agentController = require('../controllers/agentController')
// const authController = require('../controllers/authController')

router.route('/').get(agentController.getAllAgents).post(
  // authController.protect,
  // authController.restrictTo(''Staff', 'Admin'),
  agentController.createAgent
)

router
  .route('/:id')
  .get(agentController.getAgent)
  .patch(
    // authController.protect,
    // authController.restrictTo(''Staff', 'Admin'),
    agentController.updateAgent
  )
  .delete(
    // authController.protect,
    // authController.restrictTo(''Staff', 'Admin'),
    agentController.deleteAgent
  )

module.exports = router

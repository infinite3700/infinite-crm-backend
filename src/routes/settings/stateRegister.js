import express from 'express'
import { createLeadStage, getLeadStages } from '../../controller/settings/leadStagesController.js'
import { createState, getDistrictsStateWise, getStateEnums, getStates, upadateStateAndStatus, updateStatebyId } from '../../controller/settings/stateController.js'
import authMiddleware from '../../middleware/authMiddleware.js'
const router = express.Router()

router.get('/state', authMiddleware, getStates)
router.post('/state', authMiddleware, createState)
router.post('/state/:state', authMiddleware, upadateStateAndStatus)
router.get('/district-enums/:state', authMiddleware, getDistrictsStateWise)
router.get('/state-enums', authMiddleware, getStateEnums)
router.put('/state/:_id', authMiddleware, updateStatebyId)

// routes for lead stages
router.get('/lead-stages', authMiddleware, getLeadStages)
router.post('/lead-stages', authMiddleware, createLeadStage)



export default router

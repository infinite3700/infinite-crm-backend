import express from 'express'
import {
  createCampaign,
  deleteCampaign,
  getCampaignById,
  getCampaigns,
  hardDeleteCampaign,
  updateCampaign
} from '../../controller/settings/campaignController.js'
import authMiddleware from '../../middleware/authMiddleware.js'

const router = express.Router()

// Campaign Routes (all protected with authentication)
router.post('/', authMiddleware, createCampaign)
router.get('/', authMiddleware, getCampaigns)
router.get('/:id', authMiddleware, getCampaignById)
router.put('/:id', authMiddleware, updateCampaign)
router.delete('/:id', authMiddleware, deleteCampaign)
router.delete('/:id/hard', authMiddleware, hardDeleteCampaign)

export default router

import express from 'express'
import {
  createLead,
  deleteLead,
  exportMyLeadsCSV,
  getAssignedLeads,
  getContributingLeads,
  getFollowUpLeads,
  getLeadById,
  getLeads,
  getLeadsCount,
  getMyLeads,
  updateLead
} from '../controller/leadsController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// Lead Routes (all protected with authentication)
router.post('/', authMiddleware, createLead)
router.get('/', authMiddleware, getLeads)
router.get('/my-leads', authMiddleware, getMyLeads)
router.get('/my-leads/export', authMiddleware, exportMyLeadsCSV)
router.get('/assigned', authMiddleware, getAssignedLeads)
router.get('/contributing', authMiddleware, getContributingLeads)
router.get('/follow-up', authMiddleware, getFollowUpLeads)
router.get('/count', authMiddleware, getLeadsCount)
router.get('/:id', authMiddleware, getLeadById)
router.put('/:id', authMiddleware, updateLead)
router.delete('/:id', authMiddleware, deleteLead)

export default router

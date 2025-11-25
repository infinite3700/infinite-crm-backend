import express from 'express'
import authRoutes from './authRoutes.js'
import leadsRoutes from './leadsRoutes.js'
import campaignRoutes from './settings/campaignRoutes.js'
import permissionRoutes from './settings/permissionRoutes.js'
import productsRoutes from './settings/productsRoutes.js'
import stateRoutes from './settings/stateRegister.js'
import taskRoutes from './taskRoutes.js'
import userRoutes from './userRoutes.js'
const router = express.Router()

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/tasks', taskRoutes)
router.use('/leads', leadsRoutes)
router.use('/settings', stateRoutes)
router.use('/settings/products', productsRoutes)
router.use('/settings/campaigns', campaignRoutes)
router.use('/settings', permissionRoutes)

export default router

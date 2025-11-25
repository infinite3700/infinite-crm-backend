import express from 'express'
import { createTask, getTasks, getFilteredTasks, updateTask, deleteTask } from '../controller/taskController.js'
import authMiddleware from '../middleware/authMiddleware.js'
const router = express.Router()

router.post('/', authMiddleware, createTask)
router.get('/', authMiddleware, getTasks)
router.get('/filter', authMiddleware, getFilteredTasks)
router.put('/:id', authMiddleware, updateTask)
router.delete('/:id', authMiddleware, deleteTask)

export default router

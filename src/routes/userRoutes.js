import express from 'express'
import {
  deleteUser,
  getAllUsers,
  getCurrentUser,
  getUserById,
  updateUser
} from '../controller/userController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// Get all users with search and pagination
// GET /api/users
router.get('/', authMiddleware, getAllUsers)

// Get current user profile
// GET /api/users/profile
router.get('/profile', authMiddleware, getCurrentUser)

// Get user by ID
// GET /api/users/:id
router.get('/:id', authMiddleware, getUserById)

// Update user
// PUT /api/users/:id
router.put('/:id', authMiddleware, updateUser)

// Delete user
// DELETE /api/users/:id
router.delete('/:id', authMiddleware, deleteUser)

export default router

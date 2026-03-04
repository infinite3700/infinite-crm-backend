import express from 'express'
import {
  assignUsersToUser,
  deleteUser,
  getAllUsers,
  getCurrentUser,
  getUserById,
  getUsersByFilter,
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

// Get users by optionalUserType and role filter
// GET /api/users/filter?optionalUserType=manager|franchise|null&role=roleId
router.get('/filter', authMiddleware, getUsersByFilter)

// Get user by ID
// GET /api/users/:id
router.get('/:id', authMiddleware, getUserById)

// Update user
// PUT /api/users/:id
router.put('/:id', authMiddleware, updateUser)

// Assign users to a user
// POST /api/users/:id/assign
router.post('/:id/assign', authMiddleware, assignUsersToUser)

// Delete user
// DELETE /api/users/:id
router.delete('/:id', authMiddleware, deleteUser)

export default router

import bcrypt from 'bcrypt'
import asyncHandler from 'express-async-handler'
import User from '../models/User.js'
import '../models/settings/Permission.js'
import '../models/settings/Role.js'

// @desc    Get user profile with role and permissions
// @route   GET /api/users/:id
// @access  Private
export const getUserById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findById(id)
      .select('-password') // Exclude password from response
      .populate({
        path: 'role',
        populate: {
          path: 'permission',
          model: 'Permission'
        }
      })

    if (!user) {
      res.status(404)
      throw new Error('User not found')
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      mobile: user.mobile,
      joinDate: user.joinDate,
      role: {
        _id: user.role._id,
        name: user.role.name,
        description: user.role.description,
        permissions: user.role.permission ? user.role.permission.map(permission => permission.key) : []
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    })
  } catch (error) {
    throw new Error(error.message)
  }
})

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
export const getCurrentUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate({
        path: 'role',
        populate: {
          path: 'permission',
          model: 'Permission'
        }
      })
    if (!user) {
      res.status(404)
      throw new Error('User not found')
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      mobile: user.mobile,
      joinDate: user.joinDate,
      role: {
        _id: user.role._id,
        name: user.role.name,
        description: user.role.description,
        permissions: user.role.permission ? user.role.permission.map(permission => permission.key) : []
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    })
  } catch (error) {
    throw new Error(error.message)
  }
})

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
export const updateUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params
    const { name, username, email, mobile, role, password } = req.body

    const user = await User.findById(id)
    if (!user) {
      res.status(404)
      throw new Error('User not found')
    }

    // Check for unique constraints if updating username, email, or mobile
    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username })
      if (usernameExists) {
        res.status(400)
        throw new Error('Username already taken')
      }
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email })
      if (emailExists) {
        res.status(400)
        throw new Error('Email already exists')
      }
    }

    if (mobile && mobile !== user.mobile) {
      const mobileExists = await User.findOne({ mobile })
      if (mobileExists) {
        res.status(400)
        throw new Error('Mobile number already registered')
      }
    }

    // Prepare update data
    const updateData = {}
    if (name) {
      updateData.name = name
    }
    if (username) {
      updateData.username = username
    }
    if (email) {
      updateData.email = email
    }
    if (mobile) {
      updateData.mobile = mobile
    }
    if (role) {
      updateData.role = role
    }

    // Handle password update
    if (password) {
      const bcryptRound = Number(process.env.BCRYPT_ROUNDS || 10)
      const salt = await bcrypt.genSalt(bcryptRound)
      updateData.password = await bcrypt.hash(password, salt)
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .select('-password')
      .populate({
        path: 'role',
        populate: {
          path: 'permission',
          model: 'Permission'
        }
      })

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      username: updatedUser.username,
      email: updatedUser.email,
      mobile: updatedUser.mobile,
      joinDate: updatedUser.joinDate,
      role: {
        _id: updatedUser.role._id,
        name: updatedUser.role.name,
        description: updatedUser.role.description,
        permissions: updatedUser.role.permission ? updatedUser.role.permission.map(permission => permission.key) : []
      },
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    })
  } catch (error) {
    throw new Error(error.message)
  }
})

// @desc    Get all users
// @route   GET /api/users
// @access  Private
export const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 100, search } = req.query

    const query = search
      ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { mobile: { $regex: search, $options: 'i' } }
        ]
      }
      : {}

    const users = await User.find(query)
      .select('-password')
      .populate({
        path: 'role',
        select: 'name description'
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })

    const total = await User.countDocuments(query)

    res.status(200).json({
      users: users.map(user => ({
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        joinDate: user.joinDate,
        role: {
          _id: user.role._id,
          name: user.role.name,
          description: user.role.description
        },
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    })
  } catch (error) {
    throw new Error(error.message)
  }
})

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private
export const deleteUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findById(id)
    if (!user) {
      res.status(404)
      throw new Error('User not found')
    }

    await User.findByIdAndDelete(id)

    res.status(200).json({
      message: 'User deleted successfully'
    })
  } catch (error) {
    throw new Error(error.message)
  }
})

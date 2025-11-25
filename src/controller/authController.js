import bcrypt from 'bcrypt'
import asyncHandler from 'express-async-handler'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import '../models/settings/Permission.js'
import '../models/settings/Role.js'

export const registeruser = asyncHandler(async (req, res) => {
  try {
    const { name, username, email, mobile, password, role } = req.body
    if (!name || !username || !email || !mobile || !password || !role) {
      res.status(400)
      throw new Error('Please fill all the fields')
    }

    // Check if user already exists with email, username, or mobile
    const userExists = await User.findOne({
      $or: [
        { email },
        { username },
        { mobile }
      ]
    })
    if (userExists) {
      res.status(400)
      if (userExists.email === email) {
        throw new Error('User with this email already exists')
      } else if (userExists.username === username) {
        throw new Error('Username already taken')
      } else if (userExists.mobile === mobile) {
        throw new Error('Mobile number already registered')
      }
    }

    // Hash password
    const bcryptRound = Number(process.env.BCRYPT_ROUNDS || 10)
    const salt = await bcrypt.genSalt(bcryptRound)
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = await User.create({
      name,
      username,
      email,
      mobile,
      password: hashedPassword,
      role,
      joinDate: new Date()
    })
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        joinDate: user.joinDate
      })
    }
  } catch (error) {
    throw new Error(error.message)
  }


})

export const loginUser = asyncHandler(async (req, res) => {
  const { login, password } = req.body
  try {
    if (!login || !password) {
      res.status(400)
      throw new Error('Please provide login credentials and password')
    }

    // Find user by email, username, or mobile
    const user = await User.findOne({
      $or: [
        { email: login },
        { username: login },
        { mobile: login }
      ]
    }).populate({
      path: 'role',
      populate: {
        path: 'permission',
        model: 'Permission'
      }
    })
    if (!user) {
      res.status(401)
      throw new Error('Invalid credentials')
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      res.status(401)
      throw new Error('Invalid credentials')
    }

    // Generate JWT token valid for 1 day
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        username: user.username,
        role: user.role._id
      },
      process.env.JWT_SECRET || 'defaultsecret',
      { expiresIn: '1d' }
    )

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
      token
    })
  } catch (error) {
    throw new Error(error.message)
  }
})

import Task from '../models/Task.js'
import asyncHandler from 'express-async-handler'

// Get tasks with filter criteria
export const getFilteredTasks = asyncHandler(async (req, res) => {
  const { status, title, priority } = req.query
  const filter = { user: req.user._id }
  if (status) {
    filter.status = status
  }
  if (priority) {
    filter.priority = priority
  }
  if (title) {
    filter.title = { $regex: title, $options: 'i' }
  }
  try {
    const tasks = await Task.find(filter)
    res.status(200).json(tasks)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create a new task
export const createTask = asyncHandler( async (req, res) => {
  const { title, description, priority, status } = req.body
  if (!title || !description || !priority || !status) {
    res.status(400)
    throw new Error('All fields (title, description, priority, status) are required')
  }
  try {
    const task = new Task({
      title,
      description,
      priority,
      status,
      user: req.user._id
    })
    await task.save()
    res.status(201).json(task)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get all tasks
export const getTasks = asyncHandler( async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const skip = (page - 1) * limit
  try {
    const total = await Task.countDocuments({ user: req.user._id })
    const tasks = await Task.find({ user: req.user._id })
      .skip(skip)
      .limit(limit)
    res.status(200).json({
      tasks,
      page,
      totalPages: Math.ceil(total / limit),
      total
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update a task
export const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { title, description, priority, status } = req.body

  try {
    const task = await Task.findOne({ _id: id, user: req.user._id })

    if (!task) {
      res.status(404)
      throw new Error('Task not found')
    }

    // Update fields if provided
    if (title !== undefined) {
      task.title = title
    }
    if (description !== undefined) {
      task.description = description
    }
    if (priority !== undefined) {
      task.priority = priority
    }
    if (status !== undefined) {
      task.status = status
    }

    const updatedTask = await task.save()
    res.status(200).json(updatedTask)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete a task
export const deleteTask = asyncHandler(async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id
    })

    if (!task) {
      res.status(404)
      throw new Error('Task not found')
    }

    await Task.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: 'Task deleted successfully' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

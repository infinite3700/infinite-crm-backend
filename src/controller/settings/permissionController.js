import asyncHandler from 'express-async-handler'
import { Permission, Roles } from '../../models/settings/Permission.js'

// @desc    Get all permissions
// @route   GET /api/settings/permissions
// @access  Private
const getPermissions = asyncHandler(async (req, res) => {
  try {
    const permissions = await Permission.find({}).sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: permissions.length,
      data: permissions
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching permissions',
      error: error.message
    })
  }
})

// @desc    Get single permission
// @route   GET /api/settings/permissions/:id
// @access  Private
const getPermission = asyncHandler(async (req, res) => {
  try {
    const permission = await Permission.findById(req.params.id)

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      })
    }

    res.status(200).json({
      success: true,
      data: permission
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching permission',
      error: error.message
    })
  }
})

// @desc    Create new permission
// @route   POST /api/settings/permissions
// @access  Private
const createPermission = asyncHandler(async (req, res) => {
  try {
    const { key, description } = req.body

    // Validation
    if (!key || !description) {
      return res.status(400).json({
        success: false,
        message: 'Key and description are required'
      })
    }

    // Check if permission already exists
    const existingPermission = await Permission.findOne({ key: key.toLowerCase() })
    if (existingPermission) {
      return res.status(400).json({
        success: false,
        message: 'Permission with this key already exists'
      })
    }

    const permission = await Permission.create({
      key: key.toLowerCase(),
      description
    })

    res.status(201).json({
      success: true,
      message: 'Permission created successfully',
      data: permission
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating permission',
      error: error.message
    })
  }
})

// @desc    Update permission
// @route   PUT /api/settings/permissions/:id
// @access  Private
const updatePermission = asyncHandler(async (req, res) => {
  try {
    const { key, description } = req.body

    // Validation
    if (!key || !description) {
      return res.status(400).json({
        success: false,
        message: 'Key and description are required'
      })
    }

    // Check if permission exists
    const permission = await Permission.findById(req.params.id)
    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      })
    }

    // Check if new key already exists (excluding current permission)
    const existingPermission = await Permission.findOne({
      key: key.toLowerCase(),
      _id: { $ne: req.params.id }
    })
    if (existingPermission) {
      return res.status(400).json({
        success: false,
        message: 'Permission with this key already exists'
      })
    }

    const updatedPermission = await Permission.findByIdAndUpdate(
      req.params.id,
      {
        key: key.toLowerCase(),
        description
      },
      { new: true, runValidators: true }
    )

    res.status(200).json({
      success: true,
      message: 'Permission updated successfully',
      data: updatedPermission
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating permission',
      error: error.message
    })
  }
})

// @desc    Delete permission
// @route   DELETE /api/settings/permissions/:id
// @access  Private
const deletePermission = asyncHandler(async (req, res) => {
  try {
    const permission = await Permission.findById(req.params.id)

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      })
    }

    // Check if permission is being used in any roles
    const rolesUsingPermission = await Roles.find({ permission: req.params.id })
    if (rolesUsingPermission.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete permission as it is being used in roles',
        rolesCount: rolesUsingPermission.length
      })
    }

    await Permission.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: 'Permission deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting permission',
      error: error.message
    })
  }
})

// ================== ROLES CRUD OPERATIONS ==================

// @desc    Get all roles
// @route   GET /api/settings/roles
// @access  Private
const getRoles = asyncHandler(async (req, res) => {
  try {
    const roles = await Roles.find({})
      .populate('permission', 'key description')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: roles.length,
      data: roles
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching roles',
      error: error.message
    })
  }
})

// @desc    Get single role
// @route   GET /api/settings/roles/:id
// @access  Private
const getRole = asyncHandler(async (req, res) => {
  try {
    const role = await Roles.findById(req.params.id)
      .populate('permission', 'key description')

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      })
    }

    res.status(200).json({
      success: true,
      data: role
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching role',
      error: error.message
    })
  }
})

// @desc    Create new role
// @route   POST /api/settings/roles
// @access  Private
const createRole = asyncHandler(async (req, res) => {
  try {
    const { name, description, permission, status } = req.body

    // Validation
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Name and description are required'
      })
    }

    // Check if role already exists
    const existingRole = await Roles.findOne({ name })
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: 'Role with this name already exists'
      })
    }

    // Validate permissions if provided
    if (permission && permission.length > 0) {
      const validPermissions = await Permission.find({ _id: { $in: permission } })
      if (validPermissions.length !== permission.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more permissions are invalid'
        })
      }
    }

    const role = await Roles.create({
      name,
      description,
      permission: permission || [],
      status: status !== undefined ? status : true
    })

    const populatedRole = await Roles.findById(role._id)
      .populate('permission', 'key description')

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: populatedRole
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating role',
      error: error.message
    })
  }
})

// @desc    Update role
// @route   PUT /api/settings/roles/:id
// @access  Private
const updateRole = asyncHandler(async (req, res) => {
  try {
    const { name, description, permission, status } = req.body

    // Validation
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Name and description are required'
      })
    }

    // Check if role exists
    const role = await Roles.findById(req.params.id)
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      })
    }

    // Check if new name already exists (excluding current role)
    const existingRole = await Roles.findOne({
      name,
      _id: { $ne: req.params.id }
    })
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: 'Role with this name already exists'
      })
    }

    // Validate permissions if provided
    if (permission && permission.length > 0) {
      const validPermissions = await Permission.find({ _id: { $in: permission } })
      if (validPermissions.length !== permission.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more permissions are invalid'
        })
      }
    }

    const updatedRole = await Roles.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        permission: permission || [],
        status: status !== undefined ? status : role.status
      },
      { new: true, runValidators: true }
    ).populate('permission', 'key description')

    res.status(200).json({
      success: true,
      message: 'Role updated successfully',
      data: updatedRole
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating role',
      error: error.message
    })
  }
})

// @desc    Delete role
// @route   DELETE /api/settings/roles/:id
// @access  Private
const deleteRole = asyncHandler(async (req, res) => {
  try {
    const role = await Roles.findById(req.params.id)

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      })
    }

    await Roles.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: 'Role deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting role',
      error: error.message
    })
  }
})

// @desc    Toggle role status
// @route   PATCH /api/settings/roles/:id/toggle-status
// @access  Private
const toggleRoleStatus = asyncHandler(async (req, res) => {
  try {
    const role = await Roles.findById(req.params.id)

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      })
    }

    const updatedRole = await Roles.findByIdAndUpdate(
      req.params.id,
      { status: !role.status },
      { new: true }
    ).populate('permission', 'key description')

    res.status(200).json({
      success: true,
      message: `Role ${updatedRole.status ? 'activated' : 'deactivated'} successfully`,
      data: updatedRole
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling role status',
      error: error.message
    })
  }
})

export {
  createPermission, createRole, deletePermission, deleteRole, getPermission,
  // Permission exports
  getPermissions, getRole,
  // Role exports
  getRoles, toggleRoleStatus, updatePermission, updateRole
}


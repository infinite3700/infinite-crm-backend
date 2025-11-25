import express from 'express'
import {
  createPermission,
  createRole,
  deletePermission,
  deleteRole,
  getPermission,
  // Permission routes
  getPermissions,
  getRole,
  // Role routes
  getRoles,
  toggleRoleStatus,
  updatePermission,
  updateRole
} from '../../controller/settings/permissionController.js'

const router = express.Router()

// ================== PERMISSION ROUTES ==================
router.route('/permissions')
  .get(getPermissions)
  .post(createPermission)

router.route('/permissions/:id')
  .get(getPermission)
  .put(updatePermission)
  .delete(deletePermission)

// ================== ROLE ROUTES ==================
router.route('/roles')
  .get(getRoles)
  .post(createRole)

router.route('/roles/:id')
  .get(getRole)
  .put(updateRole)
  .delete(deleteRole)

router.route('/roles/:id/toggle-status')
  .patch(toggleRoleStatus)

export default router

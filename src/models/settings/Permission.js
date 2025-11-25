import mongoose from 'mongoose'

const rolesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  permission: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Permission',
    required: true,
    default: []
  },
  status: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

const permissionSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
})

const Roles = mongoose.model('Roles', rolesSchema)
const Permission = mongoose.model('Permission', permissionSchema)

export { Roles, Permission }

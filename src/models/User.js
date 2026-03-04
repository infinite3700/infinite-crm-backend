import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  mobile: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roles',
    required: true
  },
  joinDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  optionalUserType: {
    type: String,
    enum: ['manager', 'franchise', null],
    default: null
  },
  assignedUser: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true })

export default mongoose.model('User', userSchema)

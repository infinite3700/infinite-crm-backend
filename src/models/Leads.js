import mongoose from 'mongoose'

const leadsSchema = new mongoose.Schema({
  companyName: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  district: {
    type: String,
    trim: true
  },
  contactName: {
    type: String,
    required: false,
    trim: true
  },
  contactMobile: {
    type: String,
    required: true,
    trim: true
  },
  stage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LeadStage'
  },
  productRequirement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false
  },
  nextCallDate: {
    type: Date,
    required: false
  },
  currentStatus: {
    type: String,
    trim: true,
    default: ''
  },
  assignTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contributor: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },
  leadOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  products:{
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
})

const Lead = mongoose.model('Lead', leadsSchema)
export default Lead

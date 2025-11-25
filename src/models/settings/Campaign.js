import mongoose from 'mongoose'

const campaignSchema = new mongoose.Schema({
  campaignName: {
    type: String,
    required: true,
    trim: true
  },
  campaignDescription: {
    type: String,
    required: true,
    trim: true
  },
  campaignStartDate: {
    type: Date,
    required: true
  },
  campaignEndDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'deleted'],
    default: 'active',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

const Campaign = mongoose.model('Campaign', campaignSchema)
export default Campaign

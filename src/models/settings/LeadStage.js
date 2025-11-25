import mongoose from 'mongoose'

const leadStageSchema = new mongoose.Schema({
  stage:{
    type:String,
    default:'',
    required:true,
    trim:true
  },
  status:{
    type:Boolean,
    default:true
  }
})

const LeadStage = mongoose.model('LeadStage', leadStageSchema)
export default LeadStage

import mongoose from 'mongoose'
const stateSchema = new mongoose.Schema({
  state: {
    type: String,
    required: true,
    trim: true
  },
  district:{
    type: String,
    trim: true
  },
  city:{
    type: String,
    required: true,
    trim: true
  },
  status:{
    type: Boolean,
    default: true
  }
})

const State = mongoose.model('State', stateSchema)
export default State

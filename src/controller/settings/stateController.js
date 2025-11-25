import asyncHandler from 'express-async-handler'
import { INDIAN_STATES, UTTAR_PRADESH_DISTRICTS, UTTARAKHAND_DISTRICTS } from '../../common/common-util.js'
import State from '../../models/settings/State.js'
const filter = (obj)=>{
  const newObj = {}
  if (obj.state === 'all'){
    newObj.state = { $exists:true  }
  } else if (obj.state){
    newObj.state = obj.state
  }
  if (obj.district){
    newObj.district = obj.district
  }
  if (obj.city){
    newObj.city = obj.city
  }

  return newObj
}

export const getStates = asyncHandler(async (req, res) => {
  try {
    const argsFilter = filter(req.query)
    let getStates = []
    if (argsFilter.state){
      getStates = await State.find(argsFilter, { _id:1, state:1, district:1, city:1, status:1 })
    } else if (argsFilter.district === 'all'){
      getStates = await State.aggregate([
        { $group: { _id: '$district', status:{ $first:'$status' }, state:{ $first:'$state' } } },
        { $project: { district: '$_id', _id: 0, status:1, state:1 } }
      ])
    } else {
      getStates = await State.aggregate([
        { $group: { _id: '$state', status:{ $first:'$status' } } },
        { $project: { state: '$_id', _id: 0, status:1 } }
      ])
    }

    res.status(200).json(getStates)
  } catch (error) {
    res.status(500)
    throw new Error(error)
  }
})

export const createState = asyncHandler(async (req, res) => {
  try {
    const { state, district, city } = req.body
    const upsertState = await State.updateOne({
      state, district, city
    }, {
      state, district, city
    }, {
      upsert: true
    })

    res.status(200).json(upsertState)

  } catch (error) {
    throw new Error(error)
  }
})

export const upadateStateAndStatus = asyncHandler(async (req, res) => {
  try {
    const { state } = req.params
    const { status } = req.body
    const newState = req.body.state
    if (typeof status !== 'boolean'){
      res.status(400)
      throw new Error('Status must be a boolean value')
    }
    const updateStatus = await State.updateMany({ state }, { status, state:newState })

    res.status(200).json(updateStatus)
  } catch (error) {
    throw new Error(error)
  }
})

export const updateStatebyId = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.params
    const { state, district, city, status } = req.body
    const updateState = await State.findByIdAndUpdate(_id, {
      state, district, city, status
    }, { new: true })
    res.status(200).json(updateState)
  } catch (error) {
    throw new Error(error)
  }
})

export const getDistrictsStateWise = asyncHandler(async (req, res) => {
  try {
    let districts = []
    const { state } = req.params
    if (state === 'Uttarakhand'){
      districts = UTTARAKHAND_DISTRICTS
    }
    if (state === 'Uttar Pradesh'){
      districts = UTTAR_PRADESH_DISTRICTS
    }

    if (state === 'all'){
      districts = [...UTTAR_PRADESH_DISTRICTS, ...UTTARAKHAND_DISTRICTS]
    }

    return res.status(200).json({ districts })
  } catch (error) {
    throw new Error(error)
  }
})
export const getStateEnums = asyncHandler(async (req, res) => {
  try {
    return res.status(200).json({ state: INDIAN_STATES })
  } catch (error) {
    throw new Error(error)
  }
})

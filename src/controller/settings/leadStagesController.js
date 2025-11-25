import expressAsyncHandler from 'express-async-handler'
import LeadStage from '../../models/settings/LeadStage.js'
const argsFilter = (args)=>{
  if (!args) {
    return {}
  }
  const filter = {}
  if (args.status){
    filter.status = args.status
  }
  if (args.stage){
    filter.stage = { $regex: args.stage, $options: 'i' }
  }
  return filter
}
export const createLeadStage = expressAsyncHandler(async (req, res) => {
  try {
    const { stage, status } = req.body
    if (!stage){
      res.status(400)
      throw new Error('Stage is required')
    }
    const filter = argsFilter(req.body)
    const upsertLead = await LeadStage.updateOne(
      filter,
      { $set:{ stage:stage, status } },
      { upsert:true }
    )

    res.status(200).json(upsertLead)

  } catch (error) {
    throw new Error(error)
  }
})

export const getLeadStages = expressAsyncHandler(async (req, res) => {
  try {
    const filter = argsFilter(req.query)
    const leadStages = await LeadStage.find(filter).sort({ stage:1 })
    res.status(200).json(leadStages)
  } catch (error) {
    throw new Error(error)
  }
})

import expressAsyncHandler from 'express-async-handler'
import Lead from '../models/Leads.js'

// Helper function to build filter
const buildFilter = (query) => {
  const filter = {}

  // Filter by company name (partial match, case-insensitive)
  if (query.companyName) {
    filter.companyName = { $regex: query.companyName, $options: 'i' }
  }

  // Filter by contact name (partial match, case-insensitive)
  if (query.contactName) {
    filter.contactName = { $regex: query.contactName, $options: 'i' }
  }

  // Filter by contact mobile
  if (query.contactMobile) {
    filter.contactMobile = { $regex: query.contactMobile, $options: 'i' }
  }

  // Filter by state
  if (query.state) {
    filter.state = query.state
  }

  // Filter by city
  if (query.city) {
    filter.city = query.city
  }

  // Filter by district
  if (query.district) {
    filter.district = query.district
  }

  // Filter by stage
  if (query.stage) {
    filter.stage = query.stage
  }

  // Filter by product requirement
  if (query.productRequirement) {
    filter.productRequirement = query.productRequirement
  }

  // Filter by current status
  if (query.currentStatus) {
    filter.currentStatus = { $regex: query.currentStatus, $options: 'i' }
  }

  // Filter by assigned to
  if (query.assignTo) {
    filter.assignTo = query.assignTo
  }

  // Filter by lead owner
  if (query.leadOwner) {
    filter.leadOwner = query.leadOwner
  }

  // Filter by campaign
  if (query.campaignId) {
    filter.campaignId = query.campaignId
  }

  // Filter by next call date range
  if (query.nextCallDateFrom || query.nextCallDateTo) {
    filter.nextCallDate = {}
    if (query.nextCallDateFrom) {
      filter.nextCallDate.$gte = new Date(query.nextCallDateFrom)
    }
    if (query.nextCallDateTo) {
      filter.nextCallDate.$lte = new Date(query.nextCallDateTo)
    }
  }

  return filter
}

// Create a new lead
export const createLead = expressAsyncHandler(async (req, res) => {
  try {
    const {
      companyName,
      state,
      city,
      district,
      contactName,
      contactMobile,
      stage,
      productRequirement,
      nextCallDate,
      currentStatus,
      assignTo,
      contributor,
      campaignId
    } = req.body

    // Validate required fields
    if (!contactMobile || !campaignId || !assignTo) {
      return res.status(400).json({
        error: 'Contact mobile, campaign ID, and assign to are required'
      })
    }

    // Create new lead with current logged-in user as lead owner
    const newLead = new Lead({
      companyName,
      state,
      city,
      district,
      contactName,
      contactMobile,
      stage: stage ? stage : null,
      productRequirement: productRequirement ? productRequirement : null,
      nextCallDate: nextCallDate ? new Date(nextCallDate) : undefined,
      currentStatus,
      assignTo,
      contributor: contributor || [],
      leadOwner: req.user._id,
      campaignId
    })

    const savedLead = await newLead.save()
    await savedLead.populate([
      { path: 'stage', select: 'stage status' },
      { path: 'productRequirement', select: 'name sku unitPrice category' },
      { path: 'assignTo', select: 'name username email' },
      { path: 'contributor', select: 'name username email' },
      { path: 'leadOwner', select: 'name username email' },
      { path: 'campaignId', select: 'campaignName campaignDescription status' }
    ])

    res.status(201).json(savedLead)
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ error: error.message })
  }
})

// Get all leads with filters
export const getLeads = expressAsyncHandler(async (req, res) => {
  try {
    const filter = buildFilter(req.query)

    const leads = await Lead.find(filter)
      .populate('stage', 'stage status')
      .populate('productRequirement', 'name sku unitPrice category')
      .populate('assignTo', 'name username email')
      .populate('contributor', 'name username email')
      .populate('leadOwner', 'name username email')
      .populate('campaignId', 'campaignName campaignDescription status')
      .sort({ nextCallDate: 1, updatedAt: -1 })

    res.status(200).json(leads)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get lead by ID
export const getLeadById = expressAsyncHandler(async (req, res) => {
  try {
    const { id } = req.params

    const lead = await Lead.findById(id)
      .populate('stage', 'stage status')
      .populate('productRequirement', 'name sku unitPrice category')
      .populate('assignTo', 'name username email')
      .populate('contributor', 'name username email')
      .populate('leadOwner', 'name username email')
      .populate('campaignId', 'campaignName campaignDescription status')

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' })
    }

    res.status(200).json(lead)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update a lead
export const updateLead = expressAsyncHandler(async (req, res) => {
  try {
    const { id } = req.params
    const {
      companyName,
      state,
      city,
      district,
      contactName,
      contactMobile,
      stage,
      productRequirement,
      nextCallDate,
      currentStatus,
      assignTo,
      contributor,
      campaignId
    } = req.body

    // Find the lead
    const lead = await Lead.findById(id)
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' })
    }

    // Update fields if provided
    if (companyName !== undefined) {
      lead.companyName = companyName
    }
    if (state !== undefined) {
      lead.state = state
    }
    if (city !== undefined) {
      lead.city = city
    }
    if (district !== undefined) {
      lead.district = district
    }
    if (contactName !== undefined) {
      lead.contactName = contactName
    }
    if (contactMobile !== undefined) {
      lead.contactMobile = contactMobile
    }
    if (stage !== undefined) {
      lead.stage = stage ? stage : null
    }
    if (productRequirement !== undefined) {
      lead.productRequirement = productRequirement ? productRequirement : null
    }
    if (nextCallDate !== undefined) {
      lead.nextCallDate = nextCallDate ? new Date(nextCallDate) : null
    }
    if (currentStatus !== undefined) {
      lead.currentStatus = currentStatus
    }
    if (assignTo !== undefined) {
      lead.assignTo = assignTo
    }
    if (contributor !== undefined) {
      lead.contributor = contributor
    }
    if (campaignId !== undefined) {
      lead.campaignId = campaignId
    }

    const updatedLead = await lead.save()
    await updatedLead.populate([
      { path: 'stage', select: 'stage status' },
      { path: 'productRequirement', select: 'name sku unitPrice category' },
      { path: 'assignTo', select: 'name username email' },
      { path: 'contributor', select: 'name username email' },
      { path: 'leadOwner', select: 'name username email' },
      { path: 'campaignId', select: 'campaignName campaignDescription status' }
    ])

    res.status(200).json(updatedLead)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Delete a lead
export const deleteLead = expressAsyncHandler(async (req, res) => {
  try {
    const { id } = req.params

    const lead = await Lead.findByIdAndDelete(id)
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' })
    }

    res.status(200).json({ message: 'Lead deleted successfully', lead })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get leads by current user (as owner or assigned)
export const getMyLeads = expressAsyncHandler(async (req, res) => {
  try {
    const filter = {
      $or: [
        { leadOwner: req.user._id },
        { assignTo: req.user._id }
      ]
    }

    // Apply additional filters from query
    const queryFilter = buildFilter(req.query)
    Object.assign(filter, queryFilter)

    const leads = await Lead.find(filter)
      .populate('stage', 'stage status')
      .populate('productRequirement', 'name sku unitPrice category')
      .populate('assignTo', 'name username email')
      .populate('contributor', 'name username email')
      .populate('leadOwner', 'name username email')
      .populate('campaignId', 'campaignName campaignDescription status')
      .sort({ nextCallDate: -1, updatedAt: -1 })

    res.status(200).json(leads)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get leads assigned to current user
export const getAssignedLeads = expressAsyncHandler(async (req, res) => {
  try {
    const filter = { assignTo: req.user._id }

    // Apply additional filters from query
    const queryFilter = buildFilter(req.query)
    Object.assign(filter, queryFilter)

    const leads = await Lead.find(filter)
      .populate('stage', 'stage status')
      .populate('productRequirement', 'name sku unitPrice category')
      .populate('assignTo', 'name username email')
      .populate('contributor', 'name username email')
      .populate('leadOwner', 'name username email')
      .populate('campaignId', 'campaignName campaignDescription status')
      .sort({ nextCallDate: -1, updatedAt: -1 })

    res.status(200).json(leads)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// follow up leads for current user
export const getFollowUpLeads = expressAsyncHandler(async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const filter = {
      assignTo: req.user._id,
      nextCallDate: { $gte: today }
    }

    // Apply additional filters from query
    const queryFilter = buildFilter(req.query)
    Object.assign(filter, queryFilter)

    const leads = await Lead.find(filter)
      .populate('stage', 'stage status')
      .populate('productRequirement', 'name sku unitPrice category')
      .populate('assignTo', 'name username email')
      .populate('contributor', 'name username email')
      .populate('leadOwner', 'name username email')
      .populate('campaignId', 'campaignName campaignDescription status')
      .sort({ nextCallDate: 1, updatedAt: -1 })

    res.status(200).json(leads)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// total count to follow up and assigned leads
export const getLeadsCount = expressAsyncHandler(async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const assignedCount = await Lead.countDocuments({ assignTo: req.user._id })
    const followUpCount = await Lead.countDocuments({
      assignTo: req.user._id,
      nextCallDate: { $gte: today }
    })

    res.status(200).json({ assignedCount, followUpCount })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

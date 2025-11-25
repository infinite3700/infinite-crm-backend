import expressAsyncHandler from 'express-async-handler'
import Campaign from '../../models/settings/Campaign.js'

// Helper function to build filter
const buildFilter = (query) => {
  const filter = {}

  // Filter by campaign name (partial match, case-insensitive)
  if (query.campaignName) {
    filter.campaignName = { $regex: query.campaignName, $options: 'i' }
  }

  // Filter by status
  if (query.status) {
    filter.status = query.status
  }

  // Filter by createdBy
  if (query.createdBy) {
    filter.createdBy = query.createdBy
  }

  // Filter by campaign start date
  if (query.campaignStartDate) {
    filter.campaignStartDate = new Date(query.campaignStartDate)
  }

  // Filter by campaign end date
  if (query.campaignEndDate) {
    filter.campaignEndDate = new Date(query.campaignEndDate)
  }

  // Filter by date range
  if (query.startDateFrom || query.startDateTo) {
    filter.campaignStartDate = {}
    if (query.startDateFrom) {
      filter.campaignStartDate.$gte = new Date(query.startDateFrom)
    }
    if (query.startDateTo) {
      filter.campaignStartDate.$lte = new Date(query.startDateTo)
    }
  }

  if (query.endDateFrom || query.endDateTo) {
    filter.campaignEndDate = {}
    if (query.endDateFrom) {
      filter.campaignEndDate.$gte = new Date(query.endDateFrom)
    }
    if (query.endDateTo) {
      filter.campaignEndDate.$lte = new Date(query.endDateTo)
    }
  }

  return filter
}

// Create a new campaign
export const createCampaign = expressAsyncHandler(async (req, res) => {
  try {
    const { campaignName, campaignDescription, campaignStartDate, campaignEndDate, status } = req.body

    // Validate required fields
    if (!campaignName || !campaignDescription || !campaignStartDate || !campaignEndDate) {
      return res.status(400).json({
        error: 'Campaign name, description, start date, and end date are required'
      })
    }

    // Validate dates
    const startDate = new Date(campaignStartDate)
    const endDate = new Date(campaignEndDate)

    if (endDate <= startDate) {
      return res.status(400).json({
        error: 'Campaign end date must be after start date'
      })
    }

    // Create new campaign with current logged-in user
    const newCampaign = new Campaign({
      campaignName,
      campaignDescription,
      campaignStartDate: startDate,
      campaignEndDate: endDate,
      status: status || 'active',
      createdBy: req.user._id
    })

    const savedCampaign = await newCampaign.save()
    await savedCampaign.populate('createdBy', 'name username email')

    res.status(201).json(savedCampaign)
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ error: error.message })
  }
})

// Get all campaigns with filters
export const getCampaigns = expressAsyncHandler(async (req, res) => {
  try {
    const filter = buildFilter(req.query)

    const campaigns = await Campaign.find(filter)
      .populate('createdBy', 'name username email')
      .sort({ createdAt: -1 })

    res.status(200).json(campaigns)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get campaign by ID
export const getCampaignById = expressAsyncHandler(async (req, res) => {
  try {
    const { id } = req.params

    const campaign = await Campaign.findById(id)
      .populate('createdBy', 'name username email')

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' })
    }

    res.status(200).json(campaign)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update a campaign
export const updateCampaign = expressAsyncHandler(async (req, res) => {
  try {
    const { id } = req.params
    const { campaignName, campaignDescription, campaignStartDate, campaignEndDate, status } = req.body

    // Find the campaign
    const campaign = await Campaign.findById(id)
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' })
    }

    // Update fields if provided
    if (campaignName) {
      campaign.campaignName = campaignName
    }
    if (campaignDescription) {
      campaign.campaignDescription = campaignDescription
    }
    if (campaignStartDate) {
      campaign.campaignStartDate = new Date(campaignStartDate)
    }
    if (campaignEndDate) {
      campaign.campaignEndDate = new Date(campaignEndDate)
    }
    if (status) {
      campaign.status = status
    }

    // Validate dates if both are present
    if (campaign.campaignEndDate <= campaign.campaignStartDate) {
      return res.status(400).json({
        error: 'Campaign end date must be after start date'
      })
    }

    const updatedCampaign = await campaign.save()
    await updatedCampaign.populate('createdBy', 'name username email')

    res.status(200).json(updatedCampaign)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Delete a campaign (soft delete by setting status to 'deleted')
export const deleteCampaign = expressAsyncHandler(async (req, res) => {
  try {
    const { id } = req.params

    const campaign = await Campaign.findById(id)
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' })
    }

    // Soft delete by setting status to 'deleted'
    campaign.status = 'deleted'
    await campaign.save()

    res.status(200).json({ message: 'Campaign deleted successfully', campaign })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Hard delete a campaign (permanently remove from database)
export const hardDeleteCampaign = expressAsyncHandler(async (req, res) => {
  try {
    const { id } = req.params

    const campaign = await Campaign.findByIdAndDelete(id)
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' })
    }

    res.status(200).json({ message: 'Campaign permanently deleted', campaign })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

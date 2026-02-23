import expressAsyncHandler from 'express-async-handler'
import Lead from '../models/Leads.js'
import { Product } from '../models/settings/Products.js'

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
    filter.assignTo = { $in: [query.assignTo] }
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

  // Filter by lead created date range (createdAt)
  if (query.createdAtFrom || query.createdAtTo) {
    filter.createdAt = {}
    if (query.createdAtFrom) {
      filter.createdAt.$gte = new Date(query.createdAtFrom)
    }
    if (query.createdAtTo) {
      const toDate = new Date(query.createdAtTo)
      toDate.setHours(23, 59, 59, 999)
      filter.createdAt.$lte = toDate
    }
  }

  // Filter by lead last updated date range (updatedAt)
  if (query.updatedAtFrom || query.updatedAtTo) {
    filter.updatedAt = {}
    if (query.updatedAtFrom) {
      filter.updatedAt.$gte = new Date(query.updatedAtFrom)
    }
    if (query.updatedAtTo) {
      const toDate = new Date(query.updatedAtTo)
      toDate.setHours(23, 59, 59, 999)
      filter.updatedAt.$lte = toDate
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

    // get product details
    const getProduct = await Product.findById(productRequirement)

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
      campaignId,
      products: getProduct
    })

    const savedLead = await newLead.save()
    const populatedLead = await Lead.findById(savedLead._id)
      .populate('stage', 'stage status')
      .populate('productRequirement', 'name sku unitPrice category')
      .populate('assignTo', 'name username email')
      .populate('contributor', 'name username email')
      .populate('leadOwner', 'name username email')
      .populate('campaignId', 'campaignName campaignDescription status')
      .sort({ updatedAt: -1 })

    res.status(201).json(populatedLead)
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ error: error.message })
  }
})

// Get all leads with filters
export const getLeads = expressAsyncHandler(async (req, res) => {
  try {
    const filter = buildFilter(req.query)

    // Pagination
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const [leads, totalCount] = await Promise.all([
      Lead.find(filter)
        .populate('stage', 'stage status')
        .populate('productRequirement', 'name sku unitPrice category')
        .populate('assignTo', 'name username email')
        .populate('contributor', 'name username email')
        .populate('leadOwner', 'name username email')
        .populate('campaignId', 'campaignName campaignDescription status')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Lead.countDocuments(filter)
    ])

    res.status(200).json({
      leads,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit
      }
    })
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
      // get product details
      const getProduct = await Product.findById(productRequirement)
      lead.products = getProduct
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

    // Pagination
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Apply additional filters from query
    const queryFilter = buildFilter(req.query)
    Object.assign(filter, queryFilter)

    const [leads, totalCount] = await Promise.all([
      Lead.find(filter)
        .populate('stage', 'stage status')
        .populate('productRequirement', 'name sku unitPrice category')
        .populate('assignTo', 'name username email')
        .populate('contributor', 'name username email')
        .populate('leadOwner', 'name username email')
        .populate('campaignId', 'campaignName campaignDescription status')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Lead.countDocuments(filter)
    ])

    res.status(200).json({
      leads,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit
      }
    })
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

    // Pagination
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const [leads, totalCount] = await Promise.all([
      Lead.find(filter)
        .populate('stage', 'stage status')
        .populate('productRequirement', 'name sku unitPrice category')
        .populate('assignTo', 'name username email')
        .populate('contributor', 'name username email')
        .populate('leadOwner', 'name username email')
        .populate('campaignId', 'campaignName campaignDescription status')
        .sort({ nextCallDate: -1, updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Lead.countDocuments(filter)
    ])

    res.status(200).json({
      leads,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// follow up leads for current user
export const getFollowUpLeads = expressAsyncHandler(async (req, res) => {
  try {
    const today = new Date()
    const todayISO = today.toISOString().split('T')[0] + 'T23:59:59.999Z'

    const filter = {
      assignTo: req.user._id,
      nextCallDate: { $lte: new Date(todayISO) }
    }

    // Apply additional filters from query
    const queryFilter = buildFilter(req.query)
    Object.assign(filter, queryFilter)

    // Pagination
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const leads = await Lead.aggregate([
      {
        $match: filter
      },
      {
        $lookup: {
          from: 'leadstages',
          localField: 'stage',
          foreignField: '_id',
          as: 'stageData'
        }
      },
      {
        $match: {
          $or: [
            { stageData: { $size: 0 } }, // No stage assigned
            {
              'stageData.stage': {
                $not: {
                  $regex: /^(won|lost)$/i
                }
              }
            }
          ]
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'productRequirement',
          foreignField: '_id',
          as: 'productData'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'assignTo',
          foreignField: '_id',
          as: 'assignToData'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'contributor',
          foreignField: '_id',
          as: 'contributorData'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'leadOwner',
          foreignField: '_id',
          as: 'leadOwnerData'
        }
      },
      {
        $lookup: {
          from: 'campaigns',
          localField: 'campaignId',
          foreignField: '_id',
          as: 'campaignData'
        }
      },
      {
        $addFields: {
          stage: {
            $cond: {
              if: { $gt: [{ $size: '$stageData' }, 0] },
              then: {
                _id: { $arrayElemAt: ['$stageData._id', 0] },
                stage: { $arrayElemAt: ['$stageData.stage', 0] },
                status: { $arrayElemAt: ['$stageData.status', 0] }
              },
              else: null
            }
          },
          productRequirement: {
            $cond: {
              if: { $gt: [{ $size: '$productData' }, 0] },
              then: {
                _id: { $arrayElemAt: ['$productData._id', 0] },
                name: { $arrayElemAt: ['$productData.name', 0] },
                sku: { $arrayElemAt: ['$productData.sku', 0] },
                unitPrice: { $arrayElemAt: ['$productData.unitPrice', 0] },
                category: { $arrayElemAt: ['$productData.category', 0] }
              },
              else: null
            }
          },
          assignTo: {
            _id: { $arrayElemAt: ['$assignToData._id', 0] },
            name: { $arrayElemAt: ['$assignToData.name', 0] },
            username: { $arrayElemAt: ['$assignToData.username', 0] },
            email: { $arrayElemAt: ['$assignToData.email', 0] }
          },
          contributor: {
            $map: {
              input: '$contributorData',
              as: 'contrib',
              in: {
                _id: '$$contrib._id',
                name: '$$contrib.name',
                username: '$$contrib.username',
                email: '$$contrib.email'
              }
            }
          },
          leadOwner: {
            _id: { $arrayElemAt: ['$leadOwnerData._id', 0] },
            name: { $arrayElemAt: ['$leadOwnerData.name', 0] },
            username: { $arrayElemAt: ['$leadOwnerData.username', 0] },
            email: { $arrayElemAt: ['$leadOwnerData.email', 0] }
          },
          campaignId: {
            _id: { $arrayElemAt: ['$campaignData._id', 0] },
            campaignName: { $arrayElemAt: ['$campaignData.campaignName', 0] },
            campaignDescription: { $arrayElemAt: ['$campaignData.campaignDescription', 0] },
            status: { $arrayElemAt: ['$campaignData.status', 0] }
          }
        }
      },
      {
        $project: {
          stageData: 0,
          productData: 0,
          assignToData: 0,
          contributorData: 0,
          leadOwnerData: 0,
          campaignData: 0
        }
      },
      {
        $sort: { nextCallDate: 1, updatedAt: -1 }
      },
      {
        $facet: {
          leads: [
            { $skip: skip },
            { $limit: limit }
          ],
          totalCount: [
            { $count: 'count' }
          ]
        }
      }
    ])

    const result = leads[0]
    const leadsData = result.leads
    const totalCount = result.totalCount.length > 0 ? result.totalCount[0].count : 0

    res.status(200).json({
      leads: leadsData,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// total count to follow up and assigned leads
export const getLeadsCount = expressAsyncHandler(async (req, res) => {
  try {
    const today = new Date()
    const todayISO = today.toISOString().split('T')[0] + 'T23:59:59.999Z'

    // Count all assigned leads (without stage filtering)
    const assignedCount = await Lead.countDocuments({ assignTo: req.user._id })

    // Count follow-up leads (excluding won/lost stages)
    const followUpCountResult = await Lead.aggregate([
      {
        $match: {
          assignTo: req.user._id,
          nextCallDate: { $lte: new Date(todayISO) }
        }
      },
      {
        $lookup: {
          from: 'leadstages',
          localField: 'stage',
          foreignField: '_id',
          as: 'stageData'
        }
      },
      {
        $match: {
          $or: [
            { stageData: { $size: 0 } }, // No stage assigned
            {
              'stageData.stage': {
                $not: {
                  $regex: /^(won|lost)$/i
                }
              }
            }
          ]
        }
      },
      {
        $count: 'count'
      }
    ])

    const followUpCount = followUpCountResult.length > 0 ? followUpCountResult[0].count : 0

    res.status(200).json({ assignedCount, followUpCount })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Export leads as CSV (based on getMyLeads filters)
export const exportMyLeadsCSV = expressAsyncHandler(async (req, res) => {
  try {
    const filter = {
      $or: [
        { leadOwner: req.user._id },
        { assignTo: req.user._id }
      ]
    }

    // Pagination
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

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
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)

    // CSV Headers
    const headers = [
      'Contact Name',
      'Mobile',
      'Company Name',
      'Location',
      'District',
      'City',
      'Lead Stage',
      'Product Category',
      'Product Requirement',
      'Next Call Date',
      'Current Status',
      'Campaign',
      'Assign To',
      'Contributors',
      'Created At'
    ]

    // Helper function to escape CSV values
    const escapeCSV = (value) => {
      if (value === null || value === undefined) {
        return ''
      }
      const str = String(value)
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    // Helper function to format date
    const formatDate = (date) => {
      if (!date) {
        return ''
      }
      return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }

    // Build CSV rows
    const rows = leads.map(lead => {
      const contributors = lead.contributor && lead.contributor.length > 0
        ? lead.contributor.map(c => c.name || c.username).join('; ')
        : ''

      return [
        escapeCSV(lead.contactName),
        escapeCSV(lead.contactMobile),
        escapeCSV(lead.companyName),
        escapeCSV(lead.state),
        escapeCSV(lead.district),
        escapeCSV(lead.city),
        escapeCSV(lead.stage?.stage),
        escapeCSV(lead.productRequirement?.category),
        escapeCSV(lead.productRequirement?.name),
        escapeCSV(formatDate(lead.nextCallDate)),
        escapeCSV(lead.currentStatus),
        escapeCSV(lead.campaignId?.campaignName),
        escapeCSV(lead.assignTo?.name || lead.assignTo?.username),
        escapeCSV(contributors),
        escapeCSV(formatDate(lead.createdAt))
      ].join(',')
    })

    // Combine headers and rows
    const csvContent = [headers.join(','), ...rows].join('\n')

    // Set response headers for CSV download
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="leads-export.csv"')
    res.status(200).send(csvContent)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

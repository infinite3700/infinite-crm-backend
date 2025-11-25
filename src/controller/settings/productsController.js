import expressAsyncHandler from 'express-async-handler'
import { Product, ProductCategory } from '../../models/settings/Products.js'
const argsFilter = (args)=>{
  if (!args) {
    return {}
  }
  const filter = {}
  if (args.status){
    filter.status = args.status
  }
  if (args.category){
    filter.category = args.category
  }
}

export const createProductCategory = expressAsyncHandler(async (req, res) => {
  try {
    const { category, status, _id } = req.body
    const filter = _id ? { _id } : { category:category }
    if (!category) {
      return res.status(400).json({ error: 'Category is required' })
    }
    const createProduct = await ProductCategory.updateOne(filter, { $set:{ category:category, status:status } }, { upsert:true })
    res.status(200).json(createProduct)
  } catch (error) {
    throw new Error(error)
  }
})

export const getProductsCategory = expressAsyncHandler(async (req, res) => {
  try {
    const filter = argsFilter(req.query)
    const products = await ProductCategory.find(filter).sort({ productName:1 })
    res.status(200).json(products)
  } catch (error) {
    throw new Error(error)
  }
})


export const createProduct = expressAsyncHandler(async (req, res) => {
  try {
    const { name, sku, unitPrice, category, status } = req.body

    // Validate required fields
    if (!name || !unitPrice || !category) {
      return res.status(400).json({ error: 'Name, SKU, unit price, and category are required' })
    }

    // Create new product
    const newProduct = new Product({
      name,
      sku:sku || 0,
      unitPrice,
      category,
      status: status !== undefined ? status : true
    })

    const savedProduct = await newProduct.save()
    await savedProduct.populate('category', 'category status')

    res.status(201).json(savedProduct)
  } catch (error) {
    console.error(error.message)
    if (error.code === 11000) {
      res.status(400).json({ error: 'SKU already exists' })
    } else {
      res.status(500).json({ error: error.message })
    }
  }
})

export const getProducts = expressAsyncHandler(async (req, res) => {
  try {
    const { name, category, status, minPrice, maxPrice } = req.query
    const filter = {}

    // Build filter object
    if (name) {
      filter.name = { $regex: name, $options: 'i' }
    }
    if (category) {
      filter.category = category
    }
    if (status !== undefined) {
      filter.status = status === 'true'
    }
    if (minPrice || maxPrice) {
      filter.unitPrice = {}
      if (minPrice) {
        filter.unitPrice.$gte = Number(minPrice)
      }
      if (maxPrice) {
        filter.unitPrice.$lte = Number(maxPrice)
      }
    }

    const products = await Product.find(filter)
      .populate('category', 'category status')
      .sort({ name: 1 })

    res.status(200).json(products)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export const updateProduct = expressAsyncHandler(async (req, res) => {
  try {
    const { id } = req.params
    const { name, sku, unitPrice, category, status } = req.body

    // Find the product
    const product = await Product.findById(id)
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    // Update fields if provided
    if (name) {
      product.name = name
    }
    if (sku) {
      product.sku = sku
    }
    if (unitPrice) {
      product.unitPrice = unitPrice
    }
    if (category) {
      product.category = category
    }
    if (status !== undefined) {
      product.status = status
    }

    const updatedProduct = await product.save()
    await updatedProduct.populate('category', 'category status')

    res.status(200).json(updatedProduct)
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'SKU already exists' })
    } else {
      res.status(500).json({ error: error.message })
    }
  }
})

export const deleteProduct = expressAsyncHandler(async (req, res) => {
  try {
    const { id } = req.params

    const product = await Product.findByIdAndDelete(id)
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.status(200).json({ message: 'Product deleted successfully', product })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export const getProductById = expressAsyncHandler(async (req, res) => {
  try {
    const { id } = req.params

    const product = await Product.findById(id).populate('category', 'category status')
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.status(200).json(product)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

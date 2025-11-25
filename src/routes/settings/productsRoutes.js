import express from 'express'
import {
  createProductCategory,
  getProductsCategory,
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  getProductById
} from '../../controller/settings/productsController.js'

const router = express.Router()

// Product Category Routes
router.post('/category', createProductCategory)
router.get('/category', getProductsCategory)

// Product Routes
router.post('/', createProduct)
router.get('/', getProducts)
router.get('/:id', getProductById)
router.put('/:id', updateProduct)
router.delete('/:id', deleteProduct)

export default router

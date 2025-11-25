import mongoose from 'mongoose'

const productCategorySchema = new mongoose.Schema({
  category:{
    type:String,
    required:true,
    unique:true
  },
  status:{
    type:Boolean,
    default:true
  }
})


const productsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: Number,
    default:0
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: Boolean,
    default: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductCategory',
    required: true
  }
}, {
  timestamps: true
})

const ProductCategory = mongoose.model('ProductCategory', productCategorySchema)
const Product = mongoose.model('Product', productsSchema)

export { Product, ProductCategory }


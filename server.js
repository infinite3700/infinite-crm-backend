import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { readFileSync } from 'fs'
import yaml from 'js-yaml'
import { dirname, join } from 'path'
import swaggerUi from 'swagger-ui-express'
import { fileURLToPath } from 'url'
import { connectDB } from './src/config/db.js'
import { errorHandler } from './src/middleware/errorMiddleware.js'
import mainRoutes from './src/routes/mainRoutes.js'

const CSS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment-specific configuration
// First check if NODE_ENV is set via command line/system environment
let NODE_ENV = process.env.NODE_ENV

if (NODE_ENV === 'production') {
  // Load production environment variables and override any existing ones
  dotenv.config({ path: '.env', override: true })
  console.info('Loading production environment variables from .env.production')
} else {
  // Load development environment variables (default)
  dotenv.config()
  console.info('Loading development environment variables from .env')
}

// After loading dotenv, get NODE_ENV again (in case it was set in the .env file)
NODE_ENV = process.env.NODE_ENV || 'development'

// Load Swagger documentation with proper path resolution
let swaggerDocument
try {
  const swaggerPath = join(__dirname, 'swagger.yaml')
  const swaggerFile = readFileSync(swaggerPath, 'utf8')
  swaggerDocument = yaml.load(swaggerFile)
  console.info('Swagger documentation loaded successfully')
} catch (error) {
  console.error('Error loading Swagger file:', error.message)
  swaggerDocument = null
}

connectDB()

const PORT = process.env.PORT || 3000

const app = express()

// CORS configuration based on environment - Apply CORS BEFORE other middlewares
const corsOptions = {
  origin: NODE_ENV === 'production'
    ? process.env.FRONTEND_URL || 'https://infinite-crm-frontend.vercel.app'
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'https://infinite-crm-frontend.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Swagger UI with custom options (only if swagger loaded successfully)
if (swaggerDocument) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customCss:
      '.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }',
    customCssUrl: CSS_URL,
    customSiteTitle: 'Infinite Backend API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      tryItOutEnabled: true
    }
  }))

  console.info('Swagger UI initialized at /api-docs')
}

// Health check route
app.get('/', (req, res) => {
  console.info('Health check route hit')
  const healthInfo = {
    status: 'ok',
    message: 'Server is healthy',
    environment: NODE_ENV
  }

  if (swaggerDocument) {
    healthInfo.swagger = 'Available at /api-docs'
  }

  res.status(200).json(healthInfo)
})

app.use('/api', mainRoutes)

// app.get('/health', (req, res) => {
//   res.status(200).json({ status: 'ok', message: 'Server is healthy' });
// });

app.use(errorHandler)
app.listen(PORT, () => {
  console.info(`Server running on port  ${PORT} in ${NODE_ENV} mode`)
  console.info(`Using MongoDB: ${process.env.MONGO_URI ? 'Connected' : 'Not configured'}`)
  console.info(`JWT Secret: ${process.env.JWT_SECRET ? 'Configured' : 'Not configured'}`)
  console.info(`CORS Frontend URL: ${process.env.FRONTEND_URL || 'Not specified'}`)
  if (swaggerDocument) {
    console.info(`📚 Swagger API Documentation: http://localhost:${PORT}/api-docs`)
  }
})

export default app

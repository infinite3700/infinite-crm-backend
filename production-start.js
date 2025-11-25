// production-start.js
// This script sets NODE_ENV before importing the main server
process.env.NODE_ENV = 'production'
import('./server.js')

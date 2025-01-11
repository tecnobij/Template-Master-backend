// Import required modules
require('dotenv').config();
const app = require('./app'); // Import app from app.js
const connectToMongoDB = require('./src/config/db');

// Initialize and configure environment variables
connectToMongoDB();

console.log('MongoDB connection initialized successfully.');

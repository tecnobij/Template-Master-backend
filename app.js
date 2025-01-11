// Import required modules
require('dotenv').config(); // Load environment variables
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Route Setup
const userRoute = require('./src/routes/user.router');
const adminRoute = require('./src/routes/admin.routes');
const uploadImages = require('./src/routes/image.routes');
const uploadVideo = require('./src/routes/video.routes');
const tagRoute = require('./src/routes/tag.routes'); // Corrected route file for tags

// Initialize the app
const app = express();

// Middleware setup
app.use(bodyParser.json()); // Parse JSON request bodies

// CORS setup
const allowedOrigins = [process.env.FRONTEND_URL || "http://localhost:5173"];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true); // Allow the request
      } else {
        console.error(`CORS error: ${origin} not allowed by CORS`);
        callback(new Error("Not allowed by CORS")); // Reject the request
      }
    },
    credentials: true, // Allow cookies and credentials
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Define a port
const PORT = process.env.PORT || 3000;

// Basic route setup
app.use('/api/V1/user', userRoute);
app.use('/api/V1/admin', adminRoute);
app.use('/api/V1/images', uploadImages);
app.use('/api/V1/video', uploadVideo);
app.use('/api/V1/tag', tagRoute); // Corrected tag route

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

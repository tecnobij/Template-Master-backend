require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectToMongoDB = require('./src/config/db');

// Importing all routes
const userRoutes = require('./src/routes/user.router');
const adminRoutes = require('./src/routes/admin.routes');
const imageRoutes = require('./src/routes/image.routes');
const videoRoutes = require('./src/routes/video.routes');
const tagRoutes = require('./src/routes/tag.routes');

const app = express();
const allowedOrigins = [process.env.FRONTEND_URL || "http://localhost:5173"];
const PORT = process.env.PORT || 3000;

connectToMongoDB();

app.use(bodyParser.json());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Consolidated API routes
app.use('/api/V1/user', userRoutes);
app.use('/api/V1/admin', adminRoutes);
app.use('/api/V1/images', imageRoutes);
app.use('/api/V1/video', videoRoutes);
app.use('/api/V1/tag', tagRoutes);

// Export the app as a handler
module.exports = app;

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const multer = require('multer');

const app = express();

// MongoDB Connection
const connectToMongoDB = async () => {
    const mongoose = require('mongoose');
    const dbUri = process.env.MONGO_URI || 'mongodb://localhost:27017/myapp';
    try {
        await mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1);
    }
};
connectToMongoDB();

const allowedOrigins = [process.env.FRONTEND_URL || "http://localhost:5173"];
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
const upload = multer({ dest: 'uploads/' });

// Dummy Controllers (Replace with actual logic)
const adminController = {
    initializeAdmin: (req, res) => res.send('Admin initialized'),
    adminLogin: (req, res) => res.send('Admin login success'),
};
const userController = {
    registerUser: (req, res) => res.send('User registered'),
    loginUser: (req, res) => res.send('User login success'),
    logoutUser: (req, res) => res.send('User logged out'),
};
const imageController = {
    uploadImages: (req, res) => res.send('Images uploaded'),
};
const tagController = {
    createTag: (req, res) => res.send('Tag created'),
};
const videoController = {
    uploadVideo: (req, res) => res.send('Video uploaded'),
};

// Routes
app.post('/api/V1/admin/create', adminController.initializeAdmin);
app.post('/api/V1/admin/login', adminController.adminLogin);

app.post('/api/V1/user/register', upload.single('avatar'), userController.registerUser);
app.post('/api/V1/user/login', userController.loginUser);
app.post('/api/V1/user/logout', userController.logoutUser);

app.post('/api/V1/images/upload', upload.array('images', 10), imageController.uploadImages);

app.post('/api/V1/tag', upload.single('image'), tagController.createTag);

app.post('/api/V1/video/upload', upload.single('video'), videoController.uploadVideo);

// Start server (for local testing)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

// Export the app for serverless function
module.exports = app;

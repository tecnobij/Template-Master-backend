const express = require('express');
const { upload } = require('../middlewares/video.middleware'); // Multer middleware
const { uploadVideo } = require('../controllers/video.controller'); // Controller

const router = express.Router();

// Route for video upload
router.post('/upload', upload, uploadVideo);

module.exports = router;

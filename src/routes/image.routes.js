const express = require('express');
const { upload } = require('../middlewares/image.middleware'); // Multer configuration
const { uploadImages,getImagesByTag,getImagesByLanguage,getAllImages,getAllImagesForSlider,getImageById } = require('../controllers/image.controller'); // Controller

const router = express.Router();

router.post('/upload', upload.array('images', 10), uploadImages); // Accept up to 10 images at once
// Route to fetch images by tag
router.get('/by-tag', getImagesByTag);

// Route to fetch images by language
router.get('/by-language', getImagesByLanguage);
// Route to fetch all images
router.get('/images', getAllImages);

router.get('/images/slider', getAllImagesForSlider);
// Fetch image by ID
router.get('/images/:id', getImageById);

module.exports = router;

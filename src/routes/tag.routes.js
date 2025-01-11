const express = require('express');
const { getallimagetag,createTag, getAllTags, getTagById } = require('../controllers/tag.controller');
const { upload } = require('../middlewares/image.middleware'); // Multer setup for file upload

const router = express.Router();

// Create a new tag
router.post('/', upload.single('image'), createTag);

// Get all tags
router.get('/', getAllTags);
router.get('/imagetags', getallimagetag);

// Get a tag by ID
router.get('/:id', getTagById);

module.exports = router;

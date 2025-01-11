const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Tag = require("../models/tag.model"); // Tag model
const uploadOnCloudinary = require("../utils/cloudinary");
const Image = require("../models/image.model"); // Image model

// Create a new tag with an image
const createTag = asyncHandler(async (req, res) => {
  const { tag } = req.body;

  // Validate tag name
  if (!tag?.trim()) {
    throw new ApiError(400, "Tag name is required");
  }

  // Validate and upload the image
  const imageFile = req.file; // Assuming single image upload
  if (!imageFile) {
    throw new ApiError(400, "Image file is required");
  }

  const uploadedImage = await uploadOnCloudinary(imageFile.path);
  if (!uploadedImage) {
    throw new ApiError(500, "Failed to upload image to Cloudinary");
  }

  // Create a new tag in the database
  const newTag = await Tag.create({
    tag: tag.trim(),
    image: uploadedImage.secure_url,
  });

  res.status(201).json({
    success: true,
    message: "Tag created successfully",
    data: newTag,
  });
});

const getallimagetag = asyncHandler(async (req, res) => {
  try {
    const uniqueTags = await Image.distinct('tag');
    res.status(200).json(uniqueTags);
  } catch (error) {
    console.error('Error fetching images:', error.message);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching tags',
      error: error.message,
    });
  }
});
// Retrieve all tags
const getAllTags = asyncHandler(async (req, res) => {
  const tags = await Tag.find().sort({ createdAt: -1 }); // Retrieve tags in descending order of creation

  if (!tags || tags.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No tags found",
    });
  }

  res.status(200).json({
    success: true,
    data: tags,
  });
});





// Retrieve a single tag by ID
const getTagById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate and retrieve the tag
  const tag = await Tag.findById(id);

  if (!tag) {
    throw new ApiError(404, "Tag not found");
  }

  res.status(200).json({
    success: true,
    data: tag,
  });
});

module.exports = {
  createTag,
  getAllTags,
  getTagById,
  getallimagetag
};

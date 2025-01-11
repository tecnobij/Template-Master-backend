const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Video = require('../models/video.model');
const uploadOnCloudinary = require('../utils/cloudinary');

const uploadVideo = asyncHandler(async (req, res) => {
  let { tag, langauge } = req.body;

  try {
    tag = JSON.parse(tag); // Parse tag if it's stringified JSON
  } catch (error) {
    throw new ApiError(400, 'Tags must be a valid JSON array');
  }

  if (!tag || !Array.isArray(tag) || tag.length === 0) {
    throw new ApiError(400, 'Tags are required and should be an array');
  }

  const thumbnailFile = req.files?.thumbnail?.[0];
  const videoFile = req.files?.video?.[0];

  if (!thumbnailFile || !videoFile) {
    throw new ApiError(400, 'Both thumbnail and video files are required');
  }

  const thumbnailResponse = await uploadOnCloudinary(thumbnailFile.path);
  const videoResponse = await uploadOnCloudinary(videoFile.path);

  if (!thumbnailResponse || !videoResponse) {
    throw new ApiError(400, 'Failed to upload files to Cloudinary');
  }

  const videoDoc = new Video({
    thumbnailname: thumbnailFile.originalname,
    videoname: videoFile.originalname,
    tag,
    langauge,
    image: thumbnailResponse.secure_url,
    video: videoResponse.secure_url,
  });

  await videoDoc.save();

  res.status(201).json({
    message: 'Video uploaded successfully',
    data: videoDoc,
  });
});

module.exports = { uploadVideo };

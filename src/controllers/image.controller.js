const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Image = require("../models/image.model")
const uploadOnCloudinary = require("../utils/cloudinary");
const Video = require("../models/video.model");
const uploadImages = asyncHandler(async (req, res) => {
  let { tag, langauge } = req.body;

  // Parse `tag` if it is sent as a string
  try {
    tag = JSON.parse(tag); // Convert stringified JSON to an array
  } catch (error) {
    throw new ApiError(400, "Tags must be a valid JSON array");
  }

  // Validate the tag field
  if (!tag || !Array.isArray(tag) || tag.length === 0) {
    throw new ApiError(400, "Tags are required and should be an array");
  }

  // Validate images (files)
  const files = req.files; // Multer saves uploaded files here
  if (!files || files.length === 0) {
    throw new ApiError(400, "At least one image is required");
  }

  // Prepare arrays for metadata
  const originalNames = [];
  const imageUrls = [];

  // Process each file
  for (const file of files) {
    const localFilePath = file.path; // Temporary local file path
    const response = await uploadOnCloudinary(localFilePath); // Upload to Cloudinary

    if (response) {
      originalNames.push(file.originalname); // Extract the original name of the file
      imageUrls.push(response.secure_url); // Store the Cloudinary URL
    }
  }

  // Save metadata in MongoDB
  const imageDoc = new Image({
    originalname: originalNames, // Array of extracted file names
    tag, // Array of tags
    langauge,
    images: imageUrls, // Array of Cloudinary URLs
  });

  await imageDoc.save();

  res.status(201).json({
    message: "Images uploaded successfully",
    data: imageDoc,
  });
});

//Fetch image by tag
const getImagesByTag = asyncHandler(async (req, res) => {
  const { tag } = req.query;

  // Validate query parameter
  if (!tag) {
    throw new ApiError(400, 'Tag parameter is required');
  }

  // Find images by tag
  const images = await Image.find({
    tag: { $in: [tag] }, // Matches tag in the array
  },
    '-originalname -langauge -createdAt -updatedAt'
  );

  // If no images found
  if (images.length === 0) {
    return res.status(404).json({
      message: 'No images found for the provided tag',
    });
  }

  // Return fetched images
  res.status(200).json({
    message: 'Images fetched successfully by tag',
    data: images,
  });
});

//Get image by langauage

const getImagesByLanguage = asyncHandler(async (req, res) => {
  const { langauge } = req.query; // Ensure the query parameter is 'langauge'

  // Validate query parameter
  if (!langauge) {
    throw new ApiError(400, 'Language parameter is required');
  }

  // Log the query parameter for debugging
  console.log('Query parameter langauge:', langauge);

  // Find images by language (case-insensitive)
  const images = await Image.find(
    {
      langauge: { $regex: new RegExp(`^${langauge}$`, 'i') }, // Case-insensitive match
    },
    '-originalname -langauge -createdAt -updatedAt' // Exclude these fields
  );


  // If no images found
  if (!images || images.length === 0) {
    return res.status(404).json({
      message: 'No images found for the provided language',
    });
  }

  // Return fetched images
  res.status(200).json({
    message: 'Images fetched successfully by language',
    data: images,
  });
});

// const getAllImages = asyncHandler(async (req, res) => {
//   try {
//     // Parse query parameters for pagination
//     const { page = 1, limit = 10 } = req.query;
//     const skip = (page - 1) * parseInt(limit);

//     // Count total images in the database
//     const totalImages = await Image.countDocuments();

//     // Fetch paginated images from the database
//     const images = await Image.find()
//       .select('-originalname -createdAt -updatedAt') // Exclude unnecessary fields
//       .skip(skip)
//       .limit(parseInt(limit));

//     // Check if there are more images to fetch
//     const hasMore = skip + parseInt(limit) < totalImages;

//     // Return the response even if no images are found
//     res.status(200).json({
//       success: true,
//       total: totalImages,
//       page: parseInt(page),
//       limit: parseInt(limit),
//       hasMore,
//       data: images || [], // Return an empty array if no images
//     });
//   } catch (error) {
//     // Handle unexpected errors
//     res.status(500).json({
//       success: false,
//       message: 'An error occurred while fetching images',
//       error: error.message,
//     });
//   }
// });










const getAllImages = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
    const skip = (page - 1) * limit;

    // Log for debugging
    console.log(`Fetching page: ${page}, limit: ${limit}, skip: ${skip}`);

    // Total number of images
    const totalImages = await Image.countDocuments();

    // Fetch paginated images
    const images = await Image.find()
      .select('-originalname -createdAt -updatedAt') // Exclude unnecessary fields
      .skip(skip) // Skip for pagination
      .limit(limit); // Limit results

    // Check if there are more images
    const hasMore = skip + limit < totalImages;

    // Respond with paginated data
    res.status(200).json({
      success: true,
      total: totalImages,
      page,
      limit,
      hasMore,
      data: images,
    });
  } catch (error) {
    console.error('Error fetching images:', error.message);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching images',
      error: error.message,
    });
  }
});


const getAllImagesForSlider = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = 6; // Limit results to 6 images per request
    const skip = (page - 1) * limit;

    const { search } = req.query;
    // Fetch all documents
    const allImages = await Image.find().select('-originalname -createdAt -updatedAt');

    // Flatten and filter images
    let flattenedImages = allImages.flatMap((doc) =>
      doc.images.map((imageUrl) => ({
        _id: doc._id, // Keep track of the parent document
        tag: doc.tag,
        imageUrl,
      }))
    );

    // Apply search filter if provided
    let hasMore_search = true;


    //Paginate the results
    const totalImages = flattenedImages.length;
    let paginatedImages = flattenedImages.slice(skip, skip + limit);





    hasMore = skip + limit < totalImages;

    if (search || search !== undefined) {

      flattenedImages = flattenedImages.filter((image) =>
        image.tag?.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
      );

      if (flattenedImages.length < limit) {

        paginatedImages = flattenedImages;
        hasMore_search = false


      }
      else {

        hasMore_search = skip + limit < totalImages;

        paginatedImages = flattenedImages.slice(skip, skip + limit);


      }


    }








    // Respond with paginated data
    res.status(200).json({
      success: true,
      total: totalImages,
      page,
      limit,
      hasMore,
      hasMore_search: hasMore_search,
      data: paginatedImages,
    });
  } catch (error) {
    console.error('Error fetching images:', error.message);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching images',
      error: error.message,
    });
  }
});



//fetch imagebyid
const getImageById = asyncHandler(async (req, res) => {
  const { id } = req.params; // Extract the id from URL parameters

  // Validate ID
  if (!id) {
    throw new ApiError(400, "Image ID is required");
  }

  try {
    // Find the image document by ID
    const image = await Image.findById(id).select('-originalname -createdAt -updatedAt');

    // If no image is found
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found',
      });
    }

    // Return the image data
    res.status(200).json({
      success: true,
      message: 'Image fetched successfully',
      data: image,
    });
  } catch (error) {
    console.error('Error fetching image by ID:', error.message);
    throw new ApiError(500, 'An error occurred while fetching the image');
  }
});


module.exports = { uploadImages, getImagesByTag, getImagesByLanguage, getAllImages, getAllImagesForSlider, getImageById };

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectToMongoDB = require('../src/config/db');

// Controllers and middleware
const {
  initializeAdmin,
  adminLogin,
} = require('../src/controllers/admin.controller');
const {
  uploadImages,
  getImagesByTag,
  getImagesByLanguage,
  getAllImages,
  getAllImagesForSlider,
  getImageById,
} = require('../src/controllers/image.controller');
const {
  uploadVideo,
} = require('../src/controllers/video.controller');
const {
  registerUser,
  loginUser,
  logoutUser,
  editUserDetails,
  getUserProfile,
} = require('../src/controllers/user.controller');
const {
  getallimagetag,
  createTag,
  getAllTags,
  getTagById,
} = require('../src/controllers/tag.controller');

const { upload: imageUpload } = require('../src/middlewares/image.middleware');
const { upload: videoUpload } = require('../src/middlewares/video.middleware');
const { verifyJWT } = require('../src/middlewares/auth.middleware');

const app = express();
const allowedOrigins = [process.env.FRONTEND_URL || "http://localhost:5173"];
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
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

// Consolidated Routes
app.post('/api/V1/admin/create', initializeAdmin);
app.post('/api/V1/admin/login', adminLogin);

app.post(
  '/api/V1/user/register',
  imageUpload.fields([{ name: 'avatar', maxCount: 1 }]),
  registerUser
);
app.post('/api/V1/user/login', loginUser);
app.post('/api/V1/user/logout', verifyJWT, logoutUser);
app.put(
  '/api/V1/user/edit-profile',
  verifyJWT,
  imageUpload.fields([{ name: 'avatar', maxCount: 1 }]),
  editUserDetails
);
app.get('/api/V1/user/me', verifyJWT, getUserProfile);

app.post('/api/V1/images/upload', imageUpload.array('images', 10), uploadImages);
app.get('/api/V1/images/by-tag', getImagesByTag);
app.get('/api/V1/images/by-language', getImagesByLanguage);
app.get('/api/V1/images/images', getAllImages);
app.get('/api/V1/images/images/slider', getAllImagesForSlider);
app.get('/api/V1/images/:id', getImageById);

app.post('/api/V1/tag', imageUpload.single('image'), createTag);
app.get('/api/V1/tag', getAllTags);
app.get('/api/V1/tag/imagetags', getallimagetag);
app.get('/api/V1/tag/:id', getTagById);

app.post('/api/V1/video/upload', videoUpload, uploadVideo);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;

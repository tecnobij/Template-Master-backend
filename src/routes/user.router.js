const express = require('express');
const router = express.Router();
const { upload } = require('../middlewares/image.middleware'); // Replace with actual path
const { registerUser,loginUser,logoutUser,editUserDetails,getUserProfile } = require('../controllers/user.controller');
const { verifyJWT } = require('../middlewares/auth.middleware');

// Route for handling user registration with file upload
router.post('/register',
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1
        }
    ]),
    registerUser
);

// Route for user login
router.post('/login', loginUser);

// Secured route for user logout
router.post('/logout', verifyJWT, logoutUser);
// Edit user profile route
router.put("/edit-profile", verifyJWT, upload.fields([{ name: "avatar", maxCount: 1 }]), editUserDetails);
//login user
router.get('/me', verifyJWT, getUserProfile);
module.exports = router;
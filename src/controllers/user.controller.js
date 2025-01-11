const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const User = require("../models/user.model");
const uploadOnCloudinary = require("../utils/cloudinary");
const ApiResponses = require("../utils/ApiResponces");

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullname, phoneno, password } = req.body;
  // Validate required fields
  if (
    [fullname, email, username, password, phoneno].some(
      (field) => !field?.trim()
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user already exists
  const userExists = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (userExists) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // Validate avatar
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  // Upload avatar to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Failed to upload avatar");
  }

  // Create user
  const newUser = await User.create({
    fullname,
    avatar: avatar.url,
    email,
    username: username.toLowerCase(),
    password,
    phoneno,
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: {
      id: newUser._id,
      fullname: newUser.fullname,
      email: newUser.email,
      username: newUser.username,
      avatar: newUser.avatar,
      phoneno: newUser.phoneno,
    },
  });
});

//Login User

const loginUser = asyncHandler(async (req, res) => {
  const {phoneno, password } = req.body;

  // Check if at least one of email or username is provided
  if (!phoneno && !username) {
    throw new ApiError(400, "Either username or email is required.");
  }

  // Find user by email or username
  const user = await User.findOne({
    phoneno:phoneno});

  if (!user) {
    throw new ApiError(404, "User Not Found");
  }

  // Check if the password is correct
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid User credentials");
  }

  // Generate access and refresh tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  // Set tokens in cookies (optional, depending on your authentication mechanism)
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  // Return response
  res.status(200).json({
    success: true,
    message: "Login successful",
    accessToken,
    refreshToken,
    user
  });
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true
    }
  )
  const options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      new ApiResponses(200, {}, "User Logout Succefully")
    )
})

// Edit User Details
const editUserDetails = asyncHandler(async (req, res) => {
  const { fullname, email, username, phoneno } = req.body;

  // Ensure the user is authenticated
  const userId = req.user?._id; // This is the authenticated user's ID
  if (!userId) {
    throw new ApiError(401, 'User is not authenticated');
  }

  // Find the user in the database
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Ensure at least one field is provided to update
  if (![fullname, email, username, phoneno].some((field) => field?.trim())) {
    throw new ApiError(400, 'At least one field is required to update');
  }

  // Check for conflicts if email or username is being updated
  if (email || username) {
    const conflictingUser = await User.findOne({
      $or: [{ email }, { username }],
      _id: { $ne: userId }, // Exclude the current user from this check
    });

    if (conflictingUser) {
      throw new ApiError(409, 'Email or username is already in use by another user');
    }
  }

  // Validate and update avatar if provided
  if (req.files?.avatar?.[0]?.path) {
    const avatarLocalPath = req.files.avatar[0].path;
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) {
      throw new ApiError(400, 'Failed to upload avatar');
    }
    user.avatar = avatar.url;
  }
  // Update user details
  if (fullname) user.fullname = fullname;
  if (email) user.email = email;
  if (username) user.username = username.toLowerCase();
  if (phoneno) user.phoneno = phoneno;

  // Save the updated user
  await user.save();

  res.status(200).json({
    success: true,
    message: 'User details updated successfully',
    user: {
      id: user._id,
      fullname: user.fullname,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      phoneno: user.phoneno,
    },
  });
});

// Secure endpoint to fetch user details
const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id; // Retrieved from decoded token in middleware

  // Fetch user details
  const user = await User.findById(userId).select('fullname email username avatar phoneno');

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});
module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  editUserDetails,
  getUserProfile
};

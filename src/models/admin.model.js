require('dotenv').config(); // Load environment variables
const mongoose = require('mongoose');

// Define the Admin schema
const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    default: process.env.ADMIN_USERNAME, // Default from .env
  },
  email: {
    type: String,
    required: true,
    unique: true,
    default: process.env.ADMIN_EMAIL, // Default from .env
  },
  password: {
    type: String,
    required: true,
    default: process.env.ADMIN_PASSWORD, // Default from .env
  },
});

// Prevent creation of multiple admin entries
adminSchema.pre('save', function (next) {
  const self = this;
  mongoose.models['Admin'].findOne({}, function (err, admin) {
    if (err) {
      next(err);
    } else if (admin && self.isNew) {
      next(new Error('Admin already exists. Only one admin is allowed.'));
    } else {
      next();
    }
  });
});

// Export the Admin model
const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;

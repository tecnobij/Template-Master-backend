const mongoose = require('mongoose');

const { Schema } = mongoose;

const imageSchema = new Schema(
  {
    originalname: {
      type: [String], // Array of strings
      index: true,
    },
    tag: {
      type: [String], // Array of strings for tags
      required: true,
      trim: true,
      index: true, // Index for faster queries
    },
    langauge: {
      type: String,
      required: true,
    },
    images: {
      type: [String], // Array of strings for image URLs
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the Admin model
      ref: 'Admin', // Define the referenced model
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('Image', imageSchema);

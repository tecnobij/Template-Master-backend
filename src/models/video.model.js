const mongoose = require('mongoose');

const { Schema } = mongoose;

const videoSchema = new Schema(
  {
    thumbnailname: {
      type: String,
      index: true,
    },
    videoname: {
      type: String,
      index: true,
    },
    tag: {
      type: [String], // Array of strings for tags
      required: true,
      trim: true,
      index: true,
    },
    langauge: {
      type: String,
      required: true,
    },
    image: {
      type: String, // URL for thumbnail image
    },
    video: {
      type: String, // URL for video
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

module.exports = mongoose.model('Video', videoSchema);

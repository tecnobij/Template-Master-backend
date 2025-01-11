const mongoose = require('mongoose');

const { Schema } = mongoose;

const tagSchema = new Schema(
  {
   
    tag: {
      type: String, 
      required: true,
      trim: true,
      index: true, 
    },
    image: {
      type: String, 
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Tag', tagSchema);

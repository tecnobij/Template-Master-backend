// Import required modules
const mongoose = require("mongoose");
const express = require("express");
const { DB_name } = require("./constants");

// MongoDB connection setup
const connectToMongoDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_name}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`\n MongoDB Connected !!  DB HOST : ${connectionInstance.connection.host} `);
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
};

module.exports = connectToMongoDB;

const express = require('express');
const multer = require('multer');

const app = express();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/temp'); // Directory where files will be stored temporarily
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use the original file name
        console.log(file);
    }
    
    
});

const upload = multer({ storage });

module.exports = { upload };

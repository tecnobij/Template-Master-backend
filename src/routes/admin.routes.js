const express = require('express');
const { initializeAdmin, adminLogin } = require('../controllers/admin.controller'); // Adjust the path

const router = express.Router();

// Route to initialize admin
router.post('/create', initializeAdmin);

// Route for admin login
router.post('/login', adminLogin);

module.exports = router;

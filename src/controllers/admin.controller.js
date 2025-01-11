const bcrypt = require('bcrypt');
const Admin = require('../models/admin.model'); // Adjust the path as needed

// Create or update the admin entry
const initializeAdmin = async (req, res) => {
  try {
    const existingAdmin = await Admin.findOne({});
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists.' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    const admin = new Admin({
      username: process.env.ADMIN_USERNAME,
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
    });

    await admin.save();
    res.status(201).json({ message: 'Admin created successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating admin.', error: error.message });
  }
};

// Admin login
const adminLogin = async (req, res) => {
  const { username,email, password } = req.body;
    // Check if at least one of email or username is provided
    if (!email && !username) {
        throw new ApiError(400, "Either username or email is required.");
      }
  try {
    const admin = await Admin.findOne({
        $or: [{ username }, { email }],
      });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found.' });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    res.status(200).json({ message: 'Login successful.' });
  } catch (error) {
    res.status(500).json({ message: 'Error during login.', error: error.message });
  }
};

module.exports = {
  initializeAdmin,
  adminLogin,
};

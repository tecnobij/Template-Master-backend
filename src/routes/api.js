const express = require('express');
const router = express.Router();

// Import individual route handlers
const userRoute = require('./user.router');
const adminRoute = require('./admin.routes');
const imageRoute = require('./image.routes');
const videoRoute = require('./video.routes');
const tagRoute = require('./tag.routes');

// Combine routes into the router
router.use('/user', userRoute);
router.use('/admin', adminRoute);
router.use('/images', imageRoute);
router.use('/video', videoRoute);
router.use('/tag', tagRoute);

module.exports = router;

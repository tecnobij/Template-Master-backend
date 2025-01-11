require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const userRoute = require('./src/routes/user.router');
const adminRoute = require('./src/routes/admin.routes');
const uploadImages = require('./src/routes/image.routes');
const uploadVideo = require('./src/routes/video.routes');
const tagRoute = require('./src/routes/tag.routes');
const connectToMongoDB = require('./src/config/db');

const app = express();
const allowedOrigins = [process.env.FRONTEND_URL || "http://localhost:5173"];
const PORT = process.env.PORT || 3000;

connectToMongoDB();

app.use(bodyParser.json());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use('/api/V1/user', userRoute);
app.use('/api/V1/admin', adminRoute);
app.use('/api/V1/images', uploadImages);
app.use('/api/V1/video', uploadVideo);
app.use('/api/V1/tag', tagRoute);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

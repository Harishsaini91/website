
const multer = require("multer");
const path = require("path");


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Set destination directory for uploaded files
    cb(null, './public/images/uploded_image/'); // Directory to store images and videos
  },
  filename: (req, file, cb) => {
    // Generate unique filenames
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// File filter to allow only specific file types (images and videos)
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif|mp4|mkv|avi|mov/; // Allowed extensions
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);

  if (extname && mimeType) {
    cb(null, true);
  } else {
    cb(new Error('Only images and video files are allowed!'));
  }
};

// Configure multer upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // Limit file size to 100 MB
    files: 20 // Limit the number of files to 20
  },
  fileFilter: fileFilter
});

// 
const roleCheck = (role) => {
  return (req, res, next) => {
  const userRole = req.session.userRole || null;

    // Assuming user role is stored in `req.user` after authentication (e.g., JWT or session-based)
    if (userRole && userRole === role) {
      return next();
    } else {
      return res.status(403).json({ message: 'Access Denied: Admins only' });
    }
  };
};

  // middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Decode JWT token
    const user = await User.findById(decoded._id); // Find user by ID stored in token

    if (!user) {
      throw new Error();
    }

    req.user = user; // Set user data on the request object
    next();
  } catch (e) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};



module.exports={upload,roleCheck ,authenticate}

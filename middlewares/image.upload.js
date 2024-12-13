import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,'./uploads'); // Use the uploads directory
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique file name
  },
});

// Initialize multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5 MB file size limit
});

export default upload;

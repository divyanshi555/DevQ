import multer from 'multer';

const profileUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, callback) => {
    if (file.mimetype.startsWith('image/')) {
      callback(null, true);
      return;
    }
    callback(new Error('Only image files are allowed'), false);
  },
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

export default profileUpload;
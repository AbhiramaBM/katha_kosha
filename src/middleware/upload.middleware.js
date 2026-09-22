import multer from 'multer';
import { AppError } from '../utils/response.js';

// Memory storage to allow magic byte inspection
const storage = multer.memoryStorage();

// Author photo uploader: max 2MB, image types
export const uploadAuthorPhoto = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2 MB
  },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new AppError('UNSUPPORTED_MEDIA_TYPE', 'Only JPEG, PNG, and WebP images are allowed', 415));
    }
    cb(null, true);
  }
}).single('photo');

// Story PDF uploader: max 20MB, application/pdf
export const uploadStoryPdf = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20 MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new AppError('UNSUPPORTED_MEDIA_TYPE', 'Only PDF files are allowed', 415));
    }
    cb(null, true);
  }
}).single('pdf');

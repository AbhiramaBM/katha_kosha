import path from 'path';
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

// Standard book formats allowed (single file upload only):
// PDF, DOCX, DOC, EPUB, TXT. Strictly no images (JPG/PNG).
const ALLOWED_BOOK_MIMES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/epub+zip',
  'text/plain'
];

const ALLOWED_BOOK_EXTENSIONS = ['.pdf', '.docx', '.doc', '.epub', '.txt'];

const bookMulter = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50 MB
  },
  fileFilter: (req, file, cb) => {
    // Explicitly reject images and non-standard book formats
    if (file.mimetype.startsWith('image/')) {
      return cb(new AppError('UNSUPPORTED_MEDIA_TYPE', 'Image files (JPG, PNG, etc.) are not allowed. Only standard book formats (PDF, DOCX, DOC, EPUB, TXT) are permitted.', 415));
    }

    const ext = path.extname(file.originalname || '').toLowerCase();
    const isMimeAllowed = ALLOWED_BOOK_MIMES.includes(file.mimetype);
    const isExtAllowed = ALLOWED_BOOK_EXTENSIONS.includes(ext);

    if (!isMimeAllowed && !isExtAllowed) {
      return cb(new AppError('UNSUPPORTED_MEDIA_TYPE', 'Only standard book formats (PDF, DOCX, DOC, EPUB, TXT) are allowed. Images and other file types are not permitted.', 415));
    }

    cb(null, true);
  }
}).fields([
  { name: 'file', maxCount: 1 },
  { name: 'pdf', maxCount: 1 }
]);

export const uploadStoryPdf = (req, res, next) => {
  bookMulter(req, res, (err) => {
    if (err) return next(err);
    if (req.files) {
      // Ensure single file upload only
      const fileList = (req.files.file || []).concat(req.files.pdf || []);
      if (fileList.length > 1) {
        return next(new AppError('VALIDATION_ERROR', 'Only a single book file upload is allowed', 400));
      }
      req.file = fileList[0] || null;
    }
    next();
  });
};


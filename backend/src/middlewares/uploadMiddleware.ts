import multer, { FileFilterCallback } from 'multer'
import { Request } from 'express'

const MAX_FILE_SIZE = 5 * 1024 * 1024   // 5 MB

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'image/jpg',
  
]

const fileFilter = (
  _req:  Request,
  file:  Express.Multer.File,
  cb:    FileFilterCallback
) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only JPG, PNG, WEBP, and PDF files are allowed'))
  }
}

// Memory storage — buffer passed directly to Cloudinary
const storage = multer.memoryStorage()

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
})

// Field configs for KYC upload
export const kycUploadFields = upload.fields([
  { name: 'governmentId', maxCount: 1 },
  { name: 'selfie',       maxCount: 1 },
  { name: 'certificate',  maxCount: 1 },
])

// Single profile photo
export const profilePhotoUpload = upload.single('profilePhoto')

// Single insurance / evidence document for a Trust Badge purchase (PRD §4.3)
export const badgeDocumentUpload = upload.single('document')
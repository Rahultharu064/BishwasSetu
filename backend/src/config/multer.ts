import multer from "multer";
import path from "path";
import { v4 as uuid } from "uuid";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine upload directory based on fieldname and file type
    let uploadPath = "uploads/";
    
    if (file.fieldname === "photo") {
      uploadPath = "uploads/images/profile-photos/";
    } 
    else if (file.fieldname === "portfolioImages") {
      uploadPath = "uploads/images/portfolio/";
    }
    else if (file.fieldname === "govtIdFront" || file.fieldname === "govtIdBack") {
      uploadPath = "uploads/kyc/government-id/";
    }
    else if (file.fieldname === "tradeLicense") {
      uploadPath = "uploads/kyc/certificates/";
    }
    else if (file.mimetype.startsWith("image/")) {
      uploadPath = "uploads/images/";
    }
    else if (file.mimetype === "application/pdf") {
      uploadPath = "uploads/docs/";
    }
    else if (file.mimetype.startsWith("video/")) {
      uploadPath = "uploads/videos/";
    }
    else {
      cb(new Error("Invalid file type"), "");
      return;
    }
    
    cb(null, uploadPath);
  },
  filename: (_, file, cb) => {
    const uniqueName = uuid();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueName}${ext}`);
  }
});

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Define allowed file types for each field
  const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const allowedPDFTypes = ["application/pdf"];
  
  if (file.fieldname === "photo" || 
      file.fieldname === "portfolioImages" || 
      file.fieldname === "govtIdFront" || 
      file.fieldname === "govtIdBack") {
    // For profile photos and IDs, only allow images
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Only image files (JPEG, JPG, PNG, WEBP) are allowed for ${file.fieldname}`));
    }
  } 
  else if (file.fieldname === "tradeLicense") {
    // For trade license, allow both images and PDFs
    if (allowedImageTypes.includes(file.mimetype) || allowedPDFTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (JPEG, JPG, PNG, WEBP) and PDFs are allowed for trade license"));
    }
  }
  else {
    // For other files, use general validation
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype === "application/pdf" ||
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type"));
    }
  }
};

const limits = { 
  fileSize: 10 * 1024 * 1024, // 10MB per file
  files: 10 // Maximum 10 files total
};

// Create multer instance with configuration
export const upload = multer({ 
  storage, 
  fileFilter, 
  limits 
});

// Specific upload configurations for different routes
export const providerOnboardingUpload = upload.fields([
  { name: "photo", maxCount: 1 },
  { name: "govtIdFront", maxCount: 1 },
  { name: "govtIdBack", maxCount: 1 },
  { name: "tradeLicense", maxCount: 1 },
  { name: "portfolioImages", maxCount: 5 }
]);

// Single file uploads for specific purposes
export const uploadProfilePhoto = upload.single("photo");
export const uploadGovtId = upload.fields([
  { name: "govtIdFront", maxCount: 1 },
  { name: "govtIdBack", maxCount: 1 }
]);
export const uploadPortfolio = upload.array("portfolioImages", 5);
export const uploadTradeLicense = upload.single("tradeLicense");

// Export the base multer config for custom usage
export const multerConfig = { storage, fileFilter, limits };
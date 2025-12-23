import multer from "multer";
import path from "path";
import { v4 as uuid } from "uuid";
import type{ Request } from "express";

// Configure storage
const storage = multer.diskStorage({
    destination: (req: Request, file, cb) => {
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
    filename: (req: Request, file, cb) => {
        const uniqueName = uuid();
        const ext = path.extname(file.originalname).toLowerCase();
        const sanitizedName = file.originalname.replace(ext, '').replace(/[^a-zA-Z0-9]/g, '-');
        cb(null, `${sanitizedName}-${uniqueName}${ext}`);
    }
});

// File filter configuration
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Define allowed file types
    const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    const allowedPDFTypes = ["application/pdf"];
    
    // Field-specific validation
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
            allowedImageTypes.includes(file.mimetype) ||
            allowedPDFTypes.includes(file.mimetype) ||
            file.mimetype.startsWith("video/")
        ) {
            cb(null, true);
        } else {
            cb(new Error(`Unsupported file type: ${file.mimetype}`));
        }
    }
};

// Limits configuration
const limits = { 
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 10 // Maximum 10 files total
};

// Create multer instance
const upload = multer({ 
    storage, 
    fileFilter, 
    limits 
});

// Export specific upload configurations
export const providerOnboardingUpload = upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "govtIdFront", maxCount: 1 },
    { name: "govtIdBack", maxCount: 1 },
    { name: "tradeLicense", maxCount: 1 },
    { name: "portfolioImages", maxCount: 5 } // Note: Changed from "portfolio" to "portfolioImages"
]);

// Single file uploads
export const uploadSingle = (fieldName: string) => upload.single(fieldName);

// Multiple file uploads
export const uploadArray = (fieldName: string, maxCount: number) => upload.array(fieldName, maxCount);

// Multiple fields uploads (legacy, use providerOnboardingUpload instead)
export const uploadFields = (fields: multer.Field[]) => upload.fields(fields);

// Export base configuration
export default upload;
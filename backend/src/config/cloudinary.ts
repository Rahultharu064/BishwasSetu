import { v2 as cloudinary } from "cloudinary";
import type { Request } from "express";
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import dotenv from "dotenv"

dotenv.config()

function getCloudinary() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error(
      "Missing Cloudinary config: set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in .env"
    );
  }
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
  return cloudinary;
}

export const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary as any,
  params: async (_req: Request, file: Express.Multer.File) => {
    // Validate config at actual upload time
    getCloudinary();

    // Sanitize filename — remove extension and special chars
    const sanitizedName = file.originalname
      .split('.')[0]
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();

    const folder = (_req.body?.folder as string) || 'bishwassetu/uploads';
    return {
      folder,
      allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
      public_id: `${folder}/${sanitizedName}_${Date.now()}`,
      resource_type: 'auto',
      transformation: [{ width: 1200, quality: 80, crop: 'limit' }],
    };
  },
});

export default cloudinary;
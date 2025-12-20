import multer from "multer";
import { multerConfig } from "../config/multer.ts";

// Single file upload
export const uploadSingle = (fieldName: string) =>
  multer({
    storage: multerConfig.storage,
    fileFilter: multerConfig.fileFilter,
    limits: multerConfig.limits
  }).single(fieldName);

// Multiple files upload
export const uploadMultiple = (fieldName: string, maxCount: number) =>
  multer({
    storage: multerConfig.storage,
    fileFilter: multerConfig.fileFilter,
    limits: multerConfig.limits
  }).array(fieldName, maxCount);

import multer from "multer";
import path from "path";
import { v4 as uuid } from "uuid";

const storage = multer.diskStorage({
  destination: (_, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, "uploads/images");
    else if (file.mimetype === "application/pdf") cb(null, "uploads/docs");
    else if (file.mimetype.startsWith("video/")) cb(null, "uploads/videos");
    else cb(new Error("Invalid file type"), "");
  },
  filename: (_, file, cb) => cb(null, uuid() + path.extname(file.originalname))
});

const fileFilter = (_: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/") ||
    file.mimetype === "application/pdf"
  ) cb(null, true);
  else cb(new Error("Unsupported file type"));
};

const limits = { fileSize: 10 * 1024 * 1024 }; // 10MB

export const multerConfig = { storage, fileFilter, limits };

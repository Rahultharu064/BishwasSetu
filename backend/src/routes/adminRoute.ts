import express from "express";
import { authMiddleware, authorize } from "../middlewares/authMiddleware.ts";
import { getAllProviders } from "../controllers/adminController.ts";

const router = express.Router();

router.get("/providers", authMiddleware, authorize(["ADMIN"]), getAllProviders);

export default router;

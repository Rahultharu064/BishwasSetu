import express from "express";
import { authMiddleware, authorize } from "../middlewares/authMiddleware.ts";
import {
    getAllProviders,
    getProvidersByStatus,
    acceptProvider,
    rejectProvider,
    getPendingProviders
} from "../controllers/adminController.ts";

const router = express.Router();

router.get("/providers", authMiddleware, authorize(["ADMIN"]), getAllProviders);
router.get("/providers/status", authMiddleware, authorize(["ADMIN"]), getProvidersByStatus);
router.get("/providers/pending", authMiddleware, authorize(["ADMIN"]), getPendingProviders);
router.put("/providers/:providerId/accept", authMiddleware, authorize(["ADMIN"]), acceptProvider);
router.put("/providers/:providerId/reject", authMiddleware, authorize(["ADMIN"]), rejectProvider);

export default router;

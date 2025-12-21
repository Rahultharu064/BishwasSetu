import express from "express";
import { authMiddleware, authorize } from "../middlewares/authMiddleware.ts";
import { validate } from "../middlewares/validateMiddleware.ts";
import {
    createService,
    getServicesByProvider,
    updateService,
    deleteService,
    getServicesByCategory,
    getAllServices,
    getServicesWithFilters,
    getServiceStats,
    getServiceById
} from "../controllers/serviceController.ts";
import { createServiceSchema, updateServiceSchema, searchServiceSchema } from "../validators/serviceValidator.ts";

const router = express.Router();

// Protected routes - require PROVIDER role
router.post(
    "/",
    authMiddleware,
    authorize(["PROVIDER"]),
    validate(createServiceSchema),
    createService
);

router.get(
    "/provider",
    authMiddleware,
    authorize(["PROVIDER"]),
    getServicesByProvider
);

router.put(
    "/:id",
    authMiddleware,
    authorize(["PROVIDER"]),
    validate(updateServiceSchema),
    updateService
);

router.delete(
    "/:id",
    authMiddleware,
    authorize(["PROVIDER"]),
    deleteService
);

// Public routes
router.get("/search", validate(searchServiceSchema, 'query'), getServicesWithFilters);
router.get("/stats", getServiceStats);

router.get("/category/:categoryId", getServicesByCategory);
router.get("/:id", getServiceById);
router.get("/", getAllServices);

export default router;


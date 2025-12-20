import { Router } from "express";
import * as ServiceController from "../controllers/serviceController.ts";
import { authMiddleware } from "../middlewares/authMiddleware.ts";
import { validationMiddleware } from "../middlewares/validateMiddleware.ts";
import { createServiceSchema, updateServiceSchema } from "../validators/serviceValidator.ts";

const router = Router();

// Public routes
router.get("/", ServiceController.getServices);
router.get("/:id", ServiceController.getServiceById);

// Protected routes (Providers only for CRUD)
router.post(
  "/",
  authMiddleware,
  validationMiddleware(createServiceSchema),
  ServiceController.createService
);

router.put(
  "/:id",
  authMiddleware,
  validationMiddleware(updateServiceSchema),
  ServiceController.updateService
);

router.delete(
  "/:id",
  authMiddleware,
  ServiceController.deleteService
);

router.get(
    "/provider/me",
    authMiddleware,
    ServiceController.getMyServices
);

export default router;

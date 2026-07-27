import { Router } from "express";
import { protect } from "../middlewares/authMiddleware";
import * as MessageController from "../controllers/messageController";

const router = Router();

// All messaging requires an authenticated booking party.
router.use(protect);

router.get("/conversations", MessageController.conversations);
router.get("/:bookingId", MessageController.thread);
router.post("/:bookingId", MessageController.send);

export default router;

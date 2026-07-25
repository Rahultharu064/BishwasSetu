/**
 * Section 5 routes — mount in app.ts:
 *   import antiDisintermediationRoutes from "./routes/antiDisintermediation.routes";
 *   app.use("/api/v1", antiDisintermediationRoutes);
 */
import { Router } from "express";
import { protect as requireAuth, restrictTo as requireRole } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import * as escrow from "../controllers/escrowController";
import * as guarantee from "../controllers/guaranteeController";
import * as emergency from "../controllers/emergencyController";
import * as neighborhood from "../controllers/neighborhoodController";
import {
  initiateEscrowSchema,
  verifyEscrowSchema,
  escrowIdParamSchema,
  releaseEscrowSchema,
  refundEscrowSchema,
  fileClaimSchema,
  resolveClaimSchema,
  createEmergencySchema,
  emergencyIdParamSchema,
  providerIdParamSchema,
  createAreaSchema,
} from "../validators/antiDisintermediationValidator";

const router = Router();

// ---------- 5.1 Escrow ----------
router.post(
  "/escrow/initiate",
  requireAuth,
  requireRole("CUSTOMER"),
  validate(initiateEscrowSchema),
  escrow.initiate
);
router.post(
  "/escrow/verify",
  requireAuth,
  validate(verifyEscrowSchema),
  escrow.verify
);
router.post(
  "/escrow/:escrowId/release",
  requireAuth,
  requireRole("CUSTOMER"),
  validate(releaseEscrowSchema),
  escrow.release
);
router.post(
  "/escrow/:escrowId/refund",
  requireAuth,
  requireRole("ADMIN"),
  validate(refundEscrowSchema),
  escrow.refund
);
router.get(
  "/escrow/:escrowId",
  requireAuth,
  validate(escrowIdParamSchema),
  escrow.getOne
);

// ---------- 5.2 Guarantee ----------
router.get("/guarantees", requireAuth, guarantee.listMine);
router.post(
  "/guarantees/:guaranteeId/claims",
  requireAuth,
  requireRole("CUSTOMER"),
  validate(fileClaimSchema),
  guarantee.fileClaim
);
router.patch(
  "/guarantee-claims/:claimId/resolve",
  requireAuth,
  requireRole("ADMIN"),
  validate(resolveClaimSchema),
  guarantee.resolveClaim
);
router.get(
  "/providers/:providerId/revenue-points",
  validate(providerIdParamSchema),
  guarantee.revenuePoints
);
router.get(
  "/admin/leakage-flags",
  requireAuth,
  requireRole("ADMIN"),
  guarantee.leakageFlags
);

// ---------- 5.3 Emergency Dispatch ----------
router.post(
  "/emergency",
  requireAuth,
  requireRole("CUSTOMER"),
  validate(createEmergencySchema),
  emergency.create
);
router.post(
  "/emergency/:requestId/accept",
  requireAuth,
  requireRole("PROVIDER"),
  validate(emergencyIdParamSchema),
  emergency.accept
);
router.post(
  "/emergency/:requestId/decline",
  requireAuth,
  requireRole("PROVIDER"),
  validate(emergencyIdParamSchema),
  emergency.decline
);
router.get(
  "/emergency/:requestId",
  requireAuth,
  validate(emergencyIdParamSchema),
  emergency.status
);
router.post(
  "/emergency/:requestId/cancel",
  requireAuth,
  requireRole("CUSTOMER"),
  validate(emergencyIdParamSchema),
  emergency.cancel
);

// ---------- 5.4 Neighborhood ----------
router.get(
  "/providers/:providerId/neighborhood-stats",
  validate(providerIdParamSchema),
  neighborhood.providerStats
);
router.get("/neighborhood-areas", neighborhood.listAreas);
router.post(
  "/admin/neighborhood-areas",
  requireAuth,
  requireRole("ADMIN"),
  validate(createAreaSchema),
  neighborhood.createArea
);

export default router;

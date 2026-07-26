/**
 * Section 5 — Anti-disintermediation: escrow, workmanship guarantees,
 * emergency dispatch, and neighborhood proof. Mounted at `/api/v1`.
 */
import { Router } from "express";
import { protect, restrictTo } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validateMiddleware";
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

// ── 5.1 Escrow ────────────────────────────────────────────────
router.post(
  "/escrow/initiate",
  protect,
  restrictTo("CUSTOMER"),
  validateRequest(initiateEscrowSchema),
  escrow.initiate
);
router.post(
  "/escrow/verify",
  protect,
  validateRequest(verifyEscrowSchema),
  escrow.verify
);
router.post(
  "/escrow/:escrowId/release",
  protect,
  restrictTo("CUSTOMER"),
  validateRequest(releaseEscrowSchema),
  escrow.release
);
router.post(
  "/escrow/:escrowId/refund",
  protect,
  restrictTo("ADMIN"),
  validateRequest(refundEscrowSchema),
  escrow.refund
);
router.get(
  "/escrow/:escrowId",
  protect,
  validateRequest(escrowIdParamSchema),
  escrow.getOne
);

// ── 5.2 Workmanship guarantee ─────────────────────────────────
router.get("/guarantees", protect, guarantee.listMine);
router.post(
  "/guarantees/:guaranteeId/claims",
  protect,
  restrictTo("CUSTOMER"),
  validateRequest(fileClaimSchema),
  guarantee.fileClaim
);
router.patch(
  "/guarantee-claims/:claimId/resolve",
  protect,
  restrictTo("ADMIN"),
  validateRequest(resolveClaimSchema),
  guarantee.resolveClaim
);
router.get(
  "/providers/:providerId/revenue-points",
  validateRequest(providerIdParamSchema),
  guarantee.revenuePoints
);
router.get(
  "/admin/leakage-flags",
  protect,
  restrictTo("ADMIN"),
  guarantee.leakageFlags
);

// ── 5.3 Emergency dispatch ────────────────────────────────────
router.post(
  "/emergency",
  protect,
  restrictTo("CUSTOMER"),
  validateRequest(createEmergencySchema),
  emergency.create
);
// Provider inbox — declared before "/emergency/:requestId" so the literal wins.
router.get(
  "/emergency/offers/me",
  protect,
  restrictTo("PROVIDER"),
  emergency.myOffers
);
router.post(
  "/emergency/:requestId/accept",
  protect,
  restrictTo("PROVIDER"),
  validateRequest(emergencyIdParamSchema),
  emergency.accept
);
router.post(
  "/emergency/:requestId/decline",
  protect,
  restrictTo("PROVIDER"),
  validateRequest(emergencyIdParamSchema),
  emergency.decline
);
router.get(
  "/emergency/:requestId",
  protect,
  validateRequest(emergencyIdParamSchema),
  emergency.status
);
router.post(
  "/emergency/:requestId/cancel",
  protect,
  restrictTo("CUSTOMER"),
  validateRequest(emergencyIdParamSchema),
  emergency.cancel
);

// ── 5.4 Neighborhood ──────────────────────────────────────────
router.get(
  "/providers/:providerId/neighborhood-stats",
  validateRequest(providerIdParamSchema),
  neighborhood.providerStats
);
router.get("/neighborhood-areas", neighborhood.listAreas);
router.post(
  "/admin/neighborhood-areas",
  protect,
  restrictTo("ADMIN"),
  validateRequest(createAreaSchema),
  neighborhood.createArea
);

export default router;

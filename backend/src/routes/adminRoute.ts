import { Router } from 'express'
import * as AdminController     from '../controllers/adminController'
import { protect, restrictTo }  from '../middlewares/authMiddleware'
import { validate }             from '../middlewares/validateMiddleware'
import { ResolveComplaintSchema } from '../validators/complaintValidator'

const router = Router()

// All admin routes locked to ADMIN + MODERATOR
router.use(protect, restrictTo('ADMIN', 'MODERATOR'))

// ── Dashboard & Analytics ──────────────────────────────────────
router.get('/dashboard',         AdminController.getDashboard)
router.get('/analytics/revenue', AdminController.getRevenue)

// ── Users ──────────────────────────────────────────────────────
router.get('/users',               AdminController.getUsers)
router.patch('/users/:id/status',  AdminController.toggleUserStatus)

// ── Providers ──────────────────────────────────────────────────
router.get('/providers',           AdminController.getProviders)

// ── KYC Queue (Identity) ──────────────────────────────────────
router.get('/kyc',                 AdminController.getKycQueue)
router.put('/kyc/:id/approve',     AdminController.approveKyc)
router.put('/kyc/:id/reject',      AdminController.rejectKyc)

// ── Skill Evidence Queue (v2.3) ───────────────────────────────
// Separate from identity KYC — always human-reviewed, no auto-approve path
router.get('/skill-evidence',                  AdminController.getSkillEvidenceQueue)
router.put('/skill-evidence/:id/approve',      AdminController.approveSkillEvidence)
router.put('/skill-evidence/:id/reject',       AdminController.rejectSkillEvidence)

// ── Complaints ─────────────────────────────────────────────────
router.get('/complaints',          AdminController.getComplaints)
router.put(
  '/complaints/:id/resolve',
  validate(ResolveComplaintSchema),
  AdminController.resolveComplaint
)

// ── Trust & Fraud ──────────────────────────────────────────────
router.get('/trust/anomalies',          AdminController.getTrustAnomalies)
router.get('/fraud/flags',              AdminController.getFraudFlags)
router.patch('/fraud/flags/:id/resolve', AdminController.resolveFraudFlag)

export default router
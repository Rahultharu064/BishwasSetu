import { Router } from 'express'
import * as ComplaintController from '../controllers/complaintController'
import { protect, restrictTo }  from '../middlewares/authMiddleware'
import { validate }             from '../middlewares/validateMiddleware'
import { CreateComplaintSchema }  from '../validators/complaintValidator'

const router = Router()

router.use(protect)

router.post(
  '/',
  restrictTo('CUSTOMER'),
  validate(CreateComplaintSchema),
  ComplaintController.createComplaint
)

router.get('/me', restrictTo('CUSTOMER'), ComplaintController.getCustomerComplaints)
router.get('/:id', ComplaintController.getComplaint)

export default router
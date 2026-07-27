import { Router } from "express";
import { protect } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import * as AddressController from "../controllers/addressController";
import {
  CreateAddressSchema,
  UpdateAddressSchema,
} from "../validators/addressValidator";

const router = Router();

// A saved-address book belongs to the signed-in user.
router.use(protect);

router.get("/", AddressController.list);
router.post("/", validate(CreateAddressSchema), AddressController.create);
router.patch("/:id", validate(UpdateAddressSchema), AddressController.update);
router.patch("/:id/default", AddressController.setDefault);
router.delete("/:id", AddressController.remove);

export default router;

import { Router } from "express";
import {
  getMyProfile,
  getOtherUserProfile,
  getOtherUserPublicClothes,
  getOtherUserPublicOutfits,
  updateMyProfile,
} from "../controllers/profileController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

router.get("/me", requireAuth, getMyProfile);
router.put("/me", requireAuth, updateMyProfile);
router.get("/:userId/profile", getOtherUserProfile);
router.get("/:userId/clothes", getOtherUserPublicClothes);
router.get("/:userId/outfits", getOtherUserPublicOutfits);

export default router;

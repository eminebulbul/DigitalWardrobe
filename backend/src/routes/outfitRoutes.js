import { Router } from "express";
import {
  createOutfit,
  deleteOutfit,
  getDiscoverClothes,
  getDiscoverOutfits,
  getOutfitById,
  getOutfits,
  getSavedOutfits,
  removeSavedOutfit,
  saveOutfit,
  toggleOutfitVisibility,
} from "../controllers/outfitController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

router.get("/outfits", requireAuth, getOutfits);
router.get("/outfits/:id", requireAuth, getOutfitById);
router.post("/outfits", requireAuth, createOutfit);
router.delete("/outfits/:id", requireAuth, deleteOutfit);
router.put("/outfits/:id/visibility", requireAuth, toggleOutfitVisibility);
router.post("/outfits/:id/save", requireAuth, saveOutfit);
router.get("/saved-outfits", requireAuth, getSavedOutfits);
router.delete("/saved-outfits/:outfitId", requireAuth, removeSavedOutfit);
router.get("/discover/outfits", getDiscoverOutfits);
router.get("/discover/clothes", getDiscoverClothes);

export default router;

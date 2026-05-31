import { Router } from "express";
import {
  addCloth,
  deleteCloth,
  getFavoriteClothes,
  getClothes,
  getClothImage,
  removeBackground,
  toggleFavoriteCloth,
  toggleVisibility,
} from "../controllers/clothesController.js";
import { requireAuth } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js";

const router = Router();

router.get("/", requireAuth, getClothes);
router.post("/", requireAuth, upload.single("image"), addCloth);
router.delete("/:id", requireAuth, deleteCloth);
router.get("/:id/image", getClothImage);
router.put("/:id/visibility", requireAuth, toggleVisibility);
router.post("/:id/favorite", requireAuth, toggleFavoriteCloth);
router.get("/favorites", requireAuth, getFavoriteClothes);
router.post("/remove-background", upload.single("image"), removeBackground);

export default router;

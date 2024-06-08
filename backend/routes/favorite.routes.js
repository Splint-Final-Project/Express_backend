import express from "express";

import { createFavorite } from "../controllers/favorite/favorite.create.controller.js";
import { getFavorites } from "../controllers/favorite/favorite.get.controller.js";
import { deleteFavorite } from "../controllers/favorite/favorite.delete.controller.js";

import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/", protectRoute, getFavorites);

// 동적 + not get
router.post("/:pickleId", protectRoute, createFavorite);
router.delete("/:pickleId", protectRoute, deleteFavorite);

export default router;
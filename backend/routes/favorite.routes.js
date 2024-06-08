import express from "express";

import { createFavorite } from "../controllers/favorite/favorite.create.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/:pickleId", protectRoute, createFavorite);

export default router;
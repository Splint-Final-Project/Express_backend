import express from "express";

import { getPickles, getPicklesOfType } from "../controllers/pickle.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/", protectRoute, getPickles);
router.get("/:pickleType", protectRoute, getPicklesOfType);

export default router;
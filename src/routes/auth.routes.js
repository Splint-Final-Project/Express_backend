import express from "express";
import {
  emailVerify,
  getMe,
  login,
  logout,
  oauth,
  signup,
  signup2,
} from "../controllers/auth.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/me", protectRoute, getMe);

router.post("/join", signup);

router.post("/verify-email", emailVerify);

router.put("/join2", signup2);

router.post("/login", login);

router.delete("/logout", logout);

//callbackes from oauth providers
router.get("/oauth/:provider", oauth);

export default router;

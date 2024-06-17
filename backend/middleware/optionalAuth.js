import jwt from "jsonwebtoken";
import User from "../models/user.model.js"; // User 모델을 import하세요

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded) {
        const user = await User.findById(decoded.userId).select("-password");

        if (user && user.status !== "pending") {
          req.user = user;
        }
      }
    }

    next(); // 로그인되지 않았거나 인증 실패 시에도 요청을 계속 진행
  } catch (error) {
    console.log("Error in optionalAuth middleware: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default optionalAuth;

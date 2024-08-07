import jwt from "jsonwebtoken";
import User from "../models/user.model.js"; // User 모델을 import하세요

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded) {
        const user = await User.findById(decoded.userId).select("-password");
        if (user) {
          req.user = user;
        }
      }
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        console.log("JWT expired in optionalAuth middleware");
        return res.status(401).json({ error: "JWT expired", shouldLogOut: true });
      }
    }

    next(); // 로그인되지 않았거나 인증 실패 시에도 요청을 계속 진행
  } catch (error) {
    console.log("Error in optionalAuth middleware: ", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default optionalAuth;

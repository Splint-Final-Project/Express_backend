import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/user.model.js";
import generateToken from "../utils/generateToken.js";

export const signup = async (req, res) => {
  try {
    const { email, password, checkPassword } = req.body;

    if (password !== checkPassword) {
      return res.status(400).json({ error: "Passwords don't match" });
    }

    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10); // 해싱을 통해 비밀번호 해싱 추적을 어렵게
    const hashedPassword = await bcrypt.hash(password, salt);

    // https://avatar-placeholder.iran.liara.run/

    const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${email}`;

    const newUser = new User({
      email,
      password: hashedPassword,
      // gender,
      profilePic: boyProfilePic,
    });

    if (newUser) {
      // Generate JWT token here
      // generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        message: "회원가입 성공, 추가정보 입력 페이지로 리다이렉트합니다.",
        // token: generateToken(newUser._id),
        _id: newUser._id,
        email: newUser.email,
        status: newUser.status,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in signup controller", err.message);
  }
};

export const signup2 = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res
        .status(401)
        .json({ error: "Unauthorized - No Token Provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized - Invalid Token" });
    }
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { nickname, profilePic, occupation } = req.body;

    if (!nickname)
      return res.status(400).json({ error: "닉네임을 입력해주세요." });

    await User.findByIdAndUpdate(user._id, {
      nickname,
      profilePic,
      occupation,
      status: "active",
    });

    res.status(200).json({
      message: "필수 회원 정보가 입력되어 회원가입이 완료됐습니다.",
      user: {
        _id: user._id,
        email: user.email,
        status: user.status,
        profilePic: user.profilePic,
        nickname: user.nickname,
        occupation: user.occupation,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in signup2 controller", err.message);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    generateToken(user._id, res),
      res.status(200).json({
        message: "로그인 성공",
        user: {
          _id: user._id,
          email: user.email,
          status: user.status,
          profilePic: user.profilePic,
          nickname: user.nickname,
          occupation: user.occupation,
        },
      });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 15 * 24 * 60 * 60 * 1000 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

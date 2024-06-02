import bcrypt from "bcryptjs";

import User from "../models/user.model.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";
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
        token: generateToken(newUser._id),
        _id: newUser._id,
        email: newUser.email,
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

    res.status(200).json({
      message: "로그인 성공",
      token: generateToken(newUser._id),
      _id: newUser._id,
      email: newUser.email,
      profilePic: newUser.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

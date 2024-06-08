import Favorite from "../../models/favorite.model.js";

export const getFavorites = async (req, res) => {
  try {
    const user = req.user._id; // 현재 로그인 사용자

    const favorites = await Favorite.find({
      userId: user,
    });

    res.status(201).json({ data: favorites });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "찜 목록 조회에 실패했습니다.",
    });
  }
}
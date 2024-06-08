import Favorite from "../../models/favorite.model.js";

export const createFavorite = async (req, res) => {
  try {
    const user = req.user._id; // 현재 로그인 사용자
    const favoritePickle = req.params.pickleId;

    const newFavorite = new Favorite({
      userId: user,
      pickleId: favoritePickle,
    });

    // 데이터 베이스 저장
    await newFavorite.save();

    res.status(201).send.json({ message: "해당 피클을 찜했습니다.", data: newFavorite });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "피클 찜하기에 실패했습니다.",
    });
  }
}
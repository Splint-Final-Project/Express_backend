import Favorite from "../../models/favorite.model.js";

export const deleteFavorite = async (req, res) => {
  try {
    const user = req.user._id;
    const favoritePickle = req.params.pickleId;

    await Favorite.findOneAndDelete({ userId: user, pickleId: favoritePickle });

    res.status(200).json({
      success: true,
      message: "피클 찜하기가 제거되었습니다.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "피클 찜하기 제거에 실패했습니다.",
    });
  }
}
import Pickle from "../../models/Pickle.model.js";
import Favorite from "../../models/favorite.model.js";
import { minimumFormatPickle } from "../dto/pickle.dto.js";

export const getFavorites = async (req, res) => {
  try {
    const user = req.user._id; // 현재 로그인 사용자

    const page = parseInt(req.query.page) || 1; // 요청 파라미터로부터 페이지 번호를 가져옵니다. 기본값은 1입니다.
    const limit = 10; // 한 페이지당 반환할 항목의 수
    const skip = (page - 1) * limit;

    const favorites = await Favorite.find({
      userId: user,
    })
      .skip(skip)
      .limit(limit);

    const favoritePickles = [];

    for await (const favorite of favorites) {
      const foundPickle = await Pickle.find({
        _id: favorite.pickleId,
      });

      const filteredPickles = minimumFormatPickle(foundPickle[0]);
      favoritePickles.push(filteredPickles);
    }

    console.log(favoritePickles);

    const totalFavorites = await Favorite.countDocuments({ userId: user });
    const totalPages = Math.ceil(totalFavorites / limit);

    res.status(201).json({
      currentPage: page,
      totalPages: totalPages,
      totalFavorites: totalFavorites,
      data: favoritePickles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "찜 목록 조회에 실패했습니다.",
    });
  }
};

export const getFavoriteIds = async (req, res) => {
  try {
    const user = req.user._id; // 현재 로그인 사용자

    const favorites = await Favorite.find({
      userId: user,
    });

    const favoriteIds = [];

    for await (const favorite of favorites) {
      favoriteIds.push(favorite.pickleId);
    }

    res.status(200).json({ data: favoriteIds });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "찜 목록 조회에 실패했습니다.",
    });
  }
};

export const getFavorite = async (req, res) => {
  try {
    const user = req.user._id; // 현재 로그인 사용자
    const pickleId = req.params.pickleId;

    const favoritePickle = await Favorite.find({
      userId: user,
      pickleId: pickleId,
    })
      .populate("pickleId")
      .populate("userId");

    res.status(200).json({ data: favoritePickle });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

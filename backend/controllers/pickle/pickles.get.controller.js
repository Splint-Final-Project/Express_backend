// 다양한 종류 피클에 대한 컨트롤러
import Pickle from "../../models/Pickle.model.js";
import { findRecruitingPicklesWithPages, findProceedingPickles } from "../../services/pickle.service.js";
import { minimumFormatPickle } from "../dto/pickle.dto.js";

export const getPickles = async (req, res) => {
  try {
    const now = new Date();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const pickles = await findRecruitingPicklesWithPages(skip, limit);

    const total = await Pickle.countDocuments();

    const formattedPickles = pickles.map(minimumFormatPickle);

    res.status(200).json({
      count: pickles.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: formattedPickles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

export const getNearbyPickles = async (req, res) => {
  const now = new Date();
  const { latitude, longitude } = req.query;

  // 쿼리 파라미터를 숫자로 변환합니다.
  const parsedLatitude = parseFloat(latitude);
  const parsedLongitude = parseFloat(longitude);

  // 변환된 값이 유효한지 확인합니다.
  if (isNaN(parsedLatitude) || isNaN(parsedLongitude)) {
    return res.status(400).json({ error: "유효하지 않은 위치입니다." });
  }

  // 지구의 반지름 (미터 단위)
  const earthRadius = 6371000;

  // 500m 반경 내의 Pickle 데이터를 가져오기 위한 조건 계산
  const maxDistance = 500; // 500미터
  const radiansToDegrees = (radians) => radians * (180 / Math.PI);
  const radiusInDegrees = radiansToDegrees(maxDistance / earthRadius);

  try {
    const nearbyPickles = await Pickle.find({
      deadLine: { $gt: now },
      $expr: { $lt: [{ $size: "$participants" }, "$capacity"] },
      latitude: {
        $gte: parsedLatitude - radiusInDegrees,
        $lte: parsedLatitude + radiusInDegrees,
      },
      longitude: {
        $gte: parsedLongitude - radiusInDegrees,
        $lte: parsedLongitude + radiusInDegrees,
      },
    });

    const formattedPickles = nearbyPickles.map(minimumFormatPickle);

    res.json({ data: formattedPickles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPopularPickles = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0); // 오늘의 시작 시간
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999); // 오늘의 끝 시간

    const popularPickles = await Pickle.find({
      deadLine: { $gt: now },
      $expr: { $lt: [{ $size: "$participants" }, "$capacity"] },
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    })
      .sort({ viewCount: -1 })
      .limit(10);

    const filteredPickles = popularPickles.map(minimumFormatPickle);

    res.status(200).json({ data: filteredPickles });
  } catch (error) {
    res.status(500).json({ message: "서버 오류가 발생했습니다.", error });
  }
};

export const getHotTimePickles = async (req, res) => {
  try {
    const now = new Date();
    const oneDayLater = new Date(now);
    oneDayLater.setDate(now.getDate() + 1); // 현재 날짜에서 1일 후의 날짜를 설정

    // 마감 기한이 하루 남은 피클을 찾습니다.
    let hotTimePickles = await Pickle.find({
      deadLine: { $gt: now },
      $expr: { $lt: [{ $size: "$participants" }, "$capacity"] },
      deadLine: { $gte: now, $lte: oneDayLater },
    }).sort({ deadLine: 1 }); // deadLine 오름차순으로 정렬

    // 결과가 10개를 초과할 경우 10개만 반환
    if (hotTimePickles.length > 10) {
      hotTimePickles = hotTimePickles.slice(0, 10);
    }

    const filteredPickles = hotTimePickles.map(minimumFormatPickle);

    res.status(200).json({ data: filteredPickles });
  } catch (error) {
    res.status(500).json({ message: "서버 오류가 발생했습니다.", error });
  }
};

// 로그인 필수
export const getProceedingPickles = async (req, res) => {
  const user = req.user._id;

  try {
    const { filteredPickles, todayPickles } = await findProceedingPickles(user);

    const formattedFilteredPickles = filteredPickles.map(minimumFormatPickle);
    const formattedTodayPickles = todayPickles.map(minimumFormatPickle);

    res.json({
      proceedingPickles: formattedFilteredPickles,
      todayPickles: formattedTodayPickles,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getFinishedPickles = async (req, res) => {
  const user = req.user._id;

  try {
    const finishedPickles = await findProceedingPickles(user);

    const formattedFilteredPickles = finishedPickles.map(minimumFormatPickle);

    res.json({
      finishedPickles: formattedFilteredPickles,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}
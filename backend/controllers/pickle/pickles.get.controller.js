// 다양한 종류 피클에 대한 컨트롤러
import Pickle from "../../models/Pickle.model.js";
import { minimumFormatPickle } from "../dto/pickle.dto.js";

export const getPickles = async (req, res) => {
  try {
    // const { pickleType } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const skip = (page - 1) * limit;

    const pickles = await Pickle.find({})
      .skip(skip)
      .limit(limit);

    const total = await Pickle.countDocuments();

    const formattedPickles = pickles.map(minimumFormatPickle);

    res.status(200).json({
      count: pickles.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: formattedPickles
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

export const getNearbyPickles = async (req, res) => {
  const { latitude, longitude } = req.query;

  // 쿼리 파라미터를 숫자로 변환합니다.
  const parsedLatitude = parseFloat(latitude);
  const parsedLongitude = parseFloat(longitude);

  // 변환된 값이 유효한지 확인합니다.
  if (isNaN(parsedLatitude) || isNaN(parsedLongitude)) {
    return res.status(400).json({ error: '유효하지 않은 위치입니다.' });
  }

  // 지구의 반지름 (미터 단위)
  const earthRadius = 6371000;

  // 500m 반경 내의 Pickle 데이터를 가져오기 위한 조건 계산
  const maxDistance = 500; // 500미터
  const radiansToDegrees = (radians) => radians * (180 / Math.PI);
  const radiusInDegrees = radiansToDegrees(maxDistance / earthRadius);

  try {
    const nearbyPickles = await Pickle.find({
      latitude: {
        $gte: parsedLatitude - radiusInDegrees,
        $lte: parsedLatitude + radiusInDegrees,
      },
      longitude: {
        $gte: parsedLongitude - radiusInDegrees,
        $lte: parsedLongitude + radiusInDegrees,
      }
    });

    const formattedPickles = nearbyPickles.map(minimumFormatPickle);

    res.json({data: formattedPickles});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// 로그인 필수
export const getPicklesByStatus = async (req, res) => {
  const { status } = req.params;
  const user = req.user._id;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  try {
    const pickles = await Pickle.find().exec();

    // 상태별로 필터링된 결과를 저장할 배열
    let filteredPickles = [];
    let todayPickles = [];

    pickles.forEach(pickle => {
      const isParticipant = pickle.participants.some(participant => participant.equals(user));
      const lastTime = new Date(pickle.when.times[pickle.when.times.length - 1]);

      // 오늘 날짜와 동일한 시간을 가지는 피클을 따로 저장
      const isSameDayAsToday = lastTime >= today && lastTime < new Date(today.getTime() + 24 * 60 * 60 * 1000);
      if (isSameDayAsToday) {
        if (isParticipant) {
          todayPickles.push(pickle);
        }
      } else {
        if (status === 'start' && isParticipant && pickle.participants.length === pickle.capacity && lastTime > now) {
          filteredPickles.push(pickle);
        } else if (status === 'end' && isParticipant && pickle.participants.length === pickle.capacity && lastTime < now) {
          filteredPickles.push(pickle);
        }
      }
    });

    const formattedFilteredPickles = pickles.map(minimumFormatPickle);
    const formattedTodayPickles = pickles.map(minimumFormatPickle);

    res.json({ filteredPickles: formattedFilteredPickles, todayPickles: formattedTodayPickles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPopularPickles = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0); // 오늘의 시작 시간
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999); // 오늘의 끝 시간

    const popularPickles = await Pickle.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    })
    .sort({ viewCount: -1 })
    .limit(10);

    const filteredPickles = popularPickles.map(minimumFormatPickle);

    res.status(200).json({data: filteredPickles});
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.', error });
  }
};
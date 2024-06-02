// 다양한 종류 피클에 대한 컨트롤러
import Pickle from "../../models/Pickle.model.js";

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

    res.status(200).json({
      count: pickles.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: pickles
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

    res.json(nearbyPickles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const getPicklesByStatus = async (req, res) => {
  const { status } = req.query;
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
        if (status === '진행 중' && isParticipant && pickle.participants.length === pickle.capacity && lastTime > now) {
          filteredPickles.push(pickle);
        } else if (status === '종료' && isParticipant && pickle.participants.length === pickle.capacity && lastTime < now) {
          filteredPickles.push(pickle);
        }
      }
    });

    res.json({ filteredPickles, todayPickles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
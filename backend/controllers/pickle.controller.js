import Pickle from "../models/Pickle.model.js";

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
  const { status = '모집 중' } = req.query;

  try {
    const pickles = await Pickle.find().exec();

    // 상태에 따라 필터링
    const filteredPickles = pickles.filter(pickle => {
      const now = new Date();

      if (status === '모집 중') {
        return pickle.deadLine > now && pickle.participants.length < pickle.capacity;
      } else if (status === '진행 중') {
        return pickle.participants.length === pickle.capacity && pickle.when > now;
      } else if (status === '종료') {
        return pickle.participants.length === pickle.capacity && pickle.when < now;
      }
      return false;
    });

    res.json(filteredPickles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPickleDetails = async (req, res) => {
  try {
    const pickle = await Pickle.findById(req.params.id).exec();

    if (!pickle) {
      return res.status(404).json({ error: 'Pickle not found' });
    }

    res.json(pickle); // status 필드가 JSON 응답에 포함됩니다.
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createPickle = async (req, res) => {
  try {
    const {
      title,
      content,
      latitude,
      longitude,
      capacity
    } = req.body;
    // 현재 사용자가 생성 -> 리더가 됩니다.
    const leader = req.user._id;

    const newPickle = new Pickle({
      leader,
      title,
      content,
      viewCount: 0,
      latitude,
      longitude,
      capacity
    });

    // 데이터베이스에 저장
    const savedPickle = await newPickle.save();

    res.status(201).json({
      success: true,
      data: savedPickle
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
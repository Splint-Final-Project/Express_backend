// 다양한 종류 피클에 대한 컨트롤러
import Pickle from "../../models/Pickle.model.js";
import { 
  findRecruitingPicklesWithPages, 
  findProceedingPickles, 
  findNearbyPickles, 
  findPopularPickles, 
  findHotTimePickles,
  findPicklesByQueries
} from "../services/pickle.service.js";
import { minimumFormatPickle } from "../dto/pickle.dto.js";

export const getPickles = async (req, res) => {
  try {
    const now = new Date();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let pickles = await findRecruitingPicklesWithPages(skip, limit);

    if (req.user) {
      const userAreaCodes = req.user.areaCodes;
      const filteredPickles = [];

      for (const userAreaCode of userAreaCodes) {
        const userAreaCodePrefix = Math.floor(userAreaCode / 100000);

        for (const pickle of pickles) {
          const pickleAreaCodePrefix = Math.floor(pickle.areaCode / 100000);

          if (userAreaCodePrefix === pickleAreaCodePrefix) {
            filteredPickles.push(pickle);
          }
        }
      }
  
      pickles = filteredPickles;
    }

    const query = req.query.sortBy;
    findPicklesByQueries(pickles, query);

    const formattedPickles = pickles.map(minimumFormatPickle);
    const total = pickles.length; 

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

export const getPopularPickles = async (req, res) => {
  try {
    const startOfDayUTC = new Date();
    startOfDayUTC.setUTCHours(0, 0, 0, 0);

    const endOfDayUTC = new Date();
    endOfDayUTC.setUTCHours(23, 59, 59, 999);

    console.log('Query Start Date (UTC):', startOfDayUTC.toISOString());
    console.log('Query End Date (UTC):', endOfDayUTC.toISOString());

    let popularAndRecruitingPickles = await findPopularPickles();

    if (req.user) {
      const userAreaCodes = req.user.areaCodes;
      const filteredPickles = [];

      for (const userAreaCode of userAreaCodes) {
        const userAreaCodePrefix = Math.floor(userAreaCode / 100000);

        for (const pickle of popularAndRecruitingPickles) {
          const pickleAreaCodePrefix = Math.floor(pickle.areaCode / 100000);

          if (userAreaCodePrefix === pickleAreaCodePrefix) {
            filteredPickles.push(pickle);
          }
        }
      }

      popularAndRecruitingPickles = filteredPickles;
    }

    if (req.query.category) {
      const query = req.query.category;
      const filteredPickles = [];

      for (const pickle of popularAndRecruitingPickles) {
        if (query === pickle.category) {
          filteredPickles.push(pickle);
        }
      }

      popularAndRecruitingPickles = filteredPickles;
    }

    const filteredPickles = popularAndRecruitingPickles.map(minimumFormatPickle);

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

    let hotTimeAndRecruitingPickles = await findHotTimePickles(oneDayLater);

    if (req.user) {
      const userAreaCodes = req.user.areaCodes;
      const filteredPickles = [];

      for (const userAreaCode of userAreaCodes) {
        const userAreaCodePrefix = Math.floor(userAreaCode / 100000);

        for (const pickle of hotTimeAndRecruitingPickles) {
          const pickleAreaCodePrefix = Math.floor(pickle.areaCode / 100000);

          if (userAreaCodePrefix === pickleAreaCodePrefix) {
            filteredPickles.push(pickle);
          }
        }
      }

      if (req.query.category) {
        const query = req.query.category;
        const filteredPickles = [];
  
        for (const pickle of hotTimeAndRecruitingPickles) {
          if (query === pickle.category) {
            filteredPickles.push(pickle);
          }
        }
  
        hotTimeAndRecruitingPickles = filteredPickles;
      }

      hotTimeAndRecruitingPickles = filteredPickles;
    }

    const filteredPickles = hotTimeAndRecruitingPickles.map(minimumFormatPickle);

    res.status(200).json({ data: filteredPickles });
  } catch (error) {
    res.status(500).json({ message: "서버 오류가 발생했습니다.", error });
  }
};

export const getNearbyPickles = async (req, res) => {
  const now = new Date();
  const { latitude, longitude } = req.query;

  const parsedLatitude = parseFloat(latitude);
  const parsedLongitude = parseFloat(longitude);

  if (isNaN(parsedLatitude) || isNaN(parsedLongitude)) {
    return res.status(400).json({ error: "유효하지 않은 위치입니다." });
  }

  const earthRadius = 6371000;
  const maxDistance = 500; // 500m 반경 내의 Pickle 데이터를 가져오기 위한 조건 계산
  const radiansToDegrees = (radians) => radians * (180 / Math.PI);
  const radiusInDegrees = radiansToDegrees(maxDistance / earthRadius);

  try {
    const nearbyAndRecruitingPickles = await findNearbyPickles(parsedLatitude, parsedLongitude, radiusInDegrees);

    const formattedPickles = nearbyAndRecruitingPickles.map(minimumFormatPickle);

    res.json({ data: formattedPickles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
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

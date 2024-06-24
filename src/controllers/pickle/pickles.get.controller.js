// 다양한 종류 피클에 대한 컨트롤러
import {
  findRecruitingPickles,
  findProceedingPickles,
  findFinishedPickles,
  findNearbyPickles,
  findPopularPickles,
  findHotTimePickles,
  findPicklesByQueries,
  findPendingPickles,
  findCancelledPickles,
} from "../services/pickle.service.js";
import {
  minimumFormatPickle,
  myPickleFormat,
  finishedPickleFormat,
} from "../dto/pickle.dto.js";

export const getPickles = async (req, res) => {
  try {
    const now = new Date();

    let pickles = await findRecruitingPickles();
    const total = pickles.length;

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
    pickles = await findPicklesByQueries(pickles, query);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const paginatedPickles = pickles.slice(skip, skip + limit);
    const formattedPickles = paginatedPickles.map(minimumFormatPickle);

    res.status(200).json({
      data: formattedPickles,
      total: paginatedPickles.length,
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

    const filteredPickles =
      popularAndRecruitingPickles.map(minimumFormatPickle);

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

    const filteredPickles =
      hotTimeAndRecruitingPickles.map(minimumFormatPickle);

    res.status(200).json({ data: filteredPickles });
  } catch (error) {
    res.status(500).json({ message: "서버 오류가 발생했습니다.", error });
  }
};

export const getNearbyPickles = async (req, res) => {
  const now = new Date();
  const { level, latitude, longitude } = req.query;

  const radius = 300 * Math.pow(2, level - 3);
  const parsedLatitude = parseFloat(latitude);
  const parsedLongitude = parseFloat(longitude);

  if (isNaN(parsedLatitude) || isNaN(parsedLongitude)) {
    return res.status(400).json({ error: "유효하지 않은 위치입니다." });
  }

  const earthRadius = 6371000;
  const maxDistance = radius;
  const radiansToDegrees = (radians) => radians * (180 / Math.PI);
  const radiusInDegrees = radiansToDegrees(maxDistance / earthRadius);

  try {
    const nearbyAndRecruitingPickles = await findNearbyPickles(
      parsedLatitude,
      parsedLongitude,
      radiusInDegrees
    );

    const formattedPickles =
      nearbyAndRecruitingPickles.map(minimumFormatPickle);

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

    const formattedFilteredPickles =
      filteredPickles?.map((pickle) => myPickleFormat(pickle, "progress")) ||
      [];
    const formattedTodayPickles =
      todayPickles?.map((pickle) => myPickleFormat(pickle, "progress")) || [];

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
    const finishedPickles = await findFinishedPickles(user);
    const cancelledPickles = await findCancelledPickles(user);

    const formattedFinishedPickles =
      finishedPickles?.map((pickle) => finishedPickleFormat(pickle, "done")) ||
      [];
    const formattedCancelledPickles =
      cancelledPickles?.map((pickle) =>
        finishedPickleFormat(pickle, "cancelled")
      ) || [];

    const finalFormat = [
      ...formattedFinishedPickles,
      ...formattedCancelledPickles,
    ];

    res.json({
      finishedPickles: finalFormat,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPendingPickles = async (req, res) => {
  const user = req.user._id;

  try {
    const pendingPickles = await findPendingPickles(user);

    const formattedPendingPickles =
      pendingPickles?.map((pickle) => myPickleFormat(pickle, "pending")) || [];

    res.status(201).json({ pendingPickles: formattedPendingPickles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

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
import { filterRecruitingPickles, hotTimePicklesFilter, realtimeTrendingPickleFilter } from "../services/pickle.filter.js";

export const getPickles = async (req, res) => {
  try {
    const now = new Date();
    const query = req.query.sortBy;
    let pickles = await filterRecruitingPickles({now, page: 1, user: req.user});
    // let pickles = await findRecruitingPickles();
    const total = pickles.length;

    pickles = await findPicklesByQueries(pickles, query);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const paginatedPickles = pickles.slice(skip, skip + limit);
    const formattedPickles = paginatedPickles.map(minimumFormatPickle);

    return res.status(200).json({
      data: formattedPickles,
      total: paginatedPickles.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

export const getPopularPickles = async (req, res) => {
  try {
    const now = new Date();

    let popularAndRecruitingPickles = await realtimeTrendingPickleFilter({now, category: req.query.category, user: req.user});
    // let popularAndRecruitingPickles = await findPopularPickles();

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

    return res.status(200).json({ data: filteredPickles });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "서버 오류가 발생했습니다.", error });
  }
};

export const getHotTimePickles = async (req, res) => {
  try {
    const now = new Date();

    let hotTimeAndRecruitingPickles = await hotTimePicklesFilter({now, user: req.user});
    
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

    const filteredPickles =
      hotTimeAndRecruitingPickles.map(minimumFormatPickle);

    return res.status(200).json({ data: filteredPickles });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "서버 오류가 발생했습니다.", error });
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
    return res.status(500).json({ error: "Internal server error" });
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
    return res.status(500).json({ error: "Internal server error" });
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
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getPendingPickles = async (req, res) => {
  const user = req.user._id;

  try {
    const pendingPickles = await findPendingPickles(user);

    const formattedPendingPickles =
      pendingPickles?.map((pickle) => myPickleFormat(pickle, "pending")) || [];

    return res.status(201).json({ pendingPickles: formattedPendingPickles });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

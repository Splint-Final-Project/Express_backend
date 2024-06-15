import Pickle from "../../models/Pickle.model.js";
import Participation from "../../models/participation.model.js";
import { PICKLE_FILTER } from "./constants/pickle.filter.js";
import { filterRecruitingPickles, filterRecruitmentCompletedPickles } from "./utils/index.js";

export const findRecruitingPicklesWithPages = async (skip, limit) => {
  const notExpiredPickles = await Pickle.find(PICKLE_FILTER.NOT_EXPIRED).skip(skip).limit(limit);
  const recruitingPickles = await filterRecruitingPickles(notExpiredPickles);

  return recruitingPickles;
};

export const findPicklesByQueries = async (pickles, query) => {
  switch (query) {
    case '인기순':
      pickles.sort((a, b) => b.viewCount - a.viewCount);
      break;
    case '가격 낮은 순':
      pickles.sort((a, b) => a.count - b.count);
      break;
    case '가격 높은 순':
      pickles.sort((a, b) => b.count - a.count);
      break;
    case '전체':
    default:
      // 기본적으로 정렬하지 않음
      break;
  }
  
  return pickles
}

export const findNearbyPickles = async (parsedLatitude, parsedLongitude, radiusInDegrees) => {
  const filterConditions = {
    ...PICKLE_FILTER.NOT_EXPIRED,
    ...PICKLE_FILTER.NEARBY(parsedLatitude, parsedLongitude, radiusInDegrees)
  };
  const nearbyPickles = await Pickle.find(filterConditions);
  const nearbyAndRecruitingPickles = await filterRecruitingPickles(nearbyPickles);

  return nearbyAndRecruitingPickles;
}

export const findPopularPickles = async () => {
  const filterConditions = {
    ...PICKLE_FILTER.NOT_EXPIRED,
    ...PICKLE_FILTER.POPULAR
  };
  const popularPickles = await Pickle.find(filterConditions).sort({ viewCount: -1 }).limit(10);
  const popularAndRecruitingPickles = await filterRecruitingPickles(popularPickles);

  return popularAndRecruitingPickles;
}

export const findHotTimePickles = async (oneDayLater) => {
  const filterConditions = {
    ...PICKLE_FILTER.NOT_EXPIRED,
    ...PICKLE_FILTER.HOT_TIME(oneDayLater)
  };
  const hotTimePickles = await Pickle.find(filterConditions).sort({ deadLine: 1 });

  if (hotTimePickles.length > 10) {
    hotTimePickles = hotTimePickles.slice(0, 10);
  };

  const hotTimeAndRecruitingPickles = await filterRecruitingPickles(hotTimePickles);

  return hotTimeAndRecruitingPickles;
}

export const findRecruitmentCompletedPickles = async (user) => {
  const notStartPickles = await Pickle.find(PICKLE_FILTER.NOT_STARTED);

  const recruitmentCompletedPickles = await filterRecruitmentCompletedPickles(notStartPickles);

  return recruitmentCompletedPickles;
};

export const findProceedingPickles = async (user) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const myPickleIds = await Participation.find({
    user: user,
  }).populate("user");

  let readyToStartPickles = [];
  
  for await (const myPickleId of myPickleIds) {
    const filterConditions = {
      _id: myPickleId.pickle,
      ...PICKLE_FILTER.READY_TO_START
    };
    const readyToStartPickle = await Pickle.find(filterConditions);

    readyToStartPickles.push(readyToStartPickle[0]);
  }

  const proceedingPickles = await filterRecruitmentCompletedPickles(readyToStartPickles);

  // 오늘 날짜와 동일한 시간을 가지는 피클을 따로 저장
  let filteredPickles = [];
  let todayPickles = [];

  proceedingPickles.forEach((pickle) => {
    const isSameDayAsToday =
      lastTime >= today &&
      lastTime < new Date(today.getTime() + 24 * 60 * 60 * 1000);
    if (isSameDayAsToday) {
      if (isParticipant) {
        todayPickles.push(pickle);
      }
    } else {
      filteredPickles.push(pickle);
    }
  });

  return { filteredPickles, todayPickles };
}

export const findFinishedPickles = async (user) => {
  const myPickleIds = await Participation.find({
    user: user,
  }).populate("user");

  let finishedPickles = [];
  
  for await (const myPickleId of myPickleIds) {
    const filterConditions = {
      _id: myPickleId.pickle,
      ...PICKLE_FILTER.FINISHED
    };
    const timeOutPickle = await Pickle.find(filterConditions);

    finishedPickles.push(timeOutPickle[0]);
  }

  const completePickles = await filterRecruitmentCompletedPickles(finishedPickles);

  return completePickles;
}
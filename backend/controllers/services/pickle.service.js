import Pickle from "../../models/Pickle.model.js";
import Participation from "../../models/participation.model.js";
import { PICKLE_FILTER } from "./constants/pickle.filter.js";
import {
  filterRecruitingPickles,
  filterRecruitmentCompletedPickles,
  filterRecruitmentCompletedPicklesWithReviews
} from "./utils/index.js";

export const findRecruitingPickles = async (skip, limit) => {
  const notExpiredTotalPickles = await Pickle.find(PICKLE_FILTER.NOT_EXPIRED);
  const recruitingTotalPickles = await filterRecruitingPickles(
    notExpiredTotalPickles
  );
  // const notExpiredPickles = await Pickle.find(PICKLE_FILTER.NOT_EXPIRED).skip(skip).limit(limit);
  // const recruitingPickles = await filterRecruitingPickles(notExpiredPickles);

  return recruitingTotalPickles;
};

export const findPicklesByQueries = async (pickles, query) => {
  switch (query) {
    case "인기순":
      pickles.sort((a, b) => b.viewCount - a.viewCount);
      break;
    case "가격 낮은 순":
      pickles.sort((a, b) => a.count - b.count);
      break;
    case "가격 높은 순":
      pickles.sort((a, b) => b.count - a.count);
      break;
    case "전체":
    default:
      // 기본적으로 정렬하지 않음
      break;
  }

  return pickles;
};

export const findNearbyPickles = async (
  parsedLatitude,
  parsedLongitude,
  radiusInDegrees
) => {
  const filterConditions = {
    ...PICKLE_FILTER.NOT_EXPIRED,
    ...PICKLE_FILTER.NEARBY(parsedLatitude, parsedLongitude, radiusInDegrees),
  };
  const nearbyPickles = await Pickle.find(filterConditions);
  const nearbyAndRecruitingPickles = await filterRecruitingPickles(
    nearbyPickles
  );

  return nearbyAndRecruitingPickles;
};

export const findPopularPickles = async () => {
  const filterConditions = {
    ...PICKLE_FILTER.NOT_EXPIRED,
    ...PICKLE_FILTER.POPULAR,
  };
  const popularPickles = await Pickle.find(filterConditions)
    .sort({ viewCount: -1 })
    .limit(10);
  const popularAndRecruitingPickles = await filterRecruitingPickles(
    popularPickles
  );

  return popularAndRecruitingPickles;
};

export const findHotTimePickles = async (oneDayLater) => {
  const filterConditions = {
    ...PICKLE_FILTER.NOT_EXPIRED,
    ...PICKLE_FILTER.HOT_TIME(oneDayLater),
  };
  const hotTimePickles = await Pickle.find(filterConditions).sort({
    deadLine: 1,
  });

  if (hotTimePickles.length > 10) {
    hotTimePickles = hotTimePickles.slice(0, 10);
  }

  const hotTimeAndRecruitingPickles = await filterRecruitingPickles(
    hotTimePickles
  );

  return hotTimeAndRecruitingPickles;
};

export const findPendingPickles = async (user) => {
  const payedPickles = await Participation.find({
    user: user,
    status: "paid",
  }).populate("user");

  let findPickles = [];
  for await (const pickle of payedPickles) {
    const filterConditions = {
      ...PICKLE_FILTER.NOT_EXPIRED,
      _id: pickle.pickle,
    };
    const findPickle = await Pickle.find(filterConditions);
    findPickles.push(findPickle[0]);
  }

  const pendingPickles = await filterRecruitingPickles(findPickles);

  return pendingPickles;
};

export const findProceedingPickles = async (user) => {
  const now = new Date();
  const today = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  );

  const myPickleIds = await Participation.find({
    user: user,
    status: "paid",
  }).populate("user");

  let readyToStartPickles = [];

  for await (const myPickleId of myPickleIds) {
    const filterConditions = {
      _id: myPickleId.pickle,
      ...PICKLE_FILTER.READY_TO_START(today),
    };

    const readyToStartPickle = await Pickle.find(filterConditions);

    readyToStartPickles.push(readyToStartPickle[0]);
  }
  const proceedingPickles = await filterRecruitmentCompletedPickles(
    readyToStartPickles
  );

  // 오늘 날짜와 동일한 시간을 가지는 피클을 따로 저장
  let filteredPickles = [];
  let todayPickles = [];

  proceedingPickles.forEach((pickle) => {
    let isTodayPickle = false;

    for (const time in pickle.when.times) {
      const savedTime = pickle.when.times[time];

      if (today.getTime() === savedTime.getTime()) {
        const pickleWithToday = { ...pickle, today };
        todayPickles.push(pickleWithToday);
        isTodayPickle = true;
        break;
      }
    }

    if (!isTodayPickle) {
      filteredPickles.push(pickle);
    }
  });

  return { filteredPickles, todayPickles };
};

export const findFinishedPickles = async (user) => {
  const myPickleIds = await Participation.find({
    user: user,
    review: null,
  }).populate("user");

  const reviewedMyPickleIds = await Participation.find({
    user: user,
    review: { $ne: null }
  }).populate("user");

  let finishedPickles = [];

  for await (const myPickleId of myPickleIds) {
    const finishedConditions = {
      _id: myPickleId.pickle,
      ...PICKLE_FILTER.FINISHED,
    };

    const finishedPickle = await Pickle.find(finishedConditions);

    if (finishedPickle[0]) {
      const newFinishedPickle = { ...finishedPickle[0]._doc, review: false};

      finishedPickles.push(newFinishedPickle);
    }
  }

  for await (const myPickleId of reviewedMyPickleIds) {
    const finishedConditions = {
      _id: myPickleId.pickle,
      ...PICKLE_FILTER.FINISHED,
    };

    const finishedPickle = await Pickle.find(finishedConditions);
    if (finishedPickle[0]) {
      const newFinishedPickle = { ...finishedPickle[0]._doc, review: true};

      finishedPickles.push(newFinishedPickle);
    }
  }

  const completePickles = await filterRecruitmentCompletedPicklesWithReviews(
    finishedPickles
  );

  return completePickles;
};

export const findCancelledPickles = async (user) => {
  const myPickleIds = await Participation.find({
    user: user,
  }).populate("user");

  let finishedPickles = [];

  for await (const myPickleId of myPickleIds) {
    const cancelledConditions = {
      _id: myPickleId.pickle,
      ...PICKLE_FILTER.EXPIRED,
    };

    const cancelledPickles = await Pickle.find(cancelledConditions);

    finishedPickles.push(cancelledPickles[0]);
  }

  const completePickles = await filterRecruitingPickles(finishedPickles);
  return completePickles;
};

import Pickle from "../models/Pickle.model.js";
import Participation from "../models/participation.model.js";
import { PICKLE_FILTER } from "./constants/pickle.filter.js";
import { findParticipationNumber } from "./constants/participation.filter.js";

// const findRecruitingPickles = async (filteredPickles) => {
//   let recruitingPickles = [];

//   const participantChecks = filteredPickles.map(async (pickle) => {
//     const participantNumber = await findParticipationNumber(pickle._id);

//     if (participantNumber < )
//   });
  
// }

export const findRecruitingPicklesWithPages = async (skip, limit) => {
  const now = new Date();

  const notExpiredPickles = await Pickle.find({
    deadLine: { $gt: now },
  }).skip(skip).limit(limit);;

  let recruitingPickles = [];
  for await (const notExpiredPickle of notExpiredPickles) {

    const participantNumber = await Participation.countDocuments({
      pickle: notExpiredPickle._id,
      status: "paid",
    });

    if (participantNumber < notExpiredPickle.capacity) {
      recruitingPickles.push(notExpiredPickle);
    }
  }

  return recruitingPickles;
};

export const findRecruitmentCompletedPickles = async () => {
  const now = new Date();

  const notStartPickles = await Pickle.find({
    $expr: {
      $gt: [
        { $arrayElemAt: ["$when.times", 0] }, // times 배열의 첫 번째 요소
        now
      ]
    }
  });

  let recruitmentCompletedPickles = [];
  for await (const notStartPickle of notStartPickles) {

    const participantNumber = await Participation.countDocuments({
      pickle: notStartPickle._id,
      status: "paid",
    });

    if (participantNumber === notStartPickle.capacity) {
      recruitmentCompletedPickles.push(notStartPickle);
    }
  }

  return recruitmentCompletedPickles;
};

export const findProceedingPickles = async (user) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const readyToStartPickles = await Pickle.find({
    $and: [
      { $expr: { $gte: [now, { $arrayElemAt: ["$when.times", 0] }] } }, // 첫 번째 요소보다 크거나 같은
      { $expr: { $lte: [now, { $arrayElemAt: ["$when.times", -1] }] } } // 마지막 요소보다 작거나 같은
    ],
  });

  let proceedingPickles = [];
  for await (const readyToStartPickle of readyToStartPickles) {

    const participantNumber = await Participation.countDocuments({
      pickle: readyToStartPickle._id,
      user: user,
      status: "paid",
    });

    if (participantNumber === readyToStartPickle.capacity) {
      proceedingPickles.push(readyToStartPickle);
    }
  }

  let filteredPickles = [];
  let todayPickles = [];

  proceedingPickles.forEach((pickle) => {
    const isParticipant = pickle.participants.some((participant) =>
      participant.equals(user)
    );
    const lastTime = new Date(
      pickle.when.times[pickle.when.times.length - 1]
    );

    // 오늘 날짜와 동일한 시간을 가지는 피클을 따로 저장
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
  const timeOutPickles = await Pickle.find({
    $expr: { $gt: [now, { $arrayElemAt: ["$when.times", -1] }] }, // 첫 번째 요소보다 크거나 같은
  });

  let finishedPickles = [];
  for await (const timeOutPickle of timeOutPickles) {

    const participantNumber = await Participation.countDocuments({
      pickle: timeOutPickle._id,
      user: user,
      status: "paid",
    });

    if (participantNumber === timeOutPickle.capacity) {
      finishedPickles.push(timeOutPickle);
    }
  }

  return finishedPickles;
}
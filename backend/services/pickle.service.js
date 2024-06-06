import Pickle from "../models/Pickle.model.js";

export const findRecruitingPicklesWithPages = async (skip, limit) => {
  const now = new Date();

  const recruitingPickles = await Pickle.find({
    deadLine: { $gt: now },
    $expr: { $lt: [{ $size: "$participants" }, "$capacity"] }
  }).skip(skip).limit(limit);

  return recruitingPickles;
};

export const findRecruitmentCompletedPickles = async () => {
  const now = new Date();

  const recruitmentCompletedPickles = await Pickle.find({
    $expr: { $eq: [{ $size: "$participants" }, "$capacity"] },
    $expr: {
      $gt: [
        { $arrayElemAt: ["$when.times", 0] }, // times 배열의 첫 번째 요소
        now
      ]
    }
  });

  return recruitmentCompletedPickles;
};

export const findProceedingPickles = async (user) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const proceedingPickles = await Pickle.find({
    $expr: { $eq: [{ $size: "$participants" }, "$capacity"] },
    $and: [
      { $expr: { $gte: [now, { $arrayElemAt: ["$when.times", 0] }] } }, // 첫 번째 요소보다 크거나 같은
      { $expr: { $lte: [now, { $arrayElemAt: ["$when.times", -1] }] } } // 마지막 요소보다 작거나 같은
    ],
    participants: {
      $elemMatch: { user: mongoose.Types.ObjectId(user) } // participants 배열에 user 포함
    }
  });

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
  const finishedPickles = await Pickle.find({
    $expr: { $eq: [{ $size: "$participants" }, "$capacity"] },
    $expr: { $gt: [now, { $arrayElemAt: ["$when.times", -1] }] }, // 첫 번째 요소보다 크거나 같은
    participants: {
      $elemMatch: { user: mongoose.Types.ObjectId(user) } // participants 배열에 user 포함
    }
  });

  return finishedPickles;
}
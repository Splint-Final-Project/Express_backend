import Pickle from "../models/Pickle.model";

export const findRecruitingPickles = async () => {
  const now = new Date();

  const recruitingPickles = await Pickle.find({
    deadLine: { $gt: now },
    $expr: { $lt: [{ $size: "$participants" }, "$capacity"] }
  });

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

import Pickle from "../models/Pickle.model";
import Participation from "../models/participation.model";

export const findRecruitingPickles = async () => {
  const now = new Date();

  const notExpiredPickles = await Pickle.find({
    deadLine: { $gt: now },
  });
  let recruitingPickles = [];

  notExpiredPickles.forEach(async (pickle) => {
    // const participants = await Participation.find({ pickle: pickle._id });

    if (pickle.numParticipants < pickle.capacity) {
      recruitingPickles.push(pickle);
    }
  });

  return recruitingPickles;
};

export const findExpiredPickles = async () => {
  const now = new Date();

  const expiredPickles = await Pickle.find({
    deadLine: { $lte: now },
  });
  let closedPickles = [];

  expiredPickles.forEach(async (pickle) => {
    // const participants = await Participation.find({ pickle: pickle._id });

    if (pickle.numParticipants < pickle.capacity) {
      closedPickles.push(pickle);
    }
  });

  return closedPickles;
};

export const findRecruitmentCompletedPickles = async () => {
  const now = new Date();

  const pickles = await Pickle.find({});
  let recruitmentCompletedPickles = [];

  pickles.forEach(async (pickle) => {});
};

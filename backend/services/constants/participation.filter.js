import Participation from "../../models/participation.model";

export const PARTICIPATION_FILTER = {
  FIND_BY_PICKLE: (pickleId) => {
    return {pickle: pickleId};
  },

  PAID: { status: "paid", },

  FIND_BY_USER: (userId) => {
    return { user: userId};
  }
};

export const findParticipationNumber = async (pickleId) => {
  return await Participation.countDocuments({
    pickle: pickleId,
    status: "paid",
  }); // return array
};
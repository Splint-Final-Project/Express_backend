import Participation from "../../../models/participation.model.js";

export const PARTICIPATION_FILTER = {
  FIND_BY_PICKLE: (pickleId) => {
    return {pickle: pickleId};
  },

  PAID: { status: "paid", },

  FIND_BY_USER: (userId) => {
    return { user: userId};
  }
};
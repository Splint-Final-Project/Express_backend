import Favorite from "../../../models/favorite.model.js";

const LIKE_RANK = 3;
const PARTICIPANT_RANK = 7;

export const likeRank = async (pickle) => {
  const like = await Favorite.countDocuments({pickleId: pickle._id});
  const likeRankPickle = { ...pickle, likeRank: pickle.viewCount + like * LIKE_RANK + pickle.participantNumber * PARTICIPANT_RANK};
  return likeRankPickle;
}
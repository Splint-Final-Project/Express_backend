const LIKE_RANK = 3;
const PARTICIPANT_RANK = 7;

export const likeRank = (viewCount, like, participants) => {
  return viewCount + like * LIKE_RANK + participants * PARTICIPANT_RANK;
}
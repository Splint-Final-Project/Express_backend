// 세부 피클에 대한 컨트롤러
import Pickle from "../../models/Pickle.model.js";
import Participation from "../../models/participation.model.js";
import Favorite from "../../models/favorite.model.js";
import {
  findParticipationNumber,
  addParticipantNumber,
} from "../services/utils/index.js";

export const getPickleDetails = async (req, res) => {
  try {
    const user = req.user; // can be undefined

    const pickle = await Pickle.findOne({
      _id: req.params.id,
      // isCancelled: false,
    }).exec();

    const participations = await Participation.find({
      pickle: req.params.id,
    });

    const amIMember =
      user &&
      participations.some((participant) => {
        return participant.user._id.equals(user._id);
      });

    const leaders = participations.filter(
      (participant) => participant.isLeader
    );

    const likeCount = await Favorite.countDocuments({
      pickleId: req.params.id,
    });

    const over = pickle.deadLine < new Date();

    if (!pickle) {
      return res.status(404).json({ error: "Pickle not found" });
    }
    const participantNumber = await findParticipationNumber(req.params.id);
    const picklesWithParticipant = await addParticipantNumber(
      pickle,
      participantNumber
    );

    const addLikeAndParticipants = {
      ...picklesWithParticipant,
      like: likeCount,
      participantNumber: participations.length,
      leader: leaders[0].user,
      amIMember: amIMember,
      isRecruitingFinished:
        picklesWithParticipant.capacity === participations.length,
      isProceeding:
        picklesWithParticipant.when.times[0] <
        new Date() <=
        picklesWithParticipant.when.times[
          picklesWithParticipant.when.times.length - 1
        ],
      isFinished:
        new Date() >
        picklesWithParticipant.when.times[
          picklesWithParticipant.when.times.length - 1
        ],
      over: over,
    };

    res.json({ data: addLikeAndParticipants }); // status 필드가 JSON 응답에 포함됩니다.
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getFavoriteCount = async (req, res) => {
  try {
    const likeCount = await Favorite.countDocuments({
      pickleId: req.params.id,
    });
    let isClicked = false;
    if (req.user) {
      const user = req.user._id;
      const userClickCount = await Favorite.countDocuments({
        pickleId: req.params.id,
        userId: user,
      }).populate("userId");
      if (userClickCount === 1) {
        isClicked = true;
      } else {
        isClicked = false;
      }
    }

    res.json({ likeCount: likeCount, isClicked: isClicked }); // status 필드가 JSON 응답에 포함됩니다.
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

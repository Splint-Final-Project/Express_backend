import Participation from "../../../models/participation.model.js";

export const findParticipationNumber = async (pickleId) => {
  return await Participation.countDocuments({
    pickle: pickleId,
    status: "paid",
  }); // return array
};

export const addParticipantNumber = (pickle, participantNumber) => {
  return {
    ...pickle._doc,
    participantNumber: participantNumber
  };
}

// 모집중 피클 필터링
export const filterRecruitingPickles = async (filteredPickles) => {
  let recruitingPickles = [];

  for await (const filteredPickle of filteredPickles) {
    // 참가자 수 찾기
    const participantNumber = await findParticipationNumber(filteredPickle);

    if (participantNumber < filteredPickle.capacity) {
      const pickleWithParticipant = addParticipantNumber(filteredPickle, participantNumber);

      recruitingPickles.push(pickleWithParticipant);
    }
  }
  
  return recruitingPickles;
};

// 모집 완료 피클 필터링
export const filterRecruitmentCompletedPickles = async (filteredPickles) => {
  let recruitmentCompletedPickles = [];

  for await (const filteredPickle of filteredPickles) {

    const participantNumber = await findParticipationNumber(filteredPickle);

    if (participantNumber === filteredPickle.capacity) {
      const pickleWithParticipant = addParticipantNumber(filteredPickle, participantNumber);

      recruitmentCompletedPickles.push(pickleWithParticipant);
    }
  }

  return recruitmentCompletedPickles;
};

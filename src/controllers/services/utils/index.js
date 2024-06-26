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

export const addParticipantNumberWithReviews = (pickle, participantNumber) => {
  return {
    ...pickle,
    participantNumber: participantNumber
  }
};

// 모집중 피클 필터링: 참가 수 비교만
export const filterRecruitingPickles = async (filteredPickles) => {
  let recruitingPickles = [];

  for await (const filteredPickle of filteredPickles) {
    // 참가자 수 찾기
    const participantNumber = await findParticipationNumber(filteredPickle);

    if (participantNumber < filteredPickle?.capacity) {
      const pickleWithParticipant = addParticipantNumber(filteredPickle, participantNumber);

      recruitingPickles.push(pickleWithParticipant);
    }
  }

  return recruitingPickles;
};

// 모집 완료 피클 필터링: 참가 수 비교만 담당
export const filterRecruitmentCompletedPickles = async (filteredPickles) => {
  let recruitmentCompletedPickles = [];
  // console.log(filteredPickles)
  for await (const filteredPickle of filteredPickles) {

    const participantNumber = await findParticipationNumber(filteredPickle);

    if (participantNumber === filteredPickle?.capacity) {

      const pickleWithParticipant = addParticipantNumber(filteredPickle, participantNumber);

      recruitmentCompletedPickles.push(pickleWithParticipant);
    }
  }

  return recruitmentCompletedPickles;
};

export const filterRecruitmentCompletedPicklesWithReview = async (filteredPickles) => {
  let recruitmentCompletedPickles = [];

  for await (const filteredPickle of filteredPickles) {

    const participantNumber = await findParticipationNumber(filteredPickle);

    if (participantNumber === filteredPickle?.capacity) {

      const pickleWithParticipant = addParticipantNumberWithReviews(filteredPickle, participantNumber);

      recruitmentCompletedPickles.push(pickleWithParticipant);
    }
  }

  return recruitmentCompletedPickles;
}

export const filterRecruitmentCompletedPicklesWithSome = async (filteredPickles) => {
  let recruitmentCompletedPickles = [];

  for await (const filteredPickle of filteredPickles) {
    const participantNumber = await findParticipationNumber(filteredPickle);

    if (participantNumber === filteredPickle?.capacity) {

      const pickleWithParticipant = addParticipantNumberWithReviews(filteredPickle, participantNumber);

      recruitmentCompletedPickles.push(pickleWithParticipant);
    }
  }

  return recruitmentCompletedPickles;
}

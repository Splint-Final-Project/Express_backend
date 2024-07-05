import Pickle from "../../models/Pickle.model.js";
import { likeRank } from "./utils/likeRank.js";

const pickleDto = {
  $project: {
    _id: 1,
    title: 1,
    imgUrl: 1,
    capacity: 1,
    deadLine: 1,
    place: 1,
    when: 1,
    cost: 1,
    latitude: 1,
    longitude: 1,
    category: 1,
    participantNumber: "$participationCount", // 참가자 수 필드 추가
    detailedAddress: 1, // 필요한 다른 필드도 포함
    today: 1,
    attendance: 1,
    review: 1,
    goals: 1,
    explanation: 1,
    areaCode: 1,
    createdAt: 1,
    viewCount: 1,
  }
};

// 현재 모집 중인 피클: 참가자 비교 + 아직 데드 라인 지나지 않음
export const filterRecruitingPickles = async (now) => {
  const basePipeline = [
    deadlineFilter(now),
    ...participationCountFilter('greater'),
    pickleDto,
  ];
  return await applyFilters(basePipeline, []);
};

// 인기 급상승
export const realtimeTrendingPickleFilter = async (now) => {
  const basePipeline = [
    deadlineFilter(now),
    ...participationCountFilter('greater'),
    pickleDto,
  ];

  return await applyFilters(basePipeline, [realtimeTrendingFilter(now)]);
}

// 마감 임박
export const hotTimePicklesFilter = async (now) => {
  const basePipeline = [
    deadlineFilter(now), // 동적으로 현재 시간 기준으로 필터 생성
    ...participationCountFilter('greater'),
    pickleDto,
    {
      $sort: {
        deadLine: 1 // deadLine 기준으로 오름차순 정렬
      }
    }
  ];

  const results = await applyFilters(basePipeline, [hotTimeFilter(now)]);

  let popularAndRecruitingPickles = [];
  for await (const pickle of results) {
    const newPickle = await likeRank(pickle);

    popularAndRecruitingPickles.push(newPickle);
  }
  popularAndRecruitingPickles.sort((a, b) => b.likeRank - a.likeRank);

  return popularAndRecruitingPickles;
};

// 참가 인원 관련
const participationCountFilter = (condition) => {
  let matchCondition;

  if (condition === "equal") {
    matchCondition = { $expr: { $eq: ["$capacity", "$participationCount"] } }; // 용량과 참가자 수가 같은 경우
  } else if (condition === "greater") {
    matchCondition = { $expr: { $gt: ["$capacity", "$participationCount"] } }; // 용량이 참가자 수보다 큰 경우
  } else {
    throw new Error("Invalid condition. Use 'equal' or 'greater'.");
  }

  return [
    {
      $lookup: {
        from: "participations",
        localField: "_id",
        foreignField: "pickle",
        as: "participations"
      }
    },
    {
      $addFields: {
        participationCount: {
          $size: {
            $filter: {
              input: "$participations",
              as: "participation",
              cond: { $eq: ["$$participation.status", "paid"] } // 조건: status가 "paid"
            }
          }
        }
      }
    },
    {
      $match: matchCondition
    }
  ];
};

const deadlineFilter = (now) => {
  return {
    $match: {
      $expr: { $gt: ["$deadLine", now] } // 현재 시간보다 데드라인이 큰 경우만
    }
  };
};

export const categoryFilter = (category) => {
  if (!category || category === "all") {
    return { $match: {} }; // 빈 조건으로 모든 문서를 포함
  }
  return {
    $match: {
      category: category
    }
  };
};

const realtimeTrendingFilter = (now) => {
  const startOfDayUTC = new Date(now);
  startOfDayUTC.setUTCHours(0, 0, 0, 0);

  const endOfDayUTC = new Date(now);
  endOfDayUTC.setUTCHours(23, 59, 59, 999);

  return {
    $match: {
      $expr: {
        $and: [
          { $gte: ["$createdAt", startOfDayUTC] },
          { $lte: ["$createdAt", endOfDayUTC] }
        ]
      }
    }
  }
}

const hotTimeFilter = (now) => {
  const oneDayLater = new Date(now);
  oneDayLater.setDate(now.getDate() + 1); // 현재 날짜에서 1일 후의 날짜를 설정

  return {
    $match: {
      $expr: {
        $and: [
          { $gte: ["$deadLine", now] },
          { $lte: ["$deadLine", oneDayLater] }
        ]
      }
    }
  };
};

export const applyFilters = async (basePipeline, additionalFilters) => {
  const pipeline = [...basePipeline, ...additionalFilters];
  const results = await Pickle.aggregate(pipeline);
  return results
};

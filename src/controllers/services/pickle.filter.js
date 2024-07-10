import Pickle from "../../models/Pickle.model.js";

const LIKE_RANK = 3;
const PARTICIPANT_RANK = 7;
const PAGINATION_LIMIT = 10;

const pickleDto = [
  {
    $facet: {
      data: [
        {
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
            likeRank: "$likeRank",
            likeCount: "$likeCount",
          }
        }
      ],
      totalCount: [
        {
          $count: "totalCount"
        }
      ]
    }
  },
  {
    $unwind: "$data"
  },
  {
    $addFields: {
      totalCount: { $arrayElemAt: ["$totalCount.totalCount", 0] }
    }
  },
  {
    $replaceRoot: { newRoot: { $mergeObjects: ["$data", { totalCount: "$totalCount" }] } }
  }
];

// 현재 모집 중인 피클: 참가자 비교 + 아직 데드 라인 지나지 않음
export const filterRecruitingPickles = async ({now, page, user, query}) => {
  const basePipeline = [
    deadlineFilter(now),
    ...participationCountFilter('greater'),
    areaCodeFilter(user),
    ...queryFilter(query),
    ...pickleDto,
  ];
  return await applyFilters(basePipeline, [...paginationFilter(page)]);
};

// 인기 급상승
export const realtimeTrendingPickleFilter = async ({now, page, category, user}) => {
  const basePipeline = [
    deadlineFilter(now),
    realtimeTrendingFilter(now),
    ...participationCountFilter('greater'),
    categoryFilter(category),
    areaCodeFilter(user),
    ...likeLankFilter(),
    ...pickleDto,
  ];

  const result =  await applyFilters(basePipeline, [...paginationFilter(page)]);
  return result;
}

// 마감 임박
export const hotTimePicklesFilter = async ({now, page, category, user}) => {
  const basePipeline = [
    deadlineFilter(now), // 동적으로 현재 시간 기준으로 필터 생성
    hotTimeFilter(now),
    ...participationCountFilter('greater'),
    categoryFilter(category),
    areaCodeFilter(user),
    ...likeLankFilter(),
    ...pickleDto,
  ];

  return await applyFilters(basePipeline, [...paginationFilter(page)]);
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

const categoryFilter = (category) => {
  if (!category || category === "all") {
    return { $match: {} }; // 빈 조건으로 모든 문서를 포함
  }
  return {
    $match: {
      category: category
    }
  };
};

const areaCodeFilter = (user) => {
  if (!user) return { $match: {} };

  const userAreaCodes = user.areaCodes;
  if (!userAreaCodes || userAreaCodes.length === 0) return { $match: {} }; // 사용자 지역 코드가 없으면 빈 매치를 반환

  const userAreaCodePrefixes = userAreaCodes.map((code) => Math.floor(code / 100000));
  return {
    $match: {
      $expr: {
        $in: [{ $toInt: { $divide: ["$areaCode", 100000] } }, userAreaCodePrefixes],
      },
    },
  };
};

const queryFilter = (query) => {
  switch (query) {
    case "인기순":
    case "popular":
      return likeLankFilter();

    case "가격 낮은 순":
    case "lowPrice":
      return costFilter("lowPrice");

    case "가격 높은 순":
    case "highPrice":
      return costFilter("highPrice");

    case "recent":
      // pickles.sort((a, b) => b.createAt - a.createAt);
      // return pickles;

    case "전체":
      return [];

    default:
      return [];
  }
};

const costFilter = (condition) => {
  switch (condition) {
    case "highPrice":
      return [
        {
          $sort: {
            cost: -1
          }
        }
      ]

    case "lowPrice":
      return [
        {
          $sort: {
            cost: 1
          }
        }
      ]
  }
}

const realtimeTrendingFilter = (now) => {
  return {
    $match: {
      $expr: {
        $gt: [
          { $add: ["$createdAt", 24 * 60 * 60 * 1000] }, // createdAt + 24시간
          now
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

const likeLankFilter = () => {
  return [
    {
      $lookup: {
        from: "favorites", // 조인할 컬렉션 이름
        localField: "_id", // 조인할 필드 (pickle의 _id)
        foreignField: "pickleId", // 조인될 필드 (favorite의 pickleId)
        as: "likes" // 조인 결과를 저장할 필드 이름
      }
    },
    {
      $addFields: {
        likeCount: { $size: "$likes" } // 조인된 결과 배열의 크기를 계산하여 likeCount 필드를 추가
      }
    },
    {
      $addFields: {
        likeRank: {
          $add: [
            { $ifNull: ["$viewCount", 0] },
            { $multiply: [{ $ifNull: ["$likeCount", 0] }, LIKE_RANK] },
            { $multiply: [{ $ifNull: ["$participationCount", 0] }, PARTICIPANT_RANK] }
          ]
        }
      }
    },
    {
      $sort: {
        likeRank: -1 // likeRank 기준으로 내림차순 정렬
      }
    },
  ]
}

const paginationFilter = (page = 1) => {
  const skip = (page - 1) * PAGINATION_LIMIT;
  return [
    { $skip: skip },
    { $limit: PAGINATION_LIMIT }
  ]
}

export const applyFilters = async (basePipeline, additionalFilters) => {
  const pipeline = [...basePipeline, ...additionalFilters];
  const results = await Pickle.aggregate(pipeline);
  return results
};

// 어그리게이션을 위한 dto
export const pickleDto = [
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

export const myPickleDto = [
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
            detailedAddress: 1,
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
            // status: { $literal: status }, // 추가된 status 필드
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
]
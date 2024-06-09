export const PICKLE_FILTER = {
  NOT_EXPIRED: {
    deadLine: { $gt: new Date() },
  },

  NOT_STARTED: {
    $expr: { $gt: [{ $arrayElemAt: ["$when.times", 0] }, new Date()]},
  },

  READY_TO_START: {
    $and: [
      { $expr: { $gte: [new Date(), { $arrayElemAt: ["$when.times", 0] }] } }, // 첫 번째 요소보다 크거나 같은
      { $expr: { $lte: [new Date(), { $arrayElemAt: ["$when.times", -1] }] } } // 마지막 요소보다 작거나 같은
    ],
  },

  FINISHED: {
    $expr: { $gt: [new Date(), { $arrayElemAt: ["$when.times", -1] }] }, // 첫 번째 요소보다 크거나 같은
  },

  NEARBY: (parsedLatitude, parsedLongitude, radiusInDegrees) => {
    return {
      latitude: {
        $gte: parsedLatitude - radiusInDegrees,
        $lte: parsedLatitude + radiusInDegrees,
      },
      longitude: {
        $gte: parsedLongitude - radiusInDegrees,
        $lte: parsedLongitude + radiusInDegrees,
      },
    }
  },

  POPULAR: {
    createdAt: { $gte: new Date().setHours(0, 0, 0, 0), $lte: new Date().setHours(23, 59, 59, 999)},
  },

  HOT_TIME: {
    deadLine: (oneDayLater) => {
      return {$gte: new Date(), $lte: oneDayLater}
    },
  }
}
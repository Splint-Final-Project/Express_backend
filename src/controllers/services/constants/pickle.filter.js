export const PICKLE_FILTER = {
  NOT_EXPIRED: {
    deadLine: { $gt: new Date() },
  },

  EXPIRED: {
    deadLine: { $lt: new Date() },
  },

  NOT_STARTED: {
    $expr: { $gt: [{ $arrayElemAt: ["$when.times", 0] }, new Date()] },
  },

  READY_TO_START: (today) => {
    return { $expr: { $lte: [today, { $arrayElemAt: ["$when.times", -1] }] } }; // 마지막 요소보다 작거나 같은
  },

  FINISHED: {
    $expr: { $gt: [new Date(), { $arrayElemAt: ["$when.times", -1] }] }, // 마지막 요소보다 크거나 같은
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
    };
  },

  POPULAR: {
    createdAt: {
      $gte: new Date().setUTCHours(0, 0, 0, 0),
      $lte: new Date().setUTCHours(23, 59, 59, 999),
    },
  },

  HOT_TIME: (oneDayLater) => {
    return { deadLine: { $gte: new Date(), $lte: oneDayLater } };
  },
};

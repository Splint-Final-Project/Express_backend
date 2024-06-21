export const minimumFormatPickle = (pickle) => {
  return {
    id: pickle._id,
    title: pickle.title,
    imgUrl: pickle.imgUrl,
    capacity: pickle.capacity,
    deadLine: pickle.deadLine,
    place: pickle.place,
    when: pickle.when,
    cost: pickle.cost,
    latitude: pickle.latitude,
    longitude: pickle.longitude,
    category: pickle.category,
    participantNumber: pickle.participantNumber,
  };
};

export const myPickleFormat = (pickle, status) => {
  return {
    id: pickle._id,
    title: pickle.title,
    imgUrl: pickle.imgUrl,
    capacity: pickle.capacity,
    deadLine: pickle.deadLine,
    place: pickle.place,
    when: pickle.when,
    cost: pickle.cost,
    latitude: pickle.latitude,
    longitude: pickle.longitude,
    category: pickle.category,
    participantNumber: pickle.participantNumber,
    latitude: pickle.latitude,
    longitude: pickle.longitude,
    detailAddress: pickle.detailedAddress,
    today: pickle.today,
  }
};

export const finishedPickleFormat = (pickle, status) => {
  return {
    id: pickle._id,
    title: pickle.title,
    imgUrl: pickle.imgUrl,
    capacity: pickle.capacity,
    deadLine: pickle.deadLine,
    place: pickle.place,
    when: pickle.when,
    cost: pickle.cost,
    latitude: pickle.latitude,
    longitude: pickle.longitude,
    category: pickle.category,
    participantNumber: pickle.participantNumber,
    latitude: pickle.latitude,
    longitude: pickle.longitude,
    detailAddress: pickle.detailedAddress,
    today: pickle.today,
    isCanceled: boolean,
  }
};

export const pickleEditFormat = (pickle) => {
  return {
    title: pickle.title,
    category: pickle.category,
    explanation: pickle.explanation,
    imgUrl: pickle.imgUrl,
    goals: pickle.goals,
  };
};

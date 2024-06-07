export const minimumFormatPickle = (pickle) => {
  return {
    id: pickle._id,
    title: pickle.title,
    capacity: pickle.capacity,
    participants: pickle.participants,
    deadLine: pickle.deadLine,
    where: pickle.where,
    when: pickle.when,
    cost: pickle.cost,
    latitude: pickle.latitude,
    longitude: pickle.longitude,
    category: pickle.category
  };
}

export const pickleEditFormat = (pickle) => {
  return {
    title: pickle.title,
    capacity: pickle.capacity,
    explanation: pickle.explanation,
    deadLine: pickle.deadLine,
  }
}
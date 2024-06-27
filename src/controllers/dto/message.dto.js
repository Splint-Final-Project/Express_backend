export const messageDto = (message, user) => {
  return {
    _id: message._id,
    senderId: message.senderId,
    receivers: message.receivers,
    isTrack: message.isTrack,
    message: message.message,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    profilePic: user.profilePic,
    senderNickname: user.nickname,
  }
}
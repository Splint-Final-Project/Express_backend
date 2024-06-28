export const messageDto = (message, user, unReadNumber) => {
  return {
    _id: message._id,
    senderId: message.senderId,
    isTrack: message.isTrack,
    message: message.message,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    profilePic: user.profilePic,
    senderNickname: user.nickname,
    unReadNumber: unReadNumber
  }
}
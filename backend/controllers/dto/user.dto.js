export const userEditFormat = (user) => {
  return {
    nickname: user.nickname,
    areaCodes: user.areaCodes,
    profilePic: user.profilePic
  }
}
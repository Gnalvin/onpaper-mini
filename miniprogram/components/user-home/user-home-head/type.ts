export type IData = {
  loginUser: {
    userId: string
    userName: string
    avatar: string
  } | null
}
export type IProperty = {
  profile: {
    type: typeof Object
    value: {}
  }
  isFocus: {
    type: typeof Number
    value: 0
  }
  isOwner: {
    type: typeof Boolean
    value: false
  }
}
export type IMethod = {
  handleEditProfile: () => void
  handleSetting: () => void
  handleFoucsUser: () => void
  handleGoToChat: () => void
  goToShowMore: () => void
  handleGoToFans: (e: WechatMiniprogram.CustomEvent) => void
}

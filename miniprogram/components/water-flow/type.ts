export type IData = {
  datas: basicArtType[]
  leftList: basicArtType[]
  rightList: basicArtType[]
  leftHeight: number
  rightHeight: number
}
export type IProperty = {
  gap: {
    type: typeof Number
    value: 8
  }
  padding: {
    type: typeof Number
    value: 8
  }
  // 点击头像是否跳转主页
  noAvatarJump: {
    type: typeof Boolean
    value: false
  }
}
export type IMethod = {
  renderWaterFlow: (data: basicArtType[], succsee?: () => void) => void
  _render: (data: basicArtType[], i: number, succsee?: () => void) => void
  _calculatePicWidthAndHeight: (item: basicArtType) => void
  reSetData: (force: boolean) => void
}

export type basicArtType = {
  artworkId: string
  height: number
  width: number
  firstPic: string
  likes: number
  userAvatar: string
  userName: string
  userId: string
}

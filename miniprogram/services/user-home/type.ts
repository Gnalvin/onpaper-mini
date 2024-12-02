//请求传回来的 profile 数据类型
export interface IProfileData {
  userId: string
  userName: string
  email: string
  sex: string
  birthday: birthdayType
  avatarName: string
  bannerName: string
  createTime: string
  introduce: string
  workEmail: string
  Weibo: string
  QQ: string
  Pixiv: string
  Twitter: string
  WeChat: string
  Bilibili: string
  address: string
  expectWork: string
  createStyle: string
  software: string
  count: userCount
}

type birthdayType = {
  Time: string
  Valid: boolean
}

export interface userCount {
  artCount: number
  collectCount: number
  collects: number
  fans: number
  following: number
  likes: number
  trendCount: number
}

//作品展示信息
export interface IArtwork {
  artworkId: string
  title: string
  userId: string
  cover: string
  zone: string
  picCount: number
  firstPic: string
  userAvatar: string
  userName: string
  whoSee: 'public' | 'onlyFans' | 'privacy'
  isDelete: boolean
  adults: Boolean
  likes: number
  isOwner: boolean
  views: number
  collects: number
  createAT: string
}

//用户收藏的作品信息
export interface ICollectArtwork {
  artworkId: string
  title: string
  userId: string
  userName: string
  userAvatar: string
  picCount: number
  cover: string
  zone: string
  whoSee: 'public' | 'onlyFans' | 'privacy'
  isDelete: boolean
  adults: Boolean
  isOwner?: boolean
}

export interface IUserSmallCard {
  userId: string
  userName: string
  avatar: string
  vTag: string
  vStatus: number
  introduce: string
  count: {
    fans: number
    likes: number
    collects: number
    following: number
    trendCount: number
    artCount: number
    collectCount: number
  }
  isFocus: 0 | 1 | 2
}

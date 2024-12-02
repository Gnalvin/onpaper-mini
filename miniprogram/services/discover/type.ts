export type userQuery = {
  next: string
  type: 'hot' | 'new' | 'active'
}

export interface IUserInfo {
  userId: string
  userName: string
  avatar: string
  isFocus: boolean
  tags: string[]
  artworks: {
    artworkId: string
    userId: string
    cover: string
  }[]
  count: {
    artCount: number // 作品数
    collectCount: number // 收藏作品数
    collects: number // 被收藏数
    fans: number // 粉丝数
    following: number // 关注数
    likes: number // 被点赞数
    trendCount: number // 动态数
  }
  vStatus: 0 | 1 | 2
  vTag: string
}

export type zoneQuery = {
  next: string
  zone: string
  sort: 'hot' | 'new'
  page: number
}

export interface IArtwork {
  adults: boolean
  artworkId: string
  cover: string
  createAT: string
  firstPic: string
  height: number
  isDelete: boolean
  isOwner: boolean
  picCount: number
  title: string
  userAvatar: string
  userId: string
  userName: string
  width: number
}

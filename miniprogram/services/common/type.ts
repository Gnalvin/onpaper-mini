export interface IStsToken {
  token: stsToken
  fileName: string[]
}

interface stsToken {
  accessKeyId: string
  accessKeySecret: string
  securityToken: string
  expiration: string
}

export interface IStsQuery {
  type: 'avatars' | 'banners' | 'messages' | 'artworks' | 'trends'
  count: number
}

// 发送关注作者后 返回的数据类型
export interface IPostUserFocusResult {
  focusId: string
  isCancel: boolean
}

export interface IRecommendUser {
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

// 返回的的单个作品信息
export interface IArtworkInfoData {
  artworkId: string
  title: string
  userId: string
  intro: string
  picCount: number
  cover: string
  zone: string
  whoSee: string
  adults: Boolean
  comSetting: 'public' | 'onlyFans' | 'close'
  copyright: string
  likes: number
  views: number
  comments: number
  userName: string
  avatarName: string
  collects: number
  interact: { isCollect: boolean; isFocusAuthor: 0 | 1 | 2; isLike: boolean }
  userCount: { likes: number; fans: number; collects: number }
  isOwner: boolean
  createAT: string
  tag: { tag: string; tagId: string }[]
  picture: {
    fileName: string
    sort: number
    size: number
    width: null
    height: number
  }[]
  otherArtwork: IOtherArtworkData[]
}

//作者作品的其他信息
export type IOtherArtworkData = { artworkId: string; cover: string }

// 发送点赞收藏作品后返回的数据类型
export interface IInteractResult {
  authorId: string
  isCancel: boolean
  msgId: string
  type: 'aw' | 'tr'
}

// 上传保存作品信息接口 需要的数据
export interface IArtworkFormData {
  title: string
  description: string
  fileList: { fileName: string; sort: number; width: number; height: number }[]
  zone: string
  whoSee: string
  tags: string[]
  adult: boolean | null
  cover: string
  comment: string
  copyright: string
  device: 'WeChat'
}

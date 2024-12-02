// 发送点赞后返回的数据类型
export interface IInteractData {
  authorId: string
  isCancel: boolean
  msgId: string
  type: 'aw' | 'tr'
}

export interface ITrend {
  trendId: string
  userId: string
  userName: string
  avatar: string
  createAt: string
  pics: picsType[]
  topic: { text: string; topicId: string }
  intro: string
  count: {
    likes: number
    forwards: number
    comments: number
    views: number
    collects: number
  }
  comment: 'public' | 'close' | 'onlyFans'
  whoSee: 'public' | 'privacy' | 'onlyFans'
  forwardInfo: { id: string; type: string }
  forward?: ITrend
  interact: {
    isFocusAuthor: 0 | 1 | 2
    isLike: boolean
  }
  isDelete: boolean
  type: 'aw' | 'tr'
  vStatus: number
  vTag: string
}

export type picsType = {
  fileName: string
  sort: number
  height: number
  width: number
  preShowUrl: string
  highQuality: string
}

// 上传的数据需要的格式
export interface ITrendFormData {
  text: string
  whoSee: 'public' | 'onlyFans' | 'privacy'
  comment: 'public' | 'onlyFans' | 'close'
  topic: { text: string; topicId: string }
  forwardInfo: { id: string; type: string }
  fileList: { fileName: string; sort: number; width: number; height: number }[]
}

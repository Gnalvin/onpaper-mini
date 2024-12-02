// 返回的评论数据类型
export type ICommentType = {
  cId: string
  ownId: string
  ownType: 'aw' | 'tr'
  userId: string
  avatar: string
  userName: string
  replyId: string
  replyUserId: string
  replyUserName: string
  rootId: string
  rootCount: number
  text: string
  likes: number
  sore: number
  isLike: boolean
  isDelete: boolean
  vStatus: number
  vTag: string
  createAT: string
  childComments: ICommentType[]
}

//发布作品的数据类型
export interface IPostCommentData {
  ownId: string // 作品或动态的id
  replyId: string // 回复的是哪个评论
  replyUserId: string // 回复的是哪个用户
  rootId: string // 回复的评论属于哪个根回复
  replyUserName: string // 回复用户的名字
  text: string //回复的内容
  type: 'tr' | 'aw' // 属于aw 还是tr 回复
  senderName: string // 发送人
  senderAvatar: string //发送人头像
}

//  评论点赞需要的数据
export interface IPostLikeData {
  cId: string
  authorId: string
  isCancel: boolean
}

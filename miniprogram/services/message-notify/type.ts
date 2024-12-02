export interface IUnreadCount {
  like: number
  collect: number
  follow: number
  comment: number
  commission: number
  at: number
}

export interface INotifyBody<T = any> {
  notifyId: string
  targetId: string
  type: 'remind'
  action: 'collect' | 'like' | 'focus' | 'comment' | 'update'
  targetType: 'aw' | 'tr' | 'usr' | 'cm' | 'com'
  sender: {
    userId: string
    userName: string
    avatar: string
  }
  receiverId: string
  updateAt: string
  content: T
}

export type artAndTrendContent = {
  title: string
  cover: string
  id: string
  text: string
}

export interface ICommentNotify {
  sendContent: string
  sendCId: string
  beReplyContent: string
  beReplyCId: string
  ownType: 'aw' | 'tr'
  ownId: string
  author: string
  cover: string
  isLike: boolean
  ownerIsDel: boolean
  sendIsDel: boolean
}

export interface ILikeCommentNotify {
  beLikeCId: string
  beLikeContent: string
  cover: string
  ownerIsDel: boolean
  ownId: string
  author: string
  ownType: 'aw' | 'tr'
  rootId: string
  commentIsDel: boolean
}

export interface ICommissionNotify {
  inviteId: string
  status: 0 | 1 | 2 | 3 | -1 | -2
  text: string
  cover: string
  owner: string
}

export interface IChatRelation {
  sender: IUserInfo
  receiver: IUserInfo
  chatId: string
  unread: number
  message: IMessage[]
}

export interface IMessage {
  chatId?: string
  msgId: string
  sender: string
  receiver: string
  content: string
  msgType: 'text' | 'pic'
  sendTime: string
  showTime?: string
  width?: number | string
  height?: number | string
}

export type IUserInfo = {
  userId: string
  userName: string
  avatar: string
}

export type IQueryMsgRecord = {
  sender: string
  receiver: string
  chatid: string
  nextid: string
}

export type ISendMessage = {
  sender: string
  receiver: string
  content: string
  msgType: string
  width?: number
  height?: number
}

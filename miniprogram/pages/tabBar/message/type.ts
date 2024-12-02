import {
  IUnreadCount,
  IChatRelation,
  IMessage
} from '../../../services/message-notify/type'

export interface IPageData {
  isLogin: boolean
  unread: IUnreadCount
  chatList: IChatRelation[]
  chatListEnd: boolean
  zeroChat: boolean
}
export interface IPageFn {
  getUnreadCountAction: () => Promise<any>
  getChatListAction: () => Promise<any>
  handleGotoLogin: () => void
  handleGoToNotify: (e: WechatMiniprogram.CustomEvent) => void
  handleGoToChat: (
    e: WechatMiniprogram.CustomEvent<any, any, { chat: IChatRelation }>
  ) => void
  updateChatListMsg: (msg: IMessage) => void
}

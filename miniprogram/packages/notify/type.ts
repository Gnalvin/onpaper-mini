import {
  INotifyBody,
  ICommentNotify,
  ILikeCommentNotify
} from '../../services/message-notify/type'
export type notifyType = 'like' | 'focus' | 'comment' | 'commission' | ''

export interface IPageData {
  notifyType: notifyType
  notifys: INotifyBody[]
  isShowCommentInput: boolean
  zeroMsg: boolean
  isEnd: boolean
  commentInfo: {
    replyUserName: string
    replyUserId: string
    ownId: string
    ownType: string
    rootId: string
  } | null
}
export interface IPageFn {
  getNotifyAction: () => Promise<any>
  getLikeAndCollectAction: (nextId: string) => Promise<any>
  getFocusAction: (nextId: string) => Promise<any>
  getCommentNotifyAction: (nextId: string) => Promise<any>
  getCommissionAction: (nextId: string) => Promise<any>
  handleClickCover: (e: WechatMiniprogram.CustomEvent) => void
  handleFocusUser: (e: WechatMiniprogram.CustomEvent) => void
  handleLikeComment: (e: WechatMiniprogram.CustomEvent) => void
  handleReplyComment: (e: WechatMiniprogram.CustomEvent) => void
  goToContentDeatil: (
    e: WechatMiniprogram.CustomEvent | null,
    data?: INotifyBody
  ) => void
  goToUserHome: (e: WechatMiniprogram.CustomEvent) => void
  handleCloseCommentInput: () => void
  handleCommentSuccess: () => void
}

export { INotifyBody, ICommentNotify, ILikeCommentNotify }

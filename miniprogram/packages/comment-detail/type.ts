import { ICommentType, IPostLikeData } from '../../services/comment/type'
import { IData, IProperty, IMethod } from '../../components/comment-input/type'

export type artworkPageIns = WechatMiniprogram.Page.Instance<IPageData, IPageFn>

export interface IPageData {
  rootComment: ICommentType | null
  childComments: ICommentType[]
  commentEnd: Boolean
  zeroComment: Boolean
  commentInputIns: WechatMiniprogram.Component.Instance<
    IData,
    IProperty,
    IMethod
  > | null
  isCanComment: Boolean
  tempHeight: number
  windowHeight: number
}

export interface IPageFn {
  getChildCommemtAction: () => Promise<any>
  getRootCommentAction: (rootId: string) => Promise<any>
  handleShowReplyInput: (e: WechatMiniprogram.CustomEvent<ICommentType>) => void
  handlePostCommentSuccess: (
    e: WechatMiniprogram.CustomEvent<ICommentType>
  ) => void
  handlePostCommentLike: (
    e: WechatMiniprogram.CustomEvent<IPostLikeData>
  ) => void
  inputFocus: () => void
  handleBlur: () => void
}

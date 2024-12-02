import { ITrend } from '../../services/trend/type'
import { ICommentType, IPostLikeData } from '../../services/comment/type'
import { IData, IProperty, IMethod } from '../../components/comment-input/type'

export type trendPageIns = WechatMiniprogram.Page.Instance<IPageData, IPageFn>

export interface IPageData {
  isNoExist: boolean
  trendInfo: ITrend | null
  zeroComment: boolean
  commentEnd: boolean
  comments: ICommentType[]
  commentInputIns: WechatMiniprogram.Component.Instance<
    IData,
    IProperty,
    IMethod
  > | null
  tempHeight: number
  windowHeight: number
}

export interface IPageFn {
  getTrendInfo: (trendId: string) => void
  getCommentAction: (trendId: string) => void
  getNextCommentAction: () => void
  handleFocusUser: () => void
  handlePostTrendLike: (
    e: WechatMiniprogram.CustomEvent<{ isLike: boolean }>
  ) => void
  handlePostCommentLike: (
    e: WechatMiniprogram.CustomEvent<IPostLikeData>
  ) => void
  changeCommentStauts: (data: IPostLikeData) => void
  handleShowReplyInput: (e: WechatMiniprogram.CustomEvent<ICommentType>) => void
  handlePostCommentSuccess: (
    e: WechatMiniprogram.CustomEvent<ICommentType>
  ) => void
  handleBlur: () => void
}

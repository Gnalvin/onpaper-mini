import { ICommentType, IPostLikeData } from '../../services/comment/type'
import { IArtworkInfoData } from '../../services/artwork/type'
import { IData, IProperty, IMethod } from '../../components/comment-input/type'

export type artworkPageIns = WechatMiniprogram.Page.Instance<IPageData, IPageFn>

export interface IPageData {
  noExist: boolean // 作品是否存在
  artInfo: IArtworkInfoData | null
  zeroComment: boolean
  commentEnd: boolean
  comments: ICommentType[]
  swiperHeight: number
  swiperIndex: number
  commentInputIns: WechatMiniprogram.Component.Instance<
    IData,
    IProperty,
    IMethod
  > | null
  windowHeight: number
  tempHeight: number
  pagesCount: number
}

export interface IPageFn {
  getArtworkInfo: (artId: string) => void
  getCommentAction: (artId: string) => void
  getNextCommentAction: () => void
  handleShowReplyInput: (e: WechatMiniprogram.CustomEvent<ICommentType>) => void
  handleSwiperChange: (e: WechatMiniprogram.CustomEvent) => void
  handleCopyRightTip: () => void
  handlePreviewPic: (e: WechatMiniprogram.CustomEvent) => void
  handlePostCommentSuccess: (
    e: WechatMiniprogram.CustomEvent<ICommentType>
  ) => void
  navGoBack: () => void
  handlePostArtLike: () => void
  handlePostCollect: () => void
  handlePostCommentLike: (
    e: WechatMiniprogram.CustomEvent<IPostLikeData>
  ) => void
  changeCommentStauts: (data: IPostLikeData) => void
  handleFocusUser: () => void
  handleBlur: () => void
  goToUserHome: () => void
  goToTagPage: (e: WechatMiniprogram.CustomEvent) => void
}

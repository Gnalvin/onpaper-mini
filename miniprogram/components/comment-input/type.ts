import { ICommentType, IPostCommentData } from '../../services/comment/type'

export type IData = {
  safeBottomHight: number
  keyboardHeight: number
  commentText: string
  loginUser: { avatar: string; userId: string; userName: string }
  replyCommentInfo: IPostCommentData | null
  disablePlaceholder: string
  isFocus: boolean
}
export type IProperty = {
  likes: {
    type: typeof Number
    value: 0
  }
  comments: {
    type: typeof Number
    value: 0
  }
  collects: {
    type: typeof Number
    value: 0
  }
  placeholder: {
    type: typeof String
    value: '发布你的评论'
  }
  isInDetailPage: {
    type: typeof Boolean
    value: false
  }
  ownId: {
    type: typeof String
    value: ''
  }
  replyUserId: {
    type: typeof String
    value: ''
  }
  ownType: {
    type: typeof String
    value: ''
  }
  rootId: {
    type: typeof String
    value: ''
  }
  interact: {
    type: typeof Object
    value: {}
  }
  // 动态或作品的评论权限
  comSetting: {
    type: typeof String
    value: ''
  }
  // 是否是动态或作品的 作者
  isOwner: {
    type: typeof Boolean
    value: false
  }
}

export type IMethod = {
  handleInputFocus: (e: WechatMiniprogram.CustomEvent) => void
  handleInputBlur: () => void
  handleInput: (e: WechatMiniprogram.CustomEvent) => void
  handleSaveComment: () => void
  saveReplyData: (data: ICommentType) => void
  focus: () => void
  postLike: () => void
  postCollect: () => void
  verifyIsLogin: () => void
}

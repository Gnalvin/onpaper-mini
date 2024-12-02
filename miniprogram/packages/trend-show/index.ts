// packages/trend-show/index.ts
import router from '../../routers/index'
import {
  getTrendDetailRequest,
  postTrendLikeRequest
} from '../../services/trend/index'
import { formatTrendData } from '../../components/trend-item/handle'
import {
  getRootCommentRequest,
  postLikeCommentRequest
} from '../../services/comment/index'
import { postUserFocusRequest } from '../../services/common/index'
import { saveComment, addRootComment, saveNewComment } from './handle'
import { IPageData, IPageFn } from './type'

const systemInfo = wx.getSystemInfoSync()

Page<IPageData, IPageFn>({
  data: {
    isNoExist: false,
    trendInfo: null,
    comments: [],
    commentEnd: false,
    zeroComment: false,
    commentInputIns: null,
    tempHeight: 0,
    windowHeight: 0
  },
  onLoad(e: { trendId: string }) {
    this.data.windowHeight = systemInfo.windowHeight
    this.getTrendInfo(e.trendId)
  },
  onReachBottom() {
    if (!this.data.trendInfo) return
    this.getNextCommentAction()
  },
  async getTrendInfo(trendId: string) {
    const res = await getTrendDetailRequest(trendId)
    if (res.statusCode === 1021) {
      this.setData({ isNoExist: true })
      setTimeout(() => {
        router.back()
      }, 3000)
      return
    }
    if (res.statusCode === 200) {
      const trendInfo = formatTrendData(res.data)
      this.setData({ trendInfo })
      // 成功之后获取评论
      this.getCommentAction(trendId)
      // @ts-ignore
      this.data.commentInputIns = this.selectComponent('#comment-input')
    }
  },
  //获取作品评论数据
  async getCommentAction(artId: string) {
    const result = await getRootCommentRequest(artId, 'aw')
    //如果请求成功有评论 保存数据
    if (result.statusCode === 200) {
      saveComment(result.data, this)
    }
    //如果没有评论
    if (result.statusCode === 1017)
      this.setData({ zeroComment: true, commentEnd: true })
  },
  async getNextCommentAction() {
    //如果最后一组评论已经获取到不再发送
    if (this.data.commentEnd) return
    if (this.data.comments.length == 0) return
    const trendId = this.data.trendInfo!.trendId
    const lastComment = this.data.comments[this.data.comments.length - 1]
    const { cId, sore } = lastComment
    const result = await getRootCommentRequest(trendId, 'tr', cId, sore)
    if (result.statusCode === 200) addRootComment(result.data, this)
    if (result.statusCode === 1017) this.setData({ commentEnd: true })
  },
  // 关注作者
  async handleFocusUser() {
    const { interact, userId } = this.data.trendInfo!
    const res = await postUserFocusRequest(userId, !!interact.isFocusAuthor)
    if (res.statusCode === 200) {
      if (!res.data.isCancel) {
        interact.isFocusAuthor = 1
      } else {
        interact.isFocusAuthor = 0
      }
      this.data.trendInfo!.interact = interact
      this.setData({ trendInfo: this.data.trendInfo })
    }
  },
  // 点赞动态
  async handlePostTrendLike(e) {
    // 如果是使用input 组件点赞 需要调用网络请求，如果是trendItem 组件修改状态
    if (e.detail === undefined) {
      const { interact, trendId, userId, type } = this.data.trendInfo!
      const isCancel = interact.isLike
      const result = await postTrendLikeRequest(trendId, userId, isCancel, type)
      if (result.statusCode === 200) {
        e.detail = { isLike: !result.data.isCancel }
      } else {
        return
      }
    }
    if (e.detail.isLike) {
      this.data.trendInfo!.count.likes++
      this.data.trendInfo!.interact.isLike = true
    } else {
      this.data.trendInfo!.count.likes--
      this.data.trendInfo!.interact.isLike = false
    }
    this.setData({ trendInfo: this.data.trendInfo })
  },
  // 点赞评论
  async handlePostCommentLike(e) {
    // 点赞评论不管成功与否直接显示
    this.changeCommentStauts(e.detail)
    postLikeCommentRequest(e.detail)
  },
  // 修改评论状态
  changeCommentStauts(data) {
    const { comments } = this.data
    const isLike = !data.isCancel
    const likeComment = comments.find((c) => c.cId === data.cId)
    if (!likeComment) return
    likeComment.isLike = isLike
    if (isLike) likeComment.likes += 1
    if (!isLike) likeComment.likes -= 1
    this.setData({ comments })
  },
  //点击评论显示评论框
  handleShowReplyInput(e) {
    if (e.detail === undefined) {
      this.data.commentInputIns!.focus()
    } else {
      this.data.commentInputIns!.saveReplyData(e.detail)
      this.setData({ tempHeight: this.data.windowHeight / 3 })
      // 滚动到评论的内容附近
      wx.pageScrollTo({
        selector: `#c${e.detail.cId}`,
        offsetTop: -this.data.windowHeight / 3 + 35
      })
    }
  },
  // 输入框失去焦点时 不需要撑起高度
  handleBlur() {
    this.setData({ tempHeight: 0 })
  },
  //发布评论成功
  handlePostCommentSuccess(e) {
    saveNewComment(e.detail, this)
  },
  onShareAppMessage() {
    return {
      title:
        this.data.trendInfo!.intro || this.data.trendInfo!.userName + '的动态'
    }
  }
})

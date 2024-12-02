// packages/comment-detail/index.ts
import router from '../../routers/index'
import {
  getChildCommentRequest,
  postLikeCommentRequest,
  getOneRootCommentRequest
} from '../../services/comment/index'
import { formatAccuracyTime } from '../../utils/format'
import { IPageData, IPageFn } from './type'

const systemInfo = wx.getSystemInfoSync()

Page<IPageData, IPageFn>({
  data: {
    rootComment: null,
    childComments: [],
    commentEnd: false,
    zeroComment: false,
    commentInputIns: null,
    isCanComment: true,
    windowHeight: 0,
    tempHeight: 0
  },
  async onLoad(e: any) {
    this.data.windowHeight = systemInfo.windowHeight
    const query = router.extract(e)
    if (query.isCanComment !== undefined) {
      this.setData({ isCanComment: query.isCanComment })
    }
    // 如果直接传入 rootComment 直接使用 否则通过 rootId 查询
    if (query.rootComment !== undefined) {
      this.setData({ rootComment: query.rootComment })
    }
    if (query.rootId !== undefined) {
      await this.getRootCommentAction(query.rootId)
    }

    // @ts-ignore
    this.data.commentInputIns = this.selectComponent('#comment-input')
    this.getChildCommemtAction()
  },
  onReachBottom() {
    this.getChildCommemtAction()
  },
  async getChildCommemtAction() {
    const { commentEnd, childComments } = this.data
    if (commentEnd) return
    const rid = this.data.rootComment!.cId
    const last = childComments[childComments.length - 1]
    const { cId = '0', sore = 1 } = last || {}
    const result = await getChildCommentRequest(rid, cId, sore)
    if (result.statusCode === 200) {
      const comments = result.data
      //如果小于20 一组说明这是最后一组评论
      if (comments.length < 20) this.setData({ commentEnd: true })
      // 添加评论
      comments.forEach((c) => {
        c.createAT = formatAccuracyTime(c.createAT, 0, true)
        c.ownType = this.data.rootComment!.ownType
        childComments.push(c)
      })
      //赋值查找 replyUser 回复的名字
      childComments.forEach((item) => {
        if (item.replyId === '0') return
        const tempItem = childComments.find((i) => {
          return i.cId === item.replyId
        })
        // 理论上不会找不到 如果找不到 设置成单独回复
        if (!tempItem) {
          console.warn(`no fount replyId ${item.replyId}`, item)
          item.replyId = '0'
          return
        }
        item.replyUserName = tempItem!.userName
        item.replyUserId = tempItem!.userId
      })
      this.setData({ childComments })
    } else if (result.statusCode === 1017) {
      this.setData({ zeroComment: true })
    }
  },
  async getRootCommentAction(rootId) {
    const res = await getOneRootCommentRequest(rootId)
    if (res.statusCode === 200) {
      res.data.createAT = formatAccuracyTime(res.data.createAT, 0, true)
      this.setData({ rootComment: res.data })
    }
  },
  handleShowReplyInput(e) {
    this.data.commentInputIns!.saveReplyData(e.detail)
    this.setData({ tempHeight: this.data.windowHeight / 3 + 35 })
    // 滚动到评论的内容附近
    wx.pageScrollTo({
      selector: `#c${e.detail.cId}`,
      offsetTop: -this.data.windowHeight / 3 + 35
    })
  },
  // 输入框失去焦点时 不需要撑起高度
  handleBlur() {
    this.setData({ tempHeight: 0 })
  },
  //发布评论成功
  handlePostCommentSuccess(e) {
    const newComment = e.detail
    newComment.createAT = formatAccuracyTime(newComment.createAT, 0, true)
    newComment.ownType = this.data.rootComment!.ownType
    //如果是直接回复主评论 在最上面显示
    const comments = this.data.childComments
    if (newComment.replyId === '0') {
      comments.unshift(newComment)
      this.setData({ childComments: comments })
      return
    }
    // 如果是回复的里面的某个子评论 在该子评论底下显示
    const index = comments.findIndex((i) => i.cId === newComment.replyId)
    if (index != undefined) comments.splice(index + 1, 0, newComment)
    this.setData({ childComments: comments })
  },
  // 点赞评论
  handlePostCommentLike(e) {
    // 点赞评论不管成功与否直接显示
    const { childComments, rootComment } = this.data
    const isLike = !e.detail.isCancel
    const isLikeRoot = rootComment!.cId === e.detail.cId
    const likeComment = isLikeRoot
      ? rootComment
      : childComments.find((c) => c.cId === e.detail.cId)

    if (!likeComment) return
    likeComment.isLike = isLike
    if (isLike) likeComment.likes += 1
    if (!isLike) likeComment.likes -= 1
    if (isLikeRoot) {
      this.setData({ rootComment: likeComment })
      // 如果是点赞根评论 修改上一页的点赞状态
      const pages = getCurrentPages()
      const prevPageIns = pages[pages.length - 2] // 上一个页面
      prevPageIns.changeCommentStauts(e.detail)
    } else {
      this.setData({ childComments })
    }
    postLikeCommentRequest(e.detail)
  },
  inputFocus() {
    this.data.commentInputIns!.focus()
  }
})

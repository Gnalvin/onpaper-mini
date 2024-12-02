// packages/notify/index.ts
import {
  IPageData,
  IPageFn,
  notifyType,
  INotifyBody,
  ICommentNotify,
  ILikeCommentNotify
} from './type'
import {
  getLikeAndCollectRequest,
  getFocusNotifyRequest,
  getCommentRequest,
  getCommissionRequest
} from '../../services/message-notify/index'
import { postLikeCommentRequest } from '../../services/comment/index'
import { formatPicUrl, formatUtcToShowTime } from '../../utils/format'
import { postUserFocusRequest } from '../../services/common/index'
import Toast from '@vant/weapp/toast/toast'
import router from '../../routers/index'

Page<IPageData, IPageFn>({
  data: {
    notifyType: '',
    notifys: [],
    isEnd: false,
    zeroMsg: false,
    isShowCommentInput: false,
    commentInfo: null
  },
  async onLoad(e: { type: notifyType }) {
    if (!this.data.notifyType) this.setData({ notifyType: e.type })
    await this.getNotifyAction()
  },
  onReachBottom() {
    if (this.data.isEnd) return
    this.getNotifyAction()
  },
  // 下拉刷新
  async onPullDownRefresh() {
    this.setData({ zeroMsg: false, isEnd: false })
    this.data.notifys = []
    await this.onLoad()
    wx.stopPullDownRefresh() //刷新完成后停止下拉刷新动效
  },
  async getNotifyAction() {
    const { notifys, notifyType } = this.data
    const lastFeed = notifys[notifys.length - 1]
    const nextId = lastFeed ? lastFeed.notifyId : '0'
    if (notifyType === 'like') {
      await this.getLikeAndCollectAction(nextId)
    } else if (notifyType === 'focus') {
      await this.getFocusAction(nextId)
    } else if (notifyType === 'comment') {
      await this.getCommentNotifyAction(nextId)
    } else {
      await this.getCommissionAction(nextId)
    }
  },
  // 获取点赞或收藏提醒
  async getLikeAndCollectAction(nextId) {
    const res = await getLikeAndCollectRequest(nextId)
    if (res.statusCode === 200) {
      const length = res.data.length
      if (length < 20) this.setData({ isEnd: true })
      if (length === 0) this.setData({ zeroMsg: true })
      res.data.forEach((item) => {
        const cover = item.content.cover
        const author = item.content.author
        if (item.targetType == 'aw' || item.content.ownType == 'aw') {
          item.content.cover = formatPicUrl(cover, author, 'cover', 'm')
        } else {
          item.content.cover = cover
            ? formatPicUrl(cover, author, 'trends', 'xs')
            : ''
        }
        item.updateAt = formatUtcToShowTime(item.updateAt)
        this.data.notifys.push(item)
      })
      this.setData({ notifys: this.data.notifys })
    }
  },
  //  获取关注提醒
  async getFocusAction(nextId) {
    const res = await getFocusNotifyRequest(nextId)
    if (res.statusCode === 200) {
      const length = res.data.length
      if (length < 20) this.setData({ isEnd: true })
      if (length === 0) this.setData({ zeroMsg: true })
      res.data.forEach((item) => {
        item.updateAt = formatUtcToShowTime(item.updateAt)
        this.data.notifys.push(item)
      })
      this.setData({ notifys: this.data.notifys })
    }
  },
  // 获取评论提醒
  async getCommentNotifyAction(nextId) {
    const res = await getCommentRequest(nextId)
    if (res.statusCode == 200) {
      const length = res.data.length
      if (length < 20) this.setData({ isEnd: true })
      if (length === 0) this.setData({ zeroMsg: true })
      res.data.forEach((item) => {
        const cover = item.content.cover
        const author = item.content.author
        if (item.content.ownType == 'aw') {
          item.content.cover = formatPicUrl(cover, author, 'cover', 'm')
        } else {
          item.content.cover = cover
            ? formatPicUrl(cover, author, 'trends', 'xs')
            : ''
        }
        item.updateAt = formatUtcToShowTime(item.updateAt)
        this.data.notifys.push(item)
      })
      this.setData({ notifys: this.data.notifys })
    }
  },
  // 获取约稿提醒
  async getCommissionAction(nextId) {
    const res = await getCommissionRequest(nextId)
    if (res.statusCode === 200) {
      const length = res.data.length
      if (length < 20) this.setData({ isEnd: true })
      if (length === 0) this.setData({ zeroMsg: true })
      res.data.forEach((item) => {
        const { cover, owner } = item.content
        item.content.cover = formatPicUrl(cover, owner, 'commission', '')
        item.updateAt = formatUtcToShowTime(item.updateAt)
        this.data.notifys.push(item)
      })
      this.setData({ notifys: this.data.notifys })
    }
  },
  // 关注请求
  async handleFocusUser(e) {
    const notify = e.currentTarget.dataset.notify as INotifyBody
    const { content, sender } = notify
    const isCancel = content.isFocus > 0
    const result = await postUserFocusRequest(sender.userId, isCancel)
    if (result.statusCode === 200) {
      const notify = this.data.notifys.find(
        (i) => i.sender.userId == sender.userId
      )
      if (!notify) return
      if (!result.data.isCancel) {
        notify.content.isFocus = 2
      } else {
        notify.content.isFocus = 0
      }
      this.setData({ notifys: this.data.notifys })
    }
  },
  // 点赞评论
  async handleLikeComment(e) {
    const notify = e.currentTarget.dataset.notify as INotifyBody
    const { sendCId: cId, isLike } = notify.content as ICommentNotify
    const postData = { cId, authorId: notify.sender.userId, isCancel: isLike }
    const res = await postLikeCommentRequest(postData)
    if (res.statusCode === 200) {
      const notify = this.data.notifys.find(
        (i) => i.content.sendCId == res.data.cId
      )
      if (notify) notify.content.isLike = !res.data.isCancel
      this.setData({ notifys: this.data.notifys })
    }
  },
  // 回复评论
  handleReplyComment(e) {
    let { commentInfo } = this.data
    const notify = e.currentTarget.dataset.notify as INotifyBody
    const { targetType, targetId } = notify
    const { ownId, ownType, sendCId } = notify.content as ICommentNotify
    // targetType 是cm targetId 就是 根回复的id
    const rootId = targetType == 'cm' ? targetId : sendCId
    const replyId = targetType == 'cm' ? sendCId : '0'
    commentInfo = {
      replyUserName: notify.sender.userName,
      replyUserId: notify.sender.userId,
      ownId,
      ownType,
      rootId: rootId
    }
    this.setData({ commentInfo, isShowCommentInput: true }, () => {
      // @ts-ignore
      const commentInputIns = this.selectComponent('#comment-input')
      commentInputIns!.saveReplyData({
        ownId,
        cId: replyId,
        userId: commentInfo!.replyUserId,
        userName: commentInfo!.replyUserName,
        ownType: commentInfo!.ownType
      })
    })
  },
  // 关闭评论框
  handleCloseCommentInput() {
    this.setData({ isShowCommentInput: false })
  },
  // 回复评论成功
  handleCommentSuccess() {
    this.handleCloseCommentInput()
    Toast('回复成功 ~')
  },
  // 跳转到内容详情
  goToContentDeatil(e, data) {
    const notify = e?.currentTarget.dataset.notify ?? data
    const { action, targetType, targetId, content } = notify as INotifyBody
    // 查看被喜欢或者收藏作品和动态详情
    if ((action == 'like' && targetType != 'cm') || action == 'collect') {
      if (content.isDelete) {
        Toast('该内容已被删除')
        return
      }
      if (targetType === 'aw') {
        router.push({
          name: 'ArtworkShow',
          query: { artId: targetId }
        })
      } else {
        router.push({
          name: 'TrendShow',
          query: { trendId: targetId }
        })
      }
      return
    }
    // 查看被点赞的评论信息
    if (action == 'like' && notify.targetType == 'cm') {
      const content = notify.content as ILikeCommentNotify
      if (content.commentIsDel) {
        Toast('评论已删除')
        return
      }
      const rootId = content.rootId == '0' ? content.beLikeCId : content.rootId
      router.push({
        name: 'CommentDetail',
        query: { rootId }
      })
      return
    }
    // 查看新增关注的用户信息
    if (action === 'focus') {
      router.push({
        name: 'UserHome',
        query: { uid: notify.sender.userId }
      })
      return
    }
    // 查看评论详情评论
    if (action === 'comment') {
      if (notify.content.sendIsDel) {
        Toast('评论已删除')
        return
      }
      const rootId = targetType == 'cm' ? targetId : notify.content.sendCId
      router.push({
        name: 'CommentDetail',
        query: { rootId }
      })
    }
  },
  // 点击封面跳转
  handleClickCover(e) {
    const notify = e.currentTarget.dataset.notify as INotifyBody
    const { action, targetType } = notify
    // 评论的情况
    if (action === 'comment' || targetType == 'cm') {
      const content = notify.content as ICommentNotify
      if (content.ownerIsDel) {
        Toast('该内容已被删除')
        return
      }
      if (content.ownType == 'aw') {
        router.push({
          name: 'ArtworkShow',
          query: { artId: content.ownId }
        })
      } else {
        router.push({
          name: 'TrendShow',
          query: { trendId: content.ownId }
        })
      }
      return
    }
    this.goToContentDeatil(null, notify)
  },
  // 跳转到用户首页
  goToUserHome(e) {
    router.push({
      name: 'UserHome',
      query: { uid: e.currentTarget.dataset.uid }
    })
  }
})

// packages/artwork-show/index.ts
import router from '../../routers/index'
import {
  getArtworkInfoRequest,
  postArtworkLikeRequest,
  postArtworkCollectRequest
} from '../../services/artwork/index'
import {
  getRootCommentRequest,
  postLikeCommentRequest
} from '../../services/comment/index'
import { postUserFocusRequest } from '../../services/common/index'
import {
  saveComment,
  saveArtInfo,
  calculateSwiperHeight,
  addRootComment,
  saveNewComment
} from './handle'
import Dialog from '@vant/weapp/dialog/dialog'
import { IPageData, IPageFn } from './type'

const systemInfo = wx.getSystemInfoSync()

Page<IPageData, IPageFn>({
  data: {
    artInfo: null,
    noExist: false,
    zeroComment: false,
    commentEnd: false,
    comments: [],
    swiperHeight: 400,
    swiperIndex: 0,
    commentInputIns: null,
    tempHeight: 0,
    windowHeight: 0,
    pagesCount: 0
  },
  onLoad(query: { artId: string }) {
    const pages = getCurrentPages()
    this.setData({ pagesCount: pages.length })

    this.data.windowHeight = systemInfo.windowHeight
    this.getArtworkInfo(query.artId)
  },
  onReachBottom() {
    if (!this.data.artInfo) return
    this.getNextCommentAction()
  },
  async getArtworkInfo(artId) {
    const res = await getArtworkInfoRequest(artId)
    // 如果作品不存在
    if (res.statusCode === 1019) {
      this.setData({ noExist: true })
      setTimeout(() => {
        router.back()
      }, 3000)
    }
    if (res.statusCode == 200) {
      // 成功之后获取评论
      this.getCommentAction(artId)
      calculateSwiperHeight(res.data, this)
      saveArtInfo(res.data, this)
      // @ts-ignore
      this.data.commentInputIns = this.selectComponent('#comment-input')
    }
  },
  //获取作品评论数据
  async getCommentAction(artId: string) {
    const result = await getRootCommentRequest(artId, 'aw')
    //如果请求成功有评论 保存数据
    if (result.statusCode === 200) saveComment(result.data, this)
    //如果没有评论
    if (result.statusCode === 1017)
      this.setData({ zeroComment: true, commentEnd: true })
  },
  async getNextCommentAction() {
    //如果最后一组评论已经获取到不再发送
    if (this.data.commentEnd) return
    if (this.data.comments.length == 0) return
    const artId = this.data.artInfo!.artworkId
    const lastComment = this.data.comments[this.data.comments.length - 1]
    const { cId, sore } = lastComment
    const result = await getRootCommentRequest(artId, 'aw', cId, sore)
    if (result.statusCode === 200) addRootComment(result.data, this)
    if (result.statusCode === 1017) this.setData({ commentEnd: true })
  },
  //发布评论成功
  handlePostCommentSuccess(e) {
    saveNewComment(e.detail, this)
  },
  //点击评论显示评论框
  async handleShowReplyInput(e) {
    this.data.commentInputIns!.saveReplyData(e.detail)
    this.setData({ tempHeight: this.data.windowHeight / 3 })
    // 滚动到评论的内容附近
    wx.pageScrollTo({
      selector: `#c${e.detail.cId}`,
      offsetTop: -this.data.windowHeight / 3
    })
  },
  // 输入框失去焦点时 不需要撑起高度
  handleBlur() {
    this.setData({ tempHeight: 0 })
  },
  // 收藏作品
  async handlePostCollect() {
    const { interact, artworkId, userId } = this.data.artInfo!
    const isCancel = interact.isCollect
    const result = await postArtworkCollectRequest(artworkId, userId, isCancel)
    if (result.statusCode === 200) {
      const { artInfo } = this.data
      if (!isCancel) {
        artInfo!.collects++
        artInfo!.interact.isCollect = true
      } else {
        artInfo!.collects--
        artInfo!.interact.isCollect = false
      }
      this.setData({ artInfo })
    }
  },
  // 点赞作品
  async handlePostArtLike() {
    const { interact, artworkId, userId } = this.data.artInfo!
    const isCancel = interact.isLike
    const result = await postArtworkLikeRequest(artworkId, userId, isCancel)
    if (result.statusCode === 200) {
      const { artInfo } = this.data
      if (!isCancel) {
        artInfo!.likes++
        artInfo!.interact.isLike = true
      } else {
        artInfo!.likes--
        artInfo!.interact.isLike = false
      }
      this.setData({ artInfo })
    }
  },
  // 点赞评论
  async handlePostCommentLike(e) {
    // 点赞评论不管成功与否直接显示
    this.changeCommentStauts(e.detail)
    postLikeCommentRequest(e.detail)
  },
  // 关注作者
  async handleFocusUser() {
    const { interact, userId } = this.data.artInfo!
    const res = await postUserFocusRequest(userId, !!interact.isFocusAuthor)
    if (res.statusCode === 200) {
      if (!res.data.isCancel) {
        interact.isFocusAuthor = 1
      } else {
        interact.isFocusAuthor = 0
      }
      this.data.artInfo!.interact = interact
      this.setData({ artInfo: this.data.artInfo })
    }
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
  handleSwiperChange(e) {
    this.setData({ swiperIndex: e.detail.current })
  },
  //展示版权提示的文字
  handleCopyRightTip() {
    const copyrightMap: Record<string, string> = {
      BY: '使用作品需署名',
      'BY-NC': '使用作品需署名、禁止商业性使用',
      'BY-ND': '使用作品需署名、禁止修改',
      'BY-NC-ND': '使用作品需署名、禁止商业性使用、禁止修改',
      OWNER: '在未经作者明确许可的情况下，他人不得使用此作品，包括转载分享'
    }
    Dialog.alert({
      title: '版权提示',
      message: copyrightMap[this.data.artInfo!.copyright],
      confirmButtonText: '知道啦'
    })
  },
  handlePreviewPic(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.url,
      urls: this.data.artInfo!.picture.map((i) => i.fileName)
    })
  },
  navGoBack() {
    if (this.data.pagesCount > 1) {
      router.back()
    } else {
      router.switchTab({ name: 'TabMainHome' })
    }
  },
  goToUserHome() {
    // 当前登陆用户不跳转
    const loginId = wx.getStorageSync('userId')
    if (loginId === this.data.artInfo!.userId) return
    router.push({
      name: 'UserHome',
      query: { uid: this.data.artInfo!.userId }
    })
  },
  goToTagPage(e) {
    const tagInfo = e.currentTarget.dataset
    router.push({
      name: 'TagPage',
      query: { id: tagInfo.id, name: tagInfo.name }
    })
  },
  onShareAppMessage() {
    return {
      title: this.data.artInfo!.title
    }
  }
})

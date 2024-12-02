// components/comment/index.ts
import router from '../../routers/index'
import { verifyIsLogin } from '../../utils/verify'

Component({
  properties: {
    comment: {
      type: Object,
      value: {}
    },
    // 是否作为子回复楼层展示
    isChildFloor: {
      type: Boolean,
      value: false
    },
    // 是否可以评论
    isCanComment: {
      type: Boolean,
      value: true
    }
  },
  data: {},
  methods: {
    goToCommentReplyDetail() {
      router.push({
        name: 'CommentDetail',
        query: {
          rootComment: this.properties.comment,
          isCanComment: this.properties.isCanComment
        }
      })
    },
    handleClickCommentBody() {
      if (!this.properties.isCanComment) return
      if (!verifyIsLogin()) return
      this.triggerEvent('reply', this.properties.comment)
    },
    //发布点赞事件
    postLike() {
      if (!verifyIsLogin()) return
      const { cId, userId, isLike } = this.properties.comment
      this.triggerEvent('like', { cId, authorId: userId, isCancel: isLike })
    },
    goToUserHome(e: WechatMiniprogram.CustomEvent) {
      console.log(e.currentTarget.dataset.user)
      router.push({
        name: 'UserHome',
        query: { uid: e.currentTarget.dataset.user }
      })
    }
  }
})

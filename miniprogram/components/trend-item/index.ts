// components/trend-item/index.ts
import { cpnQueryRect } from '../../utils/query-rect'
import { postTrendLikeRequest } from '../../services/trend/index'
import { verifyIsLogin } from '../../utils/verify'
import router from '../../routers/index'

Component({
  properties: {
    trend: {
      type: Object,
      value: {}
    },
    // 是否在详情页单一使用
    isInDetail: {
      type: Boolean,
      value: false
    }
  },
  data: {
    isShowTwoLine: false
  },
  lifetimes: {
    async ready() {
      if (this.properties.isInDetail) return
      const wrapRect = await cpnQueryRect('.describe-wrap', this)
      const textRect = await cpnQueryRect('.describe', this)
      if (!textRect) return
      if (textRect.height > wrapRect.height) {
        this.setData({ isShowTwoLine: true })
      }
    }
  },
  methods: {
    // 大部分情况是展示一个item 所以直接在自己组件改状态了
    async postLikeAction() {
      if (!verifyIsLogin()) return
      const { interact, trendId, userId, type } = this.properties.trend
      const isCancel = interact.isLike
      const res = await postTrendLikeRequest(trendId, userId, isCancel, type)
      if (res.statusCode === 200) {
        if (!isCancel) {
          this.properties.trend!.count.likes++
          this.properties.trend!.interact.isLike = true
        } else {
          this.properties.trend!.count.likes--
          this.properties.trend!.interact.isLike = false
        }
        this.setData({ trend: this.properties.trend })
        this.triggerEvent('like', { isLike: !isCancel })
      }
    },
    //跳转详情
    goToDeatil() {
      if (this.properties.isInDetail) return
      if (this.properties.trend.type === 'aw') {
        router.push({
          name: 'ArtworkShow',
          query: { artId: this.data.trend.trendId }
        })
      } else {
        router.push({
          name: 'TrendShow',
          query: { trendId: this.data.trend.trendId }
        })
      }
    },
    //选择菜单
    handleShowMenu() {
      console.log(1)
    },
    handleFocusUser() {
      if (!verifyIsLogin()) return
      this.triggerEvent('foucsUser')
    },
    handleComment() {
      if (!verifyIsLogin()) return
      if (!this.properties.isInDetail) return this.goToDeatil()
      this.triggerEvent('comment')
    },
    goToUseHome() {
      // 当前登陆用户不跳转
      if (getApp().globalData.userId == this.properties.trend.userId) return
      router.push({
        name: 'UserHome',
        query: { uid: this.properties.trend.userId }
      })
    }
  }
})

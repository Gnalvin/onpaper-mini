// pages/tabBar/user/index.ts
import router from '../../../routers/index'
import {
  getUserProfileRequest,
  getUserHomeArtworkRequest,
  getUserHomeCollectRequest
} from '../../../services/user-home/index'
import { getUserHomeTrendRequest } from '../../../services/trend/index'
import { IUserPageData, IUserPageFn, nav } from './type'
import { formatPicUrl } from '../../../utils/format'
import { formatTrendData } from '../../../components/trend-item/handle'
import { throttle } from '../../../utils/throttle'

Page<IUserPageData, IUserPageFn>({
  data: {
    userId: '',
    userProfile: null,
    isLogin: false,
    nav: 'trend',
    trends: [],
    trendEnd: false,
    artworks: [],
    artPage: 1,
    artEnd: false,
    collects: [],
    collectPage: 1,
    collectEnd: false,
    showTopNav: false,
    showEndTip: false,
    showContentTip: false,
    noContentList: [],
    noContentTip: '',
    scrollY: 0
  },
  onLoad() {
    const userId = wx.getStorageSync('userId')
    this.data.userId = userId
    this.setData({ isLogin: !!userId })
    if (this.data.isLogin) {
      this.getUserProfile()
    } else {
      // 没登陆不允许分享页面
      wx.hideShareMenu()
    }
  },
  onPageScroll(options: WechatMiniprogram.Page.IPageScrollOption) {
    this.throttleSetData({ scrollY: options.scrollTop })
    // 控制向下滚动时 出现和隐藏导航栏
    if (options.scrollTop > 75) {
      if (!this.data.showTopNav) {
        this.setData({ showTopNav: true })
        this.setNavigationBarColor('black')
      }
    } else {
      if (this.data.showTopNav) {
        this.setData({ showTopNav: false })
        this.setNavigationBarColor('white')
      }
    }
  },
  // 到底加载更多
  onReachBottom() {
    const { nav, collectEnd, trendEnd, artEnd } = this.data
    if (nav === 'trend') {
      if (trendEnd) return this.setData({ showEndTip: true })
      this.getUserHomeTrend()
    } else if (nav === 'artwork') {
      if (artEnd) return this.setData({ showEndTip: true })
      this.data.artPage += 1
      this.getUserArtwork(this.data.artPage)
    } else {
      if (collectEnd) return this.setData({ showEndTip: true })
      this.data.collectPage += 1
      this.getUserCollect(this.data.collectPage)
    }
  },
  // 设置手机状态栏颜色
  setNavigationBarColor(color) {
    wx.setNavigationBarColor({
      frontColor: color === 'black' ? '#000000' : '#ffffff',
      backgroundColor: '#ffffff',
      animation: {
        duration: 300,
        timingFunc: 'easeIn'
      }
    })
  },
  // 处理导航栏切换
  handleChoseNavBar(e) {
    const navType = e.detail.val as 'trend' | 'collect' | 'artwork'
    if (navType === this.data.nav) return // 没有实际变化不请求
    this.setData({ nav: navType })
    if (this.handleShowNoContent(navType)) return
    this.setData({ showEndTip: false, showContentTip: false })
    if (navType === 'artwork' && this.data.artworks.length === 0) {
      this.getUserArtwork(1)
    } else if (navType === 'collect' && this.data.collects.length === 0) {
      this.getUserCollect(1)
    } else if (navType === 'trend' && this.data.trends.length === 0) {
      this.getUserHomeTrend()
    }
  },
  // 跳转登陆页
  handleGotoLogin() {
    router.push({ name: 'WxLoginPage' })
  },
  //处理是否没有发布过内容
  handleShowNoContent(nav, isShow = false) {
    const isNoHave = this.data.noContentList.indexOf(nav) !== -1
    const msg: Record<nav, string> = {
      trend: '你还没有发布过动态   …（⊙＿⊙；）…',
      collect: '你还没有收藏过作品  ,,Ծ‸Ծ,,',
      artwork: '你还没有发布过作品  õ.Õ?'
    }
    if (isShow) this.data.noContentList.push(nav)
    if (isNoHave || isShow) {
      this.setData({ showContentTip: true, noContentTip: msg[nav] })
    }
    return isNoHave
  },
  throttleSetData: throttle(function (data) {
    // @ts-ignore
    this.setData(data)
  }, 100),
  // 获取用户资料
  async getUserProfile() {
    const res = await getUserProfileRequest(this.data.userId)
    if (res.statusCode === 200) {
      const { profile } = res.data
      // 避免在其他端改变了名字
      wx.setStorageSync('avatar', profile.avatarName)
      wx.setStorageSync('userName', profile.userName)
      profile.bannerName = formatPicUrl(
        profile.bannerName,
        profile.userId,
        'banners',
        'l'
      )
      profile.address = profile.address.replace(/,/g, ' ')
      this.setData({ userProfile: profile })
      //资料请求成功之后请求动态
      this.getUserHomeTrend()
    }
  },
  // 获取用户动态
  async getUserHomeTrend() {
    const { userId, trends } = this.data
    const lastFeed = trends[trends.length - 1]
    const next = lastFeed ? lastFeed.trendId : '0'
    const res = await getUserHomeTrendRequest(userId, next)
    if (res.statusCode === 200) {
      if (res.data.length < 30) {
        this.data.trendEnd = true
        this.setData({ showEndTip: true })
      }
      for (let index = 0; index < res.data.length; index++) {
        const item = res.data[index]
        trends.push(formatTrendData(item))
      }
      this.setData({ trends })
    } else if (res.statusCode === 1032) {
      this.handleShowNoContent('trend', true)
    }
  },
  // 获取用户作品
  async getUserArtwork(page: number) {
    const { userId, artworks } = this.data
    const res = await getUserHomeArtworkRequest(userId, page, 'now')
    if (res.statusCode === 200) {
      const artData = res.data.artworks ?? []
      if (artData.length < 30) {
        this.data.artEnd = true
        this.setData({ showEndTip: true })
      }
      artData.forEach((item) => {
        item.firstPic = formatPicUrl(
          item.firstPic,
          item.userId,
          'artworks',
          's'
        )
        artworks.push(item)
      })
      // 获取瀑布流组件实力
      const waterFlowIns = this.selectComponent('#waterFlow')
      // 调用实例渲染方法
      waterFlowIns.renderWaterFlow(artData)
      this.data.artworks = artworks
    } else if (res.statusCode === 1016) {
      this.handleShowNoContent('artwork', true)
    }
  },
  // 获取用户收藏
  async getUserCollect(page: number) {
    const { userId, collects } = this.data
    const res = await getUserHomeCollectRequest(userId, page)
    if (res.statusCode === 200) {
      const collectDatas = res.data ?? []
      if (collectDatas.length < 30) {
        this.data.collectEnd = true
        this.setData({ showEndTip: true })
      }
      collectDatas.forEach((item) => {
        item.cover = formatPicUrl(item.cover, item.userId, 'cover', 'm')
        collects.push(item)
      })
      this.setData({ collects })
    } else if (res.statusCode === 1028) {
      this.handleShowNoContent('collect', true)
    }
  },
  //暴露给其他页面修改数据
  updateUserProfile(profile) {
    this.setData({ userProfile: profile })
  },
  onShareAppMessage() {
    if (this.data.userProfile) {
      return {
        title: this.data.userProfile!.userName + '的主页',
        path: '/packages/user-home/index?uid=' + this.data.userId
      }
    }
    return
  }
})

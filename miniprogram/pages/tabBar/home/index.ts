// pages/home/index.ts
import { RepeatRequestError } from '../../../services/request/err'
import { getHotArtworkRequest } from '../../../services/home-page/index'
import { getRecommendUserRequest } from '../../../services/common/index'
import { getFeedsRequest } from '../../../services/trend/index'
import { formatPicUrl } from '../../../utils/format'
import { formatTrendData } from '../../../components/trend-item/handle'
import { pageQueryScrollview } from '../../../utils/query-rect'
import { IPageData, IPageFn } from './type'

Page<IPageData, IPageFn>({
  data: {
    isLogin: false,
    choseNav: 'discover',
    tabs: [
      {
        text: '关注',
        value: 'focus'
      },
      {
        text: '发现',
        value: 'discover'
      }
    ],
    feeds: [],
    feedEnd: false,
    recommendUser: [],
    scrollViewHight: 0,
    loading: false,
    isRefresh: false,
    firstLoad: true,
    networkError: false
  },
  onLoad() {
    const userId = wx.getStorageSync('userId')
    this.setData({ isLogin: !!userId, userId })
    this.calculateScrollHight()
    this.getShowData()
  },
  onShow() {
    this.data.firstLoad = true
    setTimeout(() => {
      this.data.firstLoad = false
    }, 1000)
  },
  handleNavBarChose(e) {
    this.setData({ choseNav: e.detail.value })
    this.setData({ isRefresh: true })
  },
  getShowData() {
    if (this.data.choseNav === 'focus') {
      if (!this.data.feedEnd) this.getFeedsAction()
    } else {
      this.getHotArtworkAction()
    }
  },
  async onTabItemTap(item: any) {
    if (item.index !== 0) return
    if (this.data.firstLoad) {
      this.data.firstLoad = false
      return
    }
    const scrollView = await pageQueryScrollview('#scrollview')
    scrollView.scrollTo({ top: 0, duration: 200 })
    setTimeout(() => {
      // 会触发 this.handleScrollViewRefresh
      this.setData({ isRefresh: true })
    }, 350)
  },
  async getHotArtworkAction(isRefresh) {
    if (!isRefresh) {
      if (this.data.loading) return
      this.setData({ loading: true })
    }
    // 获取瀑布流组件实力
    const waterFlowIns = this.selectComponent('#waterFlow')
    try {
      const res = await getHotArtworkRequest()
      if (res.statusCode === 200) {
        res.data.forEach((i) => {
          i.firstPic = formatPicUrl(i.firstPic, i.userId, 'artworks', 's')
        })
        // 调用实例渲染方法
        waterFlowIns.renderWaterFlow(res.data)
      }
    } catch (error) {
      if (!(error instanceof RepeatRequestError)) {
        this.setData({ networkError: true })
        waterFlowIns.reSetData(true)
      }
    }
    this.setData({ loading: false })
  },
  async getFeedsAction(isRefresh) {
    let { feeds, isLogin } = this.data
    if (!isRefresh) {
      if (this.data.loading) return
      this.setData({ loading: true })
    }
    if (!isLogin) {
      await this.getRecommendUserAction(isRefresh)
      this.setData({ loading: false })
      return
    }
    const lastFeed = feeds[feeds.length - 1]
    const next = lastFeed && !isRefresh ? lastFeed.trendId : '0'
    try {
      const res = await getFeedsRequest(next)
      if (res.statusCode === 200) {
        if (isRefresh) feeds = []
        res.data.forEach((item) => {
          feeds.push(formatTrendData(item))
        })
        this.setData({ feeds })
        //小于 30 说明最后一组
        if (res.data.length < 30) this.setData({ feedEnd: true })
        // 如果是查找关注的动态 但是没有人发布过动态
        if (next === '0' && this.data.feeds.length == 0) {
          await this.getRecommendUserAction(isRefresh)
        }
      }
    } catch (error) {
      if (!(error instanceof RepeatRequestError)) {
        this.setData({ networkError: true })
      }
    }
    this.setData({ loading: false })
  },
  async getRecommendUserAction(isRefresh) {
    if (this.data.recommendUser.length !== 0 && !isRefresh) return
    const res = await getRecommendUserRequest()
    if (res.statusCode === 200) {
      if (isRefresh) this.setData({ recommendUser: [] })
      res.data.forEach((item) => {
        item.artworks.forEach((art) => {
          art.cover = formatPicUrl(art.cover, art.userId, 'cover', 'm')
        })
        this.data.recommendUser.push(item)
      })
    }
    this.setData({ recommendUser: this.data.recommendUser, loading: false })
  },
  async handleScrollViewRefresh() {
    this.setData({ networkError: false, recommendUser: [], feedEnd: false })
    if (this.data.choseNav === 'discover') {
      const waterFlowIns = this.selectComponent('#waterFlow')
      waterFlowIns.reSetData()
      await this.getHotArtworkAction(true)
    } else {
      await this.getFeedsAction(true)
    }
    this.setData({ isRefresh: false })
  },
  // 计算scrollview的滚动高度
  calculateScrollHight() {
    const { statusBarHeight, screenHeight, windowHeight } =
      wx.getSystemInfoSync()
    const tabBarHeight = screenHeight - windowHeight
    const vantNavBarHight = 46 // vant 自定义导航栏的高度
    const scrollViewHight =
      screenHeight - tabBarHeight - statusBarHeight - vantNavBarHight
    this.setData({ scrollViewHight })
  },
  goToSearch() {
    console.log('search')
  },
  onShareAppMessage() {
    return {
      title: '纸上·为绘画梦想助力'
    }
  }
})

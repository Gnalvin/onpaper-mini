// pages/tabBar/discover/index.ts
import { IPageData, IPageFn, hotTag } from './type'
import { RepeatRequestError } from '../../../services/request/err'
import {
  getHotTagRequest,
  getTopUseRequest
} from '../../../services/tag-topic/index'
import { getHotTrendRequest } from '../../../services/trend/index'
import { formatTrendData } from '../../../components/trend-item/handle'
import { pageQueryScrollview } from '../../../utils/query-rect'
import router from '../../../routers/index'

Page<IPageData, IPageFn>({
  data: {
    hotTag: [],
    trends: [],
    firstLoad: true,
    loading: false,
    networkError: false
  },
  onLoad() {
    this.getHotTagAction()
    this.getHotTrendAction()
  },
  onShow() {
    this.data.firstLoad = true
    setTimeout(() => {
      this.data.firstLoad = false
    }, 1000)
  },
  async onTabItemTap(item: any) {
    if (item.index !== 1) return
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
  async getHotTagAction() {
    const res = await getHotTagRequest()
    if (res.statusCode === 200) {
      if (res.data.length > 10) {
        this.setData({ hotTag: res.data.slice(0, 10) })
        return
      }
      //如果不够10个 使用替补数据
      const temp = await getTopUseRequest()
      if (temp.statusCode === 200) {
        let needCount = 10 - res.data.length
        const tempData: hotTag[] = temp.data.map((i) => ({
          ...i,
          status: 'keep'
        }))
        for (let i = 0; i < tempData.length; i++) {
          if (needCount === 0) break
          const data = tempData[i]
          if (res.data.findIndex((i) => i.tagId === data.tagId) === -1) {
            this.data.hotTag.push(data)
            needCount--
          }
        }
        this.data.hotTag.unshift(...res.data)
        this.setData({ hotTag: this.data.hotTag })
      }
    }
  },
  async getHotTrendAction(isRefresh) {
    if (this.data.loading && !isRefresh) return
    this.data.loading = true
    try {
      const res = await getHotTrendRequest()
      if (res.statusCode === 200) {
        if (isRefresh) this.data.trends = []
        res.data.forEach((item) => {
          this.data.trends.push(formatTrendData(item))
        })
        this.setData({ trends: this.data.trends })
      }
    } catch (error) {
      if (!(error instanceof RepeatRequestError)) {
        this.setData({ networkError: true })
      }
    }

    this.data.loading = false
  },
  async handleScrollViewRefresh() {
    await this.getHotTrendAction(true)
    this.setData({ isRefresh: false })
  },
  onScrolltolower() {
    this.getHotTrendAction()
  },
  reTryAllRequest() {
    this.getHotTagAction()
    this.getHotTrendAction()
    this.setData({ networkError: false })
  },
  goToTagPage(e) {
    const tagInfo = e.currentTarget.dataset
    router.push({
      name: 'TagPage',
      query: { id: tagInfo.id, name: tagInfo.name }
    })
  },
  goToNavPage(e) {
    const name = e.currentTarget.dataset.page
    router.push({ name })
  },
  onShareAppMessage() {
    return {
      title: '纸上·为绘画梦想助力'
    }
  }
})

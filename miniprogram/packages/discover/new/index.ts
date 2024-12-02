// packages/discover/new/index.ts
import { getNewTrendRequest } from '../../../services/trend/index'
import { formatTrendData } from '../../../components/trend-item/handle'
import { IPageData, IPageFn } from './type'

Page<IPageData, IPageFn>({
  data: {
    trends: [],
    loading: false
  },
  onLoad() {
    this.getNewTrendAction()
  },
  onReachBottom() {
    this.getNewTrendAction()
  },
  async getNewTrendAction() {
    if (this.data.loading) return
    const { trends } = this.data
    const lastFeed = trends[trends.length - 1]
    const next = lastFeed ? lastFeed.trendId : '0'
    this.data.loading = true
    const res = await getNewTrendRequest(next)
    if (res.statusCode === 200) {
      res.data.forEach((item) => {
        trends.push(formatTrendData(item))
      })
      this.setData({ trends: this.data.trends })
    }
    this.data.loading = false
  },
  onShareAppMessage() {
    return {
      title: '纸上·今日动态'
    }
  }
})

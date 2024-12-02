// packages/discover/zone/index.ts
import { zoneOptions } from '../../../config/zone/zoneOptions'
import { getZoneArtworkRequest } from '../../../services/discover/index'
import { formatPicUrl } from '../../../utils/format'
import { IPageData, IPageFn } from './type'
Page<IPageData, IPageFn>({
  data: {
    tabs: [
      {
        value: 'all',
        text: '全站'
      },
      ...zoneOptions
    ],
    artworks: [],
    query: {
      next: '0',
      zone: 'all',
      sort: 'hot',
      page: 0
    },
    loading: false,
    isEnd: false
  },
  onLoad() {
    this.getZoneArtworkAction()
  },
  onReachBottom() {
    if (this.data.isEnd) return
    this.getZoneArtworkAction()
  },
  //获取分区作品数据
  async getZoneArtworkAction() {
    if (this.data.loading) return
    this.data.loading = true
    const { query, artworks } = this.data
    // hot 是 用page 翻页
    if (query.sort == 'hot') query.page += 1
    if (query.sort == 'new') {
      const last = artworks[artworks.length - 1]
      query.next = last?.artworkId ?? '0'
      query.page = 1
    }
    const result = await getZoneArtworkRequest(query)
    this.data.loading = false
    if (result.statusCode === 200) {
      if (result.data.length < 30) this.setData({ isEnd: true })
      result.data.forEach((item) => {
        item.cover = formatPicUrl(item.cover, item.userId, 'cover', 'm')
        artworks.push(item)
      })
      this.setData({ artworks })
    }
  },
  onTabClick(e) {
    if (this.data.query.zone == e.detail.value) return
    this.data.query.zone = e.detail.value
    this.data.query.page = 0
    this.data.query.next = '0'
    this.data.loading = false
    this.setData({ isEnd: false, artworks: [] })
    this.getZoneArtworkAction()
  },
  onShareAppMessage() {
    return {
      title: '纸上·作品分区'
    }
  }
})

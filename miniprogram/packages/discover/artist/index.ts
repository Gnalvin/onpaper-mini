// packages/discover/artist/index.ts
import { getAllUserShowRequest } from '../../../services/discover/index'
import { formatPicUrl } from '../../../utils/format'
import { IPageData, IPageFn } from './type'
Page<IPageData, IPageFn>({
  data: {
    tabs: [
      {
        text: '人气画师',
        value: 'hot'
      },
      {
        text: '最近活跃',
        value: 'active'
      },
      {
        text: '最新入驻',
        value: 'new'
      }
    ],
    users: [],
    type: 'hot',
    maxPage: 0,
    loginUser: '',
    loading: false,
    isEnd: false
  },
  onLoad() {
    const userId = wx.getStorageSync('userId')
    this.setData({ loginUser: userId })
    this.getUserAction()
  },
  onReachBottom() {
    if (this.data.isEnd) return
    this.getUserAction()
  },
  async getUserAction() {
    if (this.data.loading) return
    this.data.loading = true
    const { users, type, maxPage } = this.data
    this.data.maxPage++
    const last = users[users.length - 1]
    let next: string
    if (type == 'hot') {
      next = String(maxPage)
    } else if (type == 'new') {
      next = last?.userId ?? '0'
    } else {
      next = last?.artworks[0].artworkId ?? '0'
    }
    const res = await getAllUserShowRequest({ type, next })
    this.data.loading = false
    if (res.statusCode === 200) {
      const { userData, isEnd } = res.data
      userData.forEach((item) => {
        item.artworks.forEach((art) => {
          art.cover = formatPicUrl(art.cover, art.userId, 'cover', 'm')
        })
        // @ts-ignore
        item.id = item.userId + Date.parse(String(new Date()))
        this.data.users.push(item)
      })
      this.setData({ users: this.data.users, isEnd })
    }
  },
  onTabClick(e) {
    if (this.data.type === e.detail.value) return
    this.data.type = e.detail.value
    this.data.maxPage = 0
    this.data.loading = false
    this.setData({ isEnd: false, users: [] })
    this.getUserAction()
  },
  onShareAppMessage() {
    return {
      title: '纸上·绘画大师聚集地'
    }
  }
})

// packages/discover/rank/index.ts
import {
  getArtworkRankRequest,
  getUserRankRequest
} from '../../../services/discover/index'
import { IPageData, IPageFn } from './type'
import { userTabs, artTabs } from './tabs'
import { formatPicUrl } from '../../../utils/format'
import router from '../../../routers/index'

const systemInfo = wx.getSystemInfoSync()

Page<IPageData, IPageFn>({
  data: {
    artworks: [],
    users: [],
    tabs: [...artTabs],
    choseNav: 'art',
    query: 'today',
    loading: false,
    loginUser: '',
    pagesCount: 0,
    tip: '',
    statusBarHeight: systemInfo.statusBarHeight
  },
  onLoad() {
    const userId = wx.getStorageSync('userId')
    const pages = getCurrentPages()
    this.setData({ loginUser: userId, pagesCount: pages.length })
    this.getArtworkAction()
    this.setTip()
  },
  async getArtworkAction() {
    this.setData({ artworks: [], loading: true })
    const res = await getArtworkRankRequest(this.data.query)
    this.setData({ loading: false })
    if (res.statusCode === 200) {
      res.data.forEach((item) => {
        item.cover = formatPicUrl(item.cover, item.userId, 'cover', 'm')
        this.data.artworks.push(item)
      })
      this.setData({ artworks: this.data.artworks })
    }
  },
  async getUserAction() {
    this.setData({ users: [], loading: true })
    const res = await getUserRankRequest(this.data.query)
    this.setData({ loading: false })
    if (res.statusCode === 200) {
      res.data.forEach((item) => {
        item.artworks.forEach((art) => {
          art.cover = formatPicUrl(art.cover, art.userId, 'cover', 'm')
        })
        this.data.users.push(item)
      })
      this.setData({ users: this.data.users })
    }
  },
  onNavClick(e) {
    const choseNav = e.currentTarget.dataset.text
    if (this.data.choseNav === choseNav) return
    this.setData({ choseNav })
    if (this.data.choseNav === 'art') {
      this.setData({ tabs: artTabs, users: [], query: 'today' })
      this.getArtworkAction()
    } else {
      this.setData({ tabs: userTabs, artworks: [], query: 'like' })
      this.getUserAction()
    }
    this.setTip()
  },
  onTabClick(e) {
    if (this.data.query === e.detail.value) return
    this.data.query = e.detail.value
    if (this.data.choseNav === 'art') {
      this.getArtworkAction()
    } else {
      this.getUserAction()
    }
    this.setTip()
  },
  navGoBack() {
    if (this.data.pagesCount > 1) {
      router.back()
    } else {
      router.switchTab({ name: 'TabMainHome' })
    }
  },
  setTip() {
    const dayMap: Record<string, number> = { today: 1, week: 7, month: 30 }
    const userMap: Record<string, string> = {
      like: '最近 7 天内，收获最多点赞的画师',
      collect: '最近 7 天内，收获最多收藏的画师',
      girl: '最近 21 天内，综合指标最高的女性画师',
      boy: '最近 21 天内，综合指标最高的男性画师',
      new: '最近 90 天内新加入社区，综合指标最高的画师'
    }
    if (this.data.choseNav === 'art') {
      this.data.tip = `最近 ${
        dayMap[this.data.query]
      } 天内综合指标最高的作品排行`
    } else {
      this.data.tip = userMap[this.data.query]
    }
    this.setData({ tip: this.data.tip })
  },
  onShareAppMessage() {
    const text = this.data.choseNav === 'art' ? '作品' : '画师'
    return {
      title: `纸上·${text}排行`
    }
  }
})

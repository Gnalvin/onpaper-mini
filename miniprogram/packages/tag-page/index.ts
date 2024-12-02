// packages/tag-page/index.ts
import { IPageData, IPageFn } from './type'
import {
  getRelevantTagRequest,
  getTagAboutArtRequest,
  getTagAboutUserRequest
} from '../../services/tag-topic/index'
import { formatPicUrl } from '../../utils/format'
import { throttle } from '../../utils/throttle'

Page<IPageData, IPageFn>({
  data: {
    loginId: '',
    tagId: '',
    tagName: '',
    totalCount: '0',
    users: [],
    page: 1,
    sort: 'score',
    nav: 'art',
    scrollY: 0
  },
  onLoad(e: { id: string; name: string }) {
    const userId = wx.getStorageSync('userId')
    this.setData({ tagId: e.id, tagName: e.name, loginId: userId })
    this.getRelevantTagAction()
    this.getTagAboutArtAction()
  },
  onReachBottom() {
    if (this.data.nav === 'user') return
    this.getTagAboutArtAction()
  },
  handleNavChose(e) {
    const newNav = e.currentTarget.dataset.chose
    if (newNav === this.data.nav) return
    this.setData({ nav: newNav })
    if (newNav === 'user' && this.data.users.length === 0) {
      this.getTagAboutUserAction()
    } else if (newNav === 'art' && this.data.page === 1) {
      this.getTagAboutArtAction()
    }
  },
  handleNavSort() {
    if (this.data.sort === 'score') {
      this.setData({ sort: 'time', page: 1 })
    } else {
      this.setData({ sort: 'score', page: 1 })
    }
    const waterFlowIns = this.selectComponent('#waterFlow')
    waterFlowIns.reSetData(true)
    this.getTagAboutArtAction()
  },
  async getRelevantTagAction() {
    const { tagId, tagName } = this.data
    const res = await getRelevantTagRequest(tagName, tagId)
    if (res.statusCode === 200) {
      this.setData({ totalCount: res.data.total.toLocaleString('en-US') })
    }
  },
  async getTagAboutArtAction() {
    const { tagId, tagName, page, sort } = this.data
    if (page > 10) return // 最多翻10页
    const res = await getTagAboutArtRequest(tagName, sort, page, tagId)
    if (res.statusCode === 200) {
      this.data.page++
      if (res.data.length < 36) this.data.page = 11 // 如果一组小于36个 说明没有更多了
      res.data.forEach((i) => {
        i.firstPic = formatPicUrl(i.firstPic, i.userId, 'artworks', 's')
      })
      // 获取瀑布流组件实力
      const waterFlowIns = this.selectComponent('#waterFlow')
      // 调用实例渲染方法
      waterFlowIns.renderWaterFlow(res.data)
      this.setData({ page: this.data.page })
    }
  },
  async getTagAboutUserAction() {
    const { tagId, tagName, users } = this.data
    const res = await getTagAboutUserRequest(tagName, tagId)
    if (res.statusCode === 200) {
      res.data.forEach((item) => {
        item.artworks.forEach((art) => {
          art.cover = formatPicUrl(art.cover, art.userId, 'cover', 'm')
        })
        users.push(item)
      })
      this.setData({ users })
    }
  },
  onPageScroll(options: WechatMiniprogram.Page.IPageScrollOption) {
    this.throttleSetData({ scrollY: options.scrollTop })
  },
  onShareAppMessage() {
    return {
      title: '#' + this.data.tagName
    }
  },
  throttleSetData: throttle(function (data) {
    // @ts-ignore
    this.setData(data)
  }, 100)
})

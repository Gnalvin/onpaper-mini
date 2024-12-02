// packages/user-fans/index.ts
import { getUserFollowRequest } from '../../services/user-home/index'
import { IPageData, IPageFn } from './type'
Page<IPageData, IPageFn>({
  data: {
    queryUid: '',
    loginUid: '',
    type: 'follower',
    page: 1,
    users: [],
    tip: '',
    isEnd: false
  },
  onLoad(e: { type: string; userId: string }) {
    this.data.type = e.type as 'following' | 'follower'
    this.data.queryUid = e.userId
    const title = this.data.type === 'following' ? '关注列表' : '粉丝列表'
    wx.setNavigationBarTitle({ title })
    const loginUid = wx.getStorageSync('userId')
    this.setData({ loginUid })
    this.getFansAction()
  },
  onReachBottom() {
    this.getFansAction()
  },
  async getFansAction() {
    if (this.data.isEnd) return
    const { queryUid: userId, page, type } = this.data
    const res = await getUserFollowRequest(userId, page, type)
    if (res.statusCode === 200) {
      if (res.data.length < 50) this.setData({ isEnd: true })
      this.data.users.push(...res.data)
      this.setData({ users: this.data.users })
    } else {
      this.setData({ isEnd: true })
      if (res.statusCode === 1037) this.setData({ tip: 'Ta还没有粉丝噢' })
      if (res.statusCode === 1027) this.setData({ tip: 'Ta还没关注过其他人' })
    }
  }
})

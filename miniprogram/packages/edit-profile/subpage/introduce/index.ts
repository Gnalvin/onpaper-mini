// pages/edit-profile/subpage/introduce/index.ts
import router from '../../../../routers/index'
import { IPageData, IPageFn, editePageIns } from './type'
import { updateUserProfileRequest } from '../../../../services/edit-profile/index'
import Toast from '@vant/weapp/toast/toast'

Page<IPageData, IPageFn>({
  data: {
    introduce: '',
    wordCount: 0,
    oldIntroduce: '',
    prevPageIns: null
  },
  onLoad() {
    const pages = getCurrentPages()
    this.data.prevPageIns = pages[pages.length - 2] as editePageIns // 上一个页面
    const introduce = this.data.prevPageIns.data.profile!.introduce as string // 获取上一页data里的数据
    this.setData({
      introduce,
      oldIntroduce: introduce,
      wordCount: introduce.length
    })
  },
  handleInput(e) {
    const introduce = e.detail.value as string
    this.setData({ introduce, wordCount: introduce.length })
  },
  async handleSave() {
    const { introduce, prevPageIns } = this.data
    Toast.loading({ message: '保存中...', forbidClick: true })
    const { statusCode } = await updateUserProfileRequest({
      profileType: 'introduce',
      profile: introduce.trim()
    })
    Toast.clear()
    if (statusCode === 200) {
      prevPageIns!.changeIntroduce(introduce.trim())
      // 返回上一页
      router.back()
    } else {
      Toast(`发生未知错误:${statusCode}`)
    }
  }
})

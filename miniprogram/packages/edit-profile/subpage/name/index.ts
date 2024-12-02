// pages/edit-profile/subpage/name/index.ts
import router from '../../../../routers/index'
import Toast from '@vant/weapp/toast/toast'
import { IPageData, IPageFn, editePageIns } from './type'
import {
  userNameVerifyRequest,
  updateUserProfileRequest
} from '../../../../services/edit-profile/index'

const rules = /^[\u4e00-\u9fa5A-Za-z0-9-_\uAC00-\uD7A3\u0800-\u4e00]{2,12}$/

Page<IPageData, IPageFn>({
  data: {
    userName: '',
    wordCount: 0,
    prevPageIns: null,
    loading: false,
    oldName: ''
  },
  onLoad() {
    const pages = getCurrentPages()
    this.data.prevPageIns = pages[pages.length - 2] as editePageIns // 上一个页面
    const userName = this.data.prevPageIns.data.profile!.userName as string // 获取上一页data里的数据
    this.setData({ userName, oldName: userName, wordCount: userName.length })
  },
  handleInput(e) {
    const userName = e.detail.value as string
    this.setData({ userName: userName.trim(), wordCount: userName.length })
  },
  async handleSave() {
    const { userName, loading } = this.data
    if (loading) return
    if (!userName.length) return
    // 验证长度
    if (userName.length < 2) {
      Toast('昵称字数太少了')
      return
    }
    // 验证是否有特殊字符
    if (!rules.test(userName)) {
      Toast('不能输入@<>/!空格等特殊符号噢')
      return
    }
    this.data.loading = true
    // 验证用户名是否存在
    const { statusCode } = await userNameVerifyRequest(userName)
    if (statusCode === 1002) {
      Toast({ message: '此用户名已被注册', forbidClick: true })
    } else if (statusCode === 1003) {
      // 前面步骤都成功 执行 改名
      await this.updateUserName()
    } else {
      Toast(`发生未知错误:${statusCode}`)
    }
    this.data.loading = false
  },
  async updateUserName() {
    const { userName, prevPageIns } = this.data
    const { statusCode } = await updateUserProfileRequest({
      profileType: 'userName',
      profile: userName
    })
    if (statusCode === 200) {
      wx.setStorageSync('userName', userName)
      prevPageIns!.changeUserName(userName)
      // 返回上一页
      router.back()
    } else {
      Toast(`发生未知错误:${statusCode}`)
    }
  }
})

// pages/tabBar/user/subpage/setting/index.ts
import router from '../../routers/index'

Page({
  data: {},
  // 查看协议
  hanldePrivacyPolicy() {
    router.push({
      name: 'AgreementPage',
      query: { url: 'https://onpaper.cn/terms/privacy' }
    })
  },
  // 切换账号
  handleChangeAccount() {
    router.push({ name: 'WxLoginPage' })
  },
  // 退出登陆
  handleExitLogin() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登陆吗？',
      success(res) {
        if (res.confirm) {
          wx.clearStorageSync()
          getApp().globalData.userId = ''
          router.reLaunch({ name: 'TabUserHome' })
        }
      }
    })
  }
})

// pages/login/wx-login/index.ts
import { wxPhoneLoginRequest } from '../../../services/login/index'
import router from '../../../routers/index'
import Toast from '@vant/weapp/toast/toast'

const logoUrl =
  getApp().globalData.env_config.OSS_PREVIEW_URL + 'assets/logo.png/webp'

Page({
  data: {
    logoUrl: logoUrl,
    showAgreeTip: false
  },
  onLoad(options: { reLogin: any }) {
    if (options.reLogin) {
      Toast({ message: '登陆已过期，请重新登陆', duration: 2500 })
    }
  },
  // 微信手机号登陆
  async handleWxPhoneLogin(e: WechatMiniprogram.CustomEvent) {
    this.setData({ showAgreeTip: false })
    const code = e.detail.code as string
    if (code) {
      const res = await wxPhoneLoginRequest(code)
      if (res.statusCode === 200) {
        const { refreshToken, accessToken, userId, avatar, userName } = res.data
        wx.setStorageSync('refreshToken', refreshToken)
        wx.setStorageSync('accessToken', accessToken)
        wx.setStorageSync('avatar', avatar)
        wx.setStorageSync('userName', userName)
        wx.setStorageSync('userId', userId)
        getApp().globalData.userId = userId

        // 跳转到首页
        router.reLaunch({ name: 'TabUserHome' })
      } else {
        Toast({ message: `发生未知错误:${res.statusCode}`, duration: 2500 })
      }
    }
  },
  // 其他手机号登陆
  handleOtherPhoneLogin() {
    router.replace({ name: 'PhoneLoginPage' })
  },
  //展示协议框
  onAgreeTipShow() {
    this.setData({ showAgreeTip: true })
  },
  onAgreeTipClose() {
    this.setData({ showAgreeTip: false })
  },
  //跳转到协议网站
  handleToAgreeWebSite(e: WechatMiniprogram.CustomEvent) {
    const value = e.currentTarget.dataset.value as 'user' | 'privacy'
    const urlMap = {
      user: 'https://onpaper.cn/terms/user-term',
      privacy: 'https://onpaper.cn/terms/privacy'
    }
    const url = urlMap[value]
    router.push({
      name: 'AgreementPage',
      query: { url }
    })
  }
})

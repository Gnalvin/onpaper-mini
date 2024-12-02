// pages/login/password-login/index.ts
import router from '../../../routers/index'
import { passwordLoginRequest } from '../../../services/login/index'
import Toast from '@vant/weapp/toast/toast'
import {
  verifyPhoneNumber,
  verifyPassword,
  verifyEmail
} from '../../../utils/verify'
Page({
  data: {
    account: '',
    password: '',
    showLoginBtn: false,
    showClearAcount: false,
    showPassword: false,
    showAgreeTip: false,
    checked: false
  },
  handleAccountInput(e: WechatMiniprogram.CustomEvent) {
    const text = e.detail.value as string
    this.data.account = text
    this.setData({ showClearAcount: Boolean(text.length) })
    this.isShowLoginBtn()
    return { value: text.replace(/\s*/g, '') }
  },
  handlePasswordInput(e: WechatMiniprogram.CustomEvent) {
    const text = e.detail.value
    this.data.password = text
    this.isShowLoginBtn()
  },
  // 处理登陆逻辑
  async handleLogin() {
    const { account, password, checked } = this.data
    //是否同意了协议
    if (!checked) return this.setData({ showAgreeTip: true })
    //验证账号格式
    const accountVerify = verifyPhoneNumber(account) || verifyEmail(account)
    const passwordVerify = verifyPassword(password)
    if (!accountVerify) return Toast('请输入正确的账号')
    if (!passwordVerify) return Toast('密码不正确')

    // 发送网络请求
    const res = await passwordLoginRequest({ account, password })
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
    } else if (res.statusCode === 1004 || res.statusCode === 1003) {
      Toast('账号或密码不正确')
    } else if (res.statusCode === 1031) {
      Toast('账号被禁止登陆')
    } else {
      Toast(`发生了未知错误:${res.statusCode}`)
    }
  },
  // 登陆按钮是否显示可用
  isShowLoginBtn() {
    const { account, password } = this.data
    if (!!account.length && !!password.length) {
      this.setData({ showLoginBtn: true })
    }
  },
  //清空账号输入框
  clearAcount() {
    this.setData({ account: '', showClearAcount: false, showLoginBtn: false })
  },
  //显示/隐藏密码
  onChangeShowPassword() {
    this.setData({ showPassword: !this.data.showPassword })
  },
  //点击是否同意协议按钮
  onChangeChecked(event: WechatMiniprogram.CustomEvent) {
    this.setData({
      checked: event.detail as unknown as boolean
    })
  },
  //从协议提示那点击登陆并继续
  handleAgreeTipLogin() {
    this.setData({ checked: true })
    this.onAgreeTipClose()
    this.handleLogin()
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

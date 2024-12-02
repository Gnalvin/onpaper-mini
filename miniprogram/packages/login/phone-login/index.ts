// pages/login/phone-login/index.ts
import router from '../../../routers/index'
import {
  getPhoneCodeRequest,
  postPhoneLoginRequest
} from '../../../services/login/index'
import Toast from '@vant/weapp/toast/toast'
import { verifyPhoneNumber, verifySMSCode } from '../../../utils/verify'
Page({
  data: {
    phone: '',
    code: '',
    checked: false,
    canSend: false,
    showClearAccount: false,
    showAgreeTip: false,
    showLoginBtn: false,
    countDown: 60,
    showCountDown: false
  },
  handlePhoneInput(e: WechatMiniprogram.CustomEvent) {
    // 将手机号转换成 111 2222 3333
    let value = e.detail.value.replace(/\D/g, '').substring(0, 11)
    const len = value.length
    if (len > 3 && len < 8) {
      value = value.replace(/^(\d{3})/g, '$1 ')
    } else if (len >= 8) {
      value = value.replace(/^(\d{3})(\d{4})/g, '$1 $2 ')
    }
    //设置手机号
    this.data.phone = e.detail.value.replace(/\s*/g, '')
    // 是否显示发送验证码和登陆按钮
    if (len === 11) {
      wx.hideKeyboard() //收起键盘
      this.setData({ canSend: true, showLoginBtn: this.data.code.length === 6 })
    } else {
      this.setData({ canSend: false, showLoginBtn: false })
    }
    //是否显示清空按钮
    this.setData({ showClearAccount: Boolean(len) })
    return { value }
  },
  async handleSendCode() {
    const { canSend, checked, phone } = this.data
    if (!canSend) return
    //清空已经输入的验证码
    this.setData({ code: '' })
    //是否同意了协议
    if (!checked) return this.setData({ showAgreeTip: true })
    //验证手机号
    if (!verifyPhoneNumber(phone)) return Toast('请输入正确的手机号')
    //倒计时
    const timer = setInterval(() => {
      this.setData({ countDown: this.data.countDown - 1, showCountDown: true })
      if (this.data.countDown === 0) {
        clearInterval(timer)
        this.setData({ showCountDown: false })
        this.data.countDown = 60
      }
    }, 1000)
    Toast.loading({
      duration: 0, // 持续展示 toast
      forbidClick: true
    })
    const res = await getPhoneCodeRequest(phone)
    Toast.clear()
    if (res.statusCode === 1024) {
      Toast({
        message: '新用户请使用微信登陆',
        duration: 2500,
        forbidClick: true
      })
    } else if (res.statusCode !== 200) {
      Toast(`发生未知错误:${res.statusCode}`)
      clearInterval(timer)
      this.setData({ showCountDown: false })
      this.data.countDown = 60
    }
  },
  async handleLogin() {
    const { checked, phone, code } = this.data
    //是否同意了协议
    if (!checked) return this.setData({ showAgreeTip: true })
    //验证手机号
    if (!verifyPhoneNumber(phone)) return Toast('请输入正确的手机号')
    Toast.loading({ duration: 0, forbidClick: true })

    const res = await postPhoneLoginRequest({ phone, verifyCode: code })
    Toast.clear()
    if (res.statusCode === 200) {
      const { refreshToken, accessToken, userId, avatar, userName } = res.data
      wx.setStorageSync('refreshToken', refreshToken)
      wx.setStorageSync('accessToken', accessToken)
      wx.setStorageSync('userName', userName)
      wx.setStorageSync('avatar', avatar)
      wx.setStorageSync('userId', userId)
      getApp().globalData.userId = userId
      // 跳转到首页
      router.reLaunch({ name: 'TabUserHome' })
    } else if (res.statusCode === 1031) {
      Toast('账号被禁止登陆')
    } else if (res.statusCode == 1018) {
      Toast('验证码错误')
    } else {
      Toast(`发生了未知错误:${res.statusCode}`)
    }
  },
  handleCodeInput(e: WechatMiniprogram.CustomEvent) {
    const code = e.detail.value
    this.data.code = code
    this.setData({ showLoginBtn: code.length === 6 })
  },
  //从协议提示那点击同意并继续
  handleAgreeTipLogin() {
    this.setData({ checked: true })
    if (verifySMSCode(this.data.code)) {
      this.handleLogin()
    } else {
      this.handleSendCode()
    }
    this.onAgreeTipClose()
  },
  onChangeChecked(event: WechatMiniprogram.CustomEvent) {
    this.setData({
      checked: event.detail as unknown as boolean
    })
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
  },
  //清空账号输入框
  clearAccount() {
    this.setData({
      phone: '',
      showClearAccount: false,
      showLoginBtn: false,
      canSend: false
    })
  },
  onAgreeTipClose() {
    this.setData({ showAgreeTip: false })
  }
})

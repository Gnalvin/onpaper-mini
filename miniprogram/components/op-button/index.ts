// components/op-button/index.ts
import { verifyIsLogin } from '../../utils/verify'

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    text: {
      type: String,
      value: ''
    },
    width: {
      type: String,
      value: '220rpx'
    },
    height: {
      type: String,
      value: 'auto'
    },
    btnStyle: {
      type: String,
      value: ''
    },
    fontSize: {
      type: String,
      value: '24rpx'
    },
    fontWith: {
      type: String,
      value: '600'
    },
    bgcColor: {
      type: String,
      value: ''
    },
    color: {
      type: String,
      value: ''
    },
    openType: {
      type: String,
      value: ''
    },
    isDisable: {
      type: Boolean,
      value: false
    },
    login: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    handleTab() {
      if (this.properties.isDisable) return
      if (this.properties.login) {
        const isLogin = verifyIsLogin()
        if (!isLogin) return
      }
      this.triggerEvent('click')
    },
    getPhoneNumber(e: WechatMiniprogram.CustomEvent) {
      this.triggerEvent('phoneCode', { code: e.detail.code })
    }
  }
})

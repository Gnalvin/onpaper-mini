// pages/login/cpns/change-login/index.ts
import router from '../../../../routers/index'

Component({
  properties: {
    showList: {
      type: Array,
      value: []
    }
  },
  methods: {
    handleRouterPush(e: WechatMiniprogram.CustomEvent) {
      const name = e.currentTarget.dataset.name
      if (name === 'wechat') {
        router.replace({ name: 'WxLoginPage' })
      } else if (name === 'phone') {
        router.replace({ name: 'PhoneLoginPage' })
      } else {
        router.replace({ name: 'PasswordLoginPage' })
      }
    }
  }
})

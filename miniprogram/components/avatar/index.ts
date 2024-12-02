// components/avatar/index.ts
const env_config = getApp().globalData.env_config
import router from '../../routers/index'
Component({
  properties: {
    avatarName: {
      type: String,
      value: ''
    },
    uid: {
      type: String,
      value: ''
    },
    width: {
      type: String,
      value: '165rpx'
    },
    showLogo: {
      type: Boolean,
      value: false
    },
    noJump: {
      type: Boolean,
      value: false
    }
  },
  data: {
    previewOssUrl: env_config.OSS_PREVIEW_URL,
    defaultAvatar: env_config.DEFAULT_AVATAR,
    noLoginAvatar: env_config.NO_LOGIN_AVATAR
  },

  methods: {
    goToUserHome() {
      this.triggerEvent('click')
      if (this.properties.noJump) return
      // 当前登陆用户不跳转
      if (getApp().globalData.userId == this.properties.uid) return
      router.push({
        name: 'UserHome',
        query: { uid: this.properties.uid }
      })
    }
  }
})

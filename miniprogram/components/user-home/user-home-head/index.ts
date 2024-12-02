// components/user-home/index.ts
import router from '../../../routers/index'
import { IData, IMethod, IProperty } from './type'
Component<IData, IProperty, IMethod>({
  properties: {
    profile: {
      type: Object,
      value: {}
    },
    isFocus: {
      type: Number,
      value: 0
    },
    isOwner: {
      type: Boolean,
      value: false
    }
  },
  lifetimes: {
    attached() {
      const userId = wx.getStorageSync('userId')
      const userName = wx.getStorageSync('userName')
      const avatar = wx.getStorageSync('avatar')
      this.data.loginUser = { userId, userName, avatar }
    }
  },
  data: {
    loginUser: null
  },
  methods: {
    handleEditProfile() {
      router.push({
        name: 'UserEditProfile',
        query: { userId: this.properties.profile.userId }
      })
    },
    handleSetting() {
      router.push({ name: 'UserSetting' })
    },
    handleFoucsUser() {
      this.triggerEvent('focus')
    },
    handleGoToChat() {
      if (!this.data.loginUser?.userId) return
      const sender = this.data.loginUser
      const receiver = {
        userId: this.data.profile.userId,
        userName: this.data.profile.userName,
        avatar: this.data.profile.avatarName
      }
      router.push({
        name: 'ChatDetail',
        query: { sender: sender, receiver: receiver }
      })
    },
    handleGoToFans(e) {
      const type = e.currentTarget.dataset.type
      router.push({
        name: 'UserFans',
        query: { type, userId: this.properties.profile.userId }
      })
    },
    goToShowMore() {
      router.push({
        name: 'UserProfileShowMore',
        query: { profile: this.properties.profile }
      })
    }
  }
})

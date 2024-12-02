// components/user-card/index.ts
import router from '../../routers/index'
import { postUserFocusRequest } from '../../services/common/index'

Component({
  properties: {
    userInfo: {
      type: Object,
      value: {}
    },
    loginUser: {
      type: String,
      value: ''
    }
  },
  data: {},
  methods: {
    async handleFocusUser() {
      let { isFocus, userId } = this.properties.userInfo
      const res = await postUserFocusRequest(userId, !!isFocus)
      if (res.statusCode === 200) {
        if (!res.data.isCancel) {
          this.properties.userInfo.isFocus = 1
        } else {
          this.properties.userInfo.isFocus = 0
        }
        this.setData({ userInfo: this.properties.userInfo })
      }
    },
    handleGoToUserHome() {
      router.push({
        name: 'UserHome',
        query: { uid: this.properties.userInfo.userId }
      })
    }
  }
})

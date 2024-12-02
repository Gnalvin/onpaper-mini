// app.ts
const config = require('./config/env/projectConfig')
import { checkUpdate } from './utils/system'

App<IAppOption>({
  globalData: {
    env_config: {
      ...config
    },
    userId: ''
  },
  onLaunch() {
    // 检测小程序版本
    checkUpdate()
    this.globalData.userId = wx.getStorageSync('userId') ?? ''
  }
})

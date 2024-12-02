import config from './request/config'
import WLRequest from './request/index'
import router from '../routers/index'
import { WLResponseSuccess } from '../services/request/type'
import { errorHandle } from './utils/error-handle'

const wlRequest = new WLRequest({
  baseUrl: config.BASE_URL,
  timeout: config.TIMEOUT,
  interceptors: {
    requestInterceptors: (config) => {
      // 添加token
      const token = wx.getStorageSync('accessToken')
      if (token) {
        const addHeader = { Authorization: `Bearer ${token}` }
        config.header = { ...config.header, ...addHeader }
      }
      return config
    },
    responseInterceptors: (res) => {
      // console.log("new传入的 结果拦截器");
      const result = errorHandle(res)
      return result as WLResponseSuccess
    },
    responseInterceptorsCatch: (err) => {
      // console.log("new传入的 结果错误拦截器");
      return err
    }
  }
})

const getAccessToken = new WLRequest({
  baseUrl: config.BASE_URL + '/auth/accesstoken',
  timeout: config.TIMEOUT,
  interceptors: {
    requestInterceptors: (config) => {
      const token = wx.getStorageSync('refreshToken')
      if (token) {
        const addHeader = { Authorization: `Bearer ${token}` }
        config.header = { ...config.header, ...addHeader }
      }
      return config
    },
    responseInterceptors: (res) => {
      console.log({ getAccessToken: res })
      // 如果refreshToken 过期重新登录 或请求错误
      if (res.statusCode === 1005 || res.statusCode === 1011) {
        wx.clearStorageSync()
        router.reLaunch({ name: 'WxLoginPage', query: { reLogin: true } })
      }
      return res
    }
  }
})

const retryRequest = new WLRequest({
  baseUrl: config.BASE_URL,
  timeout: config.TIMEOUT,
  interceptors: {
    // 传入拦截器
    requestInterceptors: (config) => {
      // 拦截 添加  token
      const token = wx.getStorageSync('accessToken')
      // 重新请求时 如果 有token 说明是新的 token 带上
      // 否则 把之前配置的 token 请求头取消
      if (token) {
        const addHeader = { Authorization: `Bearer ${token}` }
        config.header = { ...config.header, ...addHeader }
      } else {
        delete config.header?.Authorization
      }
      return config
    },
    responseInterceptors: (res) => {
      console.log({ retryRequest: res })
      return res
    }
  }
})

export { wlRequest, getAccessToken, retryRequest }

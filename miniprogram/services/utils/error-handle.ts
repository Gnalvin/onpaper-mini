import { WLResponseSuccess } from '../request/type'
import { getAccessToken, retryRequest } from '../../services/index'
import WLRequest from '../request/index'

const errorHandle = (res: WLResponseSuccess) => {
  switch (res.statusCode) {
    case 1005:
      // 看看是否是 之前有在刷新的请求 if没有 则去请求,else 添加到待重新请求列表中
      if (res.config.isNotRefreshing) {
        // accessToken 无效的话 则 请求 刷新token 并重新请求
        return getAccessToken
          .get<{ accessToken: string }>({})
          .then((result) => {
            // refreshToken 也过期了  也重新调用一次 getAccessToken拦截器当过期时已经清除过登陆信息
            if (result.statusCode !== 200) {
              WLRequest.runRequest()
              return retryRequest.request(res.config)
            }
            // 把获取的新accessToken 保存起来 然后调用 重新请求列表的 函数
            const token = result.data.accessToken
            //把 accessToken 删除再保存
            wx.removeStorageSync('accessToken')
            wx.setStorageSync('accessToken', token)
            WLRequest.runRequest()
            // 同时把这一次请求 也重新调用
            return retryRequest.request(res.config)
          })
      } else {
        return new Promise<any>((resolve) => {
          //这里加入列表的是一个promise的解析函数
          // 将响应的config配置对应解析的请求函数存到requests中，等到刷新token回调后再执行
          WLRequest.addRequest(() => {
            resolve(retryRequest.request(res.config))
          })
        })
      }
      break

    default:
      return res
  }
}

export { errorHandle }

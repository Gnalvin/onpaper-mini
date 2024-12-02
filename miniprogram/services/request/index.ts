import { RepeatRequestError } from './err'
import type {
  WLRequestConfig,
  WLRequestInterceptors,
  WXResultSuccessType,
  WXResultFailType,
  WXResultResultInfo,
  WLResponseSuccess,
  WXResponseFail
} from './type'

let isNotRefreshing = true //标志当前是否正在刷新 accessToken
const pendingRequests = new Map<string, WLRequestConfig>() // 存放正在请求 的请求
let requests: any[] = [] //请求队列

class WLRequest {
  //单个类拥有的拦截器 new时传入
  oneClassInterceptors?: WLRequestInterceptors
  baseUrl: string
  timeout: number | undefined
  constructor(config: WLRequestConfig) {
    this.timeout = config.timeout
    this.baseUrl = config.baseUrl!
    this.oneClassInterceptors = config.interceptors
  }

  // 所有实例都有的请求拦截器
  allHaveRequestInterceptors(config: WLRequestConfig) {
    // console.log("所有实例都有的 请求拦截器");
    const requestKey = [
      config.method,
      this.baseUrl + config.url,
      JSON.stringify(config.data)
    ].join('&')
    //将每个请求的 requestKey 设置到config
    config.requestKey = requestKey

    return config
  }
  // 所有实例都有的结果拦截器
  allHaveResponseInterceptors(res: WLResponseSuccess, config: WLRequestConfig) {
    // 替换 wxRequst 自带参数为 自己的参数
    res.statusCode = res.data.status
    res.errMsg = res.data.msg ?? res.errMsg
    res.data = res.data.data

    // 拿到本次的Key,删除这次请求记录
    const requestKey = config.requestKey!
    pendingRequests.delete(requestKey)

    // 如果 token 无效,判断是否已经有请求在刷新token
    if (res.statusCode === 1005) {
      // 没有之前都没有请求刷新token 则这次为 刷新的请求
      if (isNotRefreshing) {
        config.isNotRefreshing = true
        isNotRefreshing = false
        return res
      } else {
        // 之前已经有请求正在请求ing
        config.isNotRefreshing = false
        return res
      }
    }
    isNotRefreshing = true

    return res
  }
  allHaveResponseInterceptorsCatch(error: WXResultFailType) {
    // console.log("所有实例都有的 结果错误拦截器");
    //如果是返回某些错误 则清空 map ,允许重发请求
    pendingRequests.clear()
    wx.showToast({
      title: '网络请求出错了',
      icon: 'error',
      duration: 2000,
      mask: true
    })

    return error
  }
  allHaveCompleteInterceptors(info: WXResultResultInfo) {
    return info
  }

  // ============================ 传入的拦截器处理函数 ============================
  requestInterceptors(config: WLRequestConfig) {
    //实例拦截器处理
    let handleConf = this.allHaveRequestInterceptors(config)
    //new 时传入的 类拦截器处理
    if (this.oneClassInterceptors?.requestInterceptors) {
      handleConf = this.oneClassInterceptors?.requestInterceptors(handleConf)
    }
    //单个接口拦截器处理
    if (config.interceptors?.requestInterceptors) {
      handleConf = config.interceptors?.requestInterceptors(handleConf)
    }
    return handleConf
  }

  completeInterceptors(info: WXResultResultInfo, config: WLRequestConfig) {
    //实例拦截器处理
    let handleInfo = this.allHaveCompleteInterceptors(info)
    //new 时传入的 类拦截器处理
    if (this.oneClassInterceptors?.completeInterceptors) {
      handleInfo = this.oneClassInterceptors?.completeInterceptors(info)
    }
    //单个接口拦截器处理
    if (config.interceptors?.completeInterceptors) {
      handleInfo = config.interceptors?.completeInterceptors(handleInfo)
    }
    return handleInfo
  }

  responseInterceptors(res: WLResponseSuccess, config: WLRequestConfig) {
    //实例拦截器处理
    let handleRes = this.allHaveResponseInterceptors(res, config)
    //new 时传入的 类拦截器处理
    if (this.oneClassInterceptors?.responseInterceptors) {
      handleRes = this.oneClassInterceptors?.responseInterceptors(handleRes)
    }
    //单个接口拦截器处理
    if (config.interceptors?.responseInterceptors) {
      handleRes = config.interceptors?.responseInterceptors(handleRes)
    }

    return handleRes
  }

  responseInterceptorsCatch(error: WXResponseFail, config: WLRequestConfig) {
    //实例拦截器处理
    let handleErr = this.allHaveResponseInterceptorsCatch(error)
    //new 时传入的 类拦截器处理
    if (this.oneClassInterceptors?.responseInterceptorsCatch) {
      handleErr =
        this.oneClassInterceptors?.responseInterceptorsCatch(handleErr)
    }
    //单个接口拦截器处理
    if (config.interceptors?.responseInterceptorsCatch) {
      handleErr = config.interceptors?.responseInterceptorsCatch(handleErr)
    }
    return handleErr
  }

  // ============================ 请求方法 ============================
  request<T>(config: WLRequestConfig) {
    const finallConfig = this.requestInterceptors(config)
    const requestKey = finallConfig.requestKey as string
    return new Promise<WXResultSuccessType<T>>((resolve, reject) => {
      // 如果是 重复的请求，取消掉当前请求
      if (pendingRequests.has(requestKey)) {
        const warn = `重复的请求被主动拦截: ${requestKey}`
        console.warn(warn)
        return reject(new RepeatRequestError('重复的请求'))
      } else {
        pendingRequests.set(requestKey, finallConfig)
      }

      const requestTask = wx.request<T>({
        ...finallConfig,
        url: this.baseUrl + (finallConfig.url ?? ''),
        timeout: this.timeout,
        success: (res) => {
          const mixRes = Object.assign(res, { config })
          const finallyRes = this.responseInterceptors(mixRes, config)
          resolve(finallyRes)
        },
        fail: (err) => {
          const mixErr = Object.assign(err, { config })
          const finallyErr = this.responseInterceptorsCatch(mixErr, config)
          reject(finallyErr)
        },
        complete: (info) => {
          const mixInfo = Object.assign(info, { config })
          this.completeInterceptors(mixInfo, config)
        }
      })
      return requestTask
    })
  }

  public post<T>(config: WLRequestConfig) {
    return this.request<T>({ ...config, method: 'POST' })
  }

  public get<T>(config: WLRequestConfig) {
    return this.request<T>({ ...config, method: 'GET' })
  }

  public put<T>(config: WLRequestConfig) {
    return this.request<T>({ ...config, method: 'PUT' })
  }

  public delete<T>(config: WLRequestConfig) {
    return this.request<T>({ ...config, method: 'DELETE' })
  }

  public patch<T>(config: WLRequestConfig) {
    const addHeader = { 'X-HTTP-Method-Override': 'PATCH' }
    config.header = { ...config.header, ...addHeader }
    return this.request<T>({ ...config, method: 'POST' })
  }

  // 对外暴露一个方法 清空pendingRequests列表
  public clearRequestList() {
    pendingRequests.clear()
  }
  // 往队列中添加请求
  static addRequest(func: any) {
    requests.push(func)
  }
  // 重新请求队列中的 请求
  static runRequest() {
    isNotRefreshing = true

    //执行requests队列中的请求，（requests中存的不是请求参数，而是请求的Promise函数，这里直接拿来执行就好）
    requests.forEach((run) => run())

    //将请求队列置空
    requests = []
  }
}

export default WLRequest

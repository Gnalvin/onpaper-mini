export type WXResultSuccessType<T = any> =
  WechatMiniprogram.RequestSuccessCallbackResult<T>
export type WXResultOption = WechatMiniprogram.RequestOption
export type WXResultFailType = WechatMiniprogram.Err
export type WXResultResultInfo =
  | WXResultSuccessType
  | WechatMiniprogram.GeneralCallbackResult
  | WXResultFailType

// 定义一个拦截器接口
// T = XXXTYype 设置默认类型
export interface WLRequestInterceptors<T = WLResponseSuccess> {
  //请求成功的拦截
  requestInterceptors?: (config: WLRequestConfig) => WLRequestConfig
  //响应成功的拦截
  responseInterceptors?: (res: T) => T
  //响应失败的拦截
  responseInterceptorsCatch?: (error: WXResultFailType) => WXResultFailType
  //无论成功或失败都有的拦截
  completeInterceptors?: (info: WXResultResultInfo) => WXResultResultInfo
}

// 定义一个接口 通过继承 WechatMiniprogram.RequestOption
export interface WLRequestConfig<T = WLResponseSuccess>
  extends Omit<WXResultOption, 'url'> {
  baseUrl?: string
  url?: string
  // 拦截器
  interceptors?: WLRequestInterceptors<T>
  requestKey?: string
  isNotRefreshing?: boolean // 判断这次请求是否 是刷新token的请求
  retryCount?: number
}

// 定义一个返回类型的接口
export interface WLResponseSuccess extends WXResultSuccessType<any> {
  config: WLRequestConfig
}

export interface WXResponseFail extends WXResultFailType {
  config: WLRequestConfig
}

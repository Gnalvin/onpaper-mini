import { wlRequest } from '../index'
import { ILoginResult, IPasswordLogin, IPhoneLoginInfo } from './type'
import { encryptInterceptors } from '../utils/encrypt'

enum mainAPI {
  WxPhoneLoginAPI = '/auth/wx_login', // 微信登陆
  LoginByPassword = '/auth/login/password', // 用户密码登录
  LoginByPhone = '/auth/login/phone', // 用户手机登陆接口
  GetPhoneCode = '/auth/phonecode' // 获取手机验证码
}

// 验证码登陆
export function postPhoneLoginRequest(registerInfo: IPhoneLoginInfo) {
  return wlRequest.post<ILoginResult>({
    url: mainAPI.LoginByPhone,
    data: registerInfo
  })
}

//获取手机验证码
export function getPhoneCodeRequest(phone: string) {
  return wlRequest.get<{ status: string }>({
    url: mainAPI.GetPhoneCode,
    data: { phone },
    interceptors: {
      requestInterceptors: encryptInterceptors
    }
  })
}

// 微信手机号登陆
export function wxPhoneLoginRequest(code: string) {
  return wlRequest.get<ILoginResult>({
    url: mainAPI.WxPhoneLoginAPI,
    data: { code }
  })
}

// 账号密码登陆
export function passwordLoginRequest(loginInfo: IPasswordLogin) {
  return wlRequest.post<ILoginResult>({
    url: mainAPI.LoginByPassword,
    data: loginInfo
  })
}

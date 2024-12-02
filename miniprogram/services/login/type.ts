export interface ILoginResult {
  userId: string
  userName: string
  avatar: string
  refreshToken: string
  accessToken: string
}

export interface IPasswordLogin {
  account: string
  password: string
}

export interface IPhoneLoginInfo {
  phone: string
  verifyCode: string
}

import { wlRequest } from '../index'
import { IUpdateData } from './type'

enum mainAPI {
  VerifyName = '/auth/verifyname', // 验证用户名是否存在
  UpdateUserProfile = '/user/profile'
}
// 判断用户名是否存在
export function userNameVerifyRequest(userName: string) {
  return wlRequest.get({
    url: mainAPI.VerifyName,
    data: { username: userName }
  })
}
//更新用户资料
export function updateUserProfileRequest(data: IUpdateData) {
  return wlRequest.patch<IUpdateData>({
    url: mainAPI.UpdateUserProfile,
    data: data
  })
}

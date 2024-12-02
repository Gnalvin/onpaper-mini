import { wlRequest } from '../index'
import {
  IStsQuery,
  IStsToken,
  IPostUserFocusResult,
  IRecommendUser
} from './type'

enum mainAPI {
  GetStsData = '/uploadimg/sts',
  PostUserFocusAPI = '/user/focus',
  GetRecommendUser = '/user/recommend'
}

// 请求上传的 的sts
export function getSTSTokenRequest(data: IStsQuery) {
  return wlRequest.get<IStsToken>({
    url: mainAPI.GetStsData,
    data
  })
}

//关注用户
export function postUserFocusRequest(focusId: string, isCancel: boolean) {
  return wlRequest.post<IPostUserFocusResult>({
    url: mainAPI.PostUserFocusAPI,
    data: { focusId, isCancel }
  })
}

//请求推荐用户数据
export function getRecommendUserRequest() {
  return wlRequest.get<IRecommendUser[]>({
    url: mainAPI.GetRecommendUser
  })
}

import { wlRequest } from '../index'
import { ICallBackData } from './type'

enum mainAPI {
  PostSaveAvatarAPI = '/save/avatar',
  PostSaveBannerAPI = '/save/banner'
}

// 保存头像图片信息 请求
export function saveAvatarInfoRequest(data: ICallBackData) {
  return wlRequest.post<{ fileName: string }>({
    url: mainAPI.PostSaveAvatarAPI,
    data: data
  })
}

// 保存背景图片信息 请求
export function saveBannerInfoRequest(data: ICallBackData) {
  return wlRequest.post<{ fileName: string }>({
    url: mainAPI.PostSaveBannerAPI,
    data: data
  })
}

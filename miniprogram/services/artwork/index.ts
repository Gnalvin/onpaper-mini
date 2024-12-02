import { wlRequest } from '../index'
import { IArtworkInfoData, IInteractResult, IArtworkFormData } from './type'

enum mainAPI {
  GetArtworkInfoAPI = '/artwork/info',
  PostCollectAPI = '/user/collect',
  PostLikeAPI = '/user/like',
  PostSaveArtworkAPI = '/save/artwork'
}

// 获取作品信息请求
export function getArtworkInfoRequest(artid: string) {
  return wlRequest.get<IArtworkInfoData>({
    url: mainAPI.GetArtworkInfoAPI,
    data: { artid }
  })
}

//点赞作品请求
export function postArtworkLikeRequest(
  artworkId: string,
  authorId: string,
  isCancel: boolean
) {
  return wlRequest.post<IInteractResult>({
    url: mainAPI.PostLikeAPI,
    data: { msgId: artworkId, isCancel, authorId, type: 'aw' }
  })
}

//收藏作品请求
export function postArtworkCollectRequest(
  artworkId: string,
  authorId: string,
  isCancel: boolean,
  force = false
) {
  return wlRequest.post<IInteractResult>({
    url: mainAPI.PostCollectAPI,
    data: { msgId: artworkId, isCancel, authorId, type: 'aw', force }
  })
}

// 保存作品信息 请求
export function uploadArtworkInfoRequest(data: IArtworkFormData) {
  return wlRequest.post<{ artworkId: string }>({
    url: mainAPI.PostSaveArtworkAPI,
    data: data
  })
}

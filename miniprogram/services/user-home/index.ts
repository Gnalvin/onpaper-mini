import { wlRequest } from '../index'
import type {
  IProfileData,
  IArtwork,
  ICollectArtwork,
  IUserSmallCard
} from './type'

enum mainAPI {
  GetProfileAPI = '/user/profile',
  GetHomeArtwork = '/user/profile/artwork',
  GetHomeCollect = '/user/profile/collect',
  GetUserFollow = '/user/follow'
}

// 获取用户信息
export function getUserProfileRequest(id: string) {
  return wlRequest.get<{
    profile: IProfileData
    isFocus: number
    owner: boolean
  }>({
    url: mainAPI.GetProfileAPI,
    data: { id }
  })
}

// 获取主页作品信息
export function getUserHomeArtworkRequest(
  userId: string,
  page: number,
  sort: 'like' | 'collect' | 'now'
) {
  return wlRequest.get<{ artworks: IArtwork[] }>({
    url: mainAPI.GetHomeArtwork,
    data: { id: userId, page, sort }
  })
}

//获取主页收藏作品信息
export function getUserHomeCollectRequest(userId: string, page: number) {
  return wlRequest.get<ICollectArtwork[]>({
    url: mainAPI.GetHomeCollect,
    data: { uid: userId, page }
  })
}

// 获取用户粉丝列表
export function getUserFollowRequest(
  uid: string,
  page: number,
  type: 'follower' | 'following'
) {
  return wlRequest.get<IUserSmallCard[]>({
    url: mainAPI.GetUserFollow,
    data: { uid, page, type }
  })
}

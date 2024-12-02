import { wlRequest } from '../index'
import { encryptInterceptors } from '../utils/encrypt'
import { userQuery, IUserInfo, zoneQuery, IArtwork } from './type'

enum mainAPI {
  getAllUserShow = '/user/show',
  GetZoneArtwork = '/artwork/show',
  GetArtworkRank = '/artwork/rank',
  GetUserRank = '/user/rank'
}

//请求全站用户展示
export function getAllUserShowRequest(data: userQuery) {
  return wlRequest.get<{ userData: IUserInfo[]; isEnd: boolean }>({
    url: mainAPI.getAllUserShow,
    data: { ...data },
    interceptors: {
      requestInterceptors: encryptInterceptors
    }
  })
}

//请求分区作品数据
export function getZoneArtworkRequest(data: zoneQuery) {
  return wlRequest.get<IArtwork[]>({
    url: mainAPI.GetZoneArtwork,
    data: { ...data },
    interceptors: {
      requestInterceptors: encryptInterceptors
    }
  })
}

//请求作品排行榜数据
export function getArtworkRankRequest(type: string) {
  return wlRequest.get<IArtwork[]>({
    url: mainAPI.GetArtworkRank,
    data: { type }
  })
}

//请求用户排行榜数据
export function getUserRankRequest(type: string) {
  return wlRequest.get<IUserInfo[]>({
    url: mainAPI.GetUserRank,
    data: { type }
  })
}

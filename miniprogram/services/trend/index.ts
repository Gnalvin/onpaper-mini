import { wlRequest } from '../index'
import { IInteractData, ITrend, ITrendFormData } from './type'

enum mainAPI {
  GetOneTrend = '/trend/one',
  PostLike = '/user/like',
  GetHomeTrend = '/trend/user',
  GetNewTrend = '/trend/new',
  PostTrend = '/save/trend',
  GetFeeds = '/feed/all',
  GetHotTrend = '/trend/hot'
}

// 获取主页动态
export function getUserHomeTrendRequest(userId: string, next: string) {
  return wlRequest.get<ITrend[]>({
    url: mainAPI.GetHomeTrend,
    data: { uid: userId, next }
  })
}

//点赞动态请求
export function postTrendLikeRequest(
  trendId: string,
  authorId: string,
  isCancel: boolean,
  type: string
) {
  return wlRequest.post<IInteractData>({
    url: mainAPI.PostLike,
    data: { msgId: trendId, isCancel, authorId, type }
  })
}

//获取动态详情
export function getTrendDetailRequest(id: string, type = 'tr') {
  return wlRequest.get<ITrend>({
    url: mainAPI.GetOneTrend,
    data: { id, type }
  })
}

// 请求关注的用户最近动态数据
export function getFeedsRequest(nextid: string) {
  return wlRequest.get<ITrend[]>({
    url: mainAPI.GetFeeds,
    data: { nextid }
  })
}

// 获取全站最新的动态
export function getNewTrendRequest(nextid: string) {
  return wlRequest.get<ITrend[]>({
    url: mainAPI.GetNewTrend,
    data: { nextid }
  })
}

// 发布动态信息 请求
export function saveTrendInfoRequest(data: ITrendFormData) {
  return wlRequest.post<ITrend>({
    url: mainAPI.PostTrend,
    data: data
  })
}

// 获取热门动态
export function getHotTrendRequest() {
  return wlRequest.get<ITrend[]>({
    url: mainAPI.GetHotTrend
  })
}

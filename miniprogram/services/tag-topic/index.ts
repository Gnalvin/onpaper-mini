import { wlRequest } from '../index'
import {
  ITagAboutArt,
  IRelevantTag,
  ITagAboutUser,
  IRelevantTopic,
  ISearchTag,
  IHotTag
} from './type'
enum mainAPI {
  GetRelevantTag = '/tag/relevant',
  GetTagAboutArt = '/tag/search/art',
  GetTagAboutUser = '/tag/user',
  GetRelevantTopic = '/topic/relevant',
  GetHotTag = '/tag/hot',
  GetTopUseTag = '/tag/top_use'
}

// 请求相似tag数据
export function getRelevantTagRequest(tag: string, query: string) {
  return wlRequest.get<IRelevantTag>({
    url: mainAPI.GetRelevantTag,
    data: { tag, query }
  })
}

// 请求tag相关的 作品
export function getTagAboutArtRequest(
  tag: string,
  sort: 'score' | 'time',
  page: number,
  query: string
) {
  return wlRequest.get<ITagAboutArt[]>({
    url: mainAPI.GetTagAboutArt,
    data: { tag, sort, page, query }
  })
}

// 请求tag相关的 用户
export function getTagAboutUserRequest(tag: string, query: string) {
  return wlRequest.get<ITagAboutUser[]>({
    url: mainAPI.GetTagAboutUser,
    data: { tag, query }
  })
}

//模糊查找 相关话题
export function getRelevantTopicRequest(query: string, id = '0') {
  return wlRequest.get<IRelevantTopic[]>({
    url: mainAPI.GetRelevantTopic,
    data: { topic: query, id }
  })
}

//获取全站tag最多 数据
export function getTopUseRequest() {
  return wlRequest.get<ISearchTag[]>({
    url: mainAPI.GetTopUseTag
  })
}

//获取热门tag 数据
export function getHotTagRequest() {
  return wlRequest.get<IHotTag[]>({
    url: mainAPI.GetHotTag
  })
}

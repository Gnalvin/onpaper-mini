import { wlRequest } from '../index'
import { ICommentType, IPostCommentData, IPostLikeData } from './type'

enum mainAPI {
  GetCommentAPI = '/comment/root',
  GetChildCommentAPI = '/comment/reply',
  GetOneRootCommentAPI = '/comment/root/one',
  PostCommentAPI = '/comment',
  PostCommentLike = '/comment/like'
}

// 获取作品/动态评论信息
export function getRootCommentRequest(
  ownid: string,
  type: 'aw' | 'tr',
  cid = '0',
  sore = 1
) {
  return wlRequest.get<ICommentType[]>({
    url: mainAPI.GetCommentAPI,
    data: { ownid, cid, sore, type }
  })
}

//获取作品评论的子评论信息
export function getChildCommentRequest(rid: string, cid = '0', sore = 1) {
  return wlRequest.get<ICommentType[]>({
    url: mainAPI.GetChildCommentAPI,
    data: { cid, sore, rid }
  })
}

// 获取一条根评论数据
export function getOneRootCommentRequest(rid: string) {
  return wlRequest.get<ICommentType>({
    url: mainAPI.GetOneRootCommentAPI,
    data: { rid }
  })
}

//发布作品评论信息
export function postCommentRequest(data: IPostCommentData) {
  return wlRequest.post<ICommentType>({
    url: mainAPI.PostCommentAPI,
    data
  })
}

// 评论点赞
export function postLikeCommentRequest(data: IPostLikeData) {
  return wlRequest.post<IPostLikeData>({
    url: mainAPI.PostCommentLike,
    data: data
  })
}

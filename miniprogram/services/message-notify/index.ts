import { wlRequest } from '../index'
import type {
  INotifyBody,
  IUnreadCount,
  ICommentNotify,
  ILikeCommentNotify,
  ICommissionNotify,
  IChatRelation,
  IMessage,
  IQueryMsgRecord,
  ISendMessage
} from './type'

enum mainAPI {
  GetUnreadCountAPI = '/notify/unread',
  GetLikeAndCollectAPI = '/notify/like_collect',
  GetFocusNotifyAPI = '/notify/focus',
  GetCommentNotifyAPI = '/notify/comment',
  GetCommissionAPI = '/notify/commission',
  GetChatListAPI = '/message/chat',
  GetChatRecordAPI = '/message/record',
  SendMessageAPI = '/message/send'
}

// 请求未读的数据
export function getUnreadCountRequest() {
  return wlRequest.get<IUnreadCount>({
    url: mainAPI.GetUnreadCountAPI
  })
}

// 获取赞和收藏的通知
export function getLikeAndCollectRequest(nextId: string) {
  return wlRequest.get<INotifyBody<ILikeCommentNotify>[]>({
    url: mainAPI.GetLikeAndCollectAPI,
    data: { next: nextId }
  })
}

// 获取关注的通知
export function getFocusNotifyRequest(nextId: string) {
  return wlRequest.get<INotifyBody[]>({
    url: mainAPI.GetFocusNotifyAPI,
    data: { next: nextId }
  })
}

// 获取评论的通知
export function getCommentRequest(nextId: string) {
  return wlRequest.get<INotifyBody<ICommentNotify>[]>({
    url: mainAPI.GetCommentNotifyAPI,
    data: { next: nextId }
  })
}

// 获取约稿的通知
export function getCommissionRequest(nextId: string) {
  return wlRequest.get<INotifyBody<ICommissionNotify>[]>({
    url: mainAPI.GetCommissionAPI,
    data: { next: nextId }
  })
}

// 请求私信会话列表数据
export function getChatListRequest(nextid = '0') {
  return wlRequest.get<IChatRelation[]>({
    url: mainAPI.GetChatListAPI,
    data: { nextid }
  })
}

// 请求聊天记录数据
export function getChatRecordRequest(data: IQueryMsgRecord) {
  return wlRequest.get<IMessage[]>({
    url: mainAPI.GetChatRecordAPI,
    data
  })
}

// 发送私信
export function postSendMessageRequest(data: ISendMessage) {
  return wlRequest.post<IMessage>({
    url: mainAPI.SendMessageAPI,
    data: data
  })
}

// pages/tabBar/message/index.ts
import router from '../../../routers/index'
import {
  getUnreadCountRequest,
  getChatListRequest
} from '../../../services/message-notify/index'
import { formatChatListTime } from './handle'
import { IPageData, IPageFn } from './type'

Page<IPageData, IPageFn>({
  data: {
    isLogin: false,
    unread: {
      like: 0,
      at: 0,
      follow: 0,
      collect: 0,
      comment: 0,
      commission: 0
    },
    chatList: [],
    chatListEnd: false,
    zeroChat: false
  },
  async onLoad() {
    const userId = wx.getStorageSync('userId')
    this.setData({ isLogin: !!userId, userId })
    // 如果没有登陆 不请求消息
    if (!userId) return
    this.getUnreadCountAction()
    await this.getChatListAction()
  },
  onReachBottom() {
    this.getChatListAction()
  },
  // 下拉刷新
  async onPullDownRefresh() {
    this.setData({ chatListEnd: false, zeroChat: false })
    this.data.chatList = []
    await this.onLoad()
    wx.stopPullDownRefresh() //刷新完成后停止下拉刷新动效
  },
  // 获取未读消息
  async getUnreadCountAction() {
    const res = await getUnreadCountRequest()
    if (res.statusCode === 200) {
      this.setData({ unread: res.data })
    }
  },
  // 获取会话列表
  async getChatListAction() {
    const { chatList, chatListEnd } = this.data
    if (chatListEnd) return
    const lastItem = chatList[chatList.length - 1]
    const nextid = lastItem ? lastItem.chatId : '0'
    const res = await getChatListRequest(nextid)
    if (res.statusCode === 200) {
      res.data?.forEach((item) => {
        item.message[0].sendTime = formatChatListTime(item.message[0].sendTime)
        chatList.push(item)
      })
      this.setData({ chatList })
      // 小于30条说明到底
      if (!res.data || res.data.length < 30) this.setData({ chatListEnd: true })
      // 如果第一次请求就是空列表 说明没有收到过私信
      if (nextid === '0' && chatList.length === 0)
        this.setData({ zeroChat: true })
    }
  },
  // 跳转登陆页
  handleGotoLogin() {
    router.push({ name: 'WxLoginPage' })
  },
  // 跳转提醒页
  handleGoToNotify(e) {
    const notifyType = e.currentTarget.dataset.notify
    const { unread } = this.data
    // 点击后消除红点
    if (notifyType === 'like') {
      unread.like = 0
      unread.collect = 0
    } else if (notifyType === 'focus') {
      unread.follow = 0
    } else if (notifyType === 'comment') {
      unread.comment = 0
    } else {
      unread.commission = 0
    }
    this.setData({ unread })
    router.push({
      name: 'NotifyPage',
      query: { type: notifyType }
    })
  },
  // 跳转到聊天详情
  handleGoToChat(e) {
    const chat = e.currentTarget.dataset.chat
    const { sender, receiver } = chat
    const index = this.data.chatList.findIndex((i) => i.chatId === chat.chatId)
    this.data.chatList[index].unread = 0
    this.setData({ chatList: this.data.chatList })
    router.push({
      name: 'ChatDetail',
      query: { sender: sender, receiver: receiver }
    })
  },
  // 修改聊天列表内容
  updateChatListMsg(msg) {
    const chatItem = this.data.chatList.find((i) => i.chatId === msg.chatId)
    if (chatItem) {
      chatItem.message[0].content = msg.content
      chatItem.message[0].msgType = msg.msgType
      chatItem.message[0].sendTime = formatChatListTime(msg.sendTime)
      this.setData({ chatList: this.data.chatList })
    }
  }
})

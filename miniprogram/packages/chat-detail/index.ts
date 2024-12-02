// packages/chat-detail/index.ts
import router from '../../routers/index'
import { IPageData, IPageFn, IRecord } from './type'
import {
  getChatRecordRequest,
  postSendMessageRequest
} from '../../services/message-notify/index'
import { getSTSTokenRequest } from '../../services/common/index'
import { formatPicUrl } from '../../utils/format'
import { formaMessageTime, calculateImgSize } from './handle'
import { handleImgSuffix } from '../../utils/verify'
import { getFileInfo, getImageInfo } from '../../utils/system'
import { pageQueryRect } from '../../utils/query-rect'
import { OssClient } from '../../utils/oss'
import Toast from '@vant/weapp/toast/toast'

const systemInfo = wx.getSystemInfoSync()

Page<IPageData, IPageFn>({
  data: {
    receiver: null, // 接受者
    sender: null, // 发送者
    chatRecords: [], // 聊天记录
    imgRecords: [], // 图片聊天记录
    messageEnd: false, // 是否到顶
    tipMsg: '', // 提示信息
    // 在第一次网络请求回来之前不允许发送消息
    noReceiveMsg: true,
    scrollViewHight: 0, // 聊天框高度
    safeBottomHight: 10, // 手机安全区高度
    keyboardHeight: 0, // 键盘高度
    isFocus: false, // 是否聚焦input
    text: '' // 输入框的文本
  },
  onLoad(e: any) {
    const query = router.extract(e)
    wx.setNavigationBarTitle({ title: query.receiver.userName })
    this.calculateScrollHight()
    this.setData({ sender: query.sender, receiver: query.receiver })
    this.getMessageRecordAction()
  },
  // 查找聊天记录
  async getMessageRecordAction() {
    const { sender, receiver, messageEnd } = this.data
    if (messageEnd) return
    const lastMsg = this.data.chatRecords[this.data.chatRecords.length - 1]
    const nextid = lastMsg ? lastMsg.msgId : '0'
    const chatid = lastMsg ? lastMsg.chatId! : '0'
    const query = {
      sender: sender!.userId,
      receiver: receiver!.userId,
      nextid,
      chatid
    }
    const res = await getChatRecordRequest(query)
    const status = [200, 1007, 1026]
    if (status.indexOf(res.statusCode) !== -1) {
      const listLength = res.data.length
      for (let i = 0; i < listLength; i++) {
        const item = res.data[i]
        // 对比时间 相差不超过5分钟的 不显示时间
        const time = i == listLength - 1 ? '' : res.data[i + 1].sendTime
        item.showTime = formaMessageTime(item.sendTime, time)
        if (item.msgType == 'pic') {
          item.content = formatPicUrl(item.content, item.sender, 'messages')
          this.data.imgRecords.unshift(item.content)
          const { width, height } = calculateImgSize(
            item.width! as number,
            item.height! as number
          )
          item.width = width
          item.height = height
        }
        this.data.chatRecords.push(item)
      }
      this.setData({ chatRecords: this.data.chatRecords })
      // 小于20条说明到底
      if (listLength < 20) this.setData({ messageEnd: true })
    }

    if (res.statusCode === 200) this.setData({ noReceiveMsg: false })
    if (res.statusCode === 1007)
      this.setData({ tipMsg: '对方设置不接受任何人的私信' })
    if (res.statusCode === 1026)
      this.setData({ tipMsg: '对方仅允许他关注的人发送私信' })
  },
  // 获得input焦点时
  async handleInputFocus(e) {
    const keyboardHeight = e.detail.height - this.data.safeBottomHight / 2
    // 1.在页面底部增加键盘高度
    this.setData({ isFocus: true, keyboardHeight }, () => {
      this.handleGoToKeyBoardTop()
    })
  },
  // 输入文字时
  handleInput(e) {
    this.setData({ text: e.detail.value })
  },
  // input框失去焦点时
  handleInputBlur() {
    this.calculateScrollHight()
    this.setData({ isFocus: false, keyboardHeight: 0 })
  },
  // 计算scrollview的滚动高度
  async calculateScrollHight() {
    const input = await pageQueryRect('#input')
    const { safeArea, screenHeight, windowHeight } = systemInfo
    let safeBottomHight = screenHeight - safeArea.bottom
    if (!safeBottomHight) safeBottomHight = 10

    this.setData({
      scrollViewHight: windowHeight - input[0].height - safeBottomHight,
      safeBottomHight
    })
  },
  // 页面滚动到键盘前面
  handleGoToKeyBoardTop() {
    pageQueryRect('#bottomFlag').then((flag) => {
      wx.pageScrollTo({
        scrollTop: flag[0].top,
        duration: 200
      })
    })
  },
  handleUploadImg() {
    if (this.data.tipMsg) return
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    })
      .then((res) => {
        const imgSrc = res.tempFiles[0].tempFilePath
        this.uploadImgAcion(imgSrc)
      })
      .catch(() => {})
  },
  async uploadImgAcion(imgSrc) {
    // 1.验证图片信息
    const fileInfo = await getFileInfo(imgSrc)
    if (fileInfo.size > 8 * 1024 * 1024) {
      Toast({ message: '图片不能大于8M' })
      return
    }
    const imgInfo = await getImageInfo(imgSrc)
    const { width, height } = calculateImgSize(imgInfo.width, imgInfo.height)
    const suffix = handleImgSuffix(imgInfo.type)
    if (!suffix) {
      Toast('只能发送jpg和png格式的图片')
      return
    }
    // 2.模拟一个消息展示在上传
    const { receiver, sender, chatRecords } = this.data
    const time = new Date()
    const msg: IRecord = {
      receiver: receiver!.userId,
      sender: sender!.userId,
      content: imgSrc,
      msgType: 'pic',
      sendTime: time.toUTCString(),
      msgId: time.getTime().toString(),
      uploading: true,
      width,
      height
    }
    const lastMsg = chatRecords[0]
    const lastTime = lastMsg ? lastMsg.sendTime : ''
    msg.showTime = formaMessageTime(msg.sendTime, lastTime)
    chatRecords.unshift(msg)
    this.setData({ chatRecords })
    this.data.imgRecords.push(imgSrc)

    // 3.请求上传token
    const stsRes = await getSTSTokenRequest({ type: 'messages', count: 1 })
    if (stsRes.statusCode !== 200) {
      Toast({ message: '获取签名出错了' })
      return
    }
    // 4.上传图片
    const fileName = stsRes.data.fileName[0] + `.${suffix}`
    const oss = new OssClient(stsRes.data.token, 'preview')
    const path = `messages/${sender!.userId}/${fileName}`
    try {
      await oss.uploadFile(imgSrc, path)
    } catch (err) {
      // 上传失败修改图片状态
      chatRecords[0].uploadFail = true
      this.setData({ chatRecords })
      return
    }
    // 5. 图片上传成功 发送聊天记录服务器保存
    const res = await postSendMessageRequest({
      sender: sender!.userId,
      receiver: receiver!.userId,
      msgType: 'pic',
      width: imgInfo.width,
      height: imgInfo.height,
      content: fileName
    })
    if (res.statusCode === 200) {
      chatRecords[0].chatId = res.data.chatId
      chatRecords[0].msgId = res.data.msgId
      chatRecords[0].uploading = false
      this.setData({ chatRecords })
      // 修改上一个页面聊天列表的最新内容
      const pages = getCurrentPages()
      const prevPageIns = pages[pages.length - 2] // 上一个页面
      if (prevPageIns?.updateChatListMsg) {
        prevPageIns.updateChatListMsg(res.data)
      }
    } else {
      chatRecords[0].uploadFail = true
      this.setData({ chatRecords })
    }
  },
  // 发送文字消息
  async handleSendMessage() {
    const { text, sender, receiver, chatRecords } = this.data
    if (!text) return
    const msg = {
      sender: sender!.userId,
      receiver: receiver!.userId,
      content: text,
      msgType: 'text'
    }
    const res = await postSendMessageRequest(msg)
    if (res.statusCode === 200) {
      const lastMsg = chatRecords[0]
      const lastTime = lastMsg ? lastMsg.sendTime : ''
      res.data.showTime = formaMessageTime(res.data.sendTime, lastTime)
      chatRecords.unshift(res.data)
      this.setData({ chatRecords, text: '' })
      // 修改上一个页面聊天列表的最新内容
      const pages = getCurrentPages()
      const prevPageIns = pages[pages.length - 2] // 上一个页面
      if (prevPageIns?.updateChatListMsg) {
        prevPageIns.updateChatListMsg(res.data)
      }
    }
  },
  // 预览图片
  handlePreviewPic(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.url,
      urls: this.data.imgRecords
    })
  },
  // 主动获取焦点
  focus() {
    this.setData({ isFocus: true })
  }
})

// packages/upload-trend/index.ts
import { verifyImgInfo } from '../../utils/verify'
import { getSTSTokenRequest } from '../../services/common/index'
import { getRelevantTopicRequest } from '../../services/tag-topic/index'
import { saveTrendInfoRequest } from '../../services/trend/index'
import { ITrendFormData } from '../../services/trend/type'
import { IPageData, IPageFn } from './type'
import { debounce } from '../../utils/debounce'
import { OssClient } from '../../utils/oss'
import Toast from '@vant/weapp/toast/toast'
import Dialog from '@vant/weapp/dialog/dialog'
import router from '../../routers/index'

const { screenHeight, safeArea } = wx.getSystemInfoSync()

Page<IPageData, IPageFn>({
  data: {
    userId: '',
    urlList: [], // 上传的图片列表
    text: '',
    wordCount: 0,
    safeBottomHight: 15, // iphoneX 底部距离
    isShowTopicPop: false,
    topicString: '',
    topic: null,
    whoSee: {
      text: '公开',
      label: 'public'
    },
    isShowPublic: false,
    whoSeeSetting: [
      {
        text: '公开',
        label: 'public'
      },
      {
        text: '粉丝可见',
        label: 'onlyFans'
      },
      {
        text: '自己可见',
        label: 'privacy'
      }
    ],
    relevantTopic: [],
    oldSearch: '',
    needDelImg: [],
    isShowUploadIng: false
  },
  onLoad() {
    const userId = wx.getStorageSync('userId')
    let safeBottomHight = screenHeight - safeArea.bottom
    if (!safeBottomHight) safeBottomHight = 15
    this.setData({ safeBottomHight, userId })
  },
  onTextInput(e) {
    let text = e.detail.value as string
    // 最多两个回车
    text = text.replace(/\n{3,}/g, '\n\n')
    this.setData({ text, wordCount: text.length })
  },
  addTrendImg() {
    const listLen = this.data.urlList.length
    wx.chooseMedia({
      count: 9 - listLen,
      mediaType: ['image'],
      sizeType: ['original'],
      sourceType: ['album']
    })
      .then(async (res) => {
        const maxSort = Math.max(...this.data.urlList.map((i) => i.sortIndex))
        // 验证图片是否合格
        const picData = await verifyImgInfo(res.tempFiles, maxSort + 1, 10, 250)
        // 上传图片
        const stsRes = await getSTSTokenRequest({
          type: 'trends',
          count: picData.okPic.length
        })
        if (stsRes.statusCode !== 200) {
          Toast('获取签名出错了')
          return
        }
        this.uploadPic(picData.okPic, stsRes.data)
        // 渲染预览
        this.data.urlList.push(...picData.okPic)
        this.setData({ urlList: this.data.urlList })
        // 如果有图片不符合要求
        if (picData.failPic.length) {
          Dialog.alert({
            title: '图片不符合要求',
            message: `有图片不符合要求已剔除：
                   1. 大小超过10M
                   2. 宽高尺寸小于 250 或超过 10000 像素
                   3. 类型只能是 jpg 或 png 格式`,
            confirmButtonText: '知道啦',
            messageAlign: 'left'
          })
        }
      })
      .catch(() => {})
  },
  saveNewList(e) {
    const newList = e.detail.newList
    const newListMap: Record<string, number> = {}
    newList.forEach(function (item) {
      newListMap[item.url] = item.sortIndex
    })
    // 更新 urlList 中的 sortIndex
    this.data.urlList.forEach((item) => {
      const newSortIndex = newListMap[item.url]
      if (newSortIndex !== undefined) {
        item.sortIndex = newSortIndex
      }
    })
  },
  delTrendImg(e) {
    let { urlList } = this.data
    const deleteIndex = e.detail.delIndex
    urlList.splice(deleteIndex, 1)
    this.setData({ urlList })
  },
  // 上传图片
  async uploadPic(urlList, sts) {
    for (const item of urlList) {
      const fileName = sts.fileName.pop() + `.${item.type}`
      const oss = new OssClient(sts.token)
      const path = `trends/${this.data.userId}/${fileName}`
      item.fileName = fileName
      try {
        await oss.uploadFile(item.url, path)
      } catch (err) {
        item.upload = -1
        continue
      }
      item.upload = 1
    }
  },
  handleShowTopicPop() {
    this.setData({ isShowTopicPop: !this.data.isShowTopicPop })
  },
  onTopicInput(e) {
    let topic = e.detail.value as string
    const reg = /[^a-zA-Z0-9\u4e00-\u9fa5\u3040-\u30ff가-힣]/g
    const isHave = reg.test(topic)
    if (isHave) Toast('话题不能含有特殊符号')
    // 使用正则表达式匹配除了中文、日文、韩文字符以外的所有字符，并替换为空字符串
    topic = topic.replace(reg, '')
    this.setData({ topicString: topic })
    if (this.data.oldSearch !== topic) {
      this.getTopicAction(topic)
      this.data.oldSearch = topic
    }
  },
  getTopicAction: debounce(function (topic: string) {
    if (!topic) {
      // @ts-ignore
      this.setData({ relevantTopic: [] })
      return
    }
    getRelevantTopicRequest(topic).then((res) => {
      if (res.statusCode === 200) {
        // @ts-ignore
        this.setData({ relevantTopic: res.data })
      }
    })
  }),
  uploadFormData() {
    if (!this.data.text && !this.data.urlList.length) {
      return
    }
    if (this.data.needDelImg.length) {
      Toast('请删除上传失败的图片')
      return
    }
    this.setData({ isShowUploadIng: true })
    this.checkUploadStatus()
      .then(() => {
        this.postTrendAction()
      })
      .catch(() => {
        this.setData({ isShowUploadIng: false })
        Dialog.alert({
          title: '图片上传失败',
          message: '有图片上传失败,请删除后重新上传',
          confirmButtonText: '知道啦'
        })
      })
  },
  async postTrendAction() {
    const data: ITrendFormData = {
      text: this.data.text,
      whoSee: this.data.whoSee.label,
      comment: 'public',
      topic: this.data.topic ?? { text: '', topicId: '' },
      forwardInfo: { id: '0', type: '' },
      fileList: this.data.urlList.map((i) => ({
        fileName: i.fileName,
        sort: i.sortIndex,
        width: i.width,
        height: i.height
      }))
    }
    const res = await saveTrendInfoRequest(data)
    if (res.statusCode === 200) {
      router.reLaunch({ name: 'TabUserHome' })
    } else {
      this.setData({ isShowUploadIng: false })
      Toast('出错了，请稍后再试')
    }
  },
  checkUploadStatus() {
    return new Promise((resolve, reject) => {
      const intervalId = setInterval(() => {
        this.data.urlList.forEach((item, index) => {
          if (item.upload === -1) {
            this.data.needDelImg.push(index)
          }
        })
        // 如果有上传失败的图片需要删除
        if (this.data.needDelImg.length) {
          this.setData({ needDelImg: this.data.needDelImg })
          clearInterval(intervalId)
          reject()
          return
        }
        const allUploaded = this.data.urlList.every((item) => item.upload === 1)
        // 每秒检查一次 如果所有的都上传成功结束
        if (allUploaded) {
          clearInterval(intervalId)
          resolve()
          return
        }
      }, 1000)
    })
  },
  onChoseTopic(e) {
    const text = e.currentTarget.dataset.text
    this.data.topic = { text, topicId: '0' }
    this.data.oldSearch = ''
    this.setData({
      topicString: '',
      isShowTopicPop: false,
      relevantTopic: [],
      topic: this.data.topic
    })
  },
  onDelTopic() {
    this.setData({ topic: null })
  },
  handleShowWhoSee() {
    this.setData({ isShowPublic: !this.data.isShowPublic })
  },
  changeWhoSee(e) {
    this.setData({ whoSee: e.detail.value })
    this.handleShowWhoSee()
  },
  handleShowSmallTip() {
    Dialog.alert({
      title: '发布小帖士',
      message: `我们鼓励向上、真实、原创的内容，含以下内容的动态将不会被推荐：
             1. 含有不文明用语，过度性感图片；
             2. 冒充他人或搬运作品；
             3. 含有广告的内容；
             4. 为刻意博取眼球，在内容、图片使用夸张的表达。`,
      confirmButtonText: '我知道啦',
      messageAlign: 'left'
    })
  }
})

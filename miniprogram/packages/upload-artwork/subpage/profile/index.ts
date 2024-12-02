// packages/upload-artwork/subpage/profile/index.ts
import router from '../../../../routers/index'
import { zoneOptions } from '../../../../config/zone/zoneOptions'
import { IEditePageFn, IEditePageData, previewPageIns, IUrlItem } from './type'
import { verifyImgInfo } from '../../../../utils/verify'
import { getSTSTokenRequest } from '../../../../services/common/index'
import { uploadArtworkInfoRequest } from '../../../../services/artwork/index'
import { OssClient } from '../../../../utils/oss'
import Toast from '@vant/weapp/toast/toast'
import Dialog from '@vant/weapp/dialog/dialog'

const { screenHeight, safeArea } = wx.getSystemInfoSync()

Page<IEditePageData, IEditePageFn>({
  data: {
    userId: '',
    urlList: [], // 上传的图片列表
    cover: '', // 本地预览封面
    coverName: '', // 上传后的封面名字
    title: '', // 标题
    introduce: '', // 介绍
    zone: '', // 分区
    comment: 'public', // 评论权限
    copyright: 'OWNER', // 版权
    whoSee: 'public', // 可见权限
    adult: false, // 是否含未成年敏感内容
    wordCount: 0, //introduce 字数统计
    isShowZone: false,
    isShowTagPop: false,
    tagString: '',
    tagList: [], // 设置的 tag
    zoneOptions: zoneOptions,
    safeBottomHight: 15, // iphoneX 底部距离
    needDelImg: [], // 上传失败需要删除的图片index
    forbidBack: false, // 点击上传按钮后不允许返回上一页
    isShowUploadIng: false
  },
  onLoad(e: any) {
    let safeBottomHight = screenHeight - safeArea.bottom
    if (!safeBottomHight) safeBottomHight = 15
    const data = router.extract(e)
    this.setData({
      urlList: data?.urlList ?? [],
      safeBottomHight,
      userId: data?.userId
    })
    wx.enableAlertBeforeUnload({ message: '确定要离开吗？数据将不会保存' })
  },
  onUnload() {
    // 点击了上传 如果手往回切 跳转到主页 不允许上一页
    if (this.data.forbidBack) {
      router.switchTab({ name: 'TabMainHome' })
    }
  },
  onTitleInput(e) {
    const title = e.detail.value as string
    this.setData({ title: title.replace(/\s*/g, '') })
  },
  onIntorduceInput(e) {
    let introduce = e.detail.value as string
    // 最多两个回车
    introduce = introduce.replace(/\n{3,}/g, '\n\n')
    this.setData({ introduce, wordCount: introduce.length })
  },
  onTagInput(e) {
    const tagString = e.detail.value as string
    const reg = /[^a-zA-Z0-9\u4e00-\u9fa5\u3040-\u30ff가-힣]/g
    const isHave = reg.test(tagString)
    if (isHave) Toast('标签不能含有特殊符号')
    // 使用正则表达式匹配除了中文、日文、韩文字符以外的所有字符，并替换为空字符串
    this.setData({
      tagString: tagString.replace(reg, '')
    })
  },
  onTagInputConfirm(e) {
    if (e.detail.value.length === 0) return
    // 不添加重复的
    if (!this.data.tagList.includes(e.detail.value)) {
      this.data.tagList.push(e.detail.value)
    }
    this.setData({ tagList: this.data.tagList, tagString: '' })
  },
  handleDelTag(e) {
    const delIndex = e.currentTarget.dataset.index
    this.data.tagList.splice(delIndex, 1)
    this.setData({ tagList: this.data.tagList })
  },
  changeZone(e) {
    const zone = e.detail.value.text
    this.setData({ zone })
    this.handleShowZonePic()
  },
  async changeCover(cover) {
    const stsRes = await getSTSTokenRequest({ type: 'artworks', count: 1 })
    if (stsRes.statusCode !== 200) {
      Toast({ message: '封面上传出错了,请重新设置封面' })
      return
    }
    const fileName = stsRes.data.fileName[0] + '.jpg'
    const oss = new OssClient(stsRes.data.token)
    const path = `artworks/${this.data.userId}/${fileName}`

    try {
      await oss.uploadFile(cover, path)
    } catch (err) {
      Toast({ message: '封面上传出错了,请重新设置封面' })
      return
    }
    this.data.coverName = fileName
    this.setData({ cover })
  },
  addArtworkImg() {
    const listLen = this.data.urlList.length
    wx.chooseMedia({
      count: 15 - listLen,
      mediaType: ['image'],
      sizeType: ['original'],
      sourceType: ['album']
    })
      .then(async (res) => {
        const maxSort = Math.max(...this.data.urlList.map((i) => i.sortIndex))
        // 验证图片是否合格
        const picData = await verifyImgInfo(res.tempFiles, maxSort + 1, 20, 500)
        // 上传图片
        const stsRes = await getSTSTokenRequest({
          type: 'artworks',
          count: picData.okPic.length
        })
        if (stsRes.statusCode !== 200) {
          Toast('获取签名出错了')
          return
        }
        this.uploadArtPic(picData.okPic, stsRes.data)
        // 渲染预览
        this.data.urlList.push(...picData.okPic)
        this.setData({ urlList: this.data.urlList })
        // 如果有图片不符合要求
        if (picData.failPic.length) {
          Dialog.alert({
            title: '图片不符合要求',
            message: `有图片不符合要求已剔除：
                   1. 大小超过20M
                   2. 宽高尺寸小于 500 或超过 10000 像素
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
  delArtworkImg(e) {
    let { needDelImg, urlList } = this.data
    const deleteIndex = e.detail.delIndex
    urlList.splice(deleteIndex, 1)
    needDelImg = needDelImg.filter((i) => i !== deleteIndex)
    this.setData({ urlList, needDelImg })
  },
  uploadFormData() {
    if (!this.checkFormData()) return
    if (this.data.needDelImg.length) {
      Toast('请删除上传失败的图片')
      return
    }
    this.setData({ isShowUploadIng: true })
    this.data.forbidBack = true
    this.checkUploadStatus()
      .then(() => {
        this.uploadArtInfoAcion()
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
  checkUploadStatus() {
    return new Promise((resolve, reject) => {
      const intervalId = setInterval(() => {
        const pages = getCurrentPages()
        const prevPageIns = pages[pages.length - 2] as previewPageIns // 上一个页面
        if (!prevPageIns) {
          clearInterval(intervalId)
          return
        }
        const statusMap: Record<string, IUrlItem> = {}
        prevPageIns.data.urlList.forEach((i) => (statusMap[i.url] = i))
        // 同步上一页的上传状态到本页
        this.data.urlList.forEach((item, index) => {
          const data = statusMap[item.url]
          if (data !== undefined) {
            item.upload = data.upload
            item.fileName = data.fileName
          }
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
  // 上传图片
  async uploadArtPic(urlList, sts) {
    for (const item of urlList) {
      const fileName = sts.fileName.pop() + `.${item.type}`
      const oss = new OssClient(sts.token)
      const path = `artworks/${this.data.userId}/${fileName}`
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
  checkFormData() {
    if (!this.data.urlList.length) {
      Toast('请至少选择一张图片')
      return false
    }
    if (!this.data.coverName) {
      Toast('请设置作品封面噢')
      return false
    }
    if (!this.data.title) {
      Toast('请填写作品标题噢')
      return false
    }
    if (!this.data.tagList.length) {
      Toast('至少要添加一个标签噢')
      return false
    }
    if (!this.data.zone) {
      Toast('必须设置作品分区噢')
      return false
    }
    return true
  },
  goToSettingCover() {
    router.push({
      name: 'UploadArtworkCover',
      query: { urlList: this.data.urlList }
    })
  },
  goToSetting() {
    const { whoSee, adult, comment, copyright } = this.data
    router.push({
      name: 'UploadArtworkSetting',
      query: { whoSee, adult, comment, copyright }
    })
  },
  handleShowZonePic() {
    this.setData({ isShowZone: !this.data.isShowZone })
  },
  handleShowTagPop() {
    this.setData({ isShowTagPop: !this.data.isShowTagPop })
  },
  async uploadArtInfoAcion() {
    const data = {
      title: this.data.title,
      description: this.data.introduce,
      fileList: this.data.urlList.map((i) => ({
        fileName: i.fileName,
        sort: i.sortIndex,
        width: i.width,
        height: i.height
      })),
      zone: this.data.zone,
      whoSee: this.data.whoSee,
      tags: this.data.tagList,
      adult: this.data.adult,
      cover: this.data.coverName,
      comment: this.data.comment,
      copyright: this.data.copyright,
      device: 'WeChat' as 'WeChat'
    }
    const res = await uploadArtworkInfoRequest(data)
    if (res.statusCode === 200) {
      this.data.forbidBack = false
      router.reLaunch({ name: 'TabUserHome' })
    } else {
      this.setData({ isShowUploadIng: false })
      Toast('出错了，请稍后再试')
    }
  },
  handleShowSmallTip() {
    Dialog.alert({
      title: '发布小帖士',
      message: `我们鼓励向上、真实、原创的内容，含以下内容的作品将不会被推荐：
             1. 含有不文明用语，过度性感图片；
             2. 冒充他人或搬运作品；
             3. 含有广告的内容；
             4. 为刻意博取眼球，在内容、图片使用夸张的表达。`,
      confirmButtonText: '我知道啦',
      messageAlign: 'left'
    })
  }
})

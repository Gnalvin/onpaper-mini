// packages/upload-artwork/index.ts
import { pageQueryScrollview } from '../../utils/query-rect'
import { verifyImgInfo } from '../../utils/verify'
import Toast from '@vant/weapp/toast/toast'
import Dialog from '@vant/weapp/dialog/dialog'
import { getSTSTokenRequest } from '../../services/common/index'
import { OssClient } from '../../utils/oss'
import { IPageData, IPageFn } from './type'
import router from '../../routers/index'

const { screenHeight, safeArea, windowWidth } = wx.getSystemInfoSync()

Page<IPageData, IPageFn>({
  data: {
    userId: '',
    swiperIndex: 0,
    urlList: [],
    tempWidth: 0,
    swiperDuration: 500,
    safeBottomHight: 15,
    itemWidth: 0,
    isShowFailImgTip: false
  },
  async onLoad() {
    const userId = wx.getStorageSync('userId')
    let safeBottomHight = screenHeight - safeArea.bottom
    if (!safeBottomHight) safeBottomHight = 15
    // 100 是盒子的宽度和间距 换算成对应机子的px
    const itemWidth = (windowWidth / 375) * 105
    const tempWidth = windowWidth / 2 - itemWidth / 2
    this.setData({ safeBottomHight, tempWidth, itemWidth, userId })
  },
  onClickAddImg() {
    if (this.data.urlList.length === 15) {
      Toast('最多添加15张图片')
      return
    }
    const listLen = this.data.urlList.length
    wx.chooseMedia({
      count: 15 - listLen,
      mediaType: ['image'],
      sizeType: ['original'],
      sourceType: ['album']
    })
      .then(async (res) => {
        // 验证图片是否合格
        const picData = await verifyImgInfo(res.tempFiles, listLen, 20, 500)
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
        if (this.data.swiperIndex < 0) this.setData({ swiperIndex: 0 })
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
  async onClickDeleteImg(e) {
    const { urlList, swiperIndex } = this.data
    const delIndex = e.currentTarget.dataset.index
    urlList.splice(delIndex, 1)

    // 从前面删除
    if (swiperIndex > delIndex) {
      this.scrollToIndex(delIndex)
      this.setData({ swiperIndex: swiperIndex - 1 })
    }
    // 从后面删除
    if (swiperIndex <= delIndex) {
      if (swiperIndex > urlList.length - 1) {
        this.setData({ swiperIndex: urlList.length - 1 })
      }
      this.scrollToIndex(delIndex - 1)
    }

    this.setData({ urlList })
  },
  // 滑动大图Swiper时
  async handleSwiperChange(e) {
    if (e.detail.source !== 'touch') return
    const index = e.detail.current
    this.setData({ swiperIndex: index })
    this.scrollToIndex(index)
  },
  // 点击图片切换展示
  async changeSwiperIndex(e) {
    const choseIndex = this.data.swiperIndex
    const newIndex = e.currentTarget.dataset.index
    //点击同一个图片不处理
    if (choseIndex === newIndex) return
    this.scrollToIndex(newIndex)
    if (Math.abs(newIndex - choseIndex) > 1) this.setData({ swiperDuration: 0 })
    this.setData({ swiperIndex: newIndex }, () => {
      this.setData({ swiperDuration: 500 })
    })
  },
  // 滚动制定位置
  async scrollToIndex(index) {
    const scrollView = await pageQueryScrollview('#scrollview')
    const left = (this.data.itemWidth - (windowWidth / 375) * 20) * index
    //left !== null 这个是废话 但是不这样真机不会滚
    if (left !== null) scrollView.scrollTo({ left, duration: 200 })
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
  goToEditeProfile() {
    if (this.data.urlList.length === 0) {
      Toast('请至少选择一张图片')
      return
    }
    router.push({
      name: 'UploadArtworkProfile',
      query: { urlList: this.data.urlList, userId: this.data.userId }
    })
  }
})

// packages/upload-artwork/subpage/cover/index.ts
import { pageQueryScrollview } from '../../../../utils/query-rect'
import router from '../../../../routers/index'
import { IPageData, IPageFn, editePageIns } from './type'

const { windowWidth, safeArea, screenHeight } = wx.getSystemInfoSync()

Page<IPageData, IPageFn>({
  data: {
    cropperWidth: 0,
    cropperHeight: 0,
    urlList: [],
    itemWidth: 0,
    tempWidth: 0,
    choseIndex: 0,
    cropperIns: null,
    safeBottomHight: 15
  },
  onLoad(e: any) {
    const cropperWidth = windowWidth > 500 ? 500 : windowWidth
    const cropperHeight = cropperWidth / 1.3 // 宽高比 1.3
    // 100 是盒子的宽度和间距 换算成对应机子的px
    const itemWidth = (windowWidth / 375) * 105
    const tempWidth = windowWidth / 2 - itemWidth / 2
    const data = router.extract(e)
    let safeBottomHight = screenHeight - safeArea.bottom
    if (!safeBottomHight) safeBottomHight = 15
    this.setData({
      urlList: data.urlList,
      cropperWidth,
      cropperHeight,
      tempWidth,
      itemWidth,
      safeBottomHight
    })
  },
  onReady() {
    // @ts-ignore
    this.data.cropperIns = this.selectComponent('#image-cropper')
  },
  async saveImg() {
    const imgUrl = await this.data.cropperIns!.saveImg()
    const pages = getCurrentPages()
    const prevPageIns = pages[pages.length - 2] as editePageIns // 上一个页面
    prevPageIns.changeCover(imgUrl)
    router.back()
  },
  // 点击图片跳转
  async changeSwiperIndex(e) {
    const newIndex = e.currentTarget.dataset.index
    //点击同一个图片不处理
    if (this.data.choseIndex === newIndex) return
    this.data.choseIndex = newIndex
    this.scrollToIndex(newIndex)
    this.data.cropperIns?.useUrlImage(this.data.urlList[newIndex].url)
  },
  // 滚动制定位置
  async scrollToIndex(index: number) {
    const scrollView = await pageQueryScrollview('#scrollview')
    const left = (this.data.itemWidth - (windowWidth / 375) * 20) * index
    scrollView.scrollTo({ left, duration: 200 })
  },
  goBack() {
    router.back()
  }
})

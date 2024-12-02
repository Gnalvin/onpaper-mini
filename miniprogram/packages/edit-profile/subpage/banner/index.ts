// pages/edit-profile/subpage/banner/index.ts
import router from '../../../../routers/index'
import { IPageData, IPageFn, editePageIns } from './type'
import { getSTSTokenRequest } from '../../../../services/common/index'
import { OssClient } from '../../../../utils/oss'
import { getFileInfo } from '../../../../utils/system'
import { saveBannerInfoRequest } from '../../../../services/upload/index'
import Toast from '@vant/weapp/toast/toast'

Page<IPageData, IPageFn>({
  /**
   * 页面的初始数据
   */
  data: {
    cropperIns: null,
    userId: '',
    filePath: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(query: { userId: string }) {
    // @ts-ignore
    this.data.cropperIns = this.selectComponent('#image-cropper')
    this.data.userId = query.userId
  },
  chooseImg() {
    this.data.cropperIns!.selectImage() // 选择图片
  },
  async upload() {
    Toast.loading({ message: '图片保存中...', forbidClick: true })
    const url = await this.data.cropperIns!.saveImg()

    const fileInfo = await getFileInfo(url)
    if (fileInfo.size > 15 * 1024 * 1024) {
      return Toast({ message: '图片不能大于15M' })
    }
    const stsRes = await getSTSTokenRequest({ type: 'banners', count: 1 })
    if (stsRes.statusCode !== 200) {
      Toast({ message: '获取签名出错了' })
      return
    }
    const fileName = stsRes.data.fileName[0] + '.jpg'
    const oss = new OssClient(stsRes.data.token)
    const path = `banners/${this.data.userId}/${fileName}`

    try {
      await oss.uploadFile(url, path)
    } catch (err) {
      Toast({
        message: `出错了! code:${err.statusCode},requestId:${err.header['x-oss-request-id']}`,
        duration: 5000
      })
      return
    }
    this.data.filePath = url
    this.uploadData(fileName, fileInfo.size)
    return
  },
  // 保存数据到服务器
  async uploadData(fileName, size) {
    const res = await saveBannerInfoRequest({
      fileName,
      type: 'image/jpeg',
      size
    })
    if (res.statusCode === 200) {
      const pages = getCurrentPages()
      const prevPageIns = pages[pages.length - 2] as editePageIns // 上一个页面
      prevPageIns.changeBanner(this.data.filePath)
      Toast.clear()
      // 返回上一页
      router.back()
    } else {
      Toast({
        message: `更新个人资料失败。code${res.statusCode}`,
        forbidClick: true
      })
    }
  }
})

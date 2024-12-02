import { IStsToken } from '../../services/common/type'

export type previewPageIns = WechatMiniprogram.Page.Instance<IPageData, IPageFn>

export interface IPageData {
  userId: string
  swiperIndex: number
  urlList: IUrlItem[]
  tempWidth: number
  swiperDuration: number
  safeBottomHight: number
  itemWidth: number
  isShowFailImgTip: boolean
}

export interface IPageFn {
  onClickAddImg: () => void
  handleSwiperChange: (e: WechatMiniprogram.CustomEvent) => void
  changeSwiperIndex: (e: WechatMiniprogram.CustomEvent) => void
  onClickDeleteImg: (e: WechatMiniprogram.CustomEvent) => void
  scrollToIndex: (index: number) => void
  uploadArtPic: (urlList: IUrlItem[], sts: IStsToken) => Promise<void>
  goToEditeProfile: () => void
}

// 构建的 URLItem
export type IUrlItem = {
  url: string
  sortIndex: number
  fileName: string
  width: number
  height: number
  upload: 0 | 1 | -1 // 0 待上传 -1 上传失败 1 上传成功
  type: 'jpg' | 'png'
}

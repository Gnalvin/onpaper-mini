import { IData, IMethod, IProperty } from '../../../../components/cropper/type'
import { IUrlItem } from '../../type'
import { IEditePageData, IEditePageFn } from '../profile/type'

export type editePageIns = WechatMiniprogram.Page.Instance<
  IEditePageData,
  IEditePageFn
>

export interface IPageData {
  cropperWidth: number
  cropperHeight: number
  urlList: IUrlItem[]
  itemWidth: number
  tempWidth: number
  choseIndex: number
  safeBottomHight: number
  cropperIns: WechatMiniprogram.Component.Instance<
    IData,
    IProperty,
    IMethod
  > | null
}

export interface IPageFn {
  saveImg: () => void
  goBack: () => void
  changeSwiperIndex: (e: WechatMiniprogram.CustomEvent) => void
  scrollToIndex: (index: number) => void
}

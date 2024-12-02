import { IData, IMethod, IProperty } from '../../../../components/cropper/type'
import { IProfilePageData, IProfilePageFn } from '../../type'

export type editePageIns = WechatMiniprogram.Page.Instance<
  IProfilePageData,
  IProfilePageFn
>

export interface IPageData {
  userId: string
  cropperIns: WechatMiniprogram.Component.Instance<
    IData,
    IProperty,
    IMethod
  > | null
}

export interface IPageFn {
  upload: () => void
  chooseImg: () => void
  uploadData: (fileName: string, size: number) => void
}

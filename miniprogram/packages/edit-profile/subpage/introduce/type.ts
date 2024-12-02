import { IProfilePageData, IProfilePageFn } from '../../type'

export type editePageIns = WechatMiniprogram.Page.Instance<
  IProfilePageData,
  IProfilePageFn
>

export interface IPageData {
  introduce: string
  wordCount: number
  prevPageIns: editePageIns | null
  oldIntroduce: string
}

export interface IPageFn {
  handleInput: (e: WechatMiniprogram.CustomEvent) => void
  handleSave: () => void
}

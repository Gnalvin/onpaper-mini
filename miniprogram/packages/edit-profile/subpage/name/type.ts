import { IProfilePageData, IProfilePageFn } from '../../type'

export type editePageIns = WechatMiniprogram.Page.Instance<
  IProfilePageData,
  IProfilePageFn
>

export interface IPageData {
  userName: string
  wordCount: number
  prevPageIns: editePageIns | null
  loading: boolean
  oldName: string
}

export interface IPageFn {
  handleInput: (e: WechatMiniprogram.CustomEvent) => void
  handleSave: () => void
  updateUserName: () => Promise<any>
}

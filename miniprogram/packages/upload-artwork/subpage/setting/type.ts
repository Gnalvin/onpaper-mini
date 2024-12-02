import { IEditePageData, IEditePageFn } from '../profile/type'

export type editePageIns = WechatMiniprogram.Page.Instance<
  IEditePageData,
  IEditePageFn
>

export interface IPageData {
  isShowPublic: boolean
  whoSee: string
  isShowComment: boolean
  comment: string
  adult: boolean
  isShowCopyright: boolean
  copyright: string
  copyrightSetting: {
    text: string
    label: string
  }[]
  commentSetting: {
    text: string
    label: string
  }[]
  whoSeeSetting: {
    text: string
    label: string
  }[]
  prevPageIns: editePageIns | null
}

export interface IPageFn {
  handleShowWhoSee: () => void
  changeWhoSee: (e: WechatMiniprogram.CustomEvent) => void
  handleShowComment: () => void
  changeComment: (e: WechatMiniprogram.CustomEvent) => void
  handleShowCopyright: () => void
  changeCopyright: (e: WechatMiniprogram.CustomEvent) => void
  changeAdult: (e: any) => void
  showAdultTip: () => void
  showCopyrightTip: () => void
}

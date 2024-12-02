import { IUrlItem } from '../../type'
export { previewPageIns } from '../../type'
import { IStsToken } from '../../../../services/common/type'

export interface IEditePageData {
  userId: string
  urlList: IUrlItem[]
  cover: string
  coverName: string
  title: string
  introduce: string
  wordCount: number
  isShowZone: boolean
  isShowTagPop: boolean
  tagString: string
  tagList: string[]
  zone: string
  comment: 'public' | 'onlyFans' | 'close'
  copyright: 'BY' | 'BY-ND' | 'BY-NC-ND' | 'BY-NC' | 'OWNER'
  whoSee: 'public' | 'onlyFans' | 'privacy'
  adult: boolean
  zoneOptions: {
    value: string
    text: string
  }[]
  safeBottomHight: number
  needDelImg: number[]
  forbidBack: boolean
  isShowUploadIng: boolean
}

export interface IEditePageFn {
  onTitleInput: (e: WechatMiniprogram.CustomEvent) => void
  onIntorduceInput: (e: WechatMiniprogram.CustomEvent) => void
  handleShowZonePic: () => void
  changeZone: (
    e: WechatMiniprogram.CustomEvent<{ value: { text: string; value: string } }>
  ) => void
  changeCover: (url: string) => void
  addArtworkImg: () => void
  delArtworkImg: (
    e: WechatMiniprogram.CustomEvent<{ delIndex: number }>
  ) => void
  saveNewList: (
    e: WechatMiniprogram.CustomEvent<{ newList: IUrlItem[] }>
  ) => void
  uploadFormData: () => void
  goToSettingCover: () => void
  goToSetting: () => void
  handleShowTagPop: () => void
  onTagInput: (e: WechatMiniprogram.CustomEvent) => void
  onTagInputConfirm: (e: WechatMiniprogram.CustomEvent) => void
  handleDelTag: (e: WechatMiniprogram.CustomEvent) => void
  checkUploadStatus: () => Promise<void>
  checkFormData: () => boolean
  uploadArtPic: (urlList: IUrlItem[], sts: IStsToken) => Promise<void>
  uploadArtInfoAcion: () => Promise<void>
  handleShowSmallTip: () => void
}

export { IUrlItem }

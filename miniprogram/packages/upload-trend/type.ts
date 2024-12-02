import { IStsToken } from '../../services/common/type'
import { IRelevantTopic } from '../../services/tag-topic/type'

export interface IPageData {
  userId: string
  urlList: IUrlItem[]
  text: string
  wordCount: number
  safeBottomHight: number
  isShowTopicPop: boolean
  topicString: string
  topic: {
    text: string
    topicId: string
  } | null
  whoSeeSetting: {
    text: string
    label: string
  }[]
  isShowPublic: boolean
  whoSee: {
    text: string
    label: 'public' | 'onlyFans' | 'privacy'
  }
  relevantTopic: IRelevantTopic[]
  oldSearch: string
  isShowUploadIng: boolean
  needDelImg: number[]
}

export interface IPageFn {
  onTextInput: (e: WechatMiniprogram.CustomEvent) => void
  addTrendImg: () => void
  uploadPic: (urlList: IUrlItem[], sts: IStsToken) => Promise<void>
  saveNewList: (
    e: WechatMiniprogram.CustomEvent<{ newList: IUrlItem[] }>
  ) => void
  delTrendImg: (e: WechatMiniprogram.CustomEvent<{ delIndex: number }>) => void
  handleShowWhoSee: () => void
  changeWhoSee: (e: WechatMiniprogram.CustomEvent) => void
  handleShowTopicPop: () => void
  onTopicInput: (e: WechatMiniprogram.CustomEvent) => void
  getTopicAction: (topic: string) => void
  onChoseTopic: (e: WechatMiniprogram.CustomEvent) => void
  onDelTopic: () => void
  postTrendAction: () => void
  checkUploadStatus: () => Promise<void>
  uploadFormData: () => void
  handleShowSmallTip: () => void
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

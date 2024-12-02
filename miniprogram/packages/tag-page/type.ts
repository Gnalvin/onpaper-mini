import { ITagAboutUser } from '../../services/tag-topic/type'
export interface IPageData {
  loginId: string
  tagName: string
  tagId: string
  totalCount: string
  page: number
  users: ITagAboutUser[]
  sort: 'score' | 'time'
  nav: 'art' | 'user'
  scrollY: number
}

export interface IPageFn {
  getRelevantTagAction: () => Promise<void>
  getTagAboutArtAction: () => Promise<void>
  getTagAboutUserAction: () => Promise<void>
  handleNavChose: (e: WechatMiniprogram.CustomEvent) => void
  handleNavSort: () => void
  throttleSetData: (data: object) => void
}

import { ITag } from '../../../services/tag-topic/type'
import { ITrend } from 'miniprogram/services/trend/type'
export interface IPageData {
  hotTag: hotTag[]
  trends: ITrend[]
  firstLoad: boolean
  loading: boolean
  networkError: boolean
}

export interface hotTag extends ITag {
  status?: 'up' | 'down' | 'keep' | 'new'
}

export interface IPageFn {
  getHotTagAction: () => Promise<void>
  getHotTrendAction: (isRefresh?: boolean) => Promise<void>
  handleScrollViewRefresh: () => Promise<void>
  onScrolltolower: () => void
  reTryAllRequest: () => void
  goToTagPage: (e: WechatMiniprogram.CustomEvent) => void
  goToNavPage: (e: WechatMiniprogram.CustomEvent) => void
}

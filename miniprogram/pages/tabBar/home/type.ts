import { ITrend } from '../../../services/trend/type'
import { IRecommendUser } from '../../../services/common/type'

export interface IPageData {
  scrollViewHight: number
  isRefresh: boolean
  loading: boolean
  firstLoad: boolean
  networkError: boolean
  choseNav: 'focus' | 'discover'
  tabs: { value: string; text: string }[]
  feeds: ITrend[]
  feedEnd: boolean
  recommendUser: IRecommendUser[]
  isLogin: boolean
}
export interface IPageFn {
  handleNavBarChose: (e: WechatMiniprogram.CustomEvent) => void
  getShowData: () => void
  getHotArtworkAction: (isRefresh?: boolean) => Promise<void>
  getFeedsAction: (isRefresh?: boolean) => Promise<void>
  getRecommendUserAction: (isRefresh?: boolean) => Promise<any>
  goToSearch: () => void
  calculateScrollHight: () => void
  handleScrollViewRefresh: () => Promise<void>
}

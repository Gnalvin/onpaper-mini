import {
  IProfileData,
  IArtwork,
  ICollectArtwork
} from '../../services/user-home/type'
import { ITrend } from '../../services/trend/type'

export type nav = 'trend' | 'artwork' | 'collect'

export interface IPageData {
  userId: string
  userProfile: IProfileData | null
  isFocus: number
  isOwner: boolean
  nav: nav
  trends: ITrend[]
  trendEnd: boolean
  artworks: IArtwork[]
  artPage: number
  artEnd: boolean
  collects: ICollectArtwork[]
  collectPage: number
  collectEnd: boolean
  showTopNav: boolean
  showEndTip: boolean
  showContentTip: boolean
  noContentList: string[]
  noContentTip: string
  scrollY: number
  pagesCount: number
}
export interface IPageFn {
  handleChoseNavBar: (e: WechatMiniprogram.CustomEvent<{ val: nav }>) => void
  getUserProfile: (uid: string) => void
  getUserHomeTrend: () => void
  handleShowNoContent: (nav: nav, isShow?: boolean) => boolean
  getUserArtwork: (page: number) => void
  setNavigationBarColor: (color: 'white' | 'black') => void
  getUserCollect: (page: number) => void
  throttleSetData: (data: object) => void
  handleUserFoucs: () => void
  navGoBack: () => void
}

import {
  IProfileData,
  IArtwork,
  ICollectArtwork
} from '../../../services/user-home/type'
import { ITrend } from '../../../services/trend/type'

export type nav = 'trend' | 'artwork' | 'collect'

export interface IUserPageData {
  userId: string
  userProfile: IProfileData | null
  isLogin: boolean
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
}
export interface IUserPageFn {
  handleGotoLogin: () => void
  handleChoseNavBar: (e: WechatMiniprogram.CustomEvent<{ val: nav }>) => void
  getUserProfile: () => void
  getUserHomeTrend: () => void
  getUserArtwork: (page: number) => void
  setNavigationBarColor: (color: 'white' | 'black') => void
  getUserCollect: (page: number) => void
  handleShowNoContent: (nav: nav, isShow?: boolean) => boolean
  throttleSetData: (data: object) => void
  updateUserProfile: (data: IProfileData) => void
}

import { IArtwork, IUserInfo } from '../../../services/discover/type'

export interface IPageData {
  artworks: IArtwork[]
  users: IUserInfo[]
  tabs: { value: string; text: string }[]
  choseNav: 'art' | 'user'
  query: string
  loading: boolean
  loginUser: string
  pagesCount: number
  statusBarHeight: number
  tip: string
}
export interface IPageFn {
  getArtworkAction: () => Promise<void>
  getUserAction: () => Promise<void>
  onNavClick: (e: WechatMiniprogram.CustomEvent) => void
  onTabClick: (e: WechatMiniprogram.CustomEvent) => void
  navGoBack: () => void
  setTip: () => void
}

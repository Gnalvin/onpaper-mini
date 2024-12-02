import { IArtwork, zoneQuery } from '../../../services/discover/type'
export interface IPageData {
  tabs: { value: string; text: string }[]
  artworks: IArtwork[]
  loading: boolean
  query: zoneQuery
  isEnd: boolean
}
export interface IPageFn {
  getZoneArtworkAction: () => Promise<void>
  onTabClick: (e: WechatMiniprogram.CustomEvent) => void
}

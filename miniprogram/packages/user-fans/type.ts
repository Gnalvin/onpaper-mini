import { IUserSmallCard } from '../../services/user-home/type'
export interface IPageData {
  queryUid: string
  loginUid: string
  type: 'following' | 'follower'
  users: IUserSmallCard[]
  page: number
  tip: string
  isEnd: boolean
}
export interface IPageFn {
  getFansAction: () => Promise<void>
}

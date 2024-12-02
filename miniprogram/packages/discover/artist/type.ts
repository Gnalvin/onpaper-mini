import { IUserInfo } from '../../../services/discover/type'
export interface IPageData {
  tabs: { value: string; text: string }[]
  users: IUser[]
  type: 'hot' | 'new' | 'active'
  maxPage: number
  loginUser: string
  isEnd: boolean
  loading: boolean
}

export interface IPageFn {
  getUserAction: () => void
  onTabClick: (e: WechatMiniprogram.CustomEvent) => void
}

interface IUser extends IUserInfo {
  id?: string
}

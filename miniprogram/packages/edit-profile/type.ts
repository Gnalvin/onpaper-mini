import { IProfileData } from '../../services/user-home/type'
import { IUserPageData, IUserPageFn } from '../../pages/tabBar/user/type'

export type userPageIns = WechatMiniprogram.Page.Instance<
  IUserPageData,
  IUserPageFn
>

export interface IProfilePageData {
  prevPageIns: userPageIns | null
  profile: IProfileData | null
  currentDate: number
  isShowBirthdayPic: boolean
  isShowSexPic: boolean
  isShowAreaPic: boolean
  areaList: {
    province_list: Record<string, string>
    city_list: Record<string, string>
    county_list: Record<string, string>
  }
}

export interface IProfilePageFn {
  changeUserName: (newName: string) => void
  changeAvatar: (fileName: string) => void
  changeBanner: (fileName: string) => void
  handleShowBirthdayPic: () => void
  changeBirthday: (e: WechatMiniprogram.CustomEvent) => void
  handleShowSexPic: () => void
  changeSex: (e: WechatMiniprogram.CustomEvent) => void
  handleShowAreaPic: () => void
  changeArea: (e: WechatMiniprogram.CustomEvent) => void
  changeIntroduce: (intro: string) => void
  goToEditIntroduce: () => void
  goToEditName: () => void
  goToEditAvatar: () => void
  goToEditBanner: () => void
}

// pages/tabBar/user/subpage/edit-profile/index.ts
import { areaList } from '@vant/area-data'
import { formatTimestampToString } from '../../utils/format'
import { IProfilePageData, IProfilePageFn, userPageIns } from './type'
import { formatBirthday } from './utils/format'
import { deepClone } from '../../utils/clone'
import router from '../../routers/index'
import { updateUserProfileRequest } from '../../services/edit-profile/index'
import Toast from '@vant/weapp/toast/toast'

Page<IProfilePageData, IProfilePageFn>({
  data: {
    prevPageIns: null,
    profile: null,
    isShowBirthdayPic: false,
    isShowSexPic: false,
    isShowAreaPic: false,
    currentDate: new Date().getTime(),
    areaList
  },
  onLoad() {
    const pages = getCurrentPages()
    this.data.prevPageIns = pages[pages.length - 2] as userPageIns // 上一个页面
    const profile = deepClone(this.data.prevPageIns.data.userProfile) // 获取上一页data里的数据
    profile.birthday = formatBirthday(profile.birthday)
    this.setData({ profile })
  },
  // 修改昵称
  changeUserName(newName) {
    const { profile, prevPageIns } = this.data
    profile!.userName = newName
    this.setData({ profile })
    // 同步数据到上一个页面
    prevPageIns!.updateUserProfile(profile!)
  },
  // 处理修改生日
  async changeBirthday(e) {
    const newDay = formatTimestampToString(
      (e.detail as unknown as number) / 1000
    )
    const { prevPageIns, profile } = this.data
    this.handleShowBirthdayPic()
    if (newDay === profile!.birthday.Time) return

    Toast.loading({ message: '保存中...', forbidClick: true })
    const { statusCode } = await updateUserProfileRequest({
      profile: newDay,
      profileType: 'birthday'
    })
    Toast.clear()

    if (statusCode === 200) {
      profile!.birthday.Time = newDay
      this.setData({ profile })
      // 同步数据到上一个页面
      prevPageIns!.updateUserProfile(profile!)
    } else {
      Toast(`发生未知错误:${statusCode}`)
    }
  },
  //处理修改性别
  async changeSex(e) {
    const newSex = e.detail.value as { text: string; value: string }
    const { prevPageIns, profile } = this.data
    this.handleShowSexPic() // 关闭选择器
    if (newSex.value === profile!.sex) return

    Toast.loading({ message: '保存中...', forbidClick: true })
    const { statusCode } = await updateUserProfileRequest({
      profile: newSex.value,
      profileType: 'sex'
    })
    Toast.clear()

    if (statusCode === 200) {
      profile!.sex = newSex.value
      this.setData({ profile })
      // 同步数据到上一个页面
      prevPageIns!.updateUserProfile(profile!)
    } else {
      Toast(`发生未知错误:${statusCode}`)
    }
  },
  // 修改地区
  async changeArea(e) {
    const data = e.detail.values as Array<{ name: string }>
    const area = data.map((i) => i.name)
    if (area[0] === area[1]) area[1] = '市辖区'
    const newArea = '中国 ' + area.join(' ')
    this.handleShowAreaPic()
    const { prevPageIns, profile } = this.data
    if (newArea === profile?.address) return

    Toast.loading({ message: '保存中...', forbidClick: true })
    const { statusCode } = await updateUserProfileRequest({
      profile: newArea.replace(/\s+/g, ','),
      profileType: 'region'
    })
    Toast.clear()

    if (statusCode === 200) {
      profile!.address = newArea
      this.setData({ profile })
      // 同步数据到上一个页面
      prevPageIns!.updateUserProfile(profile!)
    } else {
      Toast(`发生未知错误:${statusCode}`)
    }
  },
  // 修改头像
  changeAvatar(fileName) {
    const { profile, prevPageIns } = this.data
    profile!.avatarName = fileName
    this.setData({ profile })
    // 同步数据到上一个页面
    prevPageIns!.updateUserProfile(profile!)
  },
  //修改背景
  changeBanner(fileName) {
    const { profile, prevPageIns } = this.data
    profile!.bannerName = fileName
    this.setData({ profile })
    // 同步数据到上一个页面
    prevPageIns!.updateUserProfile(profile!)
  },
  // 修改简介
  changeIntroduce(intro) {
    const { profile, prevPageIns } = this.data
    profile!.introduce = intro
    this.setData({ profile })
    // 同步数据到上一个页面
    prevPageIns!.updateUserProfile(profile!)
  },
  //是否显示选择性别弹窗
  handleShowSexPic() {
    this.setData({ isShowSexPic: !this.data.isShowSexPic })
  },
  //是否显示选择生日弹窗
  handleShowBirthdayPic() {
    this.setData({ isShowBirthdayPic: !this.data.isShowBirthdayPic })
  },
  //是否显示选择区域弹窗
  handleShowAreaPic() {
    this.setData({ isShowAreaPic: !this.data.isShowAreaPic })
  },
  goToEditIntroduce() {
    router.push({ name: 'editProfileIntroduce' })
  },
  goToEditName() {
    router.push({ name: 'editProfileName' })
  },
  goToEditAvatar() {
    router.push({
      name: 'editProfileAvatar',
      query: { userId: this.data.profile?.userId }
    })
  },
  goToEditBanner() {
    router.push({
      name: 'editProfileBanner',
      query: { userId: this.data.profile?.userId }
    })
  }
})

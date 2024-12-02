// packages/user-profile/index.ts
import router from '../../routers/index'
import { formatUtcString } from '../../utils/format'
const sexMap: Record<string, string> = {
  man: '男生',
  woman: '女生',
  privacy: '保密'
}
Page({
  data: {
    profile: {},
    haveSNS: false
  },
  onLoad(e: any) {
    const data = router.extract(e)
    const profile = data.profile
    profile.birthday = profile.birthday.Valid
      ? formatUtcString(profile.birthday.Time, 'MM 月 DD 日')
      : ''
    profile.sex = sexMap[profile.sex as string]
    profile.address = profile.address.replace('中国 ', '').replace('市辖区', '')
    const { QQ, WeChat, workEmail, Weibo, Bilibili, Pixiv, Twitter } = profile
    const haveSNS =
      QQ || WeChat || workEmail || Weibo || Bilibili || Pixiv || Twitter

    this.setData({ profile, haveSNS })
  },
  handleCopy(e: WechatMiniprogram.CustomEvent) {
    wx.setClipboardData({
      //准备复制的数据
      data: e.currentTarget.dataset.text,
      success: function () {
        wx.showToast({
          title: '复制成功'
        })
      }
    })
  }
})

// packages/upload-artwork/subpage/setting/index.ts
import Dialog from '@vant/weapp/dialog/dialog'
import router from '../../../../routers/index'
import { IPageData, IPageFn } from './type'

const whoSeeMap: Record<string, string> = {
  public: '所有人',
  onlyFans: '仅粉丝',
  privacy: '不公开'
}
const commentMap: Record<string, string> = {
  public: '所有人',
  onlyFans: '仅粉丝',
  close: '关闭评论'
}
const copyrightMap: Record<string, string> = {
  BY: '署名',
  'BY-ND': '署名-禁止修改',
  'BY-NC-ND': '署名-非商业性使用-禁止修改',
  'BY-NC': '署名-非商业性使用',
  OWNER: '个人版权所有'
}

Page<IPageData, IPageFn>({
  data: {
    isShowPublic: false,
    whoSee: '所有人',
    isShowComment: false,
    comment: '所有人',
    adult: false,
    isShowCopyright: false,
    copyright: '个人版权所有',
    copyrightSetting: [
      {
        text: '个人版权所有',
        label: 'OWNER'
      },
      {
        text: '署名-非商业性使用-禁止修改',
        label: 'BY-NC-ND'
      },
      {
        text: '署名-非商业性使用',
        label: 'BY-NC'
      },
      {
        text: '署名-禁止修改',
        label: 'BY-ND'
      },
      {
        text: '署名',
        label: 'BY'
      }
    ],
    commentSetting: [
      {
        text: '所有人',
        label: 'public'
      },
      {
        text: '仅粉丝',
        label: 'onlyFans'
      },
      {
        text: '关闭评论',
        label: 'close'
      }
    ],
    whoSeeSetting: [
      {
        text: '所有人',
        label: 'public'
      },
      {
        text: '仅粉丝',
        label: 'onlyFans'
      },
      {
        text: '不公开',
        label: 'privacy'
      }
    ],
    prevPageIns: null
  },
  onLoad(e: any) {
    const { whoSee, adult, comment, copyright } = router.extract(e)
    this.setData({
      whoSee: whoSeeMap[whoSee],
      adult,
      comment: commentMap[comment],
      copyright: copyrightMap[copyright]
    })
    const pages = getCurrentPages()
    // @ts-ignore
    this.data.prevPageIns = pages[pages.length - 2] // 上一个页面
  },
  handleShowWhoSee() {
    this.setData({ isShowPublic: !this.data.isShowPublic })
  },
  changeWhoSee(e) {
    const value = e.detail.value
    this.setData({ whoSee: value.text })
    this.data.prevPageIns!.data.whoSee = value.label
    this.handleShowWhoSee()
  },
  handleShowComment() {
    this.setData({ isShowComment: !this.data.isShowComment })
  },
  changeComment(e) {
    const value = e.detail.value
    this.setData({ comment: value.text })
    this.data.prevPageIns!.data.comment = value.label
    this.handleShowComment()
  },
  handleShowCopyright() {
    this.setData({ isShowCopyright: !this.data.isShowCopyright })
  },
  changeCopyright(e) {
    const value = e.detail.value
    this.setData({ copyright: value.text })
    this.data.prevPageIns!.data.copyright = value.label
    this.handleShowCopyright()
  },
  changeAdult(e: any) {
    this.setData({ adult: e.detail })
    this.data.prevPageIns!.data.adult = e.detail
  },
  showAdultTip() {
    Dialog.alert({
      title: '未成年敏感内容',
      message:
        '作品中包含: 抽烟、喝酒、任何包括裸露、带有性暗示的部分裸露，甚至没有裸露但具有性暗示的内容',
      confirmButtonText: '知道啦'
    })
  },
  showCopyrightTip() {
    Dialog.alert({
      title: '版权许可',
      message: `署名：其他人可以分发、混合和调整您的作品并在其基础上进行创作，甚至将其用作商业用途，前提是他们要将您标注为原作者。\n
      署名-禁止修改：其他人可以重用您的作品，包括商业用途；但是，不能以改编的形式与他人共享，并且必须将所有权归属于您。\n
      署名-非商业性使用：其他人可以非商业化地混搭、调整和利用您的作品，尽管他们的新作品也必须承认您并且是非商业性的，但他们不必以相同的条款许可其衍生作品。\n
      署名-非商业性使用-禁止修改：只要其他人将所有权归属于您，就可以下载您的作品并与他人共享，但他们不能以任何方式更改它们或将其用于商业用途。\n
      个人版权所有：在未经明确许可的情况下，他人不得使用您的作品，包括转载分享。 \n`,
      confirmButtonText: '知道啦',
      messageAlign: 'left'
    })
  }
})

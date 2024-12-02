// components/fix-button/index.ts
import router from '../../routers/index'
import { verifyIsLogin } from '../../utils/verify'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    scrollY: {
      type: Number,
      value: 0
    },
    btnType: {
      type: String,
      value: 'toTop'
    },
    bottom: {
      type: String,
      value: '80rpx'
    },
    right: {
      type: String,
      value: '50rpx'
    }
  },
  observers: {
    scrollY: function (pos: number) {
      if (this.properties.btnType !== 'toTop') return
      if (pos > 800) {
        this.setData({ isShowBtn: true })
      } else {
        this.setData({ isShowBtn: false })
      }
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    isShowBtn: false,
    isShowOverlay: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleToTop() {
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 300
      })
    },
    handleShowUpload() {
      if (!verifyIsLogin()) return
      this.setData({ isShowOverlay: true })
    },
    onClickHideOverlay() {
      this.setData({ isShowOverlay: false })
    },
    // 跳转上传作品页面
    gotoUploadArtwork() {
      router.push({
        name: 'UploadArtwork'
      })
    },
    // 跳转上传动态页面
    gotoUploadTrend() {
      router.push({
        name: 'uploadTrend'
      })
    }
  }
})

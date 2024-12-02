// components/trend-item/cpn/img-wrap.ts
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    pics: {
      type: Array,
      value: []
    },
    // 是否在详情页
    isInDetail: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    showImgList: []
  },
  lifetimes: {
    attached() {
      // @ts-ignore
      this.data.showImgList = this.properties.pics.map((i) => i.fileName)
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    showImg(e: WechatMiniprogram.CustomEvent) {
      wx.previewImage({
        current: e.currentTarget.dataset.url, // 当前显示图片的http链接
        urls: this.data.showImgList // 需要预览的图片http链接列表
      })
    }
  }
})

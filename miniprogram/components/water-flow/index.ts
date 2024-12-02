// components/water-flow/index.ts
import { IData, IMethod, IProperty } from './type'
const { screenWidth, pixelRatio } = wx.getSystemInfoSync()

Component<IData, IProperty, IMethod>({
  /**
   * 组件的属性列表
   */
  properties: {
    gap: {
      type: Number,
      value: 8 //rpx
    },
    padding: {
      type: Number,
      value: 8 //rpx
    },
    noAvatarJump: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    datas: [],
    leftHeight: 0,
    rightHeight: 0,
    leftList: [],
    rightList: []
  },

  /**
   * 组件的方法列表
   */
  methods: {
    renderWaterFlow(datas, success) {
      this.data.datas = datas
      this._render(datas, 0, success)
    },
    _render(datas, i, success) {
      // 获取 左右两列 元素
      const query = wx.createSelectorQuery().in(this)
      const columnNodes = query.selectAll('#left, #right')

      if (datas.length > i && datas.length !== 0) {
        const item = datas[i]
        this._calculatePicWidthAndHeight(item)

        columnNodes.boundingClientRect().exec((res) => {
          const rects = res[0]
          if (!rects.length) return
          this.data.leftHeight = rects[0].height
          this.data.rightHeight = rects[1].height
          // 比较两列高度 插入较矮的那一列
          if (this.data.leftHeight <= this.data.rightHeight) {
            this.data.leftList.push(item)
          } else {
            this.data.rightList.push(item)
          }
          this.setData(
            {
              leftList: this.data.leftList,
              rightList: this.data.rightList
            },
            () => {
              this._render(datas, ++i, success)
            }
          )
        })
      } else {
        success && success()
      }
    },
    // 计算图片的显示宽高
    _calculatePicWidthAndHeight(item) {
      const { gap, padding } = this.properties
      const paddingPx = padding / pixelRatio
      const gapPx = gap / pixelRatio
      const picWidth = (screenWidth - paddingPx * 2 - gapPx) / 2 // 单个图片应该的宽度
      // 计算缩放比例
      const scale = picWidth / item.width
      item.height = item.height * scale
      item.width = picWidth
      // 如果缩放的宽高比 小于 0.8 保持最大宽高比
      if (item.width / item.height < 0.8) item.height = item.width / 0.8
    },
    // 重置数据
    reSetData(force) {
      this.data.datas = []
      this.data.rightList = []
      this.data.leftList = []
      this.data.leftHeight = 0
      this.data.rightHeight = 0
      if (force) {
        this.setData({ datas: [], rightList: [], leftList: [] })
      }
    }
  }
})

// components/indicator/index.ts
import { IData, IMethod, IProperty } from './type'
import { cpnQueryRect } from '../../utils/query-rect'

Component<IData, IProperty, IMethod>({
  relations: {
    './indicator-item/index': {
      type: 'child' // 关联的目标节点应为子节点
    }
  },
  properties: {
    currentIndex: {
      type: Number,
      value: 0
    }
  },
  observers: {
    currentIndex: function (newIndex: number) {
      this.computerLocation(newIndex)
    }
  },
  lifetimes: {
    async attached() {
      const dom = await cpnQueryRect('.content', this)
      this.data.contentWidth = dom.width
      this.data.contentLeft = dom.left
    }
  },
  data: {
    childs: [],
    contentScroll: 0,
    contentWidth: 0,
    translate: 0,
    contentLeft: 0
  },
  methods: {
    computerLocation(newIndex) {
      const selectItemEl = this.data.childs[newIndex]
      if (!selectItemEl) return
      const itemLeft = selectItemEl.left - this.data.contentLeft
      const itemWidth = selectItemEl.width

      let { contentScroll, contentWidth } = this.data
      if (contentScroll < contentWidth) contentScroll = contentWidth

      let distance = itemLeft + itemWidth * 0.5 - contentWidth * 0.5

      if (distance < 0) distance = 0 //左边的特殊情况处理
      const totalDistance = contentScroll - contentWidth
      if (distance > totalDistance) distance = totalDistance //右边的特殊情况处理

      this.setData({ translate: -distance })
    }
  }
})

// components/indicator/indicator-item/index.ts
import { cpnQueryRect } from '../../../utils/query-rect'
Component({
  relations: {
    '../index': {
      type: 'parent', // 关联的目标节点应为父节点
      linked: function (target: any) {
        this.data.parentIns = target
      }
    }
  },
  lifetimes: {
    async ready() {
      const res = await cpnQueryRect('.indicator-item', this)
      // @ts-ignore
      this.data.parentIns.data.childs.push(res)
      // @ts-ignore
      const allWidth = this.data.parentIns.data.childs.reduce(function (p, c) {
        return p + c.width
      }, 0)
      // @ts-ignore
      this.data.parentIns.data.contentScroll = allWidth
    }
  },
  data: {
    left: 0,
    parentIns: null
  }
})

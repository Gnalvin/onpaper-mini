// components/trend-item/cpn/forward/index.ts
import router from '../../../../routers/index'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    forward: {
      type: Object,
      value: {}
    }
  },
  data: {},
  methods: {
    //跳转详情
    goToDeatil() {
      if (this.properties.forward.type === 'aw') {
        router.push({
          name: 'ArtworkShow',
          query: { artId: this.properties.forward.trendId }
        })
      } else {
        router.push({
          name: 'TrendShow',
          query: { trendId: this.properties.forward.trendId }
        })
      }
    }
  }
})

// components/artwork/square/index.ts
import router from '../../../routers/index'

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    artwork: {
      type: Object,
      value: {}
    },
    openNew: {
      type: Boolean,
      value: true
    },
    rank: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    goToDetail() {
      const pageData = {
        name: 'ArtworkShow',
        query: { artId: this.data.artwork.artworkId }
      }
      if (this.properties.openNew) {
        router.push(pageData)
      } else {
        router.replace(pageData)
      }
    }
  }
})

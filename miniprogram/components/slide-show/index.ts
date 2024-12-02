// components/slide-show/index.ts
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    artworks: {
      type: Array,
      value: []
    },
    openNew: {
      type: Boolean,
      value: true
    }
  },
  lifetimes: {
    attached() {
      this.setData({ isOpenNew: this.properties.openNew })
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    isOpenNew: true
  },

  /**
   * 组件的方法列表
   */
  methods: {}
})

// components/user-home/nav-bar/index.ts
Component({
  data: {
    choseBar: 'trend',
    tabs: [
      {
        text: '动态',
        value: 'trend'
      },
      {
        text: '作品',
        value: 'artwork'
      },
      {
        text: '收藏',
        value: 'collect'
      }
    ]
  },
  methods: {
    onTabClick(e: WechatMiniprogram.CustomEvent) {
      const choseBar = e.detail.value
      if (this.data.choseBar === choseBar) return
      this.data.choseBar = choseBar
      this.triggerEvent('choise', { val: choseBar })
    }
  }
})

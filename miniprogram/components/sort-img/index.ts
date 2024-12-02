// components/sort-img/index.ts
import { IData, IProperty, IMethod } from './type'

Component<IData, IProperty, IMethod>({
  properties: {
    urlList: {
      type: Array,
      value: []
    },
    showDelete: {
      type: Boolean,
      value: true
    },
    showDelIndex: {
      type: Array,
      value: []
    }
  },
  data: {
    deleteIndex: -1
  },
  methods: {
    vibrate() {
      wx.vibrateShort({ type: 'medium' })
    },
    onClickAddImg() {
      this.triggerEvent('addImg')
    },
    saveSortList(e) {
      for (const item of e.newList) {
        this.data.urlList[item.index].sortIndex = item.sort
      }
      this.triggerEvent('changeList', { newList: this.data.urlList })
    },
    onClickDeleteImg(e) {
      const deleteIndex = e.currentTarget.dataset.index
      this.setData({ deleteIndex }, () => {
        this.setData({ deleteIndex: -1 })
      })
      this.triggerEvent('delImg', { delIndex: deleteIndex })
    }
  }
})

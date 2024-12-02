export type IData = {
  deleteIndex: number
}
export type IProperty = {
  urlList: {
    type: typeof Array
    value: []
  }
  showDelete: {
    type: typeof Boolean
    value: true
  }
  showDelIndex: {
    type: typeof Array
    value: []
  }
}
export type IMethod = {
  vibrate: () => void
  onClickAddImg: () => void
  saveSortList: (e: { newList: any[] }) => void
  onClickDeleteImg: (e: WechatMiniprogram.CustomEvent) => void
}

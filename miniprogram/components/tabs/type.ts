export type IData = {
  scrollView: WechatMiniprogram.ScrollViewContext | null
}
export type IProperty = {
  tabs: {
    type: typeof Array
    value: []
  }
  bottomLineColor: {
    type: typeof String
    value: 'rgb(60, 156, 255)'
  }
  bottomLineWidth: {
    type: typeof Number
    value: 20
  }
  scrollable: {
    type: typeof Boolean
    value: true
  }
  choseIndex: {
    type: typeof Number
    value: -1
  }
}
export type IMethod = {
  init: () => Promise<void>
  onClickTab: (e: { index: number }) => void
  scrollTo: (e: { distance: number }) => void
}

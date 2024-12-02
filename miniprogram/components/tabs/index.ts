// components/tabs/index.ts
import { cpnQueryScrollview } from '../../utils/query-rect'
import { IData, IMethod, IProperty } from './type'

Component<IData, IProperty, IMethod>({
  properties: {
    tabs: {
      type: Array,
      value: []
    },
    bottomLineColor: {
      type: String,
      value: 'rgb(60, 156, 255)'
    },
    bottomLineWidth: {
      type: Number,
      value: 20
    },
    scrollable: {
      type: Boolean,
      value: true
    },
    choseIndex: {
      type: Number,
      value: -1
    }
  },
  data: {
    scrollView: null
  },
  lifetimes: {
    attached() {
      this.init()
    }
  },
  methods: {
    async init() {
      // scrollView 元素实例
      this.data.scrollView = await cpnQueryScrollview('#tabsScrollView', this)
    },
    onClickTab(e) {
      this.triggerEvent('click', this.data.tabs[e.index])
    },
    scrollTo(e) {
      this.data.scrollView?.scrollTo({
        left: e.distance,
        duration: 500,
        animated: true
      })
    }
  }
})

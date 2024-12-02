// components/image-item/index.ts
import { handleImgErr } from '../../utils/format'

Component({
  externalClasses: ['image-class'],
  properties: {
    src: {
      type: String,
      value: ''
    },
    mode: {
      type: String,
      value: ''
    },
    animation: {
      type: Boolean,
      value: true
    }
  },
  data: {
    times: 2
  },
  methods: {
    handleImgLoad() {
      this.setData({ animation: false })
    },
    handleImgErr(e: WechatMiniprogram.CustomEvent) {
      const newUrl = handleImgErr(e, this.properties.src)
      if (newUrl && this.data.times) {
        this.data.times--
        this.properties.src = newUrl
        this.setData({ src: this.data.src })
      }
    }
  }
})

export type IData = {
  systemInfo: WechatMiniprogram.SystemInfo
  containerHight: number // 整个容器高度
  cut_top: number //截取的框上边距
  cut_left: number //截取的框左边距
  INIT_IMGWIDTH: number //图片初始尺寸,此值不变（记录最初设定的尺寸）
  INIT_IMGHEIGHT: number // 图片初始尺寸,此值不变（记录最初设定的尺寸）
  imgShowWidth: number // 图片展示的宽度尺寸
  imgShowHeight: number // 图片展示的高度尺寸
  scale: number // 图片缩放比
  _img_top: number //图片上边距
  _img_left: number //图片左边距
  imageInfo: WechatMiniprogram.GetImageInfoSuccessCallbackResult | null
  _touch_img_relative: { y: number; x: number }[]
  _hypotenuse_length: number
  _flag_img_endtouch: boolean
  TIME_CUT_CENTER: NodeJS.Timeout | null
  TIME_BG: NodeJS.Timeout | null
  _flag_bright: boolean
  _cut_animation: boolean
  _cut_animation_time: NodeJS.Timeout | null
  canvas: WechatMiniprogram.Canvas | null
  ctx: WechatMiniprogram.CanvasRenderingContext.CanvasRenderingContext2D | null
}
export type IProperty = {
  cropHeight: {
    type: typeof Number
    value: 200
  }
  cropWidth: {
    type: typeof Number
    value: 200
  }
  min_scale: {
    type: typeof Number
    value: 0.5
  }
  max_scale: {
    type: typeof Number
    value: 2
  }
  onlunchChose: {
    type: typeof Boolean
    value: true
  }
  showBorder: {
    type: typeof Boolean
    value: true
  }
  imgSrc: {
    type: typeof String
    value: ''
  }
}
export type IMethod = {
  setCutCenter: () => void
  selectImage: () => void
  useUrlImage: (url: string) => void
  _initCanvas: () => void
  _handleImgInfo: () => void
  _imgComputeSize: () => void
  _imgMarginDetectionScale: () => void
  _imgMarginDetectionPosition: (scale?: number) => void
  _start: (e: WechatMiniprogram.TouchEvent) => void
  _move: (e: WechatMiniprogram.TouchEvent) => void
  _end: (e: WechatMiniprogram.TouchEvent) => void
  _moveDuring: () => void
  _moveStop: () => void
  _click: () => void
  saveImg: (expected_size?: number) => Promise<string>
  limitCanvasSize: (
    width: number,
    height: number
  ) => { width: number; height: number; scalar: number }
}

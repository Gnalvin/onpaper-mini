// components/cropper/index.ts
import { cpnQueryRect } from '../../utils/query-rect'
import { IData, IMethod, IProperty } from './type'
import Toast from '@vant/weapp/toast/toast'

Component<IData, IProperty, IMethod>({
  properties: {
    /**
     * 裁剪框高度
     */
    cropHeight: {
      type: Number,
      value: 200
    },
    /**
     * 裁剪框宽度
     */
    cropWidth: {
      type: Number,
      value: 200
    },
    /**
     * 最小缩放比
     */
    min_scale: {
      type: Number,
      value: 0.5
    },
    /**
     * 最大缩放比
     */
    max_scale: {
      type: Number,
      value: 2
    },
    // 加载完成组建就调选择照片
    onlunchChose: {
      type: Boolean,
      value: true
    },
    showBorder: {
      type: Boolean,
      value: true
    },
    imgSrc: {
      type: String,
      value: ''
    }
  },
  data: {
    containerHight: 0,
    systemInfo: wx.getSystemInfoSync(),
    cut_top: 0, //截取的框上边距
    cut_left: 0, //截取的框左边距
    imageInfo: null, // 打开的图片信息
    INIT_IMGWIDTH: 0, //图片初始尺寸,此值不变（记录最初设定的尺寸）
    INIT_IMGHEIGHT: 0, // 图片初始尺寸,此值不变（记录最初设定的尺寸）
    imgShowWidth: 0, // 图片展示的宽度尺寸
    imgShowHeight: 0, // 图片展示的高度尺寸
    scale: 1, // 图片缩放比
    _img_top: 0, //图片上边距
    _img_left: 0, //图片左边距
    _touch_img_relative: [{ x: 0, y: 0 }],
    _hypotenuse_length: 0, //双指触摸时斜边长度
    _flag_img_endtouch: true, //是否结束触摸
    TIME_CUT_CENTER: null, // 移动中的timer延时函数
    TIME_BG: null, //背景变暗延时函数
    _flag_bright: false, //背景是否亮
    _cut_animation: false, //是否开启图片和裁剪框过渡
    _cut_animation_time: null, // 裁剪框过渡延时函数
    canvas: null,
    ctx: null
  },
  observers: {
    _cut_animation(value: boolean) {
      //开启过渡300毫秒之后自动关闭
      if (this.data._cut_animation_time)
        clearTimeout(this.data._cut_animation_time)
      if (value) {
        this.data._cut_animation_time = setTimeout(() => {
          this.setData({ _cut_animation: false })
        }, 300)
      }
    }
  },
  async attached() {
    const cropperEL = await cpnQueryRect('#image-cropper', this)
    const { systemInfo: info, cropHeight, cropWidth } = this.data
    // 设置剪辑框的位置
    let cut_top = (cropperEL.height - cropHeight) * 0.5
    let cut_left = (info.windowWidth - cropWidth) * 0.5
    this.setData({ cut_top, cut_left, containerHight: cropperEL.height })
    //初始化 canvas
    this._initCanvas()
    if (this.properties.onlunchChose) this.selectImage()
    if (this.data.imgSrc) this.useUrlImage(this.data.imgSrc)
  },
  methods: {
    /**
     * 初始化canvas
     */
    _initCanvas() {
      wx.createSelectorQuery()
        .in(this)
        .select('#canvas')
        .fields({
          node: true,
          size: true
        })
        .exec((res) => {
          this.data.canvas = res[0].node
          this.data.ctx = this.data.canvas!.getContext('2d')
        })
    },
    /**
     * 选择需要裁切的图片
     */
    selectImage() {
      this.setData({
        scale: 1,
        imgSrc: '',
        _img_top: this.data.containerHight / 2,
        _img_left: this.data.systemInfo.windowWidth / 2
      })
      wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera']
      })
        .then((res) => {
          const imgSrc = res.tempFiles[0].tempFilePath
          this.setData({ imgSrc })
          this._handleImgInfo()
        })
        .catch(() => {})
    },
    /**
     * 使用传入的url作为图片
     */
    useUrlImage(imgSrc) {
      this.setData({
        imgSrc,
        _img_top: this.data.containerHight / 2,
        _img_left: this.data.systemInfo.windowWidth / 2,
        scale: 1
      })
      this._handleImgInfo()
    },
    /**
     *  处理裁切的图片信息
     */
    _handleImgInfo() {
      if (!this.data.imgSrc) return
      wx.getImageInfo({
        src: this.data.imgSrc,
        success: (res) => {
          this.data.imageInfo = res
          if (res.height < 100 || res.width < 100) {
            Toast('图片尺寸不能小于 100px * 100px')
            this.setData({ imgSrc: '' })
            return
          }
          //计算最后图片尺寸
          this._imgComputeSize()
          this._imgMarginDetectionScale()
        },
        fail: () => {}
      })
    },
    setCutCenter() {
      let cut_top = (this.data.containerHight - this.data.cropHeight) * 0.5
      let cut_left =
        (this.data.systemInfo.windowWidth - this.data.cropWidth) * 0.5
      //顺序不能变
      this.setData({
        _img_top: this.data._img_top - this.data.cut_top + cut_top,
        cut_top: cut_top, //截取的框上边距
        _img_left: this.data._img_left - this.data.cut_left + cut_left,
        cut_left: cut_left //截取的框左边距
      })
    },
    /**
     * 计算图片尺寸
     */
    _imgComputeSize() {
      let imgShowWidth = 0
      let imgShowHeight = 0
      if (!this.data.imageInfo) return
      const { cropHeight, cropWidth } = this.properties
      const { width: imgWidth, height: imgHeight } = this.data.imageInfo
      if (!this.data.INIT_IMGHEIGHT && !this.data.INIT_IMGWIDTH) {
        //默认按图片最小边 = 对应裁剪框尺寸
        imgShowWidth = imgWidth
        imgShowHeight = imgHeight
        if (imgShowWidth / imgShowHeight > cropWidth / cropHeight) {
          imgShowHeight = cropHeight
          imgShowWidth = (imgWidth / imgHeight) * imgShowHeight
        } else {
          imgShowWidth = cropWidth
          imgShowHeight = (imgHeight / imgWidth) * imgShowWidth
        }
      } else if (this.data.INIT_IMGHEIGHT && !this.data.INIT_IMGWIDTH) {
        imgShowWidth = (imgWidth / imgHeight) * this.data.INIT_IMGHEIGHT
      } else if (!this.data.INIT_IMGHEIGHT && this.data.INIT_IMGWIDTH) {
        imgShowHeight = (imgHeight / imgWidth) * this.data.INIT_IMGWIDTH
      }
      this.setData({ imgShowWidth, imgShowHeight })
    },
    /**
     * 图片边缘检测-缩放
     */
    _imgMarginDetectionScale() {
      let scale = this.data.scale
      let img_width = this.data.imgShowWidth
      let img_height = this.data.imgShowHeight

      if (img_width * scale < this.properties.cropWidth) {
        scale = this.data.cropWidth / img_width
      }
      if (img_height * scale < this.data.cropHeight) {
        scale = Math.max(scale, this.data.cropHeight / img_height)
      }
      this._imgMarginDetectionPosition(scale)
    },
    /**
     * 图片边缘检测-位置
     */
    _imgMarginDetectionPosition(scale) {
      let left = this.data._img_left
      let top = this.data._img_top
      scale = scale || this.data.scale

      const { imgShowWidth, imgShowHeight, cut_left, cut_top } = this.data
      const { cropHeight, cropWidth } = this.properties
      left =
        cut_left + (imgShowWidth * scale) / 2 >= left
          ? left
          : cut_left + (imgShowWidth * scale) / 2
      left =
        cut_left + cropWidth - (imgShowWidth * scale) / 2 <= left
          ? left
          : cut_left + cropWidth - (imgShowWidth * scale) / 2
      top =
        cut_top + (imgShowHeight * scale) / 2 >= top
          ? top
          : cut_top + (imgShowHeight * scale) / 2
      top =
        cut_top + cropHeight - (imgShowHeight * scale) / 2 <= top
          ? top
          : cut_top + cropHeight - (imgShowHeight * scale) / 2

      this.setData({
        _img_left: left,
        _img_top: top,
        scale: scale
      })
    },
    //开始触摸
    _start(event) {
      this.data._flag_img_endtouch = false
      if (event.touches.length == 1) {
        //单指拖动
        this.data._touch_img_relative[0] = {
          x: event.touches[0].clientX - this.data._img_left,
          y: event.touches[0].clientY - this.data._img_top
        }
      } else {
        //双指放大
        let width = Math.abs(
          event.touches[0].clientX - event.touches[1].clientX
        )
        let height = Math.abs(
          event.touches[0].clientY - event.touches[1].clientY
        )
        this.data._touch_img_relative = [
          {
            x: event.touches[0].clientX - this.data._img_left,
            y: event.touches[0].clientY - this.data._img_top
          },
          {
            x: event.touches[1].clientX - this.data._img_left,
            y: event.touches[1].clientY - this.data._img_top
          }
        ]
        this.data._hypotenuse_length = Math.sqrt(
          Math.pow(width, 2) + Math.pow(height, 2)
        )
      }
    },
    _move(event) {
      if (this.data._flag_img_endtouch) return
      this._moveDuring()
      if (event.touches.length == 1) {
        //单指拖动
        let left =
            event.touches[0].clientX - this.data._touch_img_relative[0].x,
          top = event.touches[0].clientY - this.data._touch_img_relative[0].y
        //图像边缘检测,防止截取到空白
        this.data._img_left = left
        this.data._img_top = top

        this._imgMarginDetectionPosition()
      } else {
        //双指放大
        let width = Math.abs(
          event.touches[0].clientX - event.touches[1].clientX
        )
        let height = Math.abs(
          event.touches[0].clientY - event.touches[1].clientY
        )
        let hypotenuse = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2))
        let scale =
          this.data.scale * (hypotenuse / this.data._hypotenuse_length)

        scale = scale <= this.data.min_scale ? this.data.min_scale : scale
        scale = scale >= this.data.max_scale ? this.data.max_scale : scale
        //图像边缘检测,防止截取到空白
        this.data.scale = scale
        this._imgMarginDetectionScale()
        let _touch_img_relative = [
          {
            x: event.touches[0].clientX - this.data._img_left,
            y: event.touches[0].clientY - this.data._img_top
          },
          {
            x: event.touches[1].clientX - this.data._img_left,
            y: event.touches[1].clientY - this.data._img_top
          }
        ]
        this.data._touch_img_relative = _touch_img_relative
        this.data._hypotenuse_length = Math.sqrt(
          Math.pow(width, 2) + Math.pow(height, 2)
        )
      }
    },
    //结束操作
    _end() {
      this.data._flag_img_endtouch = true
      this._moveStop()
    },
    //移动中
    _moveDuring() {
      //清空之前的自动居中延迟函数
      if (this.data.TIME_CUT_CENTER) clearTimeout(this.data.TIME_CUT_CENTER)
      //清空之前的背景变化延迟函数
      if (this.data.TIME_BG) clearTimeout(this.data.TIME_BG)
      //高亮背景
      if (!this.data._flag_bright) this.setData({ _flag_bright: true })
    },
    //停止移动时需要做的操作
    _moveStop() {
      //清空之前的自动居中延迟函数并添加最新的
      if (this.data.TIME_CUT_CENTER) clearTimeout(this.data.TIME_CUT_CENTER)
      this.data.TIME_CUT_CENTER = setTimeout(() => {
        //动画启动
        if (!this.data._cut_animation) this.setData({ _cut_animation: true })
        this.setCutCenter()
      }, 1000)
      //清空之前的背景变化延迟函数并添加最新的
      if (this.data.TIME_BG) clearTimeout(this.data.TIME_BG)
      this.data.TIME_BG = setTimeout(() => {
        if (this.data._flag_bright) this.setData({ _flag_bright: false })
      }, 1500)
    },
    /**
     * 返回图片信息
     */
    saveImg(expected_size) {
      return new Promise<string>((resolve) => {
        const { cropWidth, cropHeight } = this.properties
        const { imgShowWidth, imgShowHeight, canvas, ctx, scale } = this.data
        if (!canvas) return
        const dpr = this.data.systemInfo.pixelRatio // 设备像素 图片清晰的关键

        canvas.width = cropWidth * dpr
        canvas.height = cropHeight * dpr

        // 计算缩放大小
        const expectedScale = expected_size ? expected_size / canvas.width : 1
        canvas.width = Math.round(canvas.width * expectedScale)
        canvas.height = Math.round(canvas.height * expectedScale)
        const safeSize = this.limitCanvasSize(canvas.width, canvas.height)
        canvas.width = safeSize.width
        canvas.height = safeSize.height
        const factor = expectedScale * safeSize.scalar * dpr

        const { cut_top, cut_left } = this.data
        const x =
          (this.data._img_left - (imgShowWidth * scale) / 2 - cut_left) * factor
        const y =
          (this.data._img_top - (imgShowHeight * scale) / 2 - cut_top) * factor
        const dWidth = imgShowWidth * factor * scale
        const dHeight = imgShowHeight * factor * scale

        const imgEl = canvas!.createImage()
        imgEl.onload = () => {
          ctx!.drawImage(imgEl, x, y, dWidth, dHeight)
          wx.canvasToTempFilePath(
            {
              fileType: 'jpg',
              canvas,
              success: (res) => {
                resolve(res.tempFilePath)
              }
            },
            this
          )
        }
        imgEl.src = this.data.imgSrc
      })
    },
    /**
     * 小程序canvas 限制 4096*4096
     */
    limitCanvasSize(width: number, height: number) {
      const maximumPixels = 16777216
      const requiredPixels = width * height
      if (requiredPixels <= maximumPixels) return { width, height, scalar: 1 }

      const scalar = Math.sqrt(maximumPixels) / Math.sqrt(requiredPixels)
      return {
        width: Math.floor(width * scalar),
        height: Math.floor(height * scalar),
        scalar
      }
    },
    _click() {
      if (!this.data.imgSrc) this.selectImage()
    }
  }
})

import router from '../routers/index'
import { getImageInfo } from './system'

function verifyPhoneNumber(phone: string) {
  const rule =
    /^(?:\+?86)?1(?:3\d{3}|5[^4\D]\d{2}|8\d{3}|7(?:[0-35-9]\d{2}|4(?:0\d|1[0-2]|9\d))|9[0-35-9]\d{2}|6[2567]\d{2}|4[579]\d{2})\d{6}$/
  return rule.test(phone)
}

function verifyEmail(email: string) {
  const rule = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/
  return rule.test(email)
}

function verifyPassword(password: string) {
  const rule = /^(?![A-Z]+$)(?![a-z]+$)(?!\d+$)(?![\W_]+$)\S{9,16}$/
  return rule.test(password)
}

function verifySMSCode(code: string) {
  const rule = /^\d{6}$/
  return rule.test(code)
}

// 验证图片类型 只允许jpg 和 png
type imgType = 'unknown' | 'jpeg' | 'png' | 'gif' | 'tiff'
function handleImgSuffix(type: imgType) {
  if (type === 'unknown' || type === 'tiff' || type === 'gif') {
    return ''
  }
  if (type === 'jpeg') return 'jpg'
  return type
}
// 验证是否登陆
function verifyIsLogin() {
  const userId = wx.getStorageSync('userId')
  if (userId) return true
  router.push({ name: 'WxLoginPage' })
  return false
}

type IUrlItem = {
  url: string
  sortIndex: number
  fileName: string
  width: number
  height: number
  upload: 0 | 1 | -1
  type: 'jpg' | 'png'
}

// 验证选择上传的图片信息是否满足要求
export async function verifyImgInfo(
  imgList: WechatMiniprogram.MediaFile[],
  startSort: number,
  size: number,
  minPicSize: number
) {
  const okPic: IUrlItem[] = []
  const failPic: WechatMiniprogram.MediaFile[] = []
  for (let i = 0; i < imgList.length; i++) {
    const img = imgList[i]
    // 验证图片大小
    if (img.size > size * 1024 * 1024) {
      failPic.push(img)
      continue
    }
    // 验证图片格式
    const { width, height, type } = await getImageInfo(img.tempFilePath)
    const suffix = handleImgSuffix(type)
    if (!suffix) {
      failPic.push(img)
      continue
    }
    // 验证长宽高
    if (!verifyPicSize(width, height, minPicSize)) {
      failPic.push(img)
      continue
    }
    okPic.push({
      url: img.tempFilePath,
      sortIndex: startSort + okPic.length,
      fileName: '',
      width,
      height,
      upload: 0,
      type: suffix
    })
  }
  return { okPic, failPic }
}

// 验证图片尺寸
const verifyPicSize = (w: number, h: number, min: number, max = 10000) => {
  //图片 太小或 太大
  if (w < min || w > max || h < min || h > max) return false
  //长宽比大于7倍 不处理
  if (h / w > 7 || w / h > 7) return false
  return true
}

export {
  verifyPhoneNumber,
  verifyEmail,
  verifyPassword,
  verifySMSCode,
  handleImgSuffix,
  verifyIsLogin,
  verifyPicSize
}

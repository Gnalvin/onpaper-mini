import dayjs from 'dayjs'
import utc from './dayjs/plugin/utc/index'

dayjs.extend(utc)
const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'
const MM_DD_HH_MM = 'MM-DD HH:mm'
const YYYY_MM_DD = 'YYYY-MM-DD'

const env_config = getApp().globalData.env_config
const OSS_PREVIEW_URL = env_config.OSS_PREVIEW_URL
const OSS_ORIGINAL_URL = env_config.OSS_ORIGINAL_URL
const OssWebpUrl = '/webp'

// 处理Utc转展示时间
export function formatUtcString(
  utcString: string,
  format: string = DATE_TIME_FORMAT,
  offset = 8
) {
  // 解决ios 兼容时间兼容问题
  let timestamp = Date.parse(utcString)
  const date = new Date(timestamp)
  return dayjs.utc(date).utcOffset(offset).format(format)
}
//时间戳转展示时间
export function formatTimestampToString(
  timestamp: number,
  format: string = YYYY_MM_DD
) {
  return dayjs.unix(timestamp).format(format)
}

// 处理时间格式 为展示的时间 当年的日期 为 MM-DD HH:mm ,不是当年 YYYY-MM-DD
export function formatUtcToShowTime(utcString: string, offset = 8) {
  // 解决ios 兼容时间兼容问题
  let timestamp = Date.parse(utcString)
  const date = new Date(timestamp)

  const nowDate = new Date()
  const strYear = parseInt(dayjs.utc(date).format('YYYY'))
  const nowYear = nowDate.getFullYear()

  if (strYear === nowYear) {
    // 如果是当年 显示日期 时分秒
    return dayjs.utc(date).utcOffset(offset).format(MM_DD_HH_MM)
  } else {
    // 不是 则 年月日
    return dayjs.utc(date).utcOffset(offset).format(YYYY_MM_DD)
  }
}

// 处理返回精确时间 alwaysTime 是否总是显示 x时x分
export function formatAccuracyTime(
  timeStr: string,
  offset = 8,
  alwaysTime = false
) {
  const nowDate = new Date()
  let timestamp = Date.parse(timeStr)
  const oldDate = new Date(timestamp)

  // 获取时间差 秒
  const diffSec = (nowDate.getTime() - oldDate.getTime()) / 1000

  //获取时间差 小时
  const diffHour = diffSec / (60 * 60) + offset

  // 时间差 分钟
  const diffMinute = diffSec / 60 + offset * 60

  //如果小于5分钟
  if (diffMinute < 5) {
    return '刚刚发布'
  }

  //如果小于一小时
  if (diffHour < 1) {
    return Math.floor(diffMinute) + ' 分钟前'
  }
  //如果小于24小时
  if (diffHour < 24) {
    return Math.floor(diffHour) + ' 小时前'
  }

  // 如果七天内
  if (diffHour < 24 * 7) {
    return Math.floor(diffHour / 24) + '天前'
  }

  const oldYear = oldDate.getUTCFullYear()
  const oldMonth = padLeftZero(String(oldDate.getUTCMonth() + 1))
  const oldDay = padLeftZero(String(oldDate.getUTCDate()))

  //补 0
  const oldHour = padLeftZero(oldDate.getUTCHours() + '')
  const oldMinute = padLeftZero(oldDate.getUTCMinutes() + '')

  // 如果大于24小时 且是今年
  if (diffHour >= 24 && oldYear === nowDate.getUTCFullYear()) {
    if (alwaysTime) {
      return dayjs.utc(oldDate).utcOffset(offset).format('MM-DD HH:mm')
    }
    return dayjs.utc(oldDate).utcOffset(offset).format('MM-DD')
  }
  //oldDate.getMonth() 从 0 开始是 1月
  //如果不是今年
  if (alwaysTime) {
    return `${oldYear}-${oldMonth}-${oldDay} ${oldHour}:${oldMinute}`
  }
  return (
    oldDate.getUTCFullYear() +
    '-' +
    (oldDate.getUTCMonth() + 1) +
    '-' +
    oldDate.getUTCDate()
  )
}

function padLeftZero(str: string) {
  str = str.toString()
  return ('00' + str).slice(str.length)
}

// arr.sort(compare("age")); 会改变原数组,根据 "age" 排序
export function objCompare(sort: string) {
  return function (m: any, n: any) {
    const a = m[sort]
    const b = n[sort]
    return a - b //升序
  }
}

type fileType =
  | 'artworks'
  | 'cover'
  | 'trends'
  | 'messages'
  | 'commission'
  | 'banners'
type size = 'l' | 'm' | 's' | 'xs' | ''
export function formatPicUrl(
  fileName: string,
  uid: string,
  fileType: fileType,
  size: size = '',
  original = false
) {
  let url = ''
  if (!fileName) return url

  const sizeType = size ? `_${size}.` : '.'
  fileName = fileName.split('.').join(sizeType)

  if (fileType == 'artworks' || fileType == 'trends') {
    const OssUrl = original ? OSS_ORIGINAL_URL : OSS_PREVIEW_URL
    url = `${OssUrl}${fileType}/${uid}/${fileName}${OssWebpUrl}`
  }

  if (fileType == 'cover') {
    url = `${OSS_PREVIEW_URL}artworks/${uid}/${fileName}`
  }

  // 如果是私信图片
  if (fileType == 'messages') {
    url = `${OSS_PREVIEW_URL}${fileType}/${uid}/${fileName}`
  }
  // 如果是约稿
  if (fileType == 'commission') {
    url = `${OSS_ORIGINAL_URL}${fileType}/${uid}/${fileName}${OssWebpUrl}`
  }

  if (fileType == 'banners') {
    url = fileName
      ? `${OSS_PREVIEW_URL}${fileType}/${uid}/${fileName}${OssWebpUrl}`
      : ''
  }

  return url
}

// 如果图片压缩图可能错误 使用原图兜底
export const handleImgErr = (
  event: WechatMiniprogram.CustomEvent,
  url: string
) => {
  if (event.detail.errMsg.indexOf('Not Found') === -1) return ''
  url = url.replace(/_.*?\./, '.').replace(/\/webp$/, '')
  url = OSS_ORIGINAL_URL + url.split(OSS_PREVIEW_URL).join('') + '/webp'
  return url
}

import { formatUtcString } from '../../utils/format'

// 处理聊天记录的时间
const today = new Date()
const yesterday = new Date(new Date().setDate(today.getDate() - 1)) // 昨天
const BYDay = new Date(new Date().setDate(today.getDate() - 2)) // 前天

export function formaMessageTime(utcString: string, lastTime: string) {
  const fiveMin = 60 * 5 * 1000
  // 间隔五分钟内不显示时间
  if (
    new Date(Date.parse(utcString)).getTime() -
      new Date(Date.parse(lastTime)).getTime() <
    fiveMin
  ) {
    return ''
  }

  // 当前年份
  const strYear = parseInt(formatUtcString(utcString, 'YYYY', 0))
  const nowYear = today.getFullYear()
  // 当前日期
  const strDay = formatUtcString(utcString, 'YYYY-MM-DD', 0)
  const nowDay = formatUtcString(today.toUTCString(), 'YYYY-MM-DD', 0)
  const yDay = formatUtcString(yesterday.toUTCString(), 'YYYY-MM-DD', 0)
  const bDay = formatUtcString(BYDay.toUTCString(), 'YYYY-MM-DD', 0)

  // 如果是当天日期 显示时分
  if (strDay == nowDay) {
    return formatUtcString(utcString, 'HH:mm')
  }
  // 如果是昨天日期 显示时分
  if (strDay == yDay) {
    return formatUtcString(utcString, '昨天 HH:mm')
  }
  // 如果是前天日期 显示时分
  if (strDay == bDay) {
    return formatUtcString(utcString, '前天 HH:mm')
  }
  // 如果是当年 显示日期
  if (strYear === nowYear) {
    return formatUtcString(utcString, 'MM-DD HH:mm')
  }
  // 年月日
  return formatUtcString(utcString, 'YYYY年MM月DD日 HH:mm')
}

// 计算图片显示大小
export const calculateImgSize = (w: number, h: number) => {
  const maxWidth = 210
  const maxHeight = 280
  const minSize = 115
  let newWidth = w
  let newHeight = h

  if (w / h > 1) {
    if (w > maxWidth) {
      newWidth = maxWidth
      newHeight = (h * maxWidth) / w

      if (newHeight > maxHeight) {
        newHeight = maxHeight
        newWidth = (w * maxHeight) / h
      }
    }

    if (newHeight < minSize) {
      newHeight = minSize
      newWidth = (w * minSize) / h
    }
  }
  // 竖长图
  else {
    if (h > maxHeight) {
      newHeight = maxHeight
      newWidth = (w * maxHeight) / h

      if (newWidth > maxWidth) {
        newWidth = maxWidth
        newHeight = (h * maxWidth) / w
      }
    }

    if (newWidth < minSize) {
      newWidth = minSize
      newHeight = (h * minSize) / w
    }
  }
  return { width: newWidth * 2 + 'rpx', height: newHeight * 2 + 'rpx' }
}

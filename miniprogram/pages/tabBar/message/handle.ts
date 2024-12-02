import { formatUtcString } from '../../../utils/format'

// 处理聊天记录的时间
const today = new Date()

// 处理聊天的时间格式 为展示的时间 当年的日期 为 MM-DD HH:mm ,不是当年 YYYY-MM-DD
export function formatChatListTime(utcString: string) {
  // 当前年份
  const strYear = parseInt(formatUtcString(utcString, 'YYYY', 0))
  const nowYear = today.getFullYear()
  // 当前日期
  const strDay = formatUtcString(utcString, 'YYYY-MM-DD', 0)
  const nowDay = formatUtcString(today.toUTCString(), 'YYYY-MM-DD', 0)

  // 如果是当天日期 显示时分秒
  if (strDay == nowDay) {
    return formatUtcString(utcString, 'HH:mm')
  }
  // 如果是当年 显示日期
  if (strYear === nowYear) {
    return formatUtcString(utcString, 'MM-DD')
  }
  // 年月日
  return formatUtcString(utcString, 'YYYY-MM-DD')
}

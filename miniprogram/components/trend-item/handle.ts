import { ITrend } from '../../services/trend/type'
import {
  objCompare,
  formatPicUrl,
  formatUtcToShowTime
} from '../../utils/format'

export interface IShowTrend extends ITrend {
  id?: string
}

export function formatTrendData(trend: IShowTrend) {
  // 这个id 是避免出现 重复图片 vue KEY 报错
  trend.id = trend.trendId + Date.parse(String(new Date()))
  trend.pics = trend.pics ? trend.pics : []
  // 排序后 拼接路径 保存
  trend.pics = trend.pics.sort(objCompare('sort'))
  trend.createAt = formatUtcToShowTime(
    trend.createAt,
    trend.type == 'aw' ? 0 : 8
  )
  trend.intro = trend.intro ? trend.intro : trend.type == 'aw' ? '分享作品' : ''
  for (let index = 0; index < trend.pics.length; index++) {
    const p = trend.pics[index]
    // 合成图片地址
    const picType = trend.type == 'aw' ? 'artworks' : 'trends'
    const size = p.width / p.height
    // 横图
    if (size >= 1) {
      const scale = p.height / 200
      p.height = 200
      p.width = p.width / scale
      //是否长图 size > 3
      const pSize = size > 3 ? 'm' : 's'
      p.preShowUrl = formatPicUrl(p.fileName, trend.userId, picType, pSize)
    } else {
      const scale = p.width / 185
      p.height = p.height / scale
      p.width = 185
      //是否长图 size < 0.35
      const pSize = size < 0.35 ? 'm' : 's'
      p.preShowUrl = formatPicUrl(p.fileName, trend.userId, picType, pSize)
    }
    const fileName = p.fileName
    p.fileName = formatPicUrl(fileName, trend.userId, picType, 'l')
    p.highQuality = formatPicUrl(fileName, trend.userId, picType, '', true)
  }
  trend.intro = trend.intro.trim()
  if (trend.forward) {
    trend.forward = formatTrendData(trend.forward as IShowTrend)
  }
  return trend
}

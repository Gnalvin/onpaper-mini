import { ITrend } from '../../../services/trend/type'

export interface IPageData {
  trends: ITrend[]
  loading: boolean
}
export interface IPageFn {
  getNewTrendAction: () => Promise<void>
}

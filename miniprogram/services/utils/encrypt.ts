import { encryptParams } from '../../utils/encrypt'
import { WLRequestConfig } from '../request/type'

export function encryptInterceptors(config: WLRequestConfig) {
  const dataObject = config.data as Record<string, any>
  dataObject['timestamp'] = new Date().getTime()
  dataObject['sign'] = encryptParams(dataObject)
  return config
}

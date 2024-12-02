import { wlRequest } from '../index'
import { IArtwork } from './type'

enum mainAPI {
  GetHotArtwork = '/artwork/hot'
}

//请求热门作品数据
export function getHotArtworkRequest() {
  return wlRequest.get<IArtwork[]>({
    url: mainAPI.GetHotArtwork
  })
}

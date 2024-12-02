import routeOpts from './pages/index'
import packageRouteOpts from './packages/index'
import { WXRouter } from './router/index'
import { wlRequest } from '../services/index'

const router = new WXRouter([...routeOpts, ...packageRouteOpts])

router.beforeEach(() => {
  // 每次路由跳转时清除 记录请求的list
  wlRequest.clearRequestList()
  return
})

export default router

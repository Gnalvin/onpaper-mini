import { RouteType } from '../router/type'

export function routeParser(name: string, routeMap: Map<string, RouteType>) {
  let route: RouteType | undefined
  // 如果输入了路由名字 到路由map 里面查找
  route = routeMap.get(name)
  // 如果路由没有找到 通过名字生成路径
  if (!route) {
    throw new Error(`没有通过 name: ${name} 匹配到对应路由`)
  }
  return route
}

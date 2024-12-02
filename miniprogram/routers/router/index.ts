import {
  RouteType,
  RouteOpts,
  PushOpt,
  ReplaceOpt,
  queryType,
  SwitchTabOpt,
  BackOpt,
  ReLaunchOpt,
  hookType,
  IcompleteOpt
} from './type'
import { routeParser, querify, decode, encode } from '../utils/index'

export class WXRouter {
  /** 路由映射Map */
  private routeMap: Map<string, RouteType>
  /** 路由配置List */
  private routeConfigList: RouteOpts
  /** 用于 extract 提炼 option 参数 */
  private encodeKey: string
  /** 全局前置守卫钩子 */
  private beforeHooks: hookType[]
  /** 全局后置钩子 */
  private afterHooks: hookType[]
  /** 当前路由堆栈数量 */
  private stackLength: number

  constructor(routes: RouteOpts, encodeKey = '') {
    this.encodeKey = encodeKey || 'extraQuery'
    this.routeConfigList = routes
    this.routeMap = new Map()
    routes.forEach((route) => {
      if (route.name) {
        this.routeMap.set(route.name, route)
      }
    })
    this.beforeHooks = []
    this.afterHooks = []
    this.stackLength = 0
  }

  /**
   * 在导航前调用 hook，hook 返回 false 时 中断路由跳转
   *
   * 如果 没有通过 name 找到 对应的路由配置 to 和 from 参数将返回 undefined
   */
  beforeEach(hook: hookType) {
    return this.registerHook(this.beforeHooks, hook)
  }

  /**
   * 在导航完成时调用 hook
   *
   * 如果 没有通过 name 找到 对应的路由配置 to 和 from 参数将返回  undefined
   *
   * 内部原理是在小程序的路由导航 complete 时调用
   */
  afterEach(hook: hookType) {
    return this.registerHook(this.afterHooks, hook)
  }

  /**
   * 最常用的路由跳转，会加入到页面栈，允许返回，也就是新页面不断入栈
   *
   * 如果在路由配置中配置了 type:"tab" 内部会自动使用 wx.switchTab 方法
   *
   * wx.switchTab 跳转tabBar页面专用，其他页面出栈，新页面入栈
   */
  push(option: PushOpt) {
    const { name, query, success, fail, complete, events } = option
    const { url, type, to, from, isBreakNav } = this.generateRouteOption(
      name,
      query
    )

    if (type === 'tab') {
      const newSuccess = success as
        | WechatMiniprogram.SwitchTabSuccessCallback
        | undefined
      return this.switchTab({
        name,
        query,
        success: newSuccess,
        fail,
        complete
      })
    }
    return new Promise((resolve, reject) => {
      if (isBreakNav) return resolve('导航中断')
      wx.navigateTo({
        url,
        success: (res) => {
          if (success) success(res)
          resolve(res)
        },
        fail: (err) => {
          if (fail) fail(err)
          reject(err)
        },
        events: events,
        complete: (res) => {
          this.complete({ res, complete, to, from })
        }
      })
    })
  }
  /**
   *
   * 关闭当前页面，跳转到应用内的某个页面。但是不允许跳转到 tabbar 页面。
   */
  replace(option: ReplaceOpt) {
    const { name, query, success, fail, complete } = option
    const { url, to, from, isBreakNav } = this.generateRouteOption(name, query)
    return new Promise((resolve, reject) => {
      if (isBreakNav) return resolve('导航中断')
      wx.redirectTo({
        url,
        success: (res) => {
          if (success) success(res)
          resolve(res)
        },
        fail: (err) => {
          if (fail) fail(err)
          reject(err)
        },
        complete: (res) => {
          this.complete({ res, complete, to, from })
        }
      })
    })
  }
  /**
   *
   * 关闭当前页面，返回上一页面或多级页面。如果 delta 大于现有页面数，则返回到首页。
   */
  back(option?: BackOpt) {
    let delta = option?.delta
    const success = option?.success
    const fail = option?.fail
    const complete = option?.complete
    if (delta === undefined) delta = 1

    const { to, from, isBreakNav } = this.generateRouteOption(
      undefined,
      undefined,
      delta
    )
    return new Promise((resolve, reject) => {
      if (isBreakNav) return resolve('导航中断')
      wx.navigateBack({
        delta,
        success: (res) => {
          if (success) success(res)
          resolve(res)
        },
        fail: (err) => {
          if (fail) fail(err)
          reject(err)
        },
        complete: (res) => {
          this.complete({ res, complete, to, from })
        }
      })
    })
  }

  switchTab(option: SwitchTabOpt) {
    const { name, query, success, fail, complete } = option
    const { url, to, from, isBreakNav } = this.generateRouteOption(name, query)
    return new Promise((resolve, reject) => {
      if (isBreakNav) return resolve('导航中断')
      wx.switchTab({
        url,
        success: (res) => {
          if (success) success(res)
          resolve(res)
        },
        fail: (err) => {
          if (fail) fail(err)
          reject(err)
        },
        complete: (res) => {
          this.complete({ res, complete, to, from })
        }
      })
    })
  }

  /**
   *
   * 关闭所有页面，打开某个页面，可以打开任意页面包括tabBar，适合强制完成某个操作的页面，
   *
   * 比如登录页，当已登录的用户点击退出后，进入登录页，那么就不能通过返回再回去了，就必须留下来登录或注册，适合用这个，表现为所有页面出栈，新页面入栈
   */
  reLaunch(option: ReLaunchOpt) {
    const { name, query, success, fail, complete } = option
    const { url, to, from, isBreakNav } = this.generateRouteOption(name, query)
    return new Promise((resolve, reject) => {
      if (isBreakNav) return resolve('导航中断')
      wx.reLaunch({
        url,
        success: (res) => {
          if (success) success(res)
          resolve(res)
        },
        fail: (err) => {
          if (fail) fail(err)
          reject(err)
        },
        complete: (res) => {
          this.complete({ res, complete, to, from })
        }
      })
    })
  }

  //提炼数据
  extract(option: queryType) {
    const data = option[this.encodeKey]
    if (data) {
      return decode(data)
    }
    return null
  }

  //对传进的 参数再做 格式化 并调用 beforeHooks
  private generateRouteOption(
    name?: string,
    query?: queryType,
    delta?: number
  ) {
    let goPageConfig: RouteType | undefined
    let url = ''
    let type: string | undefined
    // 通过name 查找到跳转的路由配置
    if (name) {
      goPageConfig = routeParser(name, this.routeMap)
      type = goPageConfig.type
      url = goPageConfig.path
    }
    // 调用 router.back() 时 通过 delta 查找到跳转的路由配置
    if (delta !== undefined) {
      const pages = getCurrentPages()
      // 小程序 如果 delta 大于现有页面数，则返回到首页 所以 index = 0
      const index = delta > this.stackLength ? 0 : pages.length - 1 - delta
      const goPage = pages[index]
      goPageConfig = this.getRouteConfigByPath(goPage.route)!
    }
    //如果传入了 query 参数 对其格式化并添加到 query里面
    if (query) {
      query[this.encodeKey] = encode(query)
      url += `?${querify(query)}`
    }
    //是否分包的路由
    if (goPageConfig?.subPackage?.root) {
      url = goPageConfig.subPackage.root + url
    }
    // 获取当前路由配置
    const { currentPageConfig } = this.getCurrentRoute()
    //运行 beforeHooks
    let isBreakNav = false
    for (let index = 0; index < this.beforeHooks.length; index++) {
      const hook = this.beforeHooks[index]
      const res = hook(goPageConfig, currentPageConfig)
      if (res === false) {
        isBreakNav = true
      }
    }
    return { url, type, to: goPageConfig, from: currentPageConfig, isBreakNav }
  }

  private registerHook(list: hookType[], fn: hookType) {
    list.push(fn)
    return () => {
      const i = list.indexOf(fn)
      if (i > -1) list.splice(i, 1)
    }
  }

  /**
   * 根据路径获取路由配置
   * @param path 小程序路径返回的path(不以/开头)
   */
  getRouteConfigByPath(path: string) {
    if (path.indexOf('?') > -1) {
      path = path.substring(0, path.indexOf('?'))
    }
    return this.routeConfigList.find((item) => item.path === `/${path}`)
  }

  // 获取当前路由
  getCurrentRoute() {
    //获取小程序路由栈
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    this.stackLength = pages.length
    const currentPageConfig = this.getRouteConfigByPath(currentPage.route)
    return { currentPage, currentPageConfig }
  }

  //路由导航完成时调用
  private complete(opt: IcompleteOpt) {
    const { res, complete, to, from } = opt
    if (complete) complete(res)
    //运行 afterHooks
    this.afterHooks.forEach((hook) => {
      hook(to, from)
    })
  }
}

type WXNavigateToOption = WechatMiniprogram.NavigateToOption
type WXRedirectToOption = WechatMiniprogram.RedirectToOption
type WXSwitchTabOption = WechatMiniprogram.SwitchTabOption
type WXBackOption = WechatMiniprogram.NavigateBackOption
type WXReLaunchOpt = WechatMiniprogram.ReLaunchOption
type WXCallbackResult = WechatMiniprogram.GeneralCallbackResult

export type queryType = {
  [key: string]: any
}

export interface RouteType {
  path: string
  name: string
  type?: string
  subPackage?: {
    root: string
  }
}
export type RouteOpts = RouteType[]

export interface PushOpt extends Omit<WXNavigateToOption, 'url'> {
  name: string
  query?: queryType
}

export interface ReplaceOpt extends Omit<WXRedirectToOption, 'url'> {
  name: string
  query?: queryType
}

export interface SwitchTabOpt extends Omit<WXSwitchTabOption, 'url'> {
  name: string
  query?: queryType
}

export interface ReLaunchOpt extends Omit<WXReLaunchOpt, 'url'> {
  name: string
  query?: queryType
}

export interface BackOpt extends WXBackOption {}

export type hookType = (
  to: RouteType | undefined,
  from: RouteType | undefined
) => any

export interface IcompleteOpt {
  res: WXCallbackResult
  complete: WechatMiniprogram.NavigateToCompleteCallback | undefined
  to: RouteType | undefined
  from: RouteType | undefined
}

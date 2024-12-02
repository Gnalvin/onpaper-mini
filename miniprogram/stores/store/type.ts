import { DataStore } from './index'

type actionsFn<T extends StateTree> = {
  (this: DataStore<T>, ctx: T, payload?: any): any
}

export type actionsType<T extends StateTree> = {
  [key: string]: actionsFn<T>
}

export interface IOptions<T extends StateTree, A extends actionsType<T> = {}> {
  state: T
  actions?: A
}

export type StateTree = Record<string, any>

export type CallbackType = {
  (...arg: any[]): any
}

export type HandlersType = {
  eventCallback: CallbackType
  originalKey: string
  thisArg: any
}

export type IEventBus = Map<string, { callBackFns: HandlersType[] }>

export type EventName = string

export type StateKeys = string | string[]

export type StateKeyType = keyof StateTree

export type setStateObj = {
  [key in StateKeyType]: any
}

export type WatchOption = {
  immediate?: boolean
}

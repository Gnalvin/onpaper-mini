import type {
  IOptions,
  actionsType,
  CallbackType,
  StateTree,
  IEventBus,
  EventName,
  StateKeys,
  WatchOption,
  setStateObj,
  HandlersType
} from './type'

import { isObject, unique, deepClone } from './utils'

class DataStore<T extends StateTree, A extends actionsType<T> = {}> {
  state: T
  actions: A
  eventBus: IEventBus
  private copyState: T

  constructor(options: IOptions<T, A>) {
    if (!isObject(options.state)) {
      throw new TypeError('the state must be object type')
    }
    if (options.actions && isObject(options.actions)) {
      const values = Object.values(options.actions)
      for (const value of values) {
        if (typeof value !== 'function') {
          throw new TypeError('the value of actions must be a function')
        }
      }
    }

    this.state = this.observer(options.state)
    this.actions = options.actions ? options.actions : ({} as A)
    this.eventBus = new Map<string, { callBackFns: HandlersType[] }>()
    this.copyState = deepClone(options.state)
  }

  private observer(state: T, topKey?: string) {
    const _this = this
    const objProxy: T = new Proxy(state, {
      set: function (target, key, newValue, receiver) {
        if (typeof key === 'symbol') return true
        //如果 设置相同的值 不发出事件调用回调函数
        if (target[key] === newValue) return true

        // 修改的不是对象和数组
        if (topKey === undefined) {
          const oldValue = target[key]
          _this.emit(key as string, { newValue, oldValue })
          return Reflect.set(target, key, newValue, receiver)
        }
        // 修改的是对象和数组
        const value = _this.state[topKey]
        const oldValue = deepClone(value)
        const res = Reflect.set(target, key, newValue, receiver)
        _this.emit(topKey, { newValue: value, oldValue })
        return res
      },
      get: function (target, key, receiver) {
        if (typeof key === 'symbol') return true
        const res = Reflect.get(target, key, receiver)

        // 如果是对象 进行深度监听,保存最顶端的 object key
        if (isObject(target[key])) {
          if (topKey === undefined) {
            return _this.observer(target[key], key as string)
          } else {
            return _this.observer(target[key], topKey)
          }
        }

        return res
      },
      deleteProperty(target, key) {
        const result = Reflect.deleteProperty(target, key)
        return result
      }
    })
    return objProxy
  }

  /**
   * Add listener key
   * @param stateKeys which key do you want to watch
   * @param stateCallback Called when the key changes
   * @param options whether to call immediately
   * @param thisArg the this of the callback function
   * @returns function to cancel listening
   */
  watch(
    stateKeys: Extract<keyof T, string> | Array<Extract<keyof T, string>>,
    stateCallback: CallbackType | CallbackType[],
    options?: WatchOption,
    thisArg?: any
  ) {
    if (typeof stateKeys === 'string') {
      stateKeys = [stateKeys]
    }
    const keys = Object.keys(this.state)
    for (const theKey of stateKeys) {
      if (keys.indexOf(theKey) === -1) {
        throw new Error(`the ${theKey} does not contain your state key`)
      }
    }

    const formatKey = unique(stateKeys).sort().join('&')
    const originalKey = unique(stateKeys).join('&')

    if (!Array.isArray(stateCallback)) {
      stateCallback = [stateCallback]
    }
    stateCallback.forEach((callBackFn) => {
      if (typeof callBackFn !== 'function') {
        throw new TypeError('the event callback must be function type')
      }
      //注册事件
      this.on(formatKey, originalKey, callBackFn, thisArg)
      // 立即执行一次
      if (options?.immediate === true) {
        this.forceExec(formatKey, callBackFn)
      }
    })

    //返回取消监听函数
    return () => {
      if (Array.isArray(stateCallback)) {
        stateCallback.forEach((callBackFn) => {
          this.offWatch(formatKey as any, callBackFn)
        })
      }
    }
  }

  /**
   * Cancel listening for events
   * @param stateKeys Cancelled key name
   * @param stateCallback Pass in the callback function to cancel
   */
  offWatch(
    stateKeys: Extract<keyof T, string> | Array<Extract<keyof T, string>>,
    stateCallback: CallbackType | CallbackType[]
  ) {
    if (typeof stateKeys === 'string') {
      stateKeys = [stateKeys]
    }
    if (!Array.isArray(stateCallback)) {
      stateCallback = [stateCallback]
    }

    const formatKey = unique(stateKeys).sort().join('&')
    stateCallback.forEach((callBackFn) => {
      this.off(formatKey, callBackFn)
    })
  }

  /**
   * change the value of state
   * @param keyAndValue
   */
  setState(keyAndValue: setStateObj) {
    const stateKeys = Object.keys(this.state)
    for (const key in keyAndValue) {
      if (stateKeys.indexOf(key) === -1) {
        throw new Error(`the ${key} does not contain your state key`)
      }
      this.state[key as keyof T] = keyAndValue[key]
    }
  }

  /**
   *
   * @param actionName dispatch action name
   * @param payload arguments passed to the action function
   */
  async dispatch(actionName: keyof A, payload?: any): Promise<any> {
    if (typeof actionName !== 'string') {
      throw new TypeError('the action name must be string type')
    }
    if (Object.keys(this.actions).indexOf(actionName) === -1) {
      throw new Error('this action name does not exist, please check it')
    }
    const actionFn = this.actions[actionName]

    return actionFn.apply(this, [this.state, payload])
  }

  /**
   *
   * @param stateKeys Clear all listeners of the stateKeys
   */
  clearWatch(stateKeys: StateKeys) {
    if (typeof stateKeys === 'string') {
      stateKeys = [stateKeys]
    }
    const formatKey = unique(stateKeys).sort().join('&')
    if (this.eventBus.has(formatKey)) {
      this.eventBus.delete(formatKey)
    } else {
      console.warn(`clearWatch ${stateKeys} does not exist `)
    }
  }

  /**
   * Clear all listens
   */
  clearAllWatch() {
    this.eventBus = new Map<string, { callBackFns: HandlersType[] }>()
  }

  /**
   * Restore to initial value
   */
  resetStore() {
    this.state = this.observer(deepClone(this.copyState))
    this.clearAllWatch()
  }

  /**
   * 即使在监听参数没有发生变化时, 强制执行 监听参数的 回调函数
   */
  private forceExec(stateKeys: string, stateCallback: CallbackType) {
    this.emit(stateKeys, undefined, stateCallback)
  }

  /**
   * 添加监听事件
   * @param formatKey 要监听的时间名称
   * @param originalKey 原始参数格式化后的字符串
   * @param eventCallback 当监听到事件后的回调函数
   * @param thisArg 回调函数绑定的 this
   */
  private on(
    formatKey: EventName,
    originalKey: string,
    eventCallback: CallbackType,
    thisArg?: any
  ) {
    // 取出处理函数对象 如果没有则创建
    let handlers = this.eventBus.get(formatKey)
    if (handlers === undefined) {
      handlers = {
        callBackFns: []
      }
      this.eventBus.set(formatKey, handlers)
    }

    handlers.callBackFns.push({
      originalKey,
      eventCallback,
      thisArg
    })
    return this
  }

  /**
   *
   * 发出事件 调用注册的回调函数
   */
  private emit(
    formatKey: EventName,
    setStateValue?: { newValue: any; oldValue: any },
    immediatelyFn?: CallbackType
  ) {
    let resPayload: any[] = []
    let newValueList: any[] = []
    let oldValueList: any[] = []

    // 调用 forceExec 执行if
    if (setStateValue === undefined) {
      // 取出 { 'age&banners&name': { callBackFns: [ [Object], [Object] ] } }
      const handlers = this.eventBus.get(formatKey)!
      // 拿到对应的 callBackFns Object
      const handler = handlers.callBackFns.find(
        (item) => item.eventCallback === immediatelyFn
      )
      // 通过 originalKey 确定 返回参数的位置
      const watchKeys = handler!.originalKey.split('&')
      if (watchKeys.length > 1) {
        watchKeys.forEach((key) => {
          newValueList.push(this.state[key])
        })
        resPayload.push(newValueList, oldValueList)
      } else {
        resPayload.push(this.state[watchKeys[0]], undefined)
      }

      // 如果有传入 则执行传入的 没传入则 把所有依赖回调都调用
      if (immediatelyFn !== undefined) {
        immediatelyFn.apply(handler!.thisArg, resPayload)
      } else {
        handlers.callBackFns.forEach((handler) => {
          handler.eventCallback.apply(handler.thisArg, resPayload)
        })
      }

      return this
    }

    const { newValue, oldValue } = setStateValue
    this.eventBus.forEach((handlers, key) => {
      // 把包含有 eventName 的 回调函数全部调用
      if (key.indexOf(formatKey) !== -1) {
        //将监听的字符串分割
        const watchKeys = key.split('&')
        // 如果是 监听多个值的 , 回调函数获得参数格式  ([...newValue],[...oldValue])=>{}
        if (watchKeys.length > 1) {
          handlers.callBackFns.forEach((handler) => {
            const originalKeys = handler.originalKey.split('&')

            originalKeys.forEach((key) => {
              if (key === formatKey) {
                newValueList.push(newValue)
                oldValueList.push(oldValue)
              } else {
                const normalValue = this.state[key]
                newValueList.push(normalValue)
                oldValueList.push(normalValue)
              }
            })

            resPayload.push(newValueList, oldValueList)
            handler.eventCallback.apply(handler.thisArg, resPayload)
            //清空结果数组
            resPayload = []
            newValueList = []
            oldValueList = []
          })
        } else {
          //如果是 监听单个值 回调函数获得参数格式  (newValue,oldValue)=>{}
          resPayload.push(newValue, oldValue)
          handlers.callBackFns.forEach((handler) => {
            handler.eventCallback.apply(handler.thisArg, resPayload)
          })
          //清空结果数组
          resPayload = []
          newValueList = []
          oldValueList = []
        }
      }
    })

    return this
  }

  /**
   * 取消监听事件
   * @param eventName 取消的事件名字
   * @param eventCallback 传入要取消的回调函数
   */
  private off(eventName: EventName, eventCallback: CallbackType) {
    if (typeof eventName !== 'string') {
      throw new TypeError('the event name must be string type')
    }

    if (typeof eventCallback !== 'function') {
      throw new TypeError('the event callback must be function type')
    }

    const handlers = this.eventBus.get(eventName)
    if (handlers === undefined) {
      throw new Error(
        `the Cancel watching the value of ${eventName} does not contain in your watching event name list`
      )
    }

    const callBackFns = handlers.callBackFns
    if (callBackFns && eventCallback) {
      const newHandlers = [...callBackFns]
      for (let i = 0; i < newHandlers.length; i++) {
        const handler = newHandlers[i]
        if (handler.eventCallback === eventCallback) {
          const index = callBackFns.indexOf(handler)
          callBackFns.splice(index, 1)
        }
      }
    }

    if (handlers.callBackFns.length === 0) {
      this.eventBus.delete(eventName)
    }
  }
}

/**
 * Passing the option argument to retrieves the store instance
 *
 * @param options
 * @returns
 */
function defineStore<T extends StateTree, A extends actionsType<T> = {}>(
  options: IOptions<T, A>
) {
  return new DataStore<T, A>(options)
}

export { defineStore, DataStore }

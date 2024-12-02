export function pageQueryRect(selector: string) {
  return new Promise<WechatMiniprogram.BoundingClientRectCallbackResult[]>(
    (resolve) => {
      const query = wx.createSelectorQuery()
      query.select(selector).boundingClientRect()
      query.exec(resolve)
    }
  )
}

export function pageQueryRectAll(selector: string) {
  return new Promise<any>((resolve) => {
    const query = wx.createSelectorQuery()
    query.selectAll(selector).boundingClientRect()
    query.exec(resolve)
  })
}

export function pageQueryScrollview(selector: string) {
  return new Promise<WechatMiniprogram.ScrollViewContext>((resolve) => {
    wx.createSelectorQuery()
      .select(selector)
      .node()
      .exec((res) => {
        resolve(res[0].node)
      })
  })
}

export function cpnQueryScrollview(selector: string, _this: any) {
  return new Promise<WechatMiniprogram.ScrollViewContext>((resolve) => {
    _this
      .createSelectorQuery()
      .select(selector)
      .node()
      .exec((res: any) => {
        resolve(res[0].node)
      })
  })
}

export function cpnQueryRect(selector: string, _this: any) {
  return new Promise<WechatMiniprogram.BoundingClientRectCallbackResult>(
    (resolve) => {
      const query = _this.createSelectorQuery()
      query.select(selector).boundingClientRect(resolve)
      query.exec()
    }
  )
}

export function cpnQueryRectAll(selector: string, _this: any) {
  return new Promise<WechatMiniprogram.BoundingClientRectCallbackResult[]>(
    (resolve) => {
      const query = _this.createSelectorQuery()
      query.selectAll(selector).boundingClientRect()
      query.exec((res: any) => {
        resolve(res[0])
      })
    }
  )
}

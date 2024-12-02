// pages/agreement/index.ts
Page({
  /**
   * 页面的初始数据
   */
  data: {
    url: '' // 页面中需要的数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options: { url: string; nav: string }) {
    this.setData({
      url: options.url // 从跳转页面中传过来的url在options中可以拿到
    })
    wx.setNavigationBarTitle({
      title: options.nav
    })
  }
})

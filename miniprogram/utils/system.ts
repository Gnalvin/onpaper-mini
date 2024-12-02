type updateCallBackFn = (
  updateManager: WechatMiniprogram.UpdateManager,
  res: WechatMiniprogram.GeneralCallbackResult
) => void
// 检查小程序版本并更新
export function checkUpdate(
  success?: updateCallBackFn,
  fail?: updateCallBackFn
) {
  // 检查是否支持版本更新
  if (wx.canIUse('getUpdateManager')) {
    // 获取版本更新对象
    var updateManager = wx.getUpdateManager()
    // 检测是否有新版本
    updateManager.onCheckForUpdate((res) => {
      // 有新版本
      if (res.hasUpdate) {
        // 更新成功回调
        updateManager.onUpdateReady((res) => {
          // 有回调实现
          if (success) {
            // 自己写提示，返回版本更新对象，方便外部使用
            success(updateManager, res)
          } else {
            // 使用内部更新提示
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: (res) => {
                // 确定重启，在 onUpdateReady 回调中使用 applyUpdate 强制小程序重启使用新版本。
                if (res.confirm) {
                  updateManager.applyUpdate()
                }
              }
            })
          }
        })
        // 更新失败回调
        updateManager.onUpdateFailed((err) => {
          // 有回调实现
          if (fail) {
            // 自己写提示
            fail(updateManager, err)
          } else {
            // 使用内部更新提示
            wx.showModal({
              title: '更新提示',
              content: '新版本下载失败，请检查网络！',
              showCancel: false
            })
          }
        })
      } else {
        // 无新版本
      }
    })
  }
}

/**
 * 获取文件大小
 * @param filePath 文件路径
 */
export function getFileInfo(filePath: string) {
  return new Promise<WechatMiniprogram.GetFileInfoSuccessCallbackResult>(
    (resolve, reject) => {
      const fileManager = wx.getFileSystemManager()
      fileManager.getFileInfo({
        filePath,
        success: (res) => {
          resolve(res)
        },
        fail: (err) => {
          reject(err)
        }
      })
    }
  )
}

/**
 * 获取图片长宽高
 * @param filePath 文件路径
 */
export function getImageInfo(filePath: string) {
  return new Promise<WechatMiniprogram.GetImageInfoSuccessCallbackResult>(
    (resolve, reject) => {
      wx.getImageInfo({
        src: filePath,
        success(res) {
          resolve(res)
        },
        fail(err) {
          reject(err)
        }
      })
    }
  )
}

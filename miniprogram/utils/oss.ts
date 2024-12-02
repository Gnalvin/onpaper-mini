import crypto from 'crypto-js'
import { Base64 } from 'js-base64'

const env_config = getApp().globalData.env_config

interface IStsToken {
  accessKeyId: string
  accessKeySecret: string
  securityToken: string
  expiration: string
}

export class OssClient {
  private stsToken: IStsToken
  private host: string

  constructor(stsToken: IStsToken, bucketName: 'temp' | 'preview' = 'temp') {
    this.stsToken = stsToken
    this.host =
      bucketName == 'preview'
        ? env_config.OSS_PREVIEW_ORIGINAL_URL
        : env_config.OSS_TEMP_URL
  }
  uploadFile(filePath: string, key: string) {
    const policyText = {
      expiration: this.stsToken.expiration,
      // 限制上传大小。
      conditions: [['content-length-range', 0, 32 * 1024 * 1024]]
    }
    // policy必须为base64的string。
    const policy = Base64.encode(JSON.stringify(policyText))
    // 生成signature
    const signature = crypto.enc.Base64.stringify(
      crypto.HmacSHA1(policy, this.stsToken.accessKeySecret)
    )
    return new Promise<any>((resolve, reject) => {
      wx.uploadFile({
        url: this.host, // 开发者服务器的URL。
        filePath: filePath,
        name: 'file', // 必须填file。
        formData: {
          key,
          policy,
          OSSAccessKeyId: this.stsToken.accessKeyId,
          signature,
          'x-oss-security-token': this.stsToken.securityToken, // 使用STS签名时必传。
          success_action_status: 200 // 自定义成功返回的http状态码，默认为204
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res)
          } else {
            reject(res)
          }
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  }
}

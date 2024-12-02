/// <reference path="./types/index.d.ts" />

interface IAppOption {
  globalData: {
     env_config:{
      environment:"dev"|"prod"
      BASE_URL:string
      OSS_PREVIEW_URL:string
      OSS_ORIGINAL_URL:string
      OSS_TEMP_URL:string
      OSS_ORIGINAL_BUCKET:string
      OSS_PREVIEW_BUCKET:string
      OSS_TEMP_BUCKET:string
      OSS_REGION:string
      DEFAULT_AVATAR:string
      MD5_SIGN:string
     },
     userId:string
  }
}
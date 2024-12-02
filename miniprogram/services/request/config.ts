const env_config = require('../../config/env/projectConfig')
// 基础共同的配置
const baseConfig = {
  TIMEOUT: 10000
}

// 合并配置
const config = Object.assign(baseConfig, { BASE_URL: env_config.BASE_URL })

export default config

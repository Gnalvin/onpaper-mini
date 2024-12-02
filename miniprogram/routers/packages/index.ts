import { userEditProfileRoute } from './edit-profile/index'
import { userSettingRoute } from './setting/index'
import { LoginRoute } from './login/index'
import { artworkShowRoute } from './artwork-show/index'
import { commentDetailRoute } from './comment-detail/index'
import { trendShowRoute } from './trend-show/index'
import { userHomeRoute } from './user-home/index'
import { notifyPageRoute } from './notify/index'
import { chatDetailRoute } from './chat-detail/index'
import { uploadArtworkRoutes } from './upload-artwork/index'
import { tagPageRoute } from './tag-page/index'
import { userProfileRoute } from './user-profile/index'
import { uploadTrendRoute } from './upload-trend/index'
import { discoverRoutes } from './discover/index'
import { userFansRoute } from './user-fans/index'

export default [
  ...userEditProfileRoute,
  ...LoginRoute,
  commentDetailRoute,
  artworkShowRoute,
  trendShowRoute,
  userHomeRoute,
  notifyPageRoute,
  userSettingRoute,
  chatDetailRoute,
  tagPageRoute,
  userProfileRoute,
  uploadTrendRoute,
  userFansRoute,
  ...uploadArtworkRoutes,
  ...discoverRoutes
]

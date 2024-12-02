const subPackage = {
  root: '/packages/edit-profile/subpage'
}

const userEditProfilePage = {
  path: '/index',
  name: 'UserEditProfile',
  subPackage: {
    root: '/packages/edit-profile'
  }
}

const editIntroduce = {
  path: '/introduce/index',
  name: 'editProfileIntroduce',
  subPackage
}

const editName = {
  path: '/name/index',
  name: 'editProfileName',
  subPackage
}

const editAvatar = {
  path: '/avatar/index',
  name: 'editProfileAvatar',
  subPackage
}

const editBanner = {
  path: '/banner/index',
  name: 'editProfileBanner',
  subPackage
}

export const userEditProfileRoute = [
  userEditProfilePage,
  editIntroduce,
  editName,
  editAvatar,
  editBanner
]

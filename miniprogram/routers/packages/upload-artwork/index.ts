const subPackage = {
  root: '/packages/upload-artwork/subpage'
}

export const uploadArtwor = {
  path: '/index',
  name: 'UploadArtwork',
  subPackage: {
    root: '/packages/upload-artwork'
  }
}

export const artworkProfile = {
  path: '/profile/index',
  name: 'UploadArtworkProfile',
  subPackage
}

export const artworCover = {
  path: '/cover/index',
  name: 'UploadArtworkCover',
  subPackage
}

export const artworSetting = {
  path: '/setting/index',
  name: 'UploadArtworkSetting',
  subPackage
}

export const uploadArtworkRoutes = [
  uploadArtwor,
  artworkProfile,
  artworCover,
  artworSetting
]

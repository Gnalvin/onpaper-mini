const subPackage = {
  root: '/packages/discover'
}

const discoverArtistPage = {
  path: '/artist/index',
  name: 'DiscoverArtist',
  subPackage
}

const discoverTodyPage = {
  path: '/new/index',
  name: 'DiscoverTody',
  subPackage
}

const discoverRankPage = {
  path: '/rank/index',
  name: 'DiscoverRank',
  subPackage
}

const discoverZonePage = {
  path: '/zone/index',
  name: 'DiscoverZone',
  subPackage
}

export const discoverRoutes = [
  discoverRankPage,
  discoverArtistPage,
  discoverTodyPage,
  discoverZonePage
]

// components/artwork/rectangle/index.ts
import router from '../../../routers/index'
import { postArtworkLikeRequest } from '../../../services/artwork/index'
import { verifyIsLogin } from '../../../utils/verify'

Component({
  properties: {
    artwork: {
      type: Object,
      value: {}
    },
    noAvatarJump: {
      type: Boolean,
      value: false
    }
  },
  data: {},
  methods: {
    goToDetail() {
      router.push({
        name: 'ArtworkShow',
        query: { artId: this.data.artwork.artworkId }
      })
    },
    // 点赞
    async postLikeAction() {
      if (!verifyIsLogin()) return
      const { isLike, artworkId, userId } = this.properties.artwork
      const result = await postArtworkLikeRequest(artworkId, userId, isLike)
      if (result.statusCode === 200) {
        if (!isLike) {
          this.properties.artwork!.likes++
          this.properties.artwork!.isLike = true
        } else {
          this.properties.artwork!.likes--
          this.properties.artwork!.isLike = false
        }
        this.setData({ artwork: this.properties.artwork })
      }
    }
  }
})

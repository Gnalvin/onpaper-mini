import { artworkPageIns } from './type'
import { ICommentType } from '../../services/comment/type'
import { IArtworkInfoData } from '../../services/artwork/type'
import {
  objCompare,
  formatPicUrl,
  formatUtcString,
  formatAccuracyTime
} from '../../utils/format'

const { screenWidth } = wx.getSystemInfoSync()

//保存作品评论数据
export function saveComment(comments: ICommentType[], page: artworkPageIns) {
  //如果小于20 一组说明这是最后一组评论
  if (comments.length < 20) page.setData({ commentEnd: true })
  comments.forEach((c) => {
    c.createAT = formatAccuracyTime(c.createAT, 0, true)
    c.ownType = 'aw'
  })
  page.setData({ comments })
}

export function addRootComment(comments: ICommentType[], page: artworkPageIns) {
  //如果小于20 一组说明这是最后一组评论
  if (comments.length < 20) page.setData({ commentEnd: true })
  comments.forEach((c) => {
    c.createAT = formatAccuracyTime(c.createAT, 0, true)
    c.ownType = 'aw'
    page.data.comments.push(c)
  })
  page.setData({ comments: page.data.comments })
}

export function saveNewComment(newComment: ICommentType, page: artworkPageIns) {
  const artInfo = page.data.artInfo
  artInfo!.comments++
  newComment.createAT = formatAccuracyTime(newComment.createAT, 0, true)
  newComment.ownType = 'aw'
  //如果是直接评论作品 在最上面显示
  const comments = page.data.comments
  if (newComment.rootId === '0') {
    comments.unshift(newComment)
    page.setData({ comments, zeroComment: false, artInfo })
    return
  }
  // 如果是回复的某个根评论  在根回复下面显示
  const replyItem = comments.find((item) => item.cId === newComment.rootId)
  if (replyItem) replyItem.childComments.unshift(newComment)
  page.setData({ comments, zeroComment: false, artInfo })
}

export function saveArtInfo(artInfo: IArtworkInfoData, page: artworkPageIns) {
  artInfo.picture = artInfo.picture.sort(objCompare('sort'))
  artInfo.picture.forEach((p) => {
    p.fileName = formatPicUrl(p.fileName, artInfo.userId, 'artworks', 'm')
  })
  if (artInfo.otherArtwork.length > 3) {
    // 去除当前作品
    artInfo.otherArtwork = artInfo.otherArtwork.filter(
      (item) => item.artworkId !== artInfo.artworkId
    )
  }
  artInfo.otherArtwork.forEach((item) => {
    item.cover = formatPicUrl(item.cover, artInfo.userId, 'cover', 'm')
  })

  artInfo.createAT = formatUtcString(artInfo.createAT, 'YYYY-MM-DD HH:mm', 0)
  page.setData({ artInfo })
}

export function calculateSwiperHeight(
  artInfo: IArtworkInfoData,
  page: artworkPageIns
) {
  let picMinHightItem: any = { height: 0 }
  artInfo.picture.forEach((p) => {
    if (!picMinHightItem.height) picMinHightItem = p
    if (p.height < picMinHightItem.height) picMinHightItem = p
  })

  // 计算缩放比例
  const scale = screenWidth / picMinHightItem.width
  let swiperHeight = picMinHightItem.height * scale

  if (swiperHeight > 530) swiperHeight = 530
  if (swiperHeight < 300) swiperHeight = 300
  page.setData({ swiperHeight: swiperHeight * 2 })
}

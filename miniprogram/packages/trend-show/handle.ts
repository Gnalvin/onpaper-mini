import { ICommentType } from '../../services/comment/type'
import { formatAccuracyTime } from '../../utils/format'
import { trendPageIns } from './type'

//保存作品评论数据
export function saveComment(comments: ICommentType[], page: trendPageIns) {
  //如果小于20 一组说明这是最后一组评论
  if (comments.length < 20) page.setData({ commentEnd: true })
  comments.forEach((c) => {
    c.createAT = formatAccuracyTime(c.createAT, 0, true)
    c.ownType = 'tr'
  })
  page.setData({ comments })
}

export function addRootComment(comments: ICommentType[], page: trendPageIns) {
  //如果小于20 一组说明这是最后一组评论
  if (comments.length < 20) page.setData({ commentEnd: true })
  comments.forEach((c) => {
    c.createAT = formatAccuracyTime(c.createAT, 0, true)
    c.ownType = 'tr'
    page.data.comments.push(c)
  })
  page.setData({ comments: page.data.comments })
}

export function saveNewComment(newComment: ICommentType, page: trendPageIns) {
  const trendInfo = page.data.trendInfo
  trendInfo!.count.comments++
  newComment.createAT = formatAccuracyTime(newComment.createAT, 0, true)
  newComment.ownType = 'tr'
  //如果是直接评论作品 在最上面显示
  const comments = page.data.comments
  if (newComment.rootId === '0') {
    comments.unshift(newComment)
    page.setData({ comments, zeroComment: false, trendInfo })
    return
  }
  // 如果是回复的某个根评论  在根回复下面显示
  const replyItem = comments.find((item) => item.cId === newComment.rootId)
  if (replyItem) replyItem.childComments.unshift(newComment)
  page.setData({ comments, zeroComment: false, trendInfo })
}

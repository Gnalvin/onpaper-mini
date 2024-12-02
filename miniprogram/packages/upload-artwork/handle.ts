import { getImageInfo } from '../../utils/system'
import { handleImgSuffix, verifyPicSize } from '../../utils/verify'
import { IPageData, IPageFn } from './type'

// 验证选择上传的图片信息是否满足要求
export async function verifyImgInfo(
  img: WechatMiniprogram.MediaFile,
  page: WechatMiniprogram.Page.Instance<IPageData, IPageFn>
) {
  // 验证图片大小
  if (img.size > 20 * 1024 * 1024) return
  // 验证图片格式
  const { width, height, type } = await getImageInfo(img.tempFilePath)
  const suffix = handleImgSuffix(type)
  if (!suffix) return
  // 验证长宽高
  if (!verifyPicSize(width, height, 500)) return
  page.data.urlList.push({
    url: img.tempFilePath,
    sortIndex: page.data.urlList.length,
    fileName: '',
    width,
    height
  })
}

import { IMessage, IUserInfo } from '../../services/message-notify/type'

export interface IPageData {
  sender: IUserInfo | null
  receiver: IUserInfo | null
  chatRecords: IRecord[]
  imgRecords: string[]
  messageEnd: boolean
  tipMsg: string
  noReceiveMsg: boolean
  scrollViewHight: number
  safeBottomHight: number
  keyboardHeight: number
  isFocus: boolean
  text: string
}

export interface IPageFn {
  handleInputFocus: (e: WechatMiniprogram.CustomEvent) => void
  handleInputBlur: () => void
  handleGoToKeyBoardTop: () => void
  getMessageRecordAction: () => void
  calculateScrollHight: () => void
  handleInput: (e: WechatMiniprogram.TextareaInput) => void
  handlePreviewPic: (e: WechatMiniprogram.CustomEvent) => void
  handleUploadImg: () => void
  handleSendMessage: () => void
  uploadImgAcion: (imgSrc: string) => void
  focus: () => void
}

export interface IRecord extends IMessage {
  uploadFail?: boolean
  uploading?: boolean
}
export { IUserInfo }

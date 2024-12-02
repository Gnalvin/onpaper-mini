// components/comment-input/index.ts
import { postCommentRequest } from '../../services/comment/index'
import { IData, IMethod, IProperty } from './type'
import { verifyIsLogin } from '../../utils/verify'
import { deepClone } from '../../utils/clone'

const systemInfo = wx.getSystemInfoSync()

Component<IData, IProperty, IMethod>({
  properties: {
    likes: {
      type: Number,
      value: 0
    },
    comments: {
      type: Number,
      value: 0
    },
    collects: {
      type: Number,
      value: 0
    },
    placeholder: {
      type: String,
      value: '发布你的评论'
    },
    //是否是在评论详情页里面回复
    isInDetailPage: {
      type: Boolean,
      value: false
    },
    ownId: {
      type: String,
      value: ''
    },
    replyUserId: {
      type: String,
      value: ''
    },
    ownType: {
      type: String,
      value: ''
    },
    rootId: {
      type: String,
      value: ''
    },
    interact: {
      type: Object,
      value: {}
    },
    comSetting: {
      type: String,
      value: ''
    },
    isOwner: {
      type: Boolean,
      value: false
    }
  },
  observers: {
    'interact.isFocusAuthor': function (isFocus) {
      const { comSetting, isOwner } = this.properties
      if (!comSetting) return
      if (comSetting === 'public') return
      if (comSetting === 'close') {
        this.setData({ disablePlaceholder: '不可评论' })
        return
      }
      if (comSetting === 'onlyFans' && !isOwner && !isFocus) {
        this.setData({ disablePlaceholder: '仅粉丝可评论' })
      } else {
        this.setData({ disablePlaceholder: '' })
      }
    }
  },
  lifetimes: {
    attached() {
      const { safeArea, screenHeight } = systemInfo
      let safeBottomHight = screenHeight - safeArea.bottom
      if (!safeBottomHight) safeBottomHight = 5
      this.setData({ safeBottomHight })
      const avatar = wx.getStorageSync('avatar')
      const userId = wx.getStorageSync('userId')
      const userName = wx.getStorageSync('userName')
      this.setData({ loginUser: { avatar, userId, userName } })
      if (!this.properties.ownId)
        console.warn('commentInput 的 ownId 是必传属性')
      if (!this.properties.replyUserId)
        console.warn('commentInput 的 replyUserId 是必传属性')
      if (!this.properties.ownType)
        console.warn('commentInput 的 ownType 是必传属性')
    }
  },
  data: {
    safeBottomHight: 0,
    keyboardHeight: 0,
    commentText: '',
    replyCommentInfo: null,
    loginUser: { userId: '', avatar: '', userName: '' },
    disablePlaceholder: '',
    isFocus: false
  },
  methods: {
    // input框获取焦点时
    handleInputFocus(e) {
      // replyCommentInfo = null 则是根回复（直接评论作品/动态 或者 直接在评论详情页评论根回复）
      if (!this.data.replyCommentInfo) {
        let replyUserName = ''
        let rootId = '0'
        const { replyUserId, isInDetailPage, placeholder } = this.properties
        if (isInDetailPage) {
          replyUserName = placeholder.replace('回复 @', '')
          rootId = this.properties.rootId
        }
        this.data.replyCommentInfo = {
          ownId: this.properties.ownId, // 作品或动态的id
          replyId: '0', // 回复的是哪个评论
          replyUserId: replyUserId, // 回复的是哪个用户
          rootId: rootId, // 回复的评论属于哪个根回复
          replyUserName: replyUserName, // 回复用户的名字
          text: this.data.commentText, //回复的内容
          type: this.properties.ownType as 'aw' | 'tr', // 属于aw 还是tr 回复
          senderName: this.data.loginUser.userName, // 发送人
          senderAvatar: this.data.loginUser.avatar //发送人头像
        }
      }
      const keyboardHeight = e.detail.height - this.data.safeBottomHight / 2
      this.setData({ isFocus: true, keyboardHeight })
    },
    // input框失去焦点时 主动调用也可以失去焦点
    handleInputBlur() {
      wx.hideKeyboard()
      this.setData({
        keyboardHeight: 0,
        isFocus: false,
        replyCommentInfo: null
      })
      this.triggerEvent('blur')
    },
    // 输入文字时
    handleInput(e) {
      this.data.commentText = e.detail.value
    },
    // 输入完成发送评论
    async handleSaveComment() {
      if (!this.data.commentText.trim()) return
      this.data.replyCommentInfo!.text = this.data.commentText.trim()
      // handleInputBlur 会清空 replyCommentInfo 所以拷贝一份
      const comment = deepClone(this.data.replyCommentInfo)

      // 让键盘收起
      this.setData({ commentText: '' })
      this.handleInputBlur()

      // 发送请求
      const res = await postCommentRequest(comment)
      if (res.statusCode === 200) {
        this.triggerEvent('success', res.data)
      }
    },
    // 外部组件点击 commment-floor 需要预先保存回复信息
    saveReplyData(comment) {
      if (!comment.ownType) {
        console.warn('comment.ownType 未赋值')
        return
      }
      // 无权限评论直接返回
      if (this.data.disablePlaceholder) return
      const { isInDetailPage, rootId } = this.properties
      this.setData({
        replyCommentInfo: {
          ownId: comment.ownId, // 作品或动态的id
          replyId: isInDetailPage ? comment.cId : '0', // 回复的是哪个子评论
          replyUserId: comment.userId, // 回复的是哪个用户
          rootId: isInDetailPage ? rootId : comment.cId, // 回复的评论属于哪个根回复
          replyUserName: comment.userName, // 回复用户的名字
          text: this.data.commentText, //回复的内容
          type: comment.ownType, // 属于aw 还是tr 回复
          senderName: this.data.loginUser.userName, // 发送人
          senderAvatar: this.data.loginUser.avatar //发送人头像
        },
        isFocus: true
      })
    },
    // 外部调研主动获取焦点
    focus() {
      if (!verifyIsLogin()) return
      this.setData({ isFocus: true })
    },
    // 点赞事件
    postLike() {
      if (!verifyIsLogin()) return
      this.triggerEvent('like')
    },
    // 收藏事件
    postCollect() {
      if (!verifyIsLogin()) return
      this.triggerEvent('collect')
    },
    verifyIsLogin
  }
})

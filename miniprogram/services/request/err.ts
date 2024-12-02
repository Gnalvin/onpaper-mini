// 自定义一个错误
export class RepeatRequestError extends Error {
  constructor(message: string) {
    super(message) // 调用父类的构造函数来设置消息
    this.name = 'RepeatRequestError' // 设置错误的名称
  }
}

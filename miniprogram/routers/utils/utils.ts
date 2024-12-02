type objType = {
  [key: string]: any
}

//编码
export function encode(data: object) {
  return encodeURIComponent(JSON.stringify(data))
}

//解码
export function decode(code: string) {
  return JSON.parse(decodeURIComponent(code))
}

//将对象转成 字符串拼接 &name=18
export function querify(obj: objType) {
  return Object.keys(obj)
    .map((k) => {
      const v = obj[k]
      return `${k}=${v}`
    })
    .join('&')
}

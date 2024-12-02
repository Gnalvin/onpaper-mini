<a href="https://github.com/Ganlvin/data-store/blob/main/README.md">English</a>   
<a href="https://github.com/Ganlvin/data-store/blob/main/README_CN.md">简体中文</a>

- [简介](#简介)
- [怎么使用](#怎么使用)
  - [1、npm安装依赖](#1npm安装依赖)
  - [2、将包导入](#2将包导入)
    - [Node 环境](#node-环境)
    - [TypeScript](#typescript)
  - [3、快速开始](#3快速开始)
  - [4、具体方法](#4具体方法)
    - [定义一个store （defineStore）](#定义一个store-definestore)
    - [改变 state 数据 （setState）](#改变-state-数据-setstate)
    - [监听 state 数据 （watch）](#监听-state-数据-watch)
      - [基本使用](#基本使用)
      - [其他参数](#其他参数)
      - [深度监听](#深度监听)
      - [监听多个属性](#监听多个属性)
      - [多个回调函数](#多个回调函数)
      - [取消监听](#取消监听)
        - [取消函数](#取消函数)
        - [offWatch](#offwatch)
        - [clearWatch](#clearwatch)
        - [clearAllWatch](#clearallwatch)
    - [dispatch 调用异步](#dispatch-调用异步)
  - [5、TypeSrcipt 支持](#5typesrcipt-支持)

# 简介



这是一个状态管理的库，相比 Pinia，vuex，Redux，更加的轻量级，用起来也非常简单，它和 Pinia 一样可以创建多个Store 实例，同时当 Store实例 中的 state 数据发生改变时，可以回调相应的函数，也就是说他是响应式的，并且它还支持TypeScript。

# 怎么使用

## 1、npm安装依赖

```shell
npm install @onpaper/data-store
```

## 2、将包导入

### Node 环境    

JavaScript 文件中 写入下面代码

```js
// es module
import pkg from "@onpaper/data-store";
const { defineStore } = pkg;

// commonjs
const { defineStore } = require("@onpaper/data-store");
```

### TypeScript

如果你使用的 TypeScript

```js
import { defineStore } from "@onpaper/data-store";
```

## 3、快速开始

```js
import { defineStore } from "@onpaper/data-store";
// 1.定义一个 store
const studentStore = defineStore({
  state: {
    name: 'jack',
    hobby:[],
    friends: {
      name: 'rose'
    }
  },
  actions: {
    getStudentInfoAction(ctx, payload) {
      // axios 发送网络请求 或者其他异步事件
      // ctx 是 state
      ctx.name = 'Bob'
      // dispatch 传入的 payload
      console.log(payload) // -> { id: 123 }
      // this 是 store 实例
      console.log(this === studentStore) // -> true
    }
  }
})

// 2. 监听数据 
// 参数一 ： state 的 key
// 参数二 ： 监听的参数 发生改变时 回调的函数
studentStore.watch('hobby', (newHobby, oldHobby) => {
  console.log(newHobby, oldHobby) // -> ['playGames'] []
})

// 同时监听 "name" "age" ，任意属性改变 都会回调 fn1 fn2
studentStore.watch(['name', 'age'], [fn1, fn2])

// 3. 修改数据
studentStore.setState({ hobby: ['playGames'] })

// 4. 回调函数执行
//console.log(newHobby, oldHobby)


//5. dispatch 派发异步方法
// 参数一 : actions 中注册过的 函数名
// 参数二 : 可以自定义一个payload 到 调用的 action 函数参数中
studentStore.dispatch('getStudentInfoAction', { id: 123 })

// 6. 回调函数执行
// fn1 fn2

```



## 4、具体方法

### 定义一个store （defineStore）

```js
import { defineStore } from "@onpaper/data-store";

const studentStore = defineStore({
  state: {
    name: 'jack',
    friends: {
      name: 'rose'
    }
  },
  actions: {
    getStudentInfoAction(ctx, payload) {
      // ...进行网络请求等异步操作
    }
  }
})
```

使用 defineStore 方法，传入 自定义 state 参数 初始化 store 

### 改变 state 数据 （setState）

```js
const studentStore = defineStore({
  state: {
    name: 'jack',
    hobby: [],
    friends: {
      name: 'rose',
      hobby: []
    }
  }
})

// 方法一：使用 setState 方法
const hobby = ["runnig"]
studentStore.setState({ name: "lucy", hobby })

//方法二：直接改变
studentStore.state.hobby = ['baseball']
studentStore.state.friends.name = "Bob"

```

这两种方法没有什么区别，哪个更加方便 使用哪一个就好了

### 监听 state 数据 （watch）

####  基本使用

```js
// 1. 生成 store
const studentStore = defineStore({
  state: {
    name: 'jack',
    hobby: [],
    friends: {
      name: 'rose',
      hobby: []
    }
  }
})

// 2. 监听数据 
// 参数一 ： state 的 key
// 参数二 ： 监听的参数 发生改变时 回调的函数
studentStore.watch('hobby', (newHobby, oldHobby) => {
  console.log(newHobby, oldHobby) // -> ['playGames'] []
})

// 3. 修改数据
studentStore.setState({ hobby: ['playGames'] })

// 4. 回调函数执行
//console.log(newHobby, oldHobby)
```

如果 发生变化的值 和 上一次 的值一样，回调函数将不会调用

#### 其他参数

```js
// watch(stateName,callfunction,option,this)
studentStore.watch(
  'name',
  function (newValue, oldValue) {
    console.log(this) //  { test: 123 }
  },
  {
    immediate: true // 立即执行一次 回调函数
  },
  { test: 123 }
)
```

option 可以传入 immediate 参数立即执行一次 回调函数，watch 最后一个参数 可以绑定回调函数的 this

#### 深度监听

watch 函数默认进行 深度监听，意味着 即使多层嵌套数据 发生改变也会执行回调函数

```js
// 1. friends 嵌套 friends
const studentStore = defineStore({
  state: {
    name: '',
    friends: {
      name: 'jack',
      friends: {
        name: 'rose',
        hobby: [{ test: 'fail' }]
      }
    }
  }
})

// 2. 监听 state.friends 属性
studentStore.watch('friends', (newValue, oldValue) => {
  console.log(newValue.friends.hobby[0].test)  //  -> success
  console.log(oldValue.friends.hobby[0].test) //  ->  fail
})

// 3. 改变数据
const testObj = studentStore.state.friends.friends.hobby[0]
testObj.test = 'success'
```

#### 监听多个属性

```js
const studentStore = defineStore({
  state: {
    name: '',
    age: 0
  }
})

// 同时监听 "name" "age"
// 回调函数的参数 以数组返回
studentStore.watch(['name', 'age'], ([newName, newAge], [oldName, oldAge]) => {
  console.log(newName, newAge)
  console.log(oldName, oldAge)
})

// 监听的任何 属性发生改变 都会 执行回调函数
studentStore.setState({ name: 'jack' })
studentStore.setState({ age: 18 })
```

监听多个 state 属性时， 第一个参数 传入的是 监听属性的 数组，**数组中任何一个** 属性发生改变 都会 执行回调函数，回调函数的参数 将以数组返回

#### 多个回调函数

```js
const studentStore = defineStore({
  state: {
    name: '',
    age: 0
  }
})

studentStore.watch(['name', 'age'], [test1, test2])
```

回调函数也可以传入一个函数数组，当属性发生改变时 数组中的函数会 **依次调用**

#### 取消监听

##### 取消函数

watch 会 返回一个 取消函数， 执行取消函数 可以直接取消监听

```js
// 方法一： watch 函数会返回一个 取消函数 
const offWatch = studentStore.watch(['hobby',"name"], newHobby => {
  // ....
})
// 执行 取消函数 可以取消 监听
offWatch()

```

##### offWatch

有些时候 返回的取消函数 不方便调用，那么可以使用 offWatch 方法

```js
// 方法二： offWatch
// 添加了 三个回调函数 log1, log2, log3
studentStore.watch('age', [log1, log2, log3])

//参数一 取消监听的 属性名
//参数二 取消监听 对应的函数
studentStore.offWatch('age', log1)  // 只取消 log1
studentStore.offWatch('age', [log2, log3]) // 取消 log2 和 log3
```

##### clearWatch

如果你想 一次性取消 某些监听属性 所有的回调方法

```js
// clearWatch 
studentStore.watch('age', [log1, log2, log3])
studentStore.clearWatch('age')

studentStore.watch(['age','name'], [log1, log2, log3])
studentStore.clearWatch(['age','name'])
```

##### clearAllWatch

如果你想 取消  store 实例的 所有监听

```js
//clearAllWatch
studentStore.watch('age', [log1, log2, log3])
studentStore.watch(['age', 'name'], [log1, log2, log3])

studentStore.clearAllWatch()
```

### dispatch 调用异步

```js
const studentStore = defineStore({
  state: {
    name: ''
  },
  actions: {
    getStudentInfoAction(ctx, payload) {
      // axios 发送网络请求 获取其他异步事件
      // ctx 是 state
      ctx.name = 'jack'
      // dispatch 传入的 payload
      console.log(payload) // -> { id: 123 }
      // this 是 store 实例
      console.log(this === studentStore) // -> true
    }
  }
})

// 当 actions 中的函数 修改了 state 回调函数会被调用
studentStore.watch('name', newName => {
  console.log(newName) // -> jack
})

// 参数一 : actions 中注册过的 函数名
// 参数二 : 可以自定义一个payload 到 调用的 action 函数参数中
studentStore.dispatch('getStudentInfoAction', { id: 123 })
```

首先需要再 actions中注册 对应的 函数，调用 dispatch 方法 传入 函数名 即可调用，调用时可以传递 payload

## 5、TypeSrcipt 支持

例子：

```js
interface IStudentData {
  name: string
  age: number
  hobby: string[]
  friends: friendType
}

type IActionFn = {
  getStudentInfoAction?: (ctx: IStudentData, payload: any) => void
}
  
// 第一个参数 state 类型 , 第二个是 actions 类型
const studentStore = defineStore<IStudentData, IActionFn>({
  state: {
    // ....
  },
  actions: {
    //...
  }
})
```


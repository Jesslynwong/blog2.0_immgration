---
sidebar_position: 6
---
## 什么是immutation

`immutation`就是不可变数据，不可变数据指的是当下的变量不可发生改变，如果需要改变当前变量的值，那么需要重新开辟一段新的地址存取最新改变后的变量。react采用的是immutation的范式。

## 为什么react遵循immutation范式，immutation解决了什么问题？

事出必有因，react为什么需要遵循immutation的范式呢？

1. react对于当前组件的更新主要是通过props和state来  判断当前组件是否需要进行重新渲染。有时候可以通过shouldComponentUpdate, pureComponent, memo判断，当前是否需要更新。如果组件的属性和状态是不可变的对象或值，您可以使用简单的`===`检查它们是否发生了变化。
2. 简单并且消耗比较少的性能检测变化。对于比较大的数组或者嵌套过深的对象来说，直接比较地址对性能的耗损对比直接进行值比较性能耗损比较小一些。在绝对必要时才执行计算量大的更新 DOM 过程。

## 缺点有哪些

1. 只通过比较地址来判断当前的state或者props有没有发生改变，可能会导致：渲染不及时的情况。比如为了避免对内存进行消耗，改动了当前引用类型的某个值，这个时候react还是会通过浅比较来判断该地址有没有发生改变，这个时候会出现无法重新渲染的问题
2. 如果对引用类型的state进行改变，则需要通过深拷贝进行setState，这样往往给开发者带来不便。我们常见的写法是通过`setState([...state, newObj])`,`setState(Object.assign(xxx))`，或者是一些返回新对象的方法比如`concat` `slice` `filter`  
3. 对于较大的数组来说，深拷贝会是一个缓慢的操作，比较耗费性能。

## 如何改进缺陷

目前的immutation，一般是通过持久数据结构来对此改进。持久数据结构会在修改内容的时候创建一个新的版本，使得数据不可变，同时，能够提供所有版本的访问。

如果数据结构是部分持久化的，则可以访问所有版本，但只能修改最新版本。如果数据结构是完全持久的，您可以访问和修改每个版本。对于持久数据结构和结构共享，这里就不过多讨论，可以看下[这篇博客](https://blog.logrocket.com/immutability-react-should-you-mutate-objects/)

以下都是react社区中用来优化immutation的库

### immerjs or immutablejs

数据immutable使得操作数据状态的时候比较繁琐，开发人员更加习惯用可变的方式对数据操作。而immerjs主要解决的问题是可以使用可变的方式对数据进行修改，内部会采取不可变的方式应付react。

【immerjs使用方式】：可以通过`useImmer` 来代替`useState` ，用`useImmerReducer`来代替`useReducer`等操作。[点击查看](https://immerjs.github.io/immer/)

【immutable使用方式】：调用`fromjs` `tojs` `map` `merge`等进行使用。[点击查看](https://immutable-js.com/docs/v4.1.0)

### RTK（Redux toolkit）

Redux不使用mutation的原因在于：

- 它会导致错误，例如 UI 无法正确更新以显示最新值。因为react的范式是不可变的数据
- 理解状态更新的原因和方式变得更加困难。因为不知道在哪一步状态被修改，难以进行场景复现。
- 无法进行“[时间旅行调试](https://learn.microsoft.com/zh-cn/windows-hardware/drivers/debugger/time-travel-debugging-overview)”。因为需要记录下执行前的值，并且需要对执行过程变化需要复现，便于用户调试

RTK是Redux的最佳实践。内部使用immer封装，因此通过reducer修改state的时候直接改动redux里面的state即可，无需进行深拷贝写法。

```js
export const exampleSlice = createSlice({
  name: 'example',
  initialState,
  reducers: {
    exampleReducer: (state, action) => {
      state.example.push(action.payload)
    },
  },
})
```

## 使用借鉴

对于immutation来说，开发中有许多的搭配能够对其进行mutation化，下面列出几个

1. immer + redux（RTK）
2. Immer + useReducer
3. Immer + useState

## 参考文章
https://blog.logrocket.com/immutability-react-should-you-mutate-objects/
https://redux-toolkit.js.org/usage/immer-reducers
https://github.com/camsong/blog/issues/3


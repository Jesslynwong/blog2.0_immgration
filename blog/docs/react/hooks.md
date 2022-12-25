---
sidebar_position: 6
---
​    React16.8之后出现hooks，我认为使用hook的有点在于能够使用函数式编程，使用一种更加人性化、更加语义化的思维来使用react，并且当项目越来越大的时候，hook更加可维护以及可读，主要是借助了函数本身的优势，不像class会有继承属性，当层层继承多了的时候，调试可能会比较麻烦。下面说说我对hook的一些理解

### hooks使用规则

1. Hooks只能在函数组件的顶级作用域使用。循环、条件判断、嵌套函数——必须按顺序执行
2. Hooks只能在函数组件或者自定义Hooks中使用，如果需要再class内使用，可以通过高阶组件转化
3. eslint检查hooks

### useState    

在写class的时候存储状态可以通过setState一个状态对象或者使用静态属性来保存class组件里面需要保存的值。但是对于函数来说，原本就没有储存状态这个功能（当然也能够用闭包来存储变量，但是这有个问题是由于闭包的作用域属性，变量会一直gc不了，会造成内存泄露）。

那么什么样的值应该保存在 state 中呢？state中不要保存可以通过计算得到的值

> 1. props 传过来的值需要计算后呈现在UI上，那么可以通过cache来搞，用useMemo封装一层
> 2. 能从 URL 中读到的值、从 cookie、localStorage 中读取的值，不要放state里面

`useState` 函数的参数虽然是初始值，但由于整个函数都是 Render，因此每次初始化都会被调用。如果初始值计算比较耗时间，建议使用函数传入，这样只会执行一次。因为useState初始值只在首次渲染生效，而不用在function里面计算。

```react
// ❌每次渲染都需要重新计算
function FunctionComponent(props) {
  const initalState = createRows(props.count)
  const [rows, setRows] = useState(initalState);
}
// ✅ 初始值通过函数传入，只计算一次
function FunctionComponent(props) {
  const [rows, setRows] = useState(() => createRows(props.count));
}
```

⚠️如果把读取到的数据放到本地的 state 里，那么每个用到这个组件的地方，就都需要重新获取一遍。——可以通过放在状态管理redux 

### useRef ——多次渲染之间共享数据

在类组件中，我们可以定义类的成员变量，保存数据。但是在函数组件中，是没有这样一个空间去保存数据的。ref不会触发组件重新渲染。因为返回了缓存下来的值，因为引用一样，所以不需要依赖项

```react
function TextInputWithFocusButton() {
  const inputEl = useRef(null); // 保存dom
  const onButtonClick = () => {
    // `current` points to the mounted text input element 点击后自动聚焦
    inputEl.current.focus();
  };
  return (
    <>
      <input ref={inputEl} type="text" />
      <button onClick={onButtonClick}>Focus the input</button>
    </>
  );
}

```

>📢注意：
>
>1. 保存不涉及到UI渲染数据，比如某个 DOM 节点的引用等等
>2. ForwardRef 多层之间传递ref
>3. useImperativeHandle 可以让你在使用 ref 时自定义暴露给父组件的实例值

### useEffect——执行副作用

useState用来存放状态值，需要状态更新的时候怎么通知state更新呢？当某些值发生变化的时候，需要执行一段function，class组件里面有生命周期钩子判断是否需要更新执行，而hook怎么办呢？这就用到了useEffect。

```react
useEffect(() => {
  callback()
  return unmountFuntion()
},[dependencies])
```

当依赖项发生改变的时候，里面的callback就会执行，return出去的unmountFuntion是当该组件卸载前触发。

这就解决了上述问题了，可以看出语义化非常强，这也就是我为什么喜欢写hook的原因，对比class不需要每次想着往生命周期钩子里面去塞函数，一切都非常自然和顺理成章。能在同一个地方维护同一套逻辑，而不用在多个声明周期中维护同一套逻辑。做到依赖不丢、逻辑内聚从而更容易维护。

>📢注意
>
>1. 第二个参数：通过浅比较来判断是否执行callback，因此依赖项是对象的时候需要注意比较的是地址。每次组件执行的时候，引用变量都会重新赋予创建赋予新地址。（当然可以用object.assign来整合成同一个对象，那么每次就是原来的地址了）
>2. 不指定依赖项：每次 render 后都会重新执行
>3. 依赖项为空数组[]：在首次执行时触发，相当于是componentdidMount
>4. 在 useEffect 的回调函数中使用的变量，都必须在依赖项中声明。这个可以通过eslint来进行配置
>5. ref值不能用来做useEffect的依赖项，因为会出现

💡实际项目中我遇到的问题是useEffect的依赖项可能有五个以上，这么做可能会出现依赖项比较乱的问题，之后调试也可能出现一些问题。因此要做到一个函数只做一件事。

#### useEffect闭包陷阱

useEffect的状态是同步的，每次渲染之后运行callback，在概念上属于组件输出的一部分。我们来模拟一下useEffect是怎么运行的

>组件：React，把我的状态设置为1
>
>React：给我状态为1的UI
>
>组件：给渲染内容：<p> you click 1 times </p>
>
>​           渲染完了之后调用这个effect：() => { console.log(1111) }
>
>React: 更新UI
>
>Browser: 绘制屏幕
>
>React：运行属于该次渲染的effect， () => { console.log(1111) 



react每次渲染的时候，会形成一层快照，把状态以及涉及的变量函数给存下来，数据是不变的，因此一不小心会出现闭包陷阱。我们来看个例子

```react
const [count, setCount] = useState(0);
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1);
  }, 1000);
  return () => clearInterval(id);
},[]);
```

上面的代码，通过定时器使count自增1。预期打印结果是1 2 3 4... 但实际打印结果是1 1 1 1...为什么会这样呢？这就涉及到了闭包陷阱的问题。每次渲染react会把当次渲染`id`以及`count`形成快照，那么当第一次渲染该组件的时候，创建回调函数内部快照，以及 count = 0 在当次渲染中，count永远是等于0， 因此输出的 count === 1。

那么我们要把不断更新 count 可以怎么改变呢？不断更新快照不就行了，那简单，直接依赖项改变，更新里面的函数闭包。

```react
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1);
  }, 1000);
  return () => clearInterval(id);
}, [count]); // ****
```

是的，结果准确了。可以带来了两个问题

1. 定时器不准确了。count每次都会销毁，并且重新计时
2. 不断生成销毁定时器，给性能带来一定的负担

但是，我们本意是执行1次定时器，让定时器来让count自增1。没有解决这个只执行1次的问题。而且在回调函数内部我们不需要使用count。我们只想要告诉react去自增更新状态。因此，我们可以把setCount里面改为函数，因为setCount能够拿到最新的state值。

```react
useEffect(() => {
  const id = setInterval(() => {
    setCount(count => count + 1); // ****
  }, 1000);
  return () => clearInterval(id);
}, []);
```

#### useEffect优点

刚刚探讨了useEffect的闭包问题，useEffect的渲染逻辑，接下来，我们探讨一下，目前useEffect这样子设计有什么好处呢？ 

1. 不会阻塞浏览器渲染进程。因为useEffect主要在渲染结束的时候执行。因此使用function component写项目一般都有比较好的性能
2. 能保证拿到状态生效后的DOM属性。useEffect不会在服务端渲染时执行，在DOM执行完毕之后才执行。
3. 保证值的安全访问。useEffect符合react fiber理念，因为fiber会根据情况暂停或插队执行不同组件的 渲染，如果代码遵循了 Capture Value 的特性，在 Fiber 环境下会保证值的安全访问，同时弱化生命周期也能解决中断执行时带来的问题。

### 缓存相关 useCallback和useMemo

函数组件里面没有一个直接方式维持多次渲染间的状态，比如里面有个const increment的函数，只要有函数组件状态发生变化，每次render会不断创建这个函数。useCallback和useMemo解决了以上问题，其本质上都是都是依靠一个依赖值进行缓存。

```react
useMemo(() => {
  callback()
},[dependencies])

useCallback(() => {
  callback()
},[dependencies])
```

其中两者区别在于，useCallback——缓存回调函数；useMemo——缓存值。可以避免子组件重复渲染的问题和避免重复计算问题。

### useContext——定义全局状态

为了能够进行数据的绑定，数据改变时刷新状态。

```react
const ThemeContext = React.createContext(themes.light);

function App() {
  return (
    <ThemeContext.Provider value={themes.dark}>
      <Toolbar />
    </ThemeContext.Provider>
  );
}

function Toolbar() {
  const theme = useContext(ThemeContext);
  return (
    <button style={{ background: theme.background, color: theme.foreground }}>
      I am styled by theme context!
    </button>
  );
}
```

>缺点：
>
>1. 调试困难，项目大了后会有点混乱
>2. 组件复用困难，必须保证引用到他的父级组件有个context provider

 ### useReducer

useReducer主要是React社区对Redux的借鉴出现的hook，写法上也类似。我们先来t通过一个例子看看，useReducer怎么使用：

```react
function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return {count: state.count + 1};
    case 'decrement':
      return {count: state.count - 1};
    case 'reset':
      return init(action.payload);
    default:
      throw new Error();
  }
}

function Counter({initialCount}) {
  const [state, dispatch] = useReducer(reducer, initialCount, init);
  return (
    <>
      Count: {state.count}
      <button
        onClick={() => dispatch({type: 'reset', payload: initialCount})}>
        Reset
      </button>
      <button onClick={() => dispatch({type: 'decrement'})}>-</button>
      <button onClick={() => dispatch({type: 'increment'})}>+</button>
    </>
  );
}
```

useReducer解决什么问题呢？

1. memo可以代替pure component和shouldComponentUpdate，那么forceUpdate呢？我们可以依靠useReducer进行强制更新。
2. 对于希望function component能够破除capture value（参数状态形成快照）的问题，也可以通过useReducer解决，可以访问到当前 state 和新的 props。
3. 对于代码可维护性来说，我认为这里借助一种OOP的思想，把更新逻辑和描述更新动作分开。比较与useEffect来说，我们不需要依赖项，不需要关注useEffect的闭包陷阱问题，因为拿到的就是最新值。所以在Dan佬的思维下，useReducer就是hooks的一种作弊模式，集合了useState和useEffect，当然如果需要稳定输出的话，个人还是感觉还是慎用useReducer。

### hooks 场景

hooks核心优点：

1. 方便逻辑复用。比如当控制一个全局UI状态时可以通过一个自定义hook里面的state来控制。需要用到的时候直接引入该hook即可

```react
import React, { useState } from "react";
// 自定义hook
const useOpenModal = (handle) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    // handle处理函数
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return { isModalOpen, showModal, handleOk, handleCancel };
};

export default useOpenModal;
```

2. 关注点分离，让代码更加语义化，易于理解

场景：

1. 自定义hook拆分复杂组件
2. 抽取业务逻辑
3. 封装通用逻辑
4. 监听浏览器状态

### hooks中的capture value 

render的时候会把当前的组件参数形成快照。举个例子，我们预期，在三秒内改变input值，alert出来的是最新的input值。代码如下

```react
function MessageThread() {
  const [message, setMessage] = useState("");

  const showMessage = () => {
    alert("You said: " + message);
  };

  const handleSendClick = () => {
    setTimeout(showMessage, 3000);
  };

  const handleMessageChange = e => {
    setMessage(e.target.value);
  };

  return (
    <>
      <input value={message} onChange={handleMessageChange} />
      <button onClick={handleSendClick}>Send</button>
    </>
  );
}
```

但是三秒之后输出的是点击输入前的那个值。这说明，当时所引用的message形成快照给存起来了。就像Dan佬所说的capture value。那么这个时候我们怎么去规避capture value这个特性呢？

1. 利用 useRef 把当前值给存起来。利用useRef的缓存属性，保证每次拿到的都是最新值

```react
function MessageThread() {
  const latestMessage = useRef("");

  const showMessage = () => {
    alert("You said: " + latestMessage.current);
  };

  const handleSendClick = () => {
    setTimeout(showMessage, 3000);
  };

  const handleMessageChange = e => {
    latestMessage.current = e.target.value;
  };
  
  return (
    <>
      <input value={message} onChange={handleMessageChange} />
      <button onClick={handleSendClick}>Send</button>
    </>
  );
}
```

2. 使用useReducer，state永远拿到的都是最新的值

   ```react
   function MessageThread() {
     const latestMessage = useRef("");
     const [latestMessage, dispatch] = useReducer((state, action) => {
       if (action.type === 'inc') {
         return action.payload ;
       }
     }, '');
   
     const showMessage = () => {
       alert("You said: " + latestMessage);
     };
   
     const handleSendClick = () => {
       setTimeout(showMessage, 3000);
     };
   
     const handleMessageChange = e => {
       dispatch({type:'inc', payload: e.target.value})
     };
     
     return (
       <>
         <input value={message} onChange={handleMessageChange} />
         <button onClick={handleSendClick}>Send</button>
       </>
     );
   }
   ```

   

### class和hook的在使用上不同：

state:  class一个对象和多个state

缓存: hooks: usecallback、useMemo，class可以用

变量存储：类有静态属性，hook里面ref

写法不同：一个生命周期往里面塞，一个直接函数式编程

生命周期写法不一样：useEffect里面依赖项判断是否执行callback，class组件componentDidUpdate里面需要去手动判断prevprops和props，或者使用shouldComponentUpdate。而舍弃了声明周期会出现性能问题，hook解决的方式就是useCallback, useMemo，useEffect通过依赖项，来进行判断是否进行重新渲染。

this变化：每次调用class的时候，this会发行改变，导致每次调用`this.props`的时候，拿到的this.props都是最新值。而如果想获取稳定的props那么可以使用function component。举个例子Dan佬在文章中举的[例子](https://codesandbox.io/s/pjqnl16lm7) 。我们在三秒之内改变props.user看会alert什么。

```react
class ProfilePage extends React.Component {
  showMessage = () => {
    alert("Followed " + this.props.user);
  };

  handleClick = () => {
    setTimeout(this.showMessage, 3000);
  };

  render() {
    return <button onClick={this.handleClick}>Follow</button>;
  }
}
// ------------------------------------
// 形成快照
function ProfilePage(props) {
  const showMessage = () => {
    alert("Followed " + props.user);
  };

  const handleClick = () => {
    setTimeout(showMessage, 3000);
  };

  return <button onClick={handleClick}>Follow</button>;
}
```

当我们在三秒之内，修改了props，class component会alert最新的props。而function component，数据是immutable，会形成快照。这个就是class组件和function组件的capture value。 

💡使用class来进行稳定输出，避免this改变而输出的不稳定，我们可以通过闭包来改进

```react
class ProfilePage extends React.Component {
  showMessage = (message) => {
    alert("Followed " + message);
  };

  handleClick = () => {
    const message = this.props.user
    setTimeout(() => this.showMessage(message), 3000);
  };

  render() {
    return <button onClick={this.handleClick}>Follow</button>;
  }
}
```

### 参考文章
https://overreacted.io/before-you-memo/
https://overreacted.io/a-complete-guide-to-useeffect/
https://overreacted.io/how-are-function-components-different-from-classes/
https://github.com/ascoders/weekly/blob/v2/096.%E7%B2%BE%E8%AF%BB%E3%80%8AuseEffect%20%E5%AE%8C%E5%85%A8%E6%8C%87%E5%8D%97%E3%80%8B.md
---
sidebar_position: 6
---
typescript是一个type checker。主要用来弥补javascript这种动态语言带来的不便。动态语言（弱类型）的变量类型是运行时被赋值后才有某种类型。这样一来，当项目越来越大的时候，当类型出现错误的时候，在编译时就能够确定对象的类型，显得尤为重要，因此就出现了typescript。

## ts, es5, es6 关系
一般来说浏览器和node是识别不了TS的，因此在日常开发过程中，TS会通过类型擦除等转化，如webpack的ts-loader等把TS转化成浏览器和node可识别的JS运行。

TS主要通过TS类型擦除城es6可以运行在node或者浏览器特定版本以上，如果出现不兼容es6的情况，可以转译成es5，再打包成单文件，到浏览器中运行。

## 数据类型 datatype

学习TS主要得把类型看成集合的概念，这样很多东西都可以理解了，比如泛型中有特定的数字等。

JS类型：string, number, boolean, null, undefined, bigint, symbol, object

TS在JS的基础上增加了: void, never, any, enum, unknown, 自定义类型：type, interface

### 基础类型

对于基础类型，我们一般直接通过小写或者大写类型来进行定义，举个🌰

```typescript
const num:number = 1
const num:Number = 1
```

探讨一下两者有什么区别呢？number是基础类型，Number是包装对象。当定义为number的时候，在内存中给开辟的是一段栈空间存储number值。定义为Number开辟的是堆内存，在内存中不仅仅只有数值本身，还具有Number方法，比如toFixed等。因此对于普通对象，我们一般不写包装类型对象。

那既然number没有方法，那为什么定义为number的时候还能使用方法呢？主要是因为number这类基础类型会进行包装类型的转化。举个🌰

```js
let num = 1.23435
let afterTransfer = num.toFixed(2) // 1.23
// 实际上进行了以下转化
let temp = Number(num)
let value = temp.toFixed(2)
delete temp
return value
```

### 对象类型

Number, String, Object等属于对象object，那么在定义的时候写成object，`num:object = 1` 和`num:object = 'hhh'`都不会报错。但这失去了我们对TS类型检查的期待。所以，定义对象类型的时，不要写成object

由于包装类型的问题，object太不精确，所以一般使用`索引签名`或者`Record泛型` 来描述普通对象。

```ts
// 索引签名
type A = {
  [k: string]: number
}
// Record泛型，（Record可以实现定义一个对象的 key 和 value 类型）
type A = Record<string, number>
// 若具体一点的
type A = {
  name: string,
  age: number
}

const a:A = {
	name: string,
  age: '23' // 这里用字符串也OK，数字会toString隐式转化
}
```

### 数组对象

由于直接写类型中直接写Array并没有说清楚具体数组里面类型，不精确，因此以下三种方式描述数组

```ts 
// 1. Array<?>
type A = Array<string>
const a:A = ['w','y','q','d','c']
// 2. string[]
type B = string[]
const b:B = ['w','y','q','d','c']
const b:string[] = ['w','y','q','d','c']
// 3. [string, number]
type C = [string, number]
const c:C = ['y', 5]
```

### 函数对象

类型中直接写成Function，不会出现报错

```ts
var add: Function = () => {
  console.log(11111)
}
```

但是对于输出结果来说，并不能知道其类型。因此一般使用`()=>xxx`来表示其类型

```ts
// 使用类型写法
type FnType = () => void
const fn:FnType = () => { console.log(11111) } // 箭头函数
function fn:FnType() {	// 普通函数
  console.log(11111)
}
// 使用声明写法
var add = (a:number, b:number):number => {	// 箭头函数
	return a + b 
}
function add(a:number, b:number):number {
  return a + b
}
// type中有this写法，由于this作用域的问题，实例避免写箭头函数
type FnWithThis = (this:Someone, name:string) => void
const say:FnWithThis = function() {
  console.log('hi' + this.name)
}
const X:Person = {
  name:'jesslyn',
  age:18
}
X.say('hhhh')
say.call(X, 'hhhh')

// ⚠️ type中定义返回为null，实例中可以为undefined，反之亦然，不会报错
type FnType = () => undefined
const fn:FnType = () => {
  return null
}
```



### any 和 unknown

any和unknown主要的区别在于unknown有断言的机会，但是any没有断言的机会，基本用了any之后，类型都能被检测通过。

### never

never主要是用来判断而不是用来声明的，有never基本可以判断用户错了。举个🌰

```ts
type a = string && number // string交number = 空集 -> never
```

### enum枚举类型

enum类型应用场景比较少，一般来说，number enum应用比较多，string和其他类型enum可以通过泛型来定义，用enum反而多此一举

```ts
// 1. 通过标识辨别当前状态
enum A {
  todo = 0,
  done,
  archived,
  deleted
}
let status = 0
status = A.todo // 0
statu = A.done // 1

// 2. 权限控制
enum Permission {
  None = 0,
  Read = 1 << 0, // 0001
  Write = 1 << 1, // 0010
  Delete = 1 << 2, // 0100
  Manage = Read | Write | Delete
}

type User = {
  permission: Permission
}
const user: User = {
  permission:000101
}
// 通过做与运算，只有当1&1=1，才知道是否有权限
if ((user.permission & Permission.Write) === Permission.Write) {
  console.log('拥有写权限')
}
if((user.permission & Permission.Manage) === Permission.Manage) {
  console.log('拥有管理权限')
}
```
### 自定义类型：Type & interface

type是类型别名，给其他类型取的名字，不是真正的类型

```ts
type Name = string
type FalseLike = '' | 0 | false | null | undefined
type Points = {x: number; y: number}
type Line = [Points,Points]
```

#### interface和type的区别

1. interface只描述对象（Array, Function, Date, Map, Set），type能描述所有类型数据
2. type只是别名，interface是类型声明
3. 扩展性以及使用上来说，对外API尽量使用interface，方便扩展；对内API尽量使用type，防止代码分散。

interface可以扩展的原因在于，interface是对象，能直接合并，type可能不是对象，所以不能重新赋值。比如在扩展封装axios时，封装自定义的属性，以达到方便

```ts
import {AxioRequestConfig} from 'axios'
declare module 'axios' {
  export interface AxioRequestConfig {
    autoLoading: boolean,
    mock: string
  }
}
```

当然type也不是不能拓展，就是有点麻烦

```ts
// type类型合并
type A = Array<string> & {
  name: string
} & X

// interface类型扩展
interface X {
  age:number
}
interface A2 extends Array<string>, X {
  name: string
}
// 扩展全局的string，在d.ts里面声明
declare global {
  interface String {
    padZero(s:string):void
  }
}
```

### 类型收窄

类型是可以联合的，但是在使用的时候，通过类型收窄，可以处理不同类型下的逻辑。并且还不确定类型的时候就访问其中一个类型特有的属性或方法会报错，因为ts判断不了使用的是哪个类型下的方法，因此需要类型收窄来具体化。

在JS中，一般通过`typeof`或者`instanceof`进行类型收窄。

>typeof用来判断基础类型，对于引用类型和null，一概为object
>
>instanceof不支持string. number, bool等基础类型，主要是instanceof主要通过沿着proto来判断类型，基础类型不在原型链上。并且不支持TS独有的类型

在TS中，主要有以下三种方法

1. 通过`in`判断某个属性是否在对象上，这个时候既不能用typeof或者instanceof来判断。但这有个局限是in只能用于部分对象

```ts
type Person {
name: string
}
type Animal = {
    x:string
}
const fn = (a: Person | Animal) => {
    if ('name' in a) {
    //xxxxxx
    }else if('x' in a){
    xxxxxx
    }
}
```

2. 通过`is`同样能判断某个属性是否在对象上

```ts
type Person {
name: string
}
type Animal = {
    x:string
}
function fn(a: Person | Animal):x is Animal => {
    if ('name' in a) {
    //xxxxxx
    }else if('x' in a){
    xxxxxx
    }
}
```

3. 如果两个类型具有同样属性而其中属性的类型不同，那么怎么判断具体所指的类型呢？可以通过在类型中添加统一的标识符`kind`判断属性区别，kind是简单类型，并且各属性的kind没有交集

```ts
type Cricle = {kind:'circle', x?:[number, number]}
type Rect = {kind:'rect', x:number}
type Shape = Circle | Rect

const fn = (a:string | number | Shape) => {
    if (typeof a === 'string') {
    // xxxx
    } else if(typeof a === 'number') {
    //xxxx
    } else if (a.kind === 'circle') {
    // xxx
    }
}
```

4. 断言

```ts
interface Cat {
    name: string;
    run(): void;
}
interface Fish {
    name: string;
    swim(): void;
}

function isFish(animal: Cat | Fish) {
    if (typeof animal.swim === 'function') {
        return true;
    }
    return false;
}

// index.ts:11:23 - error TS2339: Property 'swim' does not exist on type 'Cat | Fish'.
//   Property 'swim' does not exist on type 'Cat'.
```

这个时候可以通过`as`断言来使得类型具体化

```ts
function isFish(animal: Cat | Fish) {
    if (typeof (animal as Fish).swim === 'function') {
        return true;
    }
    return false;
}
```

### 交叉类型

交叉类型常用于有交集的类型A B，如果A B无交集，那么可能得到never或者属性为never

```ts
type Person = {
    id: string
    name: string
}
type User = {
    id: number
    email: string
} & Person

const a :User = {
    email:'x',
    name:'dddd'
    id: 11111 // Type 'number' is not assignable to type 'never'.
}
```

这个例子中idf属性冲突了，得到id属性为never，而a必须要有email和id，实际上就等于这个User类型不能用了。

但是把a进行断言为never在编译阶段不会出现报错，如下

```ts
const a :User = {
    email:'x',
    name:'dddd'
    id: 11111
} as never
```

但是如果使用interface，就会出现报错。从这个角度上来说，interface比type类型判断更紧，所以可拓展性更强，因为不会出现这种因为内在类型错误的情况

### 泛型

```ts
// ts自动推断
function fn<T>(a:T): T {
    return 
}
function fn<T,K>(a:T, b:K): T {
    return 
}
//限制泛型范围 
interface Inter{
length:number
}
// 一定要是子类
function fn<T extends Inter>(a:T): T {
    return 
}
// 类里面使用
class Myclass<T> {
    name:T,
    constructor(name:T) {
    this.name = name
    }
}
const mv = new Myclass<string>(name:'kkk')
```

### Mypick

```ts
interface Todo {
    title: string
    description: string
    completed: boolean
}

type TodoPreview = MyPick<Todo, 'title' | 'completed'>

const todo: TodoPreview = {
    title: 'Clean room',
    completed: false,
}
// 实现MyPick
type MyPick<T,K extends keyof T> = {
[P in K]: T[P]  
}  
```

### Parameters

```ts
// 实现MyParameters
type MyParameters<T extends Function> = T extends (...args: infer aa) => any? [...aa] : "";
const foo = (arg1: string, arg2: number): void => {}

type FunctionParamsType = MyParameters<typeof foo> // [arg1: string, arg2: number]
```

### MyAwait 

```ts
// 实现MyAwaited
type MyAwaited<T extends Promise<any>> = T extends Promise<infer P>
    ? P extends Promise<any> ? MyAwaited<P> : P  // promise里面包着promise，递归
    :never

type ExampleType = Promise<string>
type Result = MyAwaited<ExampleType> // string
```

### Zip

```ts
// 实现Zip
type Zip<T, U> = T extends [infer F, ...infer rest] ? 
  U extends [infer UF, ...infer Urest] ? [[F, UF], ...Zip<rest, Urest>]: [] 
  : [] 

Zip<[], []>, [],
Zip<[1, 2], [true, false]>, [[1, true], [2, false]]
Zip<[1, 2, 3], ['1', '2']>, [[1, '1'], [2, '2']]>>,
Zip<[], [1, 2, 3]>, []
Zip<[[1, 2]], [3]>, [[[1, 2], 3]]
```




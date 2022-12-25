---
sidebar_position: 6
---
## 一张图带你看懂浏览器缓存机制
![](https://cdn.jsdelivr.net/gh/Jesslynwong/Pics@main/20221028162024.png)
### 流程解读
浏览器发送请求之后，会执行浏览器缓存机制，跑来判断是否有缓存。浏览器缓存机制，又分为强缓存和协商缓存。
浏览器发送请求后，首先会判断强缓存是否新鲜，而强缓存主要依靠的是 cache-control 或者 expire 来进行判断是否命中缓存。 如果强缓存新鲜那么浏览器使用缓存。如果强缓存不新鲜，走的是协商缓存。 浏览器这个时候会在请求头上带上 If-None-Match 或者是 If-Modified-SInce，分别返回的是 ETag 或者 Last-Modified，浏览器再去通过 ETag 或者 Last-Modified 去判断是否命中协商缓存，如果命中，那么返回304，获取缓存，否则发送请求200之后会返回资源。
### cache-control 和 expire 
总的来说 cache-control 的优先级要比 expire 高，因为 cache-control 跟准确些
#### cache-control
no-store: 客户端不可缓存
no-cache: 强制走协商缓存
public || private: 是否能被中间人缓存（cdn、中间人代理），默认为 private
max-age: 保存缓存信息的最大时间（秒）
#### expire
存储的是过期日期的本地时间，一旦本地时间被改了，该时间就失效了
### ETag 和 Last-Modified
ETag： 主要存的是资源的哈希值，可以保证每份资源是唯一性。
Last-Modified：上一次修改资源的 GMT 时间，粒度为秒级。
ETag 比 Last-Modified 优先级高的原因如下：
1. ETag 主要依赖的是对资源本身进行哈希，而依靠修改时间。如果说资源的内容没有发生改变，那么这个 ETag 就不会发生改变。当发送请求的时候 ETag 会查看哈希值是否进行改变，也就是说，如果时间变化了，但是实际资源的内容并没有发生改变，那么 ETag也不会发生改变，这样的话就不用重新去 get 请求。
2. ETag 的粒度是秒级以下，Last-Modified 粒度为秒级，所以 如果1秒钟之内修改了多次文件的话 Last-Modified 并不会检测出来，因此在这方面来说 ETag 会比 Last-Modified 更加准确。
3. 一些服务器不能精确得到文件的最后修改时间。
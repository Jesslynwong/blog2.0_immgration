---
sidebar_position: 1
---

## 客户端渲染（CSR） VS 服务端渲染（SSR）

### CSR渲染过程

1. 浏览器请求资源
2. 服务端返回html给客户端
3. 客户端解析获取代码中http请求，向服务端发送http资源请求
4. 返回资源后，会通过内容和html解析进行合并，并且渲染页面

### SSR服务端渲染过程

1. 浏览器请求资源
2. 在服务端进行数据内容导入，并且渲染好整个页面发送给客户端
3. 客户端接受服务器返回文件，进行渲染

### 优缺点结论

1. SEO：SSR获胜。一般来说搜索引擎蜘蛛抓取，主要通过TDK，同步的html等进行权重匹配抓取。对于SSR来说，内容在server side进行渲染，对于浏览器来说，是同步的html，html渲染了内容再返回。而大部分CSR并非同步的html，需要进一步的在客户端请求资源。因此SSR对蜘蛛的爬取更便利
2. 性能：请求时长资源消耗和渲染时长的平衡问题。如果请求资源时长和次数比渲染时长要长，那么SSR获胜，因为SSR只需要请求一次。如果数据量过大，在服务器渲染时间过长，会造成浏览器暂时空白，首屏时间长，这个时候CSR获胜
3. 安全性：SSR更容易被爬虫爬取。
4. 开发效率：CSR前后端分离，效率高。SSR不利于前后端分离，还需要写node后端，但是我觉得，以前前后端不分离的时代是效率低，但是市面上出现的一些框架，比如nextjs，我觉得一定程度上有所缓解前后端不分离的效率慢的问题。



## 参考文章

https://juejin.cn/post/7174715331171057720

https://juejin.cn/post/7082711258952105992#heading-3
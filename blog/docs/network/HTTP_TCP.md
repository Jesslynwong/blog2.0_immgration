---
sidebar_position: 6
---

## http协议发展
![](https://cdn.jsdelivr.net/gh/Jesslynwong/Pics@main/20221103123411.png)
## http报文解析
### 状态码 
| 状态码 | 含义                                           |
| ------ | ---------------------------------------------- |
| 1xx    | 请求已接受，继续处理                           |
| 2xx    | 请求已收到                                     |
| 201    | 创建成功                                       |
| 204    | 删除资源成功                                   |
| 3xx    | 重定向，需要完成进一步操作，才能完成请求       |
| 301    | 资源永久移动到别的URL                          |
| 302    | 暂时跳转                                       |
| 304    | 使用缓存                                       |
| 4xx    | 客户端错误。                                   |
| 401    | 未经授权                                       |
| 404    | 请求资源不存在                                 |
| 5xx    | 服务端出现问题                                 |
| 500    | 服务器内部问题                                 |
| 504    | Timeout ，网关或者代理服务器超时得到想要的响应 |

### 常见报文头

#### 请求报文
信息相关：origin, referer，accept, content-type
会话保持相关：cookie
缓存相关：cache-control, max-age, expire, if-none-match

#### 响应报文
信息相关：server 
会话保持相关：access-control-allow-origin, set-cookie
缓存相关：cache-control, max-age, expire, last-modified, etag

### 请求方法
- get：获取资源
- post：修改资源 
- head：只获取报文头
- put：主要用于取代特定资源
- patch：put的补充，用于局部资源更新
- delete：删除资源
- Options：查看服务器性能，预检请求
- trace：回显服务器请求，用于测试性能
特点：安全性（get, head, options）、幂等性
## http和https的区别
1. http 明文传输，不加密。https加密 http + tls/ssl
2. Https 基于CA 证书进行认证是否可信网站
3. 连接前验证，https 页面响应比较慢
4. http 3次握手3个包，https加上tls握手9个包，跟小号资源
5. 对应tcp端口号：http80; https 443
## TLS 连接
![](https://cdn.jsdelivr.net/gh/Jesslynwong/Pics@main/20221103101218.png)
## TCP三次握手 & 四次挥手
双方Seq都是随机数
ack：希望下个请求收到
seq:当前收到这个序列数
**SYN (synchronize)是请求同步的意思，ACK是确认同步的意思,** seq 来确定顺序，并且能够确定是否有数据包丢失。
### 三次握手
![](https://cdn.jsdelivr.net/gh/Jesslynwong/Pics@main/20221103103258.png)
### 四次挥手
![](https://cdn.jsdelivr.net/gh/Jesslynwong/Pics@main/20221103104045.png)
报文段最大生存时间MSL, 一来一回
### 为什么三次握手
结论：双方都需要判断对方接受能力和发送能力OK才行
第一次：服务端：client发送能力可以，server接受能力可以
第二次：客户端：server接受能力可以、发送能力可以，但server不知道client是否接受能力可以
第三次：服务端：client接受能力可以
## TCP 和 UDP 的区别
tcp和udp的数据包来进行阐述这个问题，主要遵循以下逻辑报文头 -> 大小 -> 运输方式 -> 是否可靠 -> 连接对象 -> 应用场景
1. 从数据报上看：UDP 首部字段主要有 源端口、目的端口、长度、校验和。通过以上报文判断，是否数据包可接受，如果有错那么进行丢弃。TCP除了以上字段以外，主要判断报文是否丢弃，主要通过 ACK SYN 进行判断，当前报文是否准确收到。
2. TCP报文的大小就比UDP大
3. TCP 需要实现可靠交付主要通过以上报文以及重传机制等保证可靠交付，消耗资源来说，TCP是大于UDP的，并且UDP没有三次握手和四次挥手，连接时间上来说，UDP是更快一些
4. 对于运输方式来说：TCP是面向字节流，UDP是面向报文
5. 从连接对象上来说：UDP支持，一对一，一对多，多对一，多对多的情况；而TCP只能是面对一对一
6. 以上导致了他们的应用场景不同：UDP 主要适用于实时应用，对于报文丢失的容错比较大，主要用于IP电话、视频、直播等。而TCP 主要用于可靠性大的场景，如文件传输等。


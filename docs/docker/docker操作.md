---
sidebar_position: 6
---
## 什么是docker

docker是开发、发布和运行程序的开放平台——虚拟容器。每个虚拟容器里面可以由不同的镜像（image）组合而成。

## 词条解释：

镜像：是个只读模板，其中包含了docker容器创建的说明。用户能够通过拉取hub中的镜像创造容器实例运行，也能够上传自己的镜像，拉自己的镜像运行。

容器：是一个可运行镜像的实例。用户能够连接其他容器或者别的网络，甚至能够基于该容器创造新的镜像。当容器被移除的时候任何的改变状态都会消失。

layer：Dockerfile中每一行都会生成一个新的layer, 每一个层是上一层的增量或者是一些改变。

## 前端为啥要使用docker？

1.  部署高效，有利于项目迁移
原来的基本操作是，需要把构建出来的资源传递给对应服务器，让服务器跑起来，完成部署。
使用docker后，只需要在本地将构建资源打包上传到远程的镜像仓库里（有点像github），在服务器端把镜像拉下来跑即可
![](https://cdn.jsdelivr.net/gh/Jesslynwong/Pics@main/20221023183340.png)

1.  对比虚拟机来说更加轻巧
传统的虚拟机主要隔离了操作系统。而docker主要隔离了应用程序，没有隔离操作系统层，跳过了系统初始化操作系统，能做到秒开。除了占用资源多外的缺点之外，还需要进行系统级别的操作步骤 
3.  高效运维，容易回滚
每打的一个tag相当于是一个版本，当需要回滚的时候，只需要跑之前打过tag的版本即可。（相当于仓库中的不同版本发布）而之前的方式下，需要把原来的代码进行回滚，将代码资源传给对应的服务器，服务器再跑起来。
![](https://cdn.jsdelivr.net/gh/Jesslynwong/Pics@main/20221023183350.png)

4.  易于cicd
直接通过git hook进行触发自动构建以及打包镜像，push到远程docker镜像库即可。服务器通过脚本自动拉取，服务器启动服务。 
5.  抹平运行环境的差异
安装的时候能够把原始环境一毛一样地复制过来运行。确保了不同机器上跑都是一致的运行环境，不会出现我机器上跑正常，你机器跑就有问题的情况。 

## 基本操作
### 构建镜像(build image)
  a. 在根目录下创建Dockerfile
  ```
 # syntax=docker/dockerfile:1
 FROM node:12-alpine
 RUN apk add --no-cache python g++ make
 WORKDIR /app
 COPY . .
 RUN yarn install --production
 CMD ["node", "src/index.js"]
 ```
  b.  构建container image（build -> tag -> run）
  - 转到项目根目录下构建
```
docker build -t getting-started .
```
< .  在这个目录下找到dockerfile>
电脑没有node这个image于是需要下载这个image，然后通过yarn install, 通过CMD运行该命令
-t 后面表示命名该容器 ，后面的 。表示构建容器时在当前目录下寻找Dockerfile。
  - 启动容器
```
docker run -dp 3000:3000 getting-started
```
-d和-p，分离（detached）模式下（在后台）运行新容器，并在主机的端口3000到容器的端口3000之间创建映射(map port)。
此时打开localhost:3000
![](https://cdn.jsdelivr.net/gh/Jesslynwong/Pics@main/20221023183358.png)

此时看到docker dashboard能够看到image运行 

推送过程跟GitHub一样，在hub里面，所有人都能够拉取你的镜像
注册登录dockerhub
点击create Repository创建
终端登录Docker hub
docker login -u YOUR-USER-NAME
通过旁边推送命令复制在终端运行 
推送镜像到docker hub上

拉取镜像(pull image)
```
docker pull IMGAE NAME 
```
## 常用命令
```
docker run -dp 3000:3000 IMGAE NAME 
docker ps // 查看容器
docker stop [container id]
docker image // 查看镜像
docker stop [container id]
dock-compose
docker-compose up
docker-compose down
```
此时已经把前端页面放到了docker上，但是页面刷新的时候，里面的item数据无法保存。此时需要数据库，但是偌大的数据库一定要在本地建立吗？答案是否定的。咱们只需要拉取镜像，并且进行配置即可。此时在容器中的数据库已经能够记录项目中的数据。docker-compose，把两个项目关联起来。创建数据库中有三种方法。主要是volumn、bind mount、tmpfs mount。具体差异可以参考：https://docs.docker.com/storage/
![](https://cdn.jsdelivr.net/gh/Jesslynwong/Pics@main/20221023183420.png)

先把通过volumn运行的数据库，连接到同一个网络，然后docker-compose到同一个地方，可以形成多容器通信，就ok啦!  

## 升级：
### 安全扫描，看看是否存在安全漏洞 
```
docker scan getting-started
```

### layer 拉取的镜像进行缓存，
比如，在原来的配置中更改了镜像，必须重新安装 yarn 依赖项。为了解决这个问题，我们需要重新构建我们的 Dockerfile 以帮助支持依赖项的缓存（如下），只要package.json没有发生改变，可以直接提取缓存，之后再把所有代码才加进来。
before： 
```
FROM node:12-alpine
WORKDIR /app
COPY . .
RUN yarn install --production
CMD ["node", "src/index.js"]
```

after :  
```
FROM node:12-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --production
COPY . .
CMD ["node", "src/index.js"]
```

### 减少依赖项载入
之后在镜像，里面install会生成node_module
在根目录下创建.dockerignore，写入 node_module 

### REACT中应用

在构建 React 应用程序时，我们需要一个 Node 环境来将 JS 代码（通常是 JSX）、LESS 等编译成静态 HTML、JS 和 CSS。如果我们不进行服务器端渲染，我们甚至不需要 Node 环境来进行生产构建。可以直接通过静态 nginx 容器中发送静态资源。此时的dockfile可以写成
```
FROM node:12 AS build
WORKDIR /app
COPY package* yarn.lock ./
RUN yarn install
COPY public ./public
COPY src ./src
RUN yarn run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
```

## 参考文章：
https://juejin.cn/post/6917975471363719182#comment
https://docs.docker.com/get-started/
https://docker.easydoc.net/doc/81170005/cCewZWoN/lTKfePfP
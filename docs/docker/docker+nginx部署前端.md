---
sidebar_position: 6
---
## 前置环境
```bash
Ubuntu 18.04
npm 8.11.0
node 16.15.1
docker 20.10.7
git *
```

## 整体概念

nginx 环境下，只需要把 build 文件和 nginx.conf 配置文件挂载指定的目录下，再启动容器即可
![](https://cdn.jsdelivr.net/gh/Jesslynwong/Pics@main/20221023183211.png)

## 整体做法 📝

1. 编写 dockerfile 和 nginx.conf 文件
2. 启动 docker
3. 通过 ip + port 访问到资源

## 详细步骤

下面路径均以以下代码结构为主
```
├── Dockerfile
├── build
├── deploy
│   └── nginx.conf
```

### Dockerfile编写

docker主要做三件事：

1. 拉取nginx容器
2. 挂载 nginx.conf 到指定目录
3. 挂载 build 文件到指定目录

```
// Dockerfile 
FROM nginx   // 拉取nginx容器 
COPY ./deploy/nginx.conf /etc/nginx/nginx.conf   // 挂载本机 nginx.conf 到 /etc/nginx/nginx.conf（docker nginx容器会直接到该地址访问）
COPY ./build /usr/share/html/<PROJECT_NAME>   // 挂载 build 文件到指定目录
```

nginx.conf 编写

以此nginx.conf为模版：

```
worker_processes  1;

events {
    worker_connections  1024;
}


http {
    include       mime.types;
    default_type  application/octet-stream;

    sendfile        on;

    keepalive_timeout  65;

    server {
       listen <PORT>;  // 监听端口号
       server_name <SERVER_NAME>;  

       root /usr/share/html/<SERVER_NAME>;  // 资源存放目录
       index index.html;
			
    	// 前端资源代理
       location / {
                 root /usr/share/html/<SERVER_NAME>;  // 资源存放目录
                 try_files $uri $uri/ /index.html;  // 不要忘记！！！当不同路由的时候找不到静态资源，就从/index.html进入
                 index index.html index.htm;
        }

    	// 后端接口代理
        location /mysqls {
            proxy_pass http://XXXXXXX; // 后端接口
            proxy_set_header Host $HOST;
        }

        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    }
}
```

### 启动dockr

分别输入以下指令

```
docker build -t <PROJECT_NAME>:latest .  // 不要忘记最后有个‘.’
docker run -dp 8080:8080 <PROJECT_NAME>:latest
```

🛎️ 需要在Dockerfile目录下启动运行指令

### 下面可以通过 ip+port 运行啦 🎉
![](https://cdn.jsdelivr.net/gh/Jesslynwong/Pics@main/20221023183219.png)


## ✨ 升级玩家做法

把第二步通过脚本启动docker

🛎️ 如果跟开篇提到的路径不相同，可以通过cp文件到项目根目录中
```
// deploy.sh
docker build -t <PROJECT_NAME>:latest .  // 不要忘记最后有个‘.’
docker run -dp 8080:8080 <PROJECT_NAME>:latest
```

#### 如何更优雅的配置 nginx ： 一个服务对应一份配置～

当有不同或者多个服务的启动的时候，把所有配置都塞进 nginx.conf 看起来比较混乱。因此，更好的做法是，通过 include 来引入配置文件维护，这样一个服务就对应一份配置。

🛎️ include 这个是引用文件，可以放在任何地方，也就是把这个文件里的内容，包含到主配置文件里面来，可以有效的减少主配置文件的行数，使其保持不会太乱。

```
// nginx.conf 
inlcude /etc/nginx/offline.conf // 引入 offline.conf 
server {
       listen <PORT>;  
       server_name <SERVER_NAME>;  

       root /usr/share/html/<SERVER_NAME>; 
       index index.html;
            
       inlcude /etc/nginx/online.conf // 引入 online.conf
```
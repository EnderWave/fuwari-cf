---
title: CSAPP · 第 11 章 · 网络编程与 Web 服务器
published: 2026-12-04
tags:
  - 计算机系统
  - csapp
  - 网络编程
  - Sockets
  - HTTP
category: 计算机系统
draft: false
description: 客户端-服务器事务模型、计算机网络层次与协议封装、IP 地址与 DNS 域名系统、Socket 套接字接口与地址结构、协议无关转换函数 getaddrinfo/getnameinfo、open_clientfd/open_listenfd 源码实现、Echo 客户端与服务器、HTTP/1.1 协议与分块传输编码，以及 Tiny Web 服务器静态/CGI 动态内容完整实现。
---

## 导读


1. **11.1–11.2 客户端-服务器编程模型与计算机网络层次**：四步客户端-服务器事务、网络主机硬件结构（网卡 DMA 与 I/O 总线）、以太网段（Hub 集线器与 48 位 MAC 地址）$\to$ 桥接以太网（Bridge 网桥自学习）$\to$ 互联网络（Router 路由器与跨网段协议封装 Encapsulation）。

2. **11.3 全球 IP 因特网（Global IP Internet）**：TCP/IP 协议簇（IP、UDP、TCP）、网络字节序（Big-Endian 大端序）与 `struct in_addr`、DNS 域名系统与 `nslookup` 四类映射性质、IPv4 分类地址与 CIDR 无类域间路由、DHCP 动态地址分配与防火墙/NAT 地址转换、因特网连接与套接字对（Socket Pair）。

3. **11.4 Sockets 套接字接口与协议无关编程**：`sockaddr` 与 `sockaddr_in` 结构强制类型转换、`socket`/`bind`/`listen`/`accept`/`connect` 五大核心调用、监听描述符 `listenfd` 与已连接描述符 `connfd` 的本质区别、`getaddrinfo` 与 `getnameinfo` 协议无关转换（附 `hostinfo.c`）、以及 CS:APP 核心包装函数 `open_clientfd` 与 `open_listenfd`（含 `SO_REUSEADDR` 端口复用）完整源码。

4. **11.5–11.6 Web 服务器原理与 Tiny Web Server 实战**：Echo 回射服务器（`echoclient.c` / `echoserveri.c`）、HTTP/1.0 与 HTTP/1.1 核心差异（持久连接、`Host` 头、Chunked 分块编码）、MIME 类型与 URL 解析、CGI（通用网关接口）工作原理（`QUERY_STRING` 环境变量 + `dup2` 标准输出重定向），以及 239 行 C 代码实现的 `tiny.c` 与 `adder.c` 逐行精读。

:::note[核心基石：客户端-服务器事务模型（Client-Server Transaction，Part I Slide 2）]

绝大多数网络应用都建立在客户端-服务器模型（Client-Server Model）**之上。一个应用由**一个服务器进程（Server Process）**和**一个或多个客户端进程（Client Processes）组成（注意：**客户端和服务器都是运行在主机上的进程，而非主机硬件本身**，它们既可以运行在不同的物理主机上，也可以运行在同一台主机上）。每次客户端-服务器事务包含以下 4 个标准步骤：

1. **Client sends request**：客户端需要服务时，向服务器发送一个请求（如同向自动售货机投币按钮），激活服务器；

2. **Server handles request**：服务器收到请求后，操作其管理的某种资源（如读取磁盘文件、查询数据库）；

3. **Server sends response**：服务器向客户端发回一个响应，并等待下一个请求；

4. **Client handles response**：客户端收到响应并处理数据（如在浏览器屏幕上渲染网页）。

:::

:::tip[学习重点]

- 沿连接建立、请求发送、响应接收的顺序理解 Socket 接口。
- 区分字节序、地址解析和 HTTP 报文，结合 Tiny 服务器追踪静态与动态请求。

:::

## 一、计算机网络硬件与协议层次（Part I Slides 3–15）

### 1.1 网络主机硬件结构与局域网/广域网演进（Slides 3–9）

对一台网络主机而言，网络本质上只是另一种 **I/O 设备**（Slide 3）：

* **网络适配器（Network Adapter，即网卡 NIC）** 插在 I/O 总线（如 PCIe）的扩展槽上，通过 I/O 桥接器（I/O Bridge）连接系统总线与主存（Main Memory）。

* 当网络收到数据时，网卡通过 **DMA（直接内存访问，Direct Memory Access）** 将数据直接复制到主存，随后通过硬件中断（Interrupt）通知 CPU；发送数据时，CPU 将主存中的数据经 DMA 传送给网卡发送上链。

按地理覆盖范围，计算机网络自底向上呈层次化组织（Slides 4–9）：

1. **最低层：以太网段（Ethernet Segment，Slide 5）**

   * 覆盖一个房间或楼层，由若干台主机通过双绞线连接到一个集线器（Hub）的端口（Port）上（通常速率为 $100\text{ Mb/s}$）。

   * 每块以太网适配器拥有全球唯一的 **48 位 MAC 地址**（如 `00:16:ea:e3:54:e6`）；主机以称为帧（Frame）的比特块为单位向其他主机发送数据。

   * **Hub 的工作方式**：极其机械（slavishly）地将从任意一个端口收到的每一个比特**无脑广播复制到所有其他端口**，因此网段上的每台主机都能看到所有帧（目前集线器已被廉价的交换机/网桥淘汰）。

2. **下一层：桥接以太网段（Bridged Ethernet Segment / LAN，Slides 6–7）**

   * 覆盖整栋大楼或校园（局域网 LAN），使用高速网桥（Bridge / Switch，如 $1\text{ Gb/s}$ 骨干链路）连接多个以太网段。

   * **Bridge 的工作方式**：网桥比集线器聪明得多——它会通过源 MAC 地址**自动学习（cleverly learn）哪些主机可以从哪个端口到达**，随后有选择地（selectively）只在必要的端口之间转发帧，从而隔离冲突域并大幅提升总带宽。在概念图中，通常将由集线器和网桥构成的整个局域网简化画成一条挂载多台主机的单根水平导线。

3. **最高层：互联网络（internets，小写 i，Slides 8–9）**

   * 多个底层技术完全不同、彼此不兼容的局域网（LAN，如以太网、802.11 Wi-Fi）和广域网（WAN，如高速点对点光纤、T1 专线、DSL）通过专用计算机——**路由器（Router）** 物理连接在一起，构成的网际互联系统称为 **internet（小写 i）**。全球 IP 因特网（Global IP Internet，大写 I）是其最著名的实例。

### 1.2 跨异构网络传输的核心机制：协议封装（Encapsulation，Slides 10–12）

**核心问题**：既然 `LAN 1`（例如以太网）和 `LAN 2`（例如无线局域网或令牌环网）的帧格式与电气特性完全不兼容，主机 A 如何跨越路由器向主机 B 发送数据？

**答案**：在每台主机和路由器上运行**互联网络协议软件（internet Protocol Software）**，提供两项基本能力（Slide 11）：

1. **命名机制（Naming Scheme）**：定义统一的主机地址格式（IP 地址），为每台主机和每个路由器接口分配至少一个唯一的互联网络地址。

2. **传送机制（Delivery Mechanism）**：定义标准的传输单元——**包/分组（Packet）**，由包头（Packet Header, `PH`，含包大小、源 IP 地址和目的 IP 地址）**与**有效载荷（Payload，源主机发送的数据比特）组成。

#### 数据包跨路由器传输的 8 步封装与解封装过程（Slide 12）

假设 `LAN 1` 上的主机 A（客户端）跨越一台路由器 `Router` 向 `LAN 2` 上的主机 B（服务器）发送一段数据 `data`：

```
Host A (LAN1)                                 Router                                 Host B (LAN2)
[Client App]                                                                         [Server App]
     | (1) data                                                                           ^
     v                                                                                    | (8) data
[Protocol SW]                                                                        [Protocol SW]
     | (2) [data | PH | FH1]                                                              ^ (7) [data | PH | FH2]
     v                                                                                    |
[LAN1 Adapter] --(3) [data|PH|FH1]--> [LAN1 Adapter]        [LAN2 Adapter] --(6) [data|PH|FH2]--> [LAN2 Adapter]
                                            | (4)                ^ (5)
                                            v                    |
                                      [      Protocol Software      ]
```

1. **步骤 (1)**：主机 A 上的客户端从用户态通过系统调用将 `data` 复制到内核协议软件；

2. **步骤 (2)**：主机 A 的协议软件在 `data` 前加上**互联网络包头 `PH`**（填好源 IP = A，目的 IP = B）构成 internet packet，再套上 **`LAN 1` 帧头 `FH1`**（目的 MAC = 路由器左网卡）构成 `LAN 1` 帧，交给网卡；

3. **步骤 (3)–(4)**：`LAN 1` 网卡将帧发送到电缆上，路由器的 `LAN 1` 网卡接收该帧并传给路由器的协议软件；

4. **步骤 (5)**：路由器协议软件**剥去旧的 `LAN 1` 帧头 `FH1`**，读取内部 `PH` 中的目的 IP 地址（主机 B），查路由表得知应从右侧 `LAN 2` 接口转发，于是保持 `data + PH` 不变，在外层**重新套上适配 `LAN 2` 的新帧头 `FH2`**（目的 MAC = 主机 B），交给 `LAN 2` 网卡；

5. **步骤 (6)–(8)**：帧经 `LAN 2` 到达主机 B 的网卡，主机 B 的协议软件剥去 `FH2` 和 `PH`，将还原出的纯净 `data` 交付给服务器进程！

## 二、程序员视角下的全球 IP 因特网（Part I Slides 14–28, 44–49）

全球 IP 因特网（Global IP Internet）建立在 **TCP/IP 协议簇**之上（Slide 14）：

* **IP（Internet Protocol，网际协议）**：提供基本的命名机制和从主机到主机（Host-to-Host）**的**不可靠（Unreliable）数据报（Datagrams）尽力而为投递。

* **UDP（Unreliable Datagram Protocol，不可靠数据报协议）**：基于 IP 扩展端口，提供从进程到进程（Process-to-Process）的不可靠数据报投递。

* **TCP（Transmission Control Protocol，传输控制协议）**：基于 IP 提供**从进程到进程**的、建立在双工连接之上的可靠字节流（Reliable Byte Streams）传输。

从程序员的视角看，可以把全球因特网精炼为以下三条核心性质（Slide 16）：

1. 主机集合被映射为一组 **32 位的 IP 地址**（IPv4，或 128 位的 IPv6）；

2. IP 地址集合通过分布式数据库 **DNS** 映射为一组人类易读的标识符——**因特网域名（Internet Domain Names）**；

3. 一台因特网主机上的进程可以通过一条连接（Connection）与另一台因特网主机上的进程读写通信。

### 2.1 IP 地址、网络字节序与点分十进制（Slides 17–19, 46–49）

在 C 语言中，32 位 IPv4 地址存放在结构体 `struct in_addr` 中（Slide 18）：

```
struct in_addr {
    uint32_t s_addr; /* MUST be in network byte order (big-endian)! */
};
```

* **网络字节序铁律（Network Byte Order）**：在任何跨机器传输的网络包头中，所有的多字节整数（包括 **IP 地址** 和 **端口号 Port**）在内存中一律采用大端字节序（Big-Endian Byte Order）存储！即便你的 x86-64 主机本身使用的是小端序（Little-Endian），写入 `in_addr` 或 `sockaddr_in` 前也必须转换为大端网络字节序（使用 `htons`/`htonl`/`ntohs`/`ntohl` 或直接用 `getaddrinfo` 自动生成）。

* **点分十进制表示法（Dotted Decimal Notation，Slide 19）**：将 32 位无符号整数按从高到低的 4 个字节分别写成十进制数并用圆点 `.` 分隔。例如十六进制 IP 地址 **`0x8002C2F2`**：

  * `0x80` $= 128$，`0x02` $= 2$，`0xC2` $= 194$，`0xF2` $= 242$ $\implies$ **`128.2.194.242`**。

* **IPv4 地址分类、CIDR 与私有保留网段（Slides 46–49）**：

  * 传统五类地址：Class A（最高位 `0`，8 位网络号）、Class B（最高位 `10`，16 位网络号，如 CMU 的 `128.2.0.0/16`）、Class C（最高位 `110`，24 位网络号）、Class D（`1110`，多播地址）、Class E（`1111`，实验保留）。

  * **三段不可在公网路由的私有 IP 地址（Unrouted / Private IP Addresses，Slide 46）**：

    * `10.0.0.0/8`、 `172.16.0.0/12`、 `192.168.0.0/16`。

  * **DHCP 与防火墙/NAT 代理机制（Slides 48–49）**：局域网内普通主机通过 **DHCP（动态主机配置协议）** 获取临时私有 IP（如企业内网主机 `10.2.2.2` 或家庭路由下的 `192.168.1.5`）；当内网客户端访问外网服务器 `216.99.99.99` 时，边界**防火墙（Firewall / NAT 网关，公网 IP 为 `176.3.3.3`）** 执行 4 步地址改写：

    1. 内网客户端发出请求：`src = 10.2.2.2, dest = 216.99.99.99`；

    2. 防火墙将源地址改写为自身公网 IP 并转发：`src = 176.3.3.3, dest = 216.99.99.99`；

    3. 外网服务器发回响应：`src = 216.99.99.99, dest = 176.3.3.3`；

    4. 防火墙将目的地址还原为内网客户端 IP 并转交：`src = 216.99.99.99, dest = 10.2.2.2`。

### 2.2 因特网域名系统（DNS）与四大映射性质（Slides 20–24）

域名空间组织为一棵以无名根节点（`unnamed root`）为顶点的倒置树：第一级域名（First-level domain，如 `.net`, `.edu`, `.gov`, `.com`）$\to$ 第二级域名（如 `cmu`, `mit`, `berkeley`, `amazon`）$\to$ 第三级域名（如 `cs.cmu.edu`）$\to$ 主机叶节点（如 `whaleshark.ics.cs.cmu.edu`）。

从数学视角看，全球分布式数据库 **DNS（Domain Naming System）** 由数百万条**主机条目（Host Entries）**构成，每条记录定义了**一组域名与一组 IP 地址之间的等价类映射（Equivalence Class）**。用 `nslookup` 可以观察到以下 4 种映射性质（Slides 22–24）：

1. **本机回环地址（Loopback Address）**：每台主机都有本地定义的域名 `localhost`，永远映射到回环地址 **`127.0.0.1`**。

2. **一对一映射（One-to-One）**：最简单的情形，1 个域名对应唯一 1 个 IP 地址（如 `whaleshark.ics.cs.cmu.edu` $\leftrightarrow$ `128.2.210.175`）。

3. **多对一映射（Multiple Domain Names to Same IP）**：多个域名映射到同一个 IP 地址（如 `cs.mit.edu` 和 `eecs.mit.edu` 均映射到 `18.62.1.6`，常用于单台服务器托管多个虚拟主机）。

4. **多对多映射（Multiple Domain Names to Multiple IPs）与无 IP 的中间域名**：

   * 大型高并发网站（如 `www.twitter.com` 和 `twitter.com`）映射到同一组多个 IP 地址（`199.16.156.6`, `.70`, `.102`, `.230`），且每次查询返回的顺序会自动轮转以实现 DNS 负载均衡；

   * 树中的某些合法中间节点域名（如子网域 `ics.cs.cmu.edu`）本身不对应任何具体机器，因此不映射到任何 IP 地址（`No answer`）。

### 2.3 因特网连接（Connections）、端口与套接字对（Slides 25–28）

客户端和服务器通过在连接（Connection）上收发字节流进行通信。每条 TCP 连接具有三大特性：

* **点对点（Point-to-point）**：连接一对进程；

* **全双工（Full-duplex）**：数据可以同时在两个方向上双向流动；

* **可靠（Reliable）**：源进程发出的字节流，保证最终按完全相同的顺序到达目的进程。

#### 套接字地址（Socket Address）、临时端口与知名端口

* **套接字（Socket）** 是连接的一个端点（Endpoint）。每个套接字都有一个对应的**套接字地址（Socket Address）**，由 **`IP地址:端口`（`IPaddress:port`）** 二元组构成。

* **端口（Port）** 是一个 **16 位无符号整数（**$0 \sim 65535$**）**，用于在同一台主机上唯一标识一个通信进程，分为两类：

  1. **临时端口（Ephemeral Port）**：当客户端发起连接请求（调用 `connect`）时，由客户端操作系统内核自动、动态分配的短期端口（如 `51213`）。

  2. **知名端口（Well-known Port）**：与服务器提供的特定公共服务永久绑定的固定端口（定义在 Linux 的 `/etc/services` 文件中）：

     * Echo 服务器：**`7/echo`**

     * SSH 安全外壳服务器：**`22/ssh`**

     * SMTP 电子邮件服务器：**`25/smtp`**

     * HTTP Web 服务器：**`80/http`**

* **连接的唯一标识——套接字对（Socket Pair，Slide 27）**：

  一条 TCP 连接由它两个端点的套接字地址构成的四元组（Socket Pair）全球唯一确定：

  $$

  \text{Socket Pair} = (\texttt{cliaddr}:\texttt{cliport},\; \texttt{servaddr}:\texttt{servport})

  $$

  例如：`(128.2.194.242:51213, 208.216.181.15:80)`。这也解释了为什么同一台 Web 服务器在同一个 `80` 端口上可以同时区分成千上万个客户端连接——因为每个连接的客户端 `(cliaddr, cliport)` 都不相同！

## 三、Sockets 套接字接口与协议无关编程（Part I Slides 29–42 & Part II Slides 2–24）

### 3.1 什么是 Socket？两大套接字地址结构体（Part I Slides 30–32）

* **对内核而言**，Socket 是通信的端点；

* **对应用程序而言**，Socket 就是一个**文件描述符（File Descriptor，`clientfd` / `serverfd`）**，让应用能用标准的 Unix I/O（特别是第 10 章的 RIO 函数）从网络读写数据。普通文件 I/O 与 Socket I/O 的唯一核心区别在于**应用程序“打开”套接字描述符的方式不同**。

由于 Berkeley Sockets 接口诞生于 20 世纪 80 年代初，当时的 C 语言还没有通用指针 `void *`。为了让 `connect`、`bind`、`accept` 等系统调用能接收各种不同协议族（IPv4、IPv6、Unix 域套接字）的地址结构，设计者定义了一个 16 字节的**通用套接字地址结构 `struct sockaddr`**，并要求程序员在传参时将**协议专用地址结构（如 IPv4 的 `struct sockaddr_in`）强制类型转换为 `(struct sockaddr *)`**（遵循 W. Richard Stevens 的惯例，定义 `typedef struct sockaddr SA;`）：

```
typedef struct sockaddr SA;

/* 1. 通用 16 字节套接字地址结构（仅用于系统调用参数强转） */
struct sockaddr {
    uint16_t sa_family;   /* Protocol family (2 bytes) */
    char     sa_data[14]; /* Address data (14 bytes) */
};

/* 2. IPv4 专用 16 字节套接字地址结构 */
struct sockaddr_in {
    uint16_t       sin_family;  /* Protocol family: 恒为 AF_INET (2 bytes) */
    uint16_t       sin_port;    /* Port num in network byte order (2 bytes, 大端序!) */
    struct in_addr sin_addr;    /* IP addr in network byte order (4 bytes, 大端序!) */
    unsigned char  sin_zero[8]; /* Pad to sizeof(struct sockaddr) (8 bytes 全 0 填充) */
};
```

### 3.2 Sockets 接口五大核心函数与连接建立全景图（Part II Slides 2–16）

客户端与服务器建立连接并进行数据交互的标准调用序列如下：

```
        客户端 (Client)                                   服务器 (Server)
  +-------------------------+                       +-------------------------+
  |      getaddrinfo        |                       |      getaddrinfo        |
  |           |             |                       |           |             |
  |           v             |                       |           v             |
  |         socket          |                       |         socket          |
  |           |             |                       |           |             |
  |           |             | <-- open_clientfd     |           v             | <-- open_listenfd
  |           |             |                       |          bind           |
  |           |             |                       |           |             |
  |           v             |                       |           v             |
  |        connect          | -- Connection req --> |         listen          |
  +-------------------------+           |           +-------------------------+
              |                         +----------------->     |
              |                                                 v
              |                                              accept (阻塞等待连接请求)
              v                                                 v
  +===========================================================================+
  |  Client / Server Session (建立在 clientfd <---> connfd 之间的全双工会话):   |
  |     rio_writen(clientfd, ...)  =========>  rio_readlineb(&rio, connfd)    |
  |     rio_readlineb(&rio, ...)   <=========  rio_writen(connfd, ...)        |
  +===========================================================================+
              |                                                 |
              v                                                 v
         close(clientfd)  ---------- EOF 通知 --------->  rio_readlineb 返回 0
                                                                |
                                                                v
                                                           close(connfd) (随后循环回到 accept)
```

1. **`int socket(int domain, int type, int protocol)`（Slide 6）**：

   * 客户端和服务器均调用它创建一个套接字描述符（此时尚未绑定完整四元组）。

   * 例如 `int clientfd = Socket(AF_INET, SOCK_STREAM, 0);` 表示使用 32 位 IPv4 地址（`AF_INET`）且作为字节流连接的端点（`SOCK_STREAM`）。实际工程中应通过 `getaddrinfo` 自动生成这三个参数以保证协议无关性。

2. **`int bind(int sockfd, SA *addr, socklen_t addrlen)`（Slide 8）**：

   * **仅服务器调用**：请求内核将服务器的套接字地址 `addr`（IP + 知名端口）与描述符 `sockfd` 关联绑定起来。

3. **`int listen(int sockfd, int backlog)`（Slide 10）**：

   * **仅服务器调用**：默认情况下，内核认为 `socket()` 创建的是客户端使用的**主动套接字（Active Socket）**；服务器调用 `listen` 告诉内核该描述符由服务器使用，将其从主动套接字转化为**监听套接字（Listening Socket）**，使其可以接收客户端连接请求（`backlog` 提示内核在开始拒绝新请求前应在队列中缓存多少个未决连接请求）。

4. **`int accept(int listenfd, SA *addr, int *addrlen)`（Slides 12, 15–16）**：

   * **仅服务器调用**：阻塞等待客户端的连接请求到达监听描述符 `listenfd`，一旦到达，将客户端的套接字地址填入 `addr`、地址长度填入 `*addrlen`，并**返回一个全新的已连接描述符（Connected Descriptor，`connfd`）**！

:::important[概念辨析：监听描述符（`listenfd`）vs. 已连接描述符（`connfd`）（Slide 16）]

* **监听描述符（Listening descriptor, `listenfd`）**：客户端连接请求的端点。由服务器在启动时**只创建一次**，并一直存在于服务器的整个生命周期中（比如始终为 `fd = 3`）。

* **已连接描述符（Connected descriptor, `connfd`）**：客户端与服务器之间已经建立好的具体连接的端点。**服务器每 `accept` 接受一个客户端连接请求，内核都会创建一个新的 `connfd`**（如 `fd = 4, 5, ...`），它只在为该客户端服务期间存在，服务结束立即被 `close(connfd)` 关闭。

* **为什么要区分这两者？** 为了支持能够同时处理成百上千个客户端连接的**并发服务器（Concurrent Servers）**！每次 `accept` 返回一个新的 `connfd` 后，主进程/主线程可以立刻派生一个子进程或工作线程专门通过该 `connfd` 服务该客户端，而主流程马上回到 `listenfd` 上继续 `accept` 下一个客户端。

:::

5. **`int connect(int clientfd, SA *addr, socklen_t addrlen)`（Slide 14）**：

   * **仅客户端调用**：客户端调用 `connect` 并阻塞，尝试与套接字地址为 `addr` 的服务器建立 TCP 连接（内核自动为客户端分配临时端口 $y$）。一旦三次握手成功，`connect` 返回，此时连接由四元组 `(x:y, addr.sin_addr:addr.sin_port)` 唯一确定，`clientfd` 即可正式用于读写。

### 3.3 主机与服务转换：`getaddrinfo` 与 `getnameinfo`（Part I Slides 35–42）

旧版 C 网络程序使用的 `gethostbyname` 和 `getservbyname` 既**不可重入（线程不安全）**，又与 IPv4 强耦合。现代网络编程一律使用 **`getaddrinfo`** 和 **`getnameinfo`**：

* **优势**：**完全可重入（Reentrant，多线程安全）**，且允许编写同时兼容 IPv4 和 IPv6 的协议无关（Protocol-Independent）代码。

```
int getaddrinfo(const char *host,               /* 域名或点分十进制 IP（如 "www.cmu.edu" 或 NULL） */
                const char *service,            /* 服务名或十进制端口号字符串（如 "http" 或 "80"） */
                const struct addrinfo *hints,   /* 输入过滤条件结构体（仅可设置 family/socktype/protocol/flags） */
                struct addrinfo **result);      /* 输出：指向动态分配的 addrinfo 链表头指针 */

void freeaddrinfo(struct addrinfo *result);     /* 必须调用以释放整个链表，防止内存泄漏！ */
const char *gai_strerror(int errcode);          /* 将 getaddrinfo 非零错误码转为错误描述字符串 */

struct addrinfo {
    int              ai_flags;      /* Hints argument flags (如 AI_PASSIVE, AI_ADDRCONFIG, AI_NUMERICSERV) */
    int              ai_family;     /* 直接传给 socket() 的第 1 个参数 (AF_INET 或 AF_INET6) */
    int              ai_socktype;   /* 直接传给 socket() 的第 2 个参数 (SOCK_STREAM 或 SOCK_DGRAM) */
    int              ai_protocol;   /* 直接传给 socket() 的第 3 个参数 */
    char            *ai_canonname;  /* Canonical host name */
    size_t           ai_addrlen;    /* 直接传给 connect()/bind() 的地址长度参数 */
    struct sockaddr *ai_addr;       /* 直接传给 connect()/bind() 的套接字地址结构指针 */
    struct addrinfo *ai_next;       /* 指向链表中的下一个候选 addrinfo 节点 */
};

/* 逆向转换函数：将套接字地址 sa 转换回对应的主机名字符串 host 和服务名/端口字符串 serv */
int getnameinfo(const SA *sa, socklen_t salen,
                char *host, size_t hostlen,
                char *serv, size_t servlen, int flags);
```

* **客户端与服务器如何使用 `getaddrinfo` 返回的链表（Slide 37）？**

  * **客户端**：依次遍历链表中的每个 `addrinfo` 节点，用其字段调用 `socket()` 和 `connect()`，直到某一个节点成功建立连接为止。

  * **服务器**：依次遍历链表中的每个 `addrinfo` 节点，调用 `socket()` 和 `bind()`，直到成功绑定为止。

```
#include "csapp.h"

int main(int argc, char **argv)
{
    struct addrinfo *p, *listp, hints;
    char buf[MAXLINE];
    int rc, flags;

    /* 1. 设置 hints 过滤条件并调用 getaddrinfo 获取地址链表 */
    memset(&hints, 0, sizeof(struct addrinfo));
    hints.ai_family = AF_INET;       /* 仅查询 IPv4 地址 */
    hints.ai_socktype = SOCK_STREAM; /* 仅保留流式连接套接字端点 */
    if ((rc = getaddrinfo(argv[1], NULL, &hints, &listp)) != 0) {
        fprintf(stderr, "getaddrinfo error: %s\n", gai_strerror(rc));
        exit(1);
    }

    /* 2. 遍历链表，用 getnameinfo (指定 NI_NUMERICHOST) 将每个地址转为点分十进制字符串打印 */
    flags = NI_NUMERICHOST; /* 直接返回数字 IP 字符串而非反向查询域名 */
    for (p = listp; p; p = p->ai_next) {
        Getnameinfo(p->ai_addr, p->ai_addrlen, buf, MAXLINE, NULL, 0, flags);
        printf("%s\n", buf);
    }

    /* 3. 释放链表内存 */
    Freeaddrinfo(listp);
    exit(0);
}
```

### 3.4 协议无关的封装函数：`open_clientfd` 与 `open_listenfd`（Part II Slides 18–24）

CS:APP 将 `getaddrinfo` 与底层 Socket 调用封装成了两个极其优雅、完全独立于任何特定 IP 版本的辅助函数：`open_clientfd` 和 `open_listenfd`：

```
/* 1. 客户端辅助函数：与运行在 hostname:port 上的服务器建立连接并返回 clientfd */
int open_clientfd(char *hostname, char *port) {
    int clientfd;
    struct addrinfo hints, *listp, *p;

    memset(&hints, 0, sizeof(struct addrinfo));
    hints.ai_socktype = SOCK_STREAM;  /* 打开流式连接 */
    hints.ai_flags = AI_NUMERICSERV;  /* 强制第二个参数 port 为数字端口号字符串 */
    hints.ai_flags |= AI_ADDRCONFIG;  /* 仅当本机配置了 IPv4/IPv6 时才返回对应协议族地址 */
    Getaddrinfo(hostname, port, &hints, &listp);

    for (p = listp; p; p = p->ai_next) {
        if ((clientfd = socket(p->ai_family, p->ai_socktype, p->ai_protocol)) < 0)
            continue; /* 创建失败则尝试下一个候选节点 */
        if (connect(clientfd, p->ai_addr, p->ai_addrlen) != -1)
            break;    /* 连接成功！立即跳出循环 */
        Close(clientfd); /* 连接失败必须先关闭刚才创建的 clientfd，再试下一个 */
    }

    Freeaddrinfo(listp);
    if (!p) return -1;   /* 所有候选地址均连接失败 */
    else    return clientfd;
}

/* 2. 服务器辅助函数：在指定端口 port 上创建并返回一个就绪的监听描述符 listenfd */
int open_listenfd(char *port) {
    struct addrinfo hints, *listp, *p;
    int listenfd, optval = 1;

    memset(&hints, 0, sizeof(struct addrinfo));
    hints.ai_socktype = SOCK_STREAM;             /* 接受流式连接 */
    hints.ai_flags = AI_PASSIVE | AI_ADDRCONFIG; /* AI_PASSIVE + host=NULL 表示监听本机所有通配 IP 地址 */
    hints.ai_flags |= AI_NUMERICSERV;            /* 强制使用数字端口号 */
    Getaddrinfo(NULL, port, &hints, &listp);

    for (p = listp; p; p = p->ai_next) {
        if ((listenfd = socket(p->ai_family, p->ai_socktype, p->ai_protocol)) < 0)
            continue;
        /* 关键技巧：配置 SO_REUSEADDR 消除服务器重启时 bind 报 "Address already in use" 错误 */
        Setsockopt(listenfd, SOL_SOCKET, SO_REUSEADDR,
                   (const void *)&optval, sizeof(int));
        if (bind(listenfd, p->ai_addr, p->ai_addrlen) == 0)
            break; /* 绑定成功！ */
        Close(listenfd);
    }

    Freeaddrinfo(listp);
    if (!p) return -1;
    if (listen(listenfd, LISTENQ) < 0) {
        Close(listenfd);
        return -1;
    }
    return listenfd;
}
```

### 3.5 迭代式 Echo 客户端与服务器完整模板（Part II Slides 25–29）

有了 `open_clientfd` 和 `open_listenfd`，编写协议无关的 Echo 客户端和迭代式服务器只需短短二十几行代码（注意服务器端使用足够容纳任何协议族地址的 `struct sockaddr_storage`）：

```
/* ==================== 1. echoclient.c ==================== */
int main(int argc, char **argv) {
    int clientfd;
    char *host = argv[1], *port = argv[2], buf[MAXLINE];
    rio_t rio;

    clientfd = Open_clientfd(host, port);
    Rio_readinitb(&rio, clientfd);
    while (Fgets(buf, MAXLINE, stdin) != NULL) {
        Rio_writen(clientfd, buf, strlen(buf));
        Rio_readlineb(&rio, buf, MAXLINE);
        Fputs(buf, stdout);
    }
    Close(clientfd); /* 发送 EOF 通知服务器连接关闭 */
    exit(0);
}

/* ==================== 2. echoserveri.c & echo.c ==================== */
void echo(int connfd) {
    size_t n;
    char buf[MAXLINE];
    rio_t rio;

    Rio_readinitb(&rio, connfd);
    while ((n = Rio_readlineb(&rio, buf, MAXLINE)) != 0) { /* 读到 0 表示客户端已 close(clientfd) 发送了 EOF */
        printf("server received %d bytes\n", (int)n);
        Rio_writen(connfd, buf, n);
    }
}

int main(int argc, char **argv) {
    int listenfd, connfd;
    socklen_t clientlen;
    struct sockaddr_storage clientaddr; /* 足够大以容纳 IPv4 或 IPv6 任意地址结构！ */
    char client_hostname[MAXLINE], client_port[MAXLINE];

    listenfd = Open_listenfd(argv[1]);
    while (1) {
        clientlen = sizeof(struct sockaddr_storage); /* 每次调用 Accept 前必须重置长度！ */
        connfd = Accept(listenfd, (SA *)&clientaddr, &clientlen);
        Getnameinfo((SA *)&clientaddr, clientlen,
                    client_hostname, MAXLINE, client_port, MAXLINE, 0);
        printf("Connected to (%s, %s)\n", client_hostname, client_port);
        echo(connfd);
        Close(connfd);
    }
    exit(0);
}
```

## 四、Web 服务器基础、HTTP 协议与 Tiny Web Server 实战（Part II Slides 30–63）

### 4.1 HTTP 协议、MIME 类型与静态/动态内容（Slides 30–37, 55–61）

Web 客户端（浏览器）与 Web 服务器基于 TCP 流连接，使用 **HTTP（HyperText Transfer Protocol，超文本传输协议）** 进行交互。Web 服务器向客户端返回的内容（Content）是一串关联了 **MIME（多用途因特网邮件扩展）类型**的字节序列：

* 常见 MIME 类型：`text/html`（HTML 网页）、`text/plain`（纯文本）、`image/gif`、`image/png`、`image/jpeg`。

* **静态内容（Static content）vs. 动态内容（Dynamic content，Slide 32）**：

  * **静态内容**：直接存储在服务器磁盘文件中、原样读取并返回给客户端的内容（如 HTML 文件、图片）。

  * **动态内容**：服务器根据客户端请求，在服务器端**实时运行一个可执行程序（如 `/cgi-bin/` 下的程序）动态生成**并返回给客户端的内容。

* **URL（统一资源定位符）的前缀与后缀分工（Slide 33）**：

  以 `http://www.cmu.edu:80/index.html` 为例：

  * **客户端使用前缀（`http://www.cmu.edu:80`）** 推断：使用什么协议（HTTP）、连接哪台主机（`www.cmu.edu`）、连接哪个端口（默认 `80`）。

  * **服务器使用后缀（`/index.html`，即 URI）** 推断：请求的是静态内容还是动态内容（通常约定含 `cgi-bin` 的路径为动态可执行程序），并在服务器文件系统中定位对应文件（最小后缀 `/` 会被服务器展开为默认主页如 `index.html`）。

#### HTTP 请求与响应报文格式及 HTTP/1.0 vs. HTTP/1.1 对比（Slides 34–37, 57–61）

**重要协议规范**：HTTP 标准规定每一行文本都必须以 **`\r\n`（CRLF）** 结尾，且请求头或响应头必须以一个仅含 `\r\n` 的空行（Blank line）作为头部结束标志！

| 报文类型 | 结构组成 | 关键字段与示例 |
| ----- | ----- | ----- |
| **HTTP 请求报文（Request）** | 1\. **请求行**：`<method> <uri> <version>\r\n`  2\. **零或多个请求头**：`<header name>: <header data>\r\n`  3\. **终止空行**：`\r\n` | • `<method>`：`GET`、`POST`、`HEAD`、`PUT`、`DELETE`、`OPTIONS`、`TRACE`  • **注意**：发给原服务器的 `<uri>` 只是 URL 后缀（如 `/index.html`），只有发给代理服务器（Proxy）时才是完整 URL！  • **HTTP/1.1 强制要求携带 `Host: <hostname>` 请求头**（用于单 IP 托管多域名虚拟主机）。 |
| **HTTP 响应报文（Response）** | 1\. **响应状态行**：`<version> <status code> <status msg>\r\n`  2\. **零或多个响应头**：`<header name>: <header data>\r\n`  3\. **终止空行**：`\r\n`  4\. **响应体（Content Body）** | • 常见状态码：`200 OK`（成功）、`301 Moved Permanently`（永久重定向，配合 `Location:` 头）、`404 Not found`（未找到）  • 核心响应头：`Content-Type:`（说明响应体的 MIME 类型）、`Content-Length:`（说明响应体的字节长度）。 |

:::tip[HTTP/1.1 相较于 HTTP/1.0 的四大核心升级（Slides 57, 60–61）]

1. **支持持久连接（Persistent Connections）**：HTTP/1.0 每次请求-响应事务都要新建并断开一条 TCP 连接；HTTP/1.1 支持通过 `Connection: Keep-Alive` 在同一条 TCP 连接上连续执行多次 HTTP 事务。

2. **强制要求 `Host:` 请求头**：使得同一台物理服务器（单个 IP 地址）能够同时托管多个不同域名的网站（Virtual Hosting）。

3. **支持分块传输编码（Chunked Encoding，`Transfer-Encoding: chunked`）**：标准模式要求服务器先缓冲整个响应体才能算出 `Content-Length`；而分块编码将响应体切分成若干块（Chunks），每块开头用一行十六进制数标明该块字节数（例如 `d75\r\n` 表示第一块有 $\text{0xd75} = 3445$ 字节），最后以一个长度为 `0` 的块（`0\r\n\r\n`）标识传输结束！

4. **增强了缓存控制头部支持**。

:::

### 4.2 CGI（通用网关接口）动态内容生成机制（Slides 41–52）

当客户端请求动态内容（如 `GET /cgi-bin/adder?15213&18213 HTTP/1.1`）时，**CGI（Common Gateway Interface）** 标准完美解决了以下四个核心交互问题（Slides 44–51）：

1. **客户端如何把参数传给服务器？**

   * 在 `GET` 请求中，参数直接拼接在 URI 的 `?` 之后，多个参数之间用 `&` 分隔（空格编码为 `+` 或 `%20`），例如 `?15213&18213`。

2. **服务器如何把参数传给 `fork` 出来的子进程？**

   * 服务器在子进程调用 `execve` 之前，调用 `setenv("QUERY_STRING", cgiargs, 1)`，将 `?` 后面的整个参数字符串（`"15213&18213"`）存入环境变量 **`QUERY_STRING`** 中！子进程启动后调用 `getenv("QUERY_STRING")` 即可取出参数。

3. **服务器如何捕获子进程生成的动态输出并发回给客户端？**

   * CGI 子进程直接将生成的内容打印到自己的**标准输出 `stdout`（`STDOUT_FILENO`）**。

   * 服务器在子进程调用 `execve` 之前，先调用 **`dup2(connfd, STDOUT_FILENO)`**，将子进程的标准输出直接**重定向到与客户端相连的已连接描述符 `connfd`**！这样子进程调 `printf` 输出的每一个字节都会直接通过 Socket 发往客户端浏览器！

4. **HTTP 响应头由谁生成？**

   * 父进程（Web 服务器）先生成并发送前两行公共响应头（`HTTP/1.0 200 OK\r\n` 和 `Server: Tiny Web Server\r\n`）；

   * 因为**只有 CGI 子进程自己知道最终生成的动态内容是什么类型、有多少字节**，所以 **`Content-length:`、`:Content-type:` 以及终止空行 `\r\n` 必须由 CGI 子进程自己生成并打印**！

### 4.3 Tiny Web Server 核心源码精读：`serve_static`、`serve_dynamic` 与 `adder.c`（Slides 40, 49–51）

```
/* ==================== 1. tiny.c：使用 mmap 零拷贝发送静态文件 ==================== */
void serve_static(int fd, char *filename, int filesize)
{
    int srcfd;
    char *srcp, filetype[MAXLINE], buf[MAXBUF];

    /* 1. 构造并发送 HTTP 响应头（注意最后一行的 \r\n\r\n 包含终止空行！） */
    get_filetype(filename, filetype);
    sprintf(buf, "HTTP/1.0 200 OK\r\n");
    sprintf(buf, "%sServer: Tiny Web Server\r\n", buf);
    sprintf(buf, "%sConnection: close\r\n", buf);
    sprintf(buf, "%sContent-length: %d\r\n", buf, filesize);
    sprintf(buf, "%sContent-type: %s\r\n\r\n", buf, filetype);
    Rio_writen(fd, buf, strlen(buf));

    /* 2. 将静态文件 mmap 映射到虚拟内存，直接写往客户端描述符 fd，随后解除映射！ */
    srcfd = Open(filename, O_RDONLY, 0);
    srcp = Mmap(0, filesize, PROT_READ, MAP_PRIVATE, srcfd, 0);
    Close(srcfd);                 /* 映射建立后即可关闭文件描述符，避免描述符泄漏 */
    Rio_writen(fd, srcp, filesize);
    Munmap(srcp, filesize);       /* 极重要：必须调用 Munmap 释放虚拟内存区域，防止虚存泄漏！ */
}

/* ==================== 2. tiny.c：fork + setenv + dup2 + execve 服务动态内容 ==================== */
void serve_dynamic(int fd, char *filename, char *cgiargs)
{
    char buf[MAXLINE], *emptylist[] = { NULL };

    /* 1. 先向客户端发送 HTTP 响应状态行与 Server 头 */
    sprintf(buf, "HTTP/1.0 200 OK\r\n");
    Rio_writen(fd, buf, strlen(buf));
    sprintf(buf, "Server: Tiny Web Server\r\n");
    Rio_writen(fd, buf, strlen(buf));

    /* 2. 派生子进程设置环境变量、重定向标准输出并加载运行 CGI 程序 */
    if (Fork() == 0) { /* Child */
        setenv("QUERY_STRING", cgiargs, 1);   /* 通过环境变量向 CGI 程序传递参数 */
        Dup2(fd, STDOUT_FILENO);              /* 将标准输出重定向到客户端 Socket 描述符 fd */
        Execve(filename, emptylist, environ); /* 加载并执行 CGI 程序 */
    }
    Wait(NULL); /* 父进程阻塞等待并回收 CGI 子进程 */
}

/* ==================== 3. cgi-bin/adder.c：解析参数并输出剩余响应头与 HTML ==================== */
/* Extract the two arguments */
if ((buf = getenv("QUERY_STRING")) != NULL) {
    p = strchr(buf, '&');
    *p = '\0';
    strcpy(arg1, buf);
    strcpy(arg2, p + 1);
    n1 = atoi(arg1);
    n2 = atoi(arg2);
}

/* Make the response body */
sprintf(content, "Welcome to add.com: ");
sprintf(content, "%sTHE Internet addition portal.\r\n<p>", content);
sprintf(content, "%sThe answer is: %d + %d = %d\r\n<p>", content, n1, n2, n1 + n2);
sprintf(content, "%sThanks for visiting!\r\n", content);

/* Generate the HTTP response headers & body on stdout (which is redirected to client fd!) */
printf("Content-length: %d\r\n", (int)strlen(content));
printf("Content-type: text/html\r\n\r\n");
printf("%s", content);
fflush(stdout); /* 必须刷新标准输出缓冲区，确保全部字节写入 Socket */
exit(0);
```

### 4.4 Web 代理服务器（Web Proxies，Slides 62–63）

**Web 代理（Proxy）** 是位于客户端（Client）与原始服务器（Origin Server）之间的中间人（这也是 CS:APP 著名压轴实验 **Proxy Lab** 的主题）：

* 对客户端而言，代理扮演着**服务器**的角色（接收客户端请求并返回响应）；

* 对原始服务器而言，代理扮演着**客户端**的角色（向原始服务器转发请求并接收响应）。

* **为什么需要代理？** 当请求与响应流经代理时，代理可以执行**高速缓存（Caching，将热门页面缓存在局域网内，避免重复跨越慢速昂贵的全球网络访问源站）**、日志记录（Logging）、匿名化（Anonymization）、内容过滤（Filtering）和转码（Transcoding）。

## 五、复习检查

- [ ] 沿连接建立、请求发送、响应接收的顺序理解 Socket 接口。
- [ ] 区分字节序、地址解析和 HTTP 报文，结合 Tiny 服务器追踪静态与动态请求。

---
title: CSAPP · 第 10 章 · 系统级 I/O 与文件共享
published: 2026-11-28
tags:
  - 计算机系统
  - csapp
  - 系统级IO
  - Linux内核
  - C语言
category: 计算机系统
draft: false
description: Unix I/O 核心接口、不足值（Short Counts）成因与处理、CS:APP RIO（Robust I/O）无缓冲与带缓冲源码实现、文件元数据 stat、Unix 内核打开文件三表模型（描述符表/打开文件表/v-node 表）、fork 文件共享与 dup2 重定向、Standard I/O 缓冲机制及三道经典描述符压轴题逐行图解。
---

## 导读



1. **10.1–10.4 Unix I/O 基础与不足值（Short Counts）**：“一切皆文件”哲学、文件类型与换行符（`\n` vs. `\r\n`）、目录层级与路径名、`open`/`close`/`read`/`write`/`lseek` 接口规范，以及网络编程中最容易踩坑的**不足值（Short Counts）**。

2. **10.5 RIO（Robust I/O）健壮包源码精读**：无缓冲输入输出函数 `rio_readn`/`rio_writen`（自动重启被信号中断的系统调用 `EINTR`），以及带内部缓冲区 `rio_t` 的线程安全读取函数 `rio_readinitb`/`rio_readlineb`/`rio_readnb`。

3. **10.6–10.9 文件元数据、内核打开文件三表模型与 I/O 重定向**：`stat`/`fstat` 与 `struct stat`、Unix 内核表示打开文件的三张核心表（**Descriptor table** $\to$ **Open file table** $\to$ **v-node table**）、多次 `open` vs. `fork()` 继承 vs. `dup2()` 重定向的引用计数与偏移量变化机制。

4. **10.10–10.12 标准 I/O、三类 I/O 函数选型法则与三道经典描述符分析题**：C 标准库 `FILE` 流缓冲与 `strace` 验证、Unix I/O vs. Standard I/O vs. RIO 优劣对比，以及讲义压轴三道 `Fun with File Descriptors`（`ffiles1.c`, `ffiles2.c`, `ffiles3.c`）逐行状态追踪。

:::note[Unix 的核心抽象：“一切皆文件（Everything is a File）”]

在 Linux/Unix 系统中，一个**文件（File）**本质上就是一个由 $m$ 个字节构成的序列：

$$

B_0, B_1, \dots, B_k, \dots, B_{m-1}

$$

所有的 I/O 设备都被统一抽象建模为文件：例如磁盘分区 `/dev/sda2`、终端 `/dev/tty2`，甚至连 Linux 内核映像 `/boot/vmlinuz-3.13.0-55-generic` 和内核数据结构 `/proc` 也都表示为文件！这种优雅的映射使得内核只需向上导出一套极简、统一的底层接口，即 **Unix I/O**。

:::

:::tip[学习重点]

- 区分 Unix I/O、标准 I/O 与 RIO，正确处理不足值。
- 用描述符表、打开文件表和 v-node 表解释 fork、dup2 与文件位置共享。

:::

## 一、Unix I/O 概览与基础系统调用（Slides 3–15）

### 1.1 Unix I/O 四大基本操作与文件类型

内核通过 **Unix I/O** 向应用程序提供四个核心操作（Slide 4）：

1. **打开和关闭文件（Opening and closing files）**：调用 `open()` 通知内核准备访问某文件，返回一个非负小整数**文件描述符（File Descriptor, `fd`）**；访问完毕后调用 `close()` 释放资源。

2. **读写文件（Reading and writing a file）**：调用 `read()` 从当前文件位置复制字节到内存，调用 `write()` 从内存复制字节到当前文件位置。

3. **改变当前文件位置（Changing the current file position / seek）**：内核为每个打开的文件维护一个文件位置偏移量 $k$（初始为 $0$），表示下一个将要读或写的字节距离文件开头的字节偏移。应用程序可通过 `lseek()` 显式修改 $k$。

#### Linux 文件类型与文本行结尾（EOL）差异（Slides 5–9）

每个 Linux 文件都有一个表明其在系统中角色的类型（Slide 5）：

- **普通文件（Regular file）**：包含任意数据。应用程序通常将其细分为**文本文件（Text files，仅含 ASCII 或 Unicode 字符）**和**二进制文件（Binary files，如目标代码 `.o`、JPEG 图片等）**，但**对 Linux 内核而言，文本文件与二进制文件毫无区别**！

  - 文本文件是一系列文本行（Text lines），每行以换行符（Newline character `\n`，ASCII 码为 `0x0a`，即 Line Feed `LF`）结尾。

  - **跨平台行尾符（EOL）差异（Slide 6）**：Linux 与 macOS 使用单字节 `\n`（`0x0a`，LF）；而 **Windows 与各类 Internet 网络协议（如 HTTP）** 继承了老式机械打字机的传统，使用双字节 **`\r\n`（`0x0d 0x0a`）**，即回车（Carriage Return, `CR`）加换行（Line Feed, `LF`）！

- **目录（Directory，Slides 7–9）**：包含一组**链接（Links）**的数组，每个链接将一个文件名（Filename）映射到一个文件（也可以是另一个子目录）。

  - 每个目录至少包含两个特殊条目：`.`（dot，指向该目录自身）和 `..`（dot dot，指向目录层级树中的父目录）。

  - 所有文件组织成一棵以根目录 `/`（slash）为锚点的树状层次结构；内核为每个进程维护**当前工作目录（Current Working Directory, `cwd`）**，区分以 `/` 开头的**绝对路径（Absolute pathname，如 `/home/droh/hello.c`）**和从 `cwd` 出发的**相对路径（Relative pathname，如 `../home/droh/hello.c`）**。

- **套接字（Socket）**：用于与另一台机器（或本机）上的进程进行跨网络通信的文件抽象。

- **其他文件类型**：命名管道（Named pipes / FIFOs）、符号链接（Symbolic links）、字符设备与块设备（Character and block devices）。

### 1.2 `open`、`close`、`read`、`write` 系统调用详解（Slides 10–14）

#### 1. 打开文件 `open` 与三大标准描述符（Slide 10）

由 Linux Shell 创建的每个进程在启动时，默认都已经打开了与终端关联的三个文件描述符：

- **`0`（`STDIN_FILENO`）**：标准输入（Standard input, `stdin`）；

- **`1`（`STDOUT_FILENO`）**：标准输出（Standard output, `stdout`）；

- **`2`（`STDERR_FILENO`）**：标准错误（Standard error, `stderr`）。

```c title="打开与关闭文件的标准错误检查范式 (Slides 10-11)"
int fd;     /* file descriptor */
int retval; /* return value */

/* 1. 打开文件：若返回 -1 表示发生错误并设置 errno */
if ((fd = open("/etc/hosts", O_RDONLY)) < 0) {
    perror("open");
    exit(1);
}

/* 2. 关闭文件：在多线程程序中，重复关闭一个已关闭的 fd 会导致灾难性后果！ */
/* 铁律：永远检查每一个系统调用的返回值，哪怕是看似无害的 close() */
if ((retval = close(fd)) < 0) {
    perror("close");
    exit(1);
}
```

#### 2. 读写文件 `read` 与 `write`（Slides 12–14）

```c title="read 与 write 系统调用用法及单字节拷贝示例 (Slides 12-14)"
char buf[512];
int fd;
int nbytes; /* 注意：read/write 标准返回类型为有符号整数 ssize_t */

/* 从 fd 当前文件位置最多读取 512 字节到 buf，并更新文件位置 */
/* 返回值：若 > 0 为实际读入字节数；若 == 0 表示遇到 EOF；若 < 0 表示出错 */
if ((nbytes = read(fd, buf, sizeof(buf))) < 0) {
    perror("read");
    exit(1);
}

/* 从 buf 最多向 fd 当前文件位置写入 512 字节，并更新文件位置 */
if ((nbytes = write(fd, buf, sizeof(buf))) < 0) {
    perror("write");
    exit(1);
}
```

:::important[核心考点：为什么返回类型是带符号的 `ssize_t` 而不是无符号的 `size_t`？]

- 请求读写的字节数参数 `n` 类型是无符号整数 `size_t`（在 x86-64 上为 `unsigned long`）；

- 但返回值类型被定义为**有符号整数 `ssize_t`**（在 x86-64 上为 `long`），因为当系统调用出错时**必须返回 `-1`** 来指示错误！因此接收返回值的变量绝不能声明为无符号的 `size_t`，否则 `-1` 会变成全 `1` 的最大正整数，导致 `< 0` 的错误检查彻底失效。

:::

### 1.3 什么是不足值（Short Counts）？何时发生？（Slide 15）

当应用程序调用 `read(fd, buf, n)` 或 `write(fd, buf, n)` 请求传输 $n$ 个字节，但函数实际返回的已传输字节数 `nbytes` 满足 $0 < \text{nbytes} < n$ 时，这种现象称为**不足值（Short Counts）**。**不足值绝不是错误（Not Errors）**！

| 分类 | 具体场景 | 原理解释 |
| :--- | :--- | :--- |
| **会发生 Short Counts 的场景** | 1. 读文件时遇到文件尾（EOF） | 例如文件还剩 20 字节，但请求 `read` 512 字节，则只返回 20（下次再调 `read` 返回 0 表示 EOF）。 |
| **会发生 Short Counts 的场景** | 2. 从终端（Terminal）读取文本行 | 终端驱动每次以回车换行为单位交付一行，若用户输入 `"hello\n"`（6 字节），`read(0, buf, 512)` 立即返回 6。 |
| **会发生 Short Counts 的场景** | 3. **读写网络套接字（Network Sockets）** | 内部内核套接字缓冲区已满/数据尚未全部到达，或者受到长距离网络传输分组延迟与 MTU 拆包限制。 |
| **绝不会发生 Short Counts 的场景** | 1. 从普通磁盘文件读取（除遇到 EOF 外）<br>2. 向普通磁盘文件写入 | 磁盘文件具有确定大小并由内核页缓存直接管理，除非遇到 EOF 或磁盘满错误，否则总是足额传输。 |

**最佳实践铁律**：在编写通用 I/O 或网络程序时，**永远要假设不足值随时可能发生**，并通过循环反复调用读写直到请求的字节全部传输完毕！

## 二、CS:APP RIO（Robust I/O）健壮包（Slides 16–24）

为了彻底屏蔽不足值（Short Counts）与信号中断（`EINTR`）带来的繁琐处理，CS:APP 作者在 `src/csapp.c` 和 `include/csapp.h` 中封装了 **RIO（Robust I/O，健壮 I/O）包**，提供两类函数（Slide 17）：

1. **无缓冲的二进制输入输出函数（Unbuffered RIO）**：`rio_readn` 和 `rio_writen`，直接在内存与文件描述符之间传输二进制数据，无应用层缓冲区，可在同一描述符上任意交错调用。

2. **带缓冲的文本行与二进制输入函数（Buffered RIO）**：`rio_readinitb`、`rio_readlineb` 和 `rio_readnb`，基于用户态缓冲区 `rio_t` 预读缓存，**完全线程安全（Thread-safe）**，且 `rio_readlineb` 与 `rio_readnb` 可在同一描述符上任意交错调用。

### 2.1 无缓冲 RIO 函数与 `rio_readn` 源码逐行解析（Slides 18–19）

```c title="rio_readn 完整源码实现 (csapp.c, Slide 19)" {10-16,18-19}
#include "csapp.h"

ssize_t rio_readn(int fd, void *usrbuf, size_t n);
ssize_t rio_writen(int fd, void *usrbuf, size_t n);
/* 返回值：成功则为实际传输字节数，EOF 返回 0（仅 rio_readn），出错返回 -1 */

ssize_t rio_readn(int fd, void *usrbuf, size_t n)
{
    size_t nleft = n;
    ssize_t nread;
    char *bufp = usrbuf;

    while (nleft > 0) {
        if ((nread = read(fd, bufp, nleft)) < 0) {
            if (errno == EINTR) /* Interrupted by sig handler return */
                nread = 0;      /* and call read() again */
            else
                return -1;      /* errno set by read() */
        }
        else if (nread == 0)
            break;              /* EOF */
        nleft -= nread;
        bufp += nread;
    }
    return (n - nleft);         /* Return >= 0 */
}
```

:::tip[`rio_readn` 与 `rio_writen` 的三大设计细节]

1. **何时返回不足值？** `rio_writen` **绝对不会**返回不足值（只要没出错就一定写满 $n$ 字节）；`rio_readn` **只有在遇到 EOF 时**才会返回不足值（$< n$），因此只有当你明确知道要读取多少字节时才使用 `rio_readn`。

2. **信号中断自动重启（Lines 11–12）**：如果进程在阻塞等待慢速 `read` 时捕获到了一个信号，从信号处理函数返回后内核会让 `read` 返回 `-1` 并将 `errno` 置为 `EINTR`。`rio_readn` 捕获到 `errno == EINTR` 后，并不将其视为致命错误，而是把 `nread` 置为 `0` 并进入下一轮 `while` 循环自动重启 `read()`！

3. **指针推进**：每次成功读入 `nread` 字节后，剩余待读字节数 `nleft -= nread`，同时用户缓冲区写入指针向后推进 `bufp += nread`，防止新读入的数据覆盖前面已读入的数据。

:::

### 2.2 带缓冲的 RIO 输入函数与 `rio_t` 内部实现（Slides 20–24）

如果我们要从网络 Socket 中读取一行以 `\n` 结尾的文本（如 HTTP 请求头），若不使用缓冲区，就只能像 Slide 14 那样每次调用 `read(fd, &c, 1)` 读 1 个字节并检查是不是 `\n`——每次 `read` 都要陷入内核态（耗时 $> 10,000$ 个时钟周期），效率极低！

因此，RIO 设计了一个用户态缓冲结构体 `rio_t`（Slide 23）：每次当内部缓冲区为空时，底层一次性调用系统调用 `read` 从内核预读一大块数据（`RIO_BUFSIZE = 8192` 字节）存入 `rio_buf`；随后的 `rio_readlineb` 和 `rio_readnb` 只需在用户态直接从 `rio_buf` 中取字节，极大减少了系统调用次数！

```c title="rio_t 缓冲区结构体声明与带缓冲文本行拷贝示例 (Slides 20-24)"
typedef struct {
    int rio_fd;                /* descriptor for this internal buf (绑定的文件描述符) */
    int rio_cnt;               /* unread bytes in internal buf (缓冲区内尚未被用户读走的字节数) */
    char *rio_bufptr;          /* next unread byte in internal buf (指向下一个未读字节的指针) */
    char rio_buf[RIO_BUFSIZE]; /* internal buffer (内部缓冲区数组) */
} rio_t;

void rio_readinitb(rio_t *rp, int fd);
ssize_t rio_readlineb(rio_t *rp, void *usrbuf, size_t maxlen);
ssize_t rio_readnb(rio_t *rp, void *usrbuf, size_t n);

/* 示例：cpfile.c —— 使用 RIO 按行将标准输入复制到标准输出 */
int main(int argc, char **argv)
{
    int n;
    rio_t rio;
    char buf[MAXLINE];

    Rio_readinitb(&rio, STDIN_FILENO);
    while ((n = Rio_readlineb(&rio, buf, MAXLINE)) != 0)
        Rio_writen(STDOUT_FILENO, buf, n);
    exit(0);
}
```

- **`rio_readlineb(rp, usrbuf, maxlen)` 的三大停止条件（Slide 20）**：

  1. 已读满 `maxlen - 1` 个字节（留最后 1 个字节自动填入字符串终止符 `'\0'`）；

  2. 遇到文件结尾 **EOF**；

  3. 遇到换行符 **`'\n'`**（注意：`'\n'` 字符本身也会被保留存入 `usrbuf` 中，随后附上 `'\0'`）。

- **混用禁忌警告（Slide 21）**：在同一个描述符 `fd` 上，`rio_readlineb` 和 `rio_readnb` 共用同一个 `rio_t` 缓冲区，因此**可以任意交错调用**；但**绝对禁止将带缓冲的 `rio_readlineb`/`rio_readnb` 与无缓冲的 `rio_readn`（或裸 `read`）在同一个 `fd` 上交错调用**！因为 `rio_t` 已经把内核文件位置往后预读了一大截，此时直接调 `rio_readn` 会跳过还在 `rio_buf` 中尚未消费的 `rio_cnt` 个字节，造成数据乱序丢失。

## 三、文件元数据、内核打开文件三表模型与重定向（Slides 25–34）

### 3.1 文件元数据（File Metadata）与 `stat` 结构体（Slides 26–27）

元数据（Metadata）是“关于数据的数据”。内核为每个文件维护一份元数据，用户程序可通过 `stat(filename, &buf)`（传路径名）或 `fstat(fd, &buf)`（传已打开的文件描述符）将其填入 `struct stat` 结构体中：

```c title="struct stat 核心字段与 statcheck.c 权限/类型检查示例 (Slides 26-27)"
struct stat {
    dev_t         st_dev;     /* Device (设备号) */
    ino_t         st_ino;     /* inode (i-node 节点号) */
    mode_t        st_mode;    /* Protection and file type (访问权限位与文件类型！) */
    nlink_t       st_nlink;   /* Number of hard links (硬链接计数) */
    uid_t         st_uid;     /* User ID of owner (所有者 UID) */
    gid_t         st_gid;     /* Group ID of owner (所属组 GID) */
    dev_t         st_rdev;    /* Device type (if inode device) */
    off_t         st_size;    /* Total size, in bytes (文件总字节大小！) */
    unsigned long st_blksize; /* Blocksize for filesystem I/O */
    unsigned long st_blocks;  /* Number of blocks allocated */
    time_t        st_atime;   /* Time of last access (最后访问时间) */
    time_t        st_mtime;   /* Time of last modification (最后修改内容时间) */
    time_t        st_ctime;   /* Time of last change (最后修改 inode 元数据时间) */
};

/* statcheck.c：利用宏 S_ISREG / S_ISDIR 与位掩码 S_IRUSR 解析 st_mode */
int main(int argc, char **argv)
{
    struct stat stat;
    char *type, *readok;

    Stat(argv[1], &stat);
    if (S_ISREG(stat.st_mode))      /* 判断是否为普通文件 */
        type = "regular";
    else if (S_ISDIR(stat.st_mode)) /* 判断是否为目录文件 */
        type = "directory";
    else
        type = "other";

    if ((stat.st_mode & S_IRUSR))   /* 检查当前所有者是否具有读权限 */
        readok = "yes";
    else
        readok = "no";

    printf("type: %s, read: %s\n", type, readok);
    exit(0);
}
```

### 3.2 Unix 内核如何表示打开的文件？三表模型深度图解（Slides 28–34）

这是整章**最重要、最核心的考点**！Unix 内核使用三个相互关联的数据结构来表示打开的文件（Slide 28）：

| 内核表名称 | 作用域（每个进程私有 vs. 全系统共享） | 表项存储的核心内容 |
| :--- | :--- | :--- |
| **1. 描述符表（Descriptor table）** | **每个进程独立拥有一张（One table per process）** | 以文件描述符 `fd`（`0, 1, 2, 3, ...`）作为下标，每个表项是一个指向**打开文件表**中某个表项的指针。 |
| **2. 打开文件表（Open file table）** | **全系统所有进程共享（Shared by all processes）** | 每次调用 `open()` 都会在表中新建一个表项，包含：<br>• **`File pos`（当前文件位置偏移量）**<br>• **`refcnt`（引用计数：当前指向该表项的描述符总数）**<br>• 指向 **v-node 表**对应表项的指针。 |
| **3. v-node 表（v-node table）** | **全系统所有进程共享（Shared by all processes）** | 每个打开的物理文件对应唯一一个 v-node 表项，包含 `struct stat` 中的大多数静态元数据（`File access`、`File size`、`File type` 等）。 |

```
 [Descriptor table]         [Open file table]          [v-node table]
 (每个进程独立一张)           (所有进程全局共享)           (所有进程全局共享)
 +------+                   +---------------+          +---------------+
 | fd 0 |                   |   File pos    | -------> |  File access  |
 | fd 1 | ----------------> |   refcnt = 1  |          |   File size   |  (File A: terminal)
 | fd 2 |                   |      ...      |          |   File type   |
 | fd 3 |                   +---------------+          +---------------+
 | fd 4 | --------+         +---------------+          +---------------+
 +------+         +-------> |   File pos    | -------> |  File access  |
                            |   refcnt = 1  |          |   File size   |  (File B: disk)
                            |      ...      |          |   File type   |
                            +---------------+          +---------------+
```

:::important[看懂一切文件操作题的黄金法则：看 `File pos` 在哪张表里！]

- **`File pos`（当前读写偏移量）存储在中间的“打开文件表（Open file table）”中**！

- 因此，判断两个描述符 `fdA` 和 `fdB` 读写时**是否共享同一个文件偏移量（即一个读了之后另一个会不会接着往后读）**，唯一标准就是看：**它们是否指向同一个“打开文件表表项（Open file table entry）”**！

- 只有当某个打开文件表表项的引用计数 `refcnt` 减至 `0` 时，内核才会销毁该打开文件表表项。

:::

#### 四种经典场景下的三表连接关系对比（Slides 28–34）

1. **场景 A：无共享的普通打开（Slide 28）**：

   - 描述符 `1`（`stdout`）指向终端文件 A，描述符 `4` 指向磁盘文件 B，各自对应独立的打开文件表项（`refcnt = 1`）和独立的 v-node 表项。

2. **场景 B：对同一个文件名调用两次 `open()`（Slide 29）**：

   - 例如进程先后执行 `fd3 = open("foo.txt", ...)` 和 `fd4 = open("foo.txt", ...)`。

   - **关键结论**：每次调用 `open()` 都会在**打开文件表（Open file table）**中分配一个**全新的、独立的表项**！因此 `fd3` 和 `fd4` 指向**两个不同的打开文件表表项**（各自的 `refcnt = 1`，拥有**各自独立的 `File pos`**，互不干扰！），但这两个打开文件表表项最终指向**同一个 v-node 表项**（因为底层是同一个磁盘文件）。

3. **场景 C：调用 `fork()` 创建子进程时的文件共享（Slides 30–31）**：

   - 子进程会获得父进程描述符表（Descriptor table）的一份精确副本！

   - **关键结论**：父进程和子进程的 `fd` 指向**完全相同的打开文件表表项（Open file table entries）**，且每个被继承的打开文件表表项的引用计数 **`refcnt` 全部加 1**（`refcnt = 2`）！

   - 因此，**父子进程共享同一个 `File pos` 文件位置偏移量**！无论父进程还是子进程调用 `read`/`write` 推进了 `File pos`，另一个进程下一次读写都会从推进后的新位置继续！

4. **场景 D：Shell 如何实现 I/O 重定向 `ls > foo.txt`？调用 `dup2(oldfd, newfd)`（Slides 32–34）**：

   - `int dup2(int oldfd, int newfd)` 的功能是：将当前进程描述符表中 **`oldfd` 的表项内容复制到 `newfd` 表项中**（如果 `newfd` 原本已经打开，会先自动关闭 `newfd`）。

   - 以 `ls > foo.txt` 为例（假设原 `fd 1` 指向终端 File A，`refcnt = 1`）：

     - **Step #1（Slide 33）**：Shell fork 出的子进程在调用 `execve` 之前，先调用 `open("foo.txt", ...)` 打开磁盘文件 File B，假设分配得到描述符 `fd 4`（此时 File B 的打开文件表项 `refcnt = 1`）。

     - **Step #2（Slide 34）**：调用 **`dup2(4, 1)`**，把 `fd 4` 的指针复制覆盖到 `fd 1`（`stdout`）！此时：

       - 原先终端 File A 的打开文件表项失去了 `fd 1` 的指向，`refcnt` 从 `1` 减为 **`0`**（内核随即回收该表项）；

       - 磁盘文件 File B 的打开文件表项同时被 `fd 1` 和 `fd 4` 指向，其 `refcnt` 从 `1` 增至 **`2`**！且 `fd 1` 与 `fd 4` **共享同一个 `File pos`**！

     - 随后调用 `execve` 运行 `ls`（`execve` 不会改变已打开的描述符表），`ls` 向标准输出 `fd 1` 打印的所有内容就自然写入了 `foo.txt`。

## 四、标准 I/O（Standard I/O）与三套 I/O 接口选型法则（Slides 35–46）

### 4.1 C 标准 I/O 流与用户态缓冲机制（Slides 36–40）

C 标准库（`libc.so`）提供了比 Unix I/O 更高层的**标准 I/O 函数（Standard I/O）**：

- 打开与关闭：`fopen`、`fclose`

- 按字节/对象读写：`fread`、`fwrite`

- 按文本行读写：`fgets`、`fputs`

- 格式化读写：`fscanf`、`fprintf`、`printf`、`scanf`

标准 I/O 将打开的文件建模为**流（Stream，`FILE *`）**，一个流本质上就是**“一个文件描述符 `fd` + 一块用户态内存缓冲区（Buffer in memory）”**的抽象封装（每个 C 程序启动时自动拥有 `stdin`、`stdout`、`stderr` 三个流，分别封装 `fd 0, 1, 2`）。

```c title="用 Linux strace 亲眼验证 printf 的行缓冲机制 (Slides 39-40)"
#include <stdio.h>

int main()
{
    printf("h");
    printf("e");
    printf("l");
    printf("l");
    printf("o");
    printf("\n");
    fflush(stdout);
    exit(0);
}
```

- **为什么需要缓冲（Slide 38）？** 程序频繁调用 `getc`/`putc`/`printf` 每次只读写一两个字符，而每次陷入内核执行 `read`/`write` 系统调用需要耗费 **$> 10,000$ 个时钟周期**。

- **输出缓冲刷新时机（Slide 39）**：对于连接终端的 `stdout`（默认采用**行缓冲 Line Buffering**），上面连续 6 次 `printf` 先把字符 `'h', 'e', 'l', 'l', 'o', '\n'` 依次拼装在用户态缓冲区 `buf` 中，**直到遇到 `"\n"`、显式调用 `fflush(stdout)`、调用 `exit()` 或从 `main` 返回时**，才最终合并为**唯一一次**底层系统调用：

  ```bash
  linux> strace ./hello
  execve("./hello", ["hello"], [/* ... */]).
  ...
  write(1, "hello\n", 6) = 6
  ...
  exit_group(0) = ?
  ```

### 4.2 Unix I/O vs. Standard I/O vs. RIO 全面对比与选型指南（Slides 42–46）

标准 I/O 和 RIO 底层都是通过调用 Unix I/O 系统调用实现的：

| I/O 函数包 | 核心优势（Pros） | 核心局限与禁忌（Cons） | 什么时候应该选用它？（Choosing Rules） |
| :--- | :--- | :--- | :--- |
| **Unix I/O**<br>(`open`, `read`, `write`, `lseek`, `stat`, `close`) | • 最通用、开销最低的底层原语（其他所有包都基于它构建）<br>• 提供访问文件元数据的函数（`stat`/`fstat`）<br>• **异步信号安全（Async-signal-safe）**，可在信号处理函数中安全调用！ | • 程序员必须手动处理棘手的不足值（Short Counts）<br>• 无用户态缓冲，按行读取效率极低且自己实现缓冲极易出错。 | 1. **在信号处理程序（Signal Handlers）内部**（因为它是异步信号安全的）；<br>2. 需要获取文件元数据 `stat` 时；<br>3. 极少数需要压榨极致底层性能的场景。 |
| **Standard I/O**<br>(`fopen`, `fread`, `fwrite`, `fgets`, `printf`, ...) | • 用户态缓冲大幅减少 `read`/`write` 系统调用次数，效率高<br>• 自动处理 Short Counts，带格式化输入输出。 | • 不提供获取文件元数据的接口<br>• **非异步信号安全**，严禁在信号处理函数中使用！<br>• **不适合用于网络套接字（Network Sockets）**（流对双向读写转换有严格的 `fflush`/`fseek` 限制，与 Socket 语义冲突，见 CS:APP3e 10.11 节）。 | **处理普通磁盘文件（Disk files）或终端文件（Terminal files）时的首选默认方案**（最高层抽象原则）。 |
| **RIO Package**<br>(`rio_readn`, `rio_writen`, `rio_readlineb`, `rio_readnb`) | • 自动处理 Short Counts 和 `EINTR` 信号中断重启<br>• 带缓冲输入函数线程安全，专为网络流设计。 | • 需引入 `csapp.c` 包装源码。 | **读写网络套接字（Network Sockets）和管道时的唯一推荐方案**（切勿在 Socket 上使用 Standard I/O！）。 |

:::caution[处理二进制文件的两大铁律（Slide 46）]

在读写二进制文件（如图片、音频、可执行文件、序列化结构体）时，**绝对禁止使用以下两类函数**：

1. **面向文本行的 I/O 函数**（如 `fgets`, `fscanf`, `rio_readlineb`）：因为二进制数据中随时可能偶然出现字节值 `0x0a`（恰好等于换行符 `'\n'`），文本函数会误以为一行结束而提前截断！应改用 **`rio_readn`、`rio_readnb` 或 `fread`**。

2. **C 字符串处理函数**（如 `strlen`, `strcpy`, `strcat`）：因为二进制数据中包含大量值为 `0x00`（空字节 Null byte）的字节，字符串函数会将其视为字符串结尾 `'\0'` 而提前终止！应改用 `memcpy`、`memmove` 等按显式字节长度操作的函数。

:::

## 五、三道经典文件描述符习题（Fun with File Descriptors）与目录读取（Slides 48–51）

讲义最后给出了三道极具代表性的文件描述符代码分析题（Slides 48–50），完美检验对“描述符表 $\to$ 打开文件表 $\to$ v-node 表”三表模型的掌握程度。

### 5.1 习题 1：多次 `open` 与 `dup2` 交错读取（`ffiles1.c`，Slide 48）

**题目**：假设文件 `fname` 的内容为 `"abcde"`，下面程序运行后会打印什么？

```c title="ffiles1.c (Slide 48)"
#include "csapp.h"
int main(int argc, char *argv[])
{
    int fd1, fd2, fd3;
    char c1, c2, c3;
    char *fname = argv[1];
    fd1 = Open(fname, O_RDONLY, 0);
    fd2 = Open(fname, O_RDONLY, 0);
    fd3 = Open(fname, O_RDONLY, 0);
    Dup2(fd2, fd3);
    Read(fd1, &c1, 1);
    Read(fd2, &c2, 1);
    Read(fd3, &c3, 1);
    printf("c1 = %c, c2 = %c, c3 = %c\n", c1, c2, c3);
    return 0;
}
```

:spoiler[**点击展开 `ffiles1.c` 逐行状态追踪与标准答案**]

- **第 1 步（三次独立 `Open`）**：`fd1`、`fd2`、`fd3` 分别调用了三次 `Open`，因此在内核**打开文件表（Open file table）**中创建了三个独立的表项 $E_1, E_2, E_3$，各自的 `pos = 0`。

- **第 2 步（`Dup2(fd2, fd3)`）**：将 `fd2` 的描述符表项复制到 `fd3`！此时 $E_3$ 被关闭销毁，而 **`fd2` 和 `fd3` 共同指向同一个打开文件表项 $E_2$**（共享同一个 `pos`，初始为 `0`），`fd1` 依然独自指向 $E_1$（`pos = 0`）。

- **第 3 步（三次 `Read`）**：

  1. `Read(fd1, &c1, 1)`：从 $E_1$ 的 `pos = 0` 处读取第 1 个字符 `'a'`（$E_1.\text{pos}: 0 \to 1$），故 **`c1 = 'a'`**；

  2. `Read(fd2, &c2, 1)`：从 $E_2$ 的 `pos = 0` 处读取第 1 个字符 `'a'`（$E_2.\text{pos}: 0 \to 1$），故 **`c2 = 'a'`**；

  3. `Read(fd3, &c3, 1)`：因为 `fd3` 与 `fd2` 共享同一个表项 $E_2$，此时 $E_2.\text{pos}$ 已经是 `1`，所以紧接着读出第 2 个字符 `'b'`（$E_2.\text{pos}: 1 \to 2$），故 **`c3 = 'b'`**！

- **最终输出结果**：

  ```text
  c1 = a, c2 = a, c3 = b
  ```

### 5.2 习题 2：`fork()` 父子进程共享文件位置（`ffiles2.c`，Slide 49）

**题目**：假设文件 `fname` 的内容为 `"abcde"`，下面程序运行后会打印什么？

```c title="ffiles2.c (Slide 49)"
#include "csapp.h"
int main(int argc, char *argv[])
{
    int fd1;
    int s = getpid() & 0x1;
    char c1, c2;
    char *fname = argv[1];
    fd1 = Open(fname, O_RDONLY, 0);
    Read(fd1, &c1, 1);
    if (fork()) { /* Parent */
        sleep(s);
        Read(fd1, &c2, 1);
        printf("Parent: c1 = %c, c2 = %c\n", c1, c2);
    } else { /* Child */
        sleep(1-s);
        Read(fd1, &c2, 1);
        printf("Child: c1 = %c, c2 = %c\n", c1, c2);
    }
    return 0;
}
```

:spoiler[**点击展开 `ffiles2.c` 逐行状态追踪与标准答案**]

- **第 1 步（`fork` 之前）**：父进程打开文件得到 `fd1`（对应打开文件表项 $E_1$，`pos = 0`），并调用 `Read(fd1, &c1, 1)` 读出字符 `'a'`，此时 **`c1 = 'a'`**，且 $E_1.\text{pos}$ 推进到 **`1`**。

- **第 2 步（`fork()` 之后）**：子进程拷贝了父进程的栈变量（所以父子进程的 `c1` 都是 `'a'`，保存在同一变量 `s` 中的奇偶位也相同），并且**父子进程的 `fd1` 指向同一个打开文件表项 $E_1$（`refcnt = 2`，共享 `pos = 1`）**！

- **第 3 步（根据父进程 PID 奇偶位 `s` 分情况讨论）**：

  - **情况一：若父进程 PID 为偶数（`s = 0`）**：

    - 父进程 `sleep(0)` 先执行 `Read(fd1, &c2, 1)`，从共享的 `pos = 1` 读出 **`'b'`**（共享 `pos` 变为 `2`），打印 `Parent: c1 = a, c2 = b`；

    - 子进程 `sleep(1)` 后醒来执行 `Read(fd1, &c2, 1)`，从已被父进程推进到 `2` 的共享 `pos` 处读出 **`'c'`**，打印 `Child: c1 = a, c2 = c`。

  - **情况二：若父进程 PID 为奇数（`s = 1`）**：

    - 子进程 `sleep(0)` 先读出 `'b'` 打印 `Child: c1 = a, c2 = b`；父进程 `sleep(1)` 后读出 `'c'` 打印 `Parent: c1 = a, c2 = c`。

### 5.3 习题 3：`O_APPEND` 追加模式与 `dup` 混合覆盖写入（`ffiles3.c`，Slide 50）

**题目**：下面程序运行结束后，磁盘文件 `fname` 中的最终内容是什么？

```c title="ffiles3.c (Slide 50)"
#include "csapp.h"
int main(int argc, char *argv[])
{
    int fd1, fd2, fd3;
    char *fname = argv[1];
    fd1 = Open(fname, O_CREAT|O_TRUNC|O_RDWR, S_IRUSR|S_IWUSR);
    Write(fd1, "pqrs", 4);
    fd3 = Open(fname, O_APPEND|O_WRONLY, 0);
    Write(fd3, "jklmn", 5);
    fd2 = dup(fd1); /* Allocates descriptor */
    Write(fd2, "wxyz", 4);
    Write(fd3, "ef", 2);
    return 0;
}
```

:spoiler[**点击展开 `ffiles3.c` 逐行状态追踪与标准答案**]

1. **`fd1 = Open(..., O_CREAT|O_TRUNC|O_RDWR, ...)` + `Write(fd1, "pqrs", 4)`**：

   - 创建并清空文件，`fd1` 指向打开文件表项 $E_1$；写入 4 个字节后，文件内容变为 `"pqrs"`，**$E_1.\text{pos} = 4$**。

2. **`fd3 = Open(fname, O_APPEND|O_WRONLY, 0)` + `Write(fd3, "jklmn", 5)`**：

   - 再次调用 `Open` 创建了一个**全新的打开文件表项 $E_3$**（带有 `O_APPEND` 标志：每次 `write` 前内核都会原子地先将 $E_3.\text{pos}$ 移到当前文件末尾！）。

   - 向 `fd3` 写入 `"jklmn"`：追加在文件末尾（偏移 4 处），文件内容变为 **`"pqrsjklmn"`**（共 9 字节），$E_3.\text{pos} = 9$。但注意：**`fd1` 对应的表项 $E_1.\text{pos}$ 依然停留在 `4`**！

3. **`fd2 = dup(fd1)` + `Write(fd2, "wxyz", 4)`**：

   - `dup(fd1)` 分配一个新描述符 `fd2`，使其与 `fd1` **共享同一个打开文件表项 $E_1$**（当前 $E_1.\text{pos} = 4$）。

   - 向 `fd2` 写入 `"wxyz"`：从偏移量 `4` 开始写入 4 个字节，**直接覆盖掉了原先位置 `4..7` 上的 `"jklm"`**！文件内容变为 **`"pqrswxyzn"`**（第 8 个字节下标 8 的 `'n'` 未被覆盖），$E_1.\text{pos}$ 推进到 `8`。

4. **`Write(fd3, "ef", 2)`**：

   - `fd3` 对应表项 $E_3$ 带有 `O_APPEND` 属性，写入前自动定位到文件末尾（偏移 9 处），在 `'n'` 后面追加 `"ef"`！

- **最终文件内容**：**`"pqrswxyznef"`**（共 11 个字节）。

### 5.4 读取目录内容（Accessing Directories，Slide 51）

对目录唯一推荐的编程操作就是依次读取它的目录项（Entries），使用 `<dirent.h>` 中的 `opendir`、`readdir` 和 `closedir`：

```c title="使用 opendir / readdir / closedir 遍历目录条目 (Slide 51)"
#include <sys/types.h>
#include <dirent.h>

{
    DIR *directory;
    struct dirent *de;
    ...
    if (!(directory = opendir(dir_name)))
        error("Failed to open directory");
    ...
    while (0 != (de = readdir(directory))) {
        printf("Found file: %s\n", de->d_name);
    }
    ...
    closedir(directory);
}
```

## 六、复习检查

- [ ] 区分 Unix I/O、标准 I/O 与 RIO，正确处理不足值。
- [ ] 用描述符表、打开文件表和 v-node 表解释 fork、dup2 与文件位置共享。

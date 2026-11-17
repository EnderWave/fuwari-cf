---
title: CSAPP · 第 12 章 · 并发编程与线程同步
published: 2026-12-10
tags:
  - 计算机系统
  - csapp
  - 并发编程
  - 多线程
  - 信号量
  - 并行计算
category: 计算机系统
draft: false
description: 三种并发服务器架构（多进程、I/O 多路复用事件驱动、多线程 Pthreads）、C 线程共享变量精确判定模型、进度图（Progress Graph）与临界区、Dijkstra 信号量 P/V 原语、生产者-消费者 sbuf 包、读者-写者问题、预线程化并发服务器、四类线程不安全函数与可重入性、竞争与死锁消除、线程级并行（并行求和与并行快速排序、Amdahl 定律）及内存一致性与嗅探缓存。
---

## 导读


1. **12.1–12.3 三种并发编程范式（Concurrent Programming）**：迭代式服务器的致命缺陷（剖析第二个客户端究竟阻塞在哪里）、基于进程的并发服务器（`echoserverp.c`）、基于 I/O 多路复用的事件驱动服务器（`select`/`epoll`）、基于 POSIX 线程（`Pthreads`）的并发服务器（`echoservert.c`）。

2. **12.4–12.5 共享变量模型与信号量同步基础（Synchronization: Basics）**：多线程 C 程序的内存模型、变量实例映射与共享变量判定表（`sharing.c`）、计数器竞争剖析（`badcnt.c` 汇编拆解 $H_i, L_i, U_i, S_i, T_i$）、进度图（Progress Graphs）与不安全区（Unsafe Region）、Dijkstra 信号量 `P(s)`/`V(s)` 不变量 $s \ge 0$ 与互斥锁（`goodcnt.c`）。

3. **12.5–12.7 同步进阶、线程安全与死锁（Synchronization: Advanced）**：生产者-消费者有界缓冲区 `sbuf` 包完整实现、第一类与第二类读者-写者问题（`rw1.c`）、预线程化并发服务器（`echoservert_pre.c` + `pthread_once`）、四类线程不安全函数及改造方案、可重入函数（Reentrant Functions）、竞争消除（`race.c` $\to$ `norace.c`）与进度图死锁可视化及锁顺序破除法则。

4. **12.6 & 扩展：线程级并行与硬件内存一致性（Thread-Level Parallelism）**：多核处理器与超线程（Hyperthreading / SMT）微架构、并行求和三部曲（`psum-mutex` $\to$ `psum-array` $\to$ `psum-local`）、加速比 $S_p$ 与并行效率 $E_p$、Amdahl 定律、并行分治快速排序（`tqsort`），以及顺序一致性（Sequential Consistency）与嗅探缓存（Snoopy Caches）协议。

:::note[为什么并发编程如此困难？（Part 1 Slides 2–3）]

人类的思维方式天生是顺序的（Sequential），而在并发系统中，事件发生的先后顺序存在指数级种交错可能。并发程序最典型的三大顽疾包括：

1. **竞争（Races）**：程序的正确性依赖于系统中别处的任意调度决策（例如：谁抢到了飞机上的最后一个座位？）；

2. **死锁（Deadlock）**：不当的资源分配顺序导致多个控制流互相等待，没有任何一方能继续向前推进（例如：十字路口交通完全锁死）；

3. **活锁 / 饥饿 / 公平性（Livelock / Starvation / Fairness）**：外部事件或系统调度策略导致某个子任务被无限期推迟（例如：排队时总有人插到你前面）。

:::

:::tip[学习重点]

- 比较进程、I/O 多路复用和线程三种并发方案。
- 用共享状态与临界区分析竞争，用信号量、锁顺序和性能模型检查正确性与效率。

:::

## 一、迭代式服务器的缺陷与三种并发编程范式（Part 1 Slides 4–34）

### 1.1 当迭代式服务器忙于服务 Client 1 时，Client 2 究竟阻塞在哪一行？（Slides 4–6）

假设一个单线程迭代式服务器正在阻塞等待慢速的 `Client 1` 输入数据（比如 `Client 1` 的用户去吃午饭了），此时 `Client 2` 启动并依次调用 `open_clientfd`（含 `connect`）、`rio_writen` 和 `rio_readlineb`：

- **误区**：很多人以为 `Client 2` 会阻塞在 `connect` 上，因为服务器还没调用 `accept`！

- **真相（Slide 5，高频考点）**：

  1. **`Client 2` 的 `connect` 会立即成功返回！** 因为尽管服务器应用层尚未调用 `accept`，但服务器操作系统**内核中的 TCP 管理器**会自动完成三次握手并将该连接放入监听队列（即 **TCP listen backlog** 机制）。

  2. **`Client 2` 的 `rio_writen` 也会立即成功返回！** 因为服务器内核的 TCP 管理器会自动将 `Client 2` 发来的数据缓存在内核 Socket 接收缓冲区中。

  3. **`Client 2` 真正阻塞在 `rio_readlineb`（等待读响应）上！** 因为服务器应用层进程被卡在 `Client 1` 的 `read` 上，根本还没法去 `accept` 并给 `Client 2` 回写任何数据！

为了不让一个慢速客户端拖垮整个服务器，我们必须编写**并发服务器（Concurrent Servers）**，主要有三种架构方法（Slide 7）。

### 1.2 方法一：基于进程的并发服务器（Process-Based Servers，Slides 8–14）

每当主服务器（父进程）通过 `accept` 接收到一个新客户端连接 `connfd`，就立即调用 `fork()` 派生一个独立的子进程专门服务该客户端，而父进程立刻返回继续等待下一个 `accept`。

```c title="基于进程的并发 Echo 服务器完整实现 (echoserverp.c, Slides 9-10)" {6,12-16,18,22-27}
#include "csapp.h"
void echo(int connfd);

void sigchld_handler(int sig)
{
    /* 必须使用 while 循环 + WNOHANG 回收所有已终止的僵尸子进程！ */
    while (waitpid(-1, 0, WNOHANG) > 0)
        ;
    return;
}

int main(int argc, char **argv)
{
    int listenfd, connfd;
    socklen_t clientlen;
    struct sockaddr_storage clientaddr;

    Signal(SIGCHLD, sigchld_handler);
    listenfd = Open_listenfd(argv[1]);
    while (1) {
        clientlen = sizeof(struct sockaddr_storage);
        connfd = Accept(listenfd, (SA *)&clientaddr, &clientlen);
        if (Fork() == 0) {
            Close(listenfd); /* 子进程不需要监听套接字，必须关闭自己的 listenfd 副本 */
            echo(connfd);    /* 子进程服务客户端 */
            Close(connfd);   /* 子进程关闭已连接描述符 */
            exit(0);         /* 子进程退出 */
        }
        Close(connfd); /* 父进程必须关闭自己的 connfd 副本！（极其重要！） */
    }
}
```

:::important[基于进程的并发服务器两大保命铁律（Slide 13）]

1. **父进程必须安装 `SIGCHLD` 处理函数回收所有僵尸子进程（Reap zombie children）**：因为信号不排队，可能有多个子进程同时终止，所以处理函数内部必须使用 `while (waitpid(-1, 0, WNOHANG) > 0);` 循环非阻塞回收，避免内核内存泄漏。

2. **父进程和子进程必须各自关闭不用的描述符副本（特别是父进程必须 `Close(connfd)`）**：回忆第 10 章内核打开文件表——`fork()` 后父子进程共享同一个 `connfd` 打开文件表项，其引用计数 **`refcnt(connfd) = 2`**！如果父进程忘记调用 `Close(connfd)`，即便子进程结束了并调用了 `Close(connfd)`，`refcnt(connfd)` 也只会从 `2` 减为 `1`（永远不会归零），导致该连接永远不会被内核真正关闭，很快耗尽服务器文件描述符并造成内存泄漏！

:::

### 1.3 方法二：基于 I/O 多路复用的事件驱动服务器（Event-Based Servers，Slides 15–17）

在**单个进程、单个主控制流**中，服务器自己用数组维护当前所有活跃的客户端连接描述符集合（Active `connfd`s），并反复调用 **`select` 或 `epoll`** 等待事件发生：

- 当 `select`/`epoll` 通知监听描述符 `listenfd` 有输入到达时，说明有新客户端请求连接，服务器调用 `accept` 并将新 `connfd` 加入活跃连接池；

- 当通知某个已连接描述符 `connfd` 有待处理输入（Pending input）时，服务器就读取并服务该 `connfd` 的一行数据。

- **优缺点对比（Slide 17）**：

  - **优点**：单一逻辑控制流和单一地址空间，**完全没有进程/线程创建与上下文切换开销**，也不用加锁，且极易用 `gdb` 单步调试。因此成为了 Nginx、Node.js、Tornado 等高性能 Web 服务器的首选架构。

  - **缺点**：编码复杂度显著高于多进程/多线程；难以实现细粒度并发（若某个客户端只发来半行 HTTP 请求头，必须写成复杂的非阻塞状态机以防卡死整个事件循环）；且单线程无法直接利用多核 CPU。

### 1.4 方法三：基于线程的并发服务器与 POSIX 线程（Thread-Based Servers，Slides 18–34）

#### 重新认识进程与线程的关系（Slides 19–25）

- **传统观点**：$\text{Process} = \text{Process Context} + \text{Code, Data, and Stack}$。

- **现代多线程观点（Slide 20）**：

  $$

  \text{Process} = \underbrace{\text{Threads (栈 + 寄存器上下文 + TID)}}_{\text{可包含多个对等线程}} + \underbrace{\text{Code, Data, and Kernel Context}}_{\text{同一进程内所有线程共享}}

  $$

  - **每个线程独立拥有的上下文（Thread Context）**：唯一的线程 ID（`TID`）、独立的栈（`Stack`）、栈指针（`SP`）、程序计数器（`PC`）、条件码（Condition codes）和通用寄存器（GP registers）。

  - **所有线程共享的上下文**：整个进程虚拟地址空间的代码段（Read-only code）、全局变量数据段（Read/write data）、运行时堆（Run-time heap）、共享库，以及内核上下文（虚拟内存结构、**打开文件描述符表 Descriptor table**、`brk` 指针）。

- **线程 vs. 进程的两大差异（Slides 22, 25）**：

  1. **逻辑关系不同**：进程之间构成严格的**父子树状层级（Tree Hierarchy）**；而同一进程内的所有线程构成一个完全平等的**对等线程池（Pool of Peers）**，任何线程都可以等待或终止任何其他对等线程。

  2. **开销差距显著**：在 Linux 上，创建并回收一个进程大约需要 **$\sim 20,000$ 个时钟周期**，而创建并回收一个线程只需 **$\sim 10,000$ 个时钟周期（或更少）**，相差一倍以上。

#### Pthreads 核心接口与多线程并发 Echo 服务器实现（Slides 26–32）

```c title="基于线程的并发 Echo 服务器标准实现 (echoservert.c, Slides 29-30)" {12-15,21-25}
#include "csapp.h"
void echo(int connfd);
void *thread(void *vargp);

int main(int argc, char **argv)
{
    int listenfd, *connfdp;
    socklen_t clientlen;
    struct sockaddr_storage clientaddr;
    pthread_t tid;

    listenfd = Open_listenfd(argv[1]);
    while (1) {
        clientlen = sizeof(struct sockaddr_storage);
        connfdp = Malloc(sizeof(int)); /* 极重要：每次必须单独 malloc 一块堆内存存放 connfd！ */
        *connfdp = Accept(listenfd, (SA *)&clientaddr, &clientlen);
        Pthread_create(&tid, NULL, thread, connfdp);
    }
}

/* 对等工作线程例程 (Thread routine) */
void *thread(void *vargp)
{
    int connfd = *((int *)vargp);
    Pthread_detach(pthread_self()); /* 1. 设为分离态 (Detached)，终止时由内核自动回收内存资源 */
    Free(vargp);                    /* 2. 释放主线程动态分配的堆内存块 */
    echo(connfd);                   /* 3. 服务客户端 */
    Close(connfd);                  /* 4. 必须由工作线程关闭 connfd（主线程不关！因为共享同一张描述符表） */
    return NULL;
}
```

:::caution[多线程并发服务器的三大细节（Slides 29–32）]

1. **为什么主线程不能调用 `Close(connfd)`？** 因为同一进程内的所有线程**共享同一张文件描述符表**（`refcnt(connfd) == 1`）！一旦主线程关了 `connfd`，对等线程手里的 `connfd` 也就瞬间失效关闭了。

2. **为什么要调用 `Pthread_detach(pthread_self())`？** 线程默认创建为**可结合态（Joinable）**，必须由其他线程显式调用 `pthread_join` 回收，否则其栈和线程描述符永远不会释放；调用 `pthread_detach` 将其变为**分离态（Detached）**后，线程结束时内核会自动回收其所有资源。

3. **为什么每次 `Accept` 前都必须 `connfdp = Malloc(sizeof(int))`？如果直接传栈变量地址 `&connfd` 会怎样？**

   - 如果写成 `connfd = Accept(...); Pthread_create(&tid, NULL, thread, &connfd);`，主线程栈上的同一个 `connfd` 变量会被所有新创建的线程共享！如果在刚创建的线程 1 执行 `int connfd = *((int *)vargp);` 解引用之前，主线程已经进入下一轮循环并完成了第二次 `Accept` 覆写了 `connfd`，那么线程 1 和线程 2 就会拿到同一个新描述符，而第一个客户端连接则彻底无人处理（详见第三部分 3.4 节竞争剖析）！

:::

## 二、共享变量判定模型、进度图与信号量同步基础（Part 2 Slides 1–25）

### 2.1 C 多线程程序中哪些变量是共享的？（Part 2 Slides 2–7）

**误区**：“全局变量是共享的，栈上的局部变量是私有的”——**这是不准确的！**

因为在线程内存模型中，虽然寄存器是硬件严格隔离保护的，但**虚拟地址空间是共享的，任何一个线程只要拿到指针，就能直接读写任何其他线程的栈（Any thread can read and write the stack of any other thread）**！

**共享变量的严格定义**：一个变量 `x` 是**共享的（Shared）**，当且仅当**有多个线程引用（Reference）了变量 `x` 的某一个实例（Instance）**。

C 程序中三类变量映射到内存实例的规则如下（Slide 5）：

1. **全局变量（Global variables）**：声明在函数外部，整个虚拟内存的数据段中**有且仅有 1 个实例**（记作 `x`）。

2. **局部自动变量（Local automatic variables）**：声明在函数内部且不带 `static` 关键字，**每个调用该函数的线程栈上各自拥有 1 个独立实例**（例如主线程栈上的 `i.m`，对等线程 0 栈上的 `myid.p0`，对等线程 1 栈上的 `myid.p1`）。

3. **局部静态变量（Local static variables）**：声明在函数内部且带有 `static` 关键字，整个虚拟内存的读写数据段中**有且仅有 1 个实例**，所有线程共用这同一个实例！

#### 经典例题：`sharing.c` 共享变量全实例判定表（Slides 4, 6–7）

```c title="sharing.c：分析每个变量的内存实例与共享性 (Slides 4, 6)"
char **ptr; /* 全局变量：数据段中只有 1 个实例 ptr */

int main()
{
    long i;                       /* 局部自动变量：主线程栈上 1 个实例 i.m */
    pthread_t tid;
    char *msgs[2] = {             /* 局部自动变量：主线程栈上 1 个实例 msgs.m */
        "Hello from foo",
        "Hello from bar"
    };
    ptr = msgs;                   /* 将主线程栈上局部变量 msgs.m 的首地址赋给全局指针 ptr！ */
    for (i = 0; i < 2; i++)
        Pthread_create(&tid, NULL, thread, (void *)i);
    Pthread_exit(NULL);
}

void *thread(void *vargp)
{
    long myid = (long)vargp;      /* 局部自动变量：每个对等线程栈上各 1 个实例 myid.p0, myid.p1 */
    static int cnt = 0;           /* 局部静态变量：数据段中只有 1 个实例 cnt！ */
    printf("[%ld]: %s (cnt=%d)\n", myid, ptr[myid], ++cnt);
    return NULL;
}
```

| 变量实例（Variable Instance） | 主线程（main）是否引用？ | 对等线程 0（p0）是否引用？ | 对等线程 1（p1）是否引用？ | 最终判定结论 |
| :--- | :---: | :---: | :---: | :--- |
| **`ptr`**（全局变量，1 个实例） | **yes** (`ptr = msgs`) | **yes** (`ptr[myid]`) | **yes** (`ptr[myid]`) | **共享（Shared）** |
| **`cnt`**（局部静态变量，1 个实例） | no | **yes** (`++cnt`) | **yes** (`++cnt`) | **共享（Shared）** |
| **`i.m`**（主线程局部变量，1 个实例） | **yes** (`for` 循环) | no（按值传参 `(void *)i`） | no | **非共享（Not shared）** |
| **`msgs.m`**（主线程局部变量，1 个实例） | **yes** | **yes**（通过 `ptr[0]` 间接引用！） | **yes**（通过 `ptr[1]` 间接引用！） | **共享（Shared）！** |
| **`myid.p0`**（线程 0 栈变量） | no | **yes** | no | **非共享（Not shared）** |
| **`myid.p1`**（线程 1 栈变量） | no | no | **yes** | **非共享（Not shared）** |

### 2.2 同步错误剖析：`badcnt.c` 汇编拆解与进度图（Slides 9–17）

在 `badcnt.c` 中，两个线程各自对全局共享计数器 `volatile long cnt = 0;` 执行 `niters`（如 `10000`）次 `cnt++`。按理最终 `cnt` 应为 `20000`，但实际运行经常打出 `BOOM! cnt=13051` 等随机偏小结果！

#### 原因剖析：一行 C 代码 `cnt++` 绝不是原子操作！（Slide 10）

编译器将线程 $i$ 的计数循环体编译为以下 5 个阶段的机器指令序列：

```asm title="线程 i 计数循环的 x86-64 汇编五阶段拆解 (Slide 10)"
    movq (%rdi), %rcx        # \
    testq %rcx, %rcx         #  |--> Hi (Head): 循环头指令块
    jle .L2                  #  |
    movl $0, %eax            # /
.L3:
    movq cnt(%rip), %rdx     # ----> Li (Load cnt):   第 1 步，从内存加载 cnt 到线程私有寄存器 %rdx_i
    addq $1, %rdx            # ----> Ui (Update cnt): 第 2 步，在私有寄存器 %rdx_i 中加 1
    movq %rdx, cnt(%rip)     # ----> Si (Store cnt):  第 3 步，将 %rdx_i 写回内存中的共享变量 cnt
    addq $1, %rax            # \
    cmpq %rcx, %rax          #  |--> Ti (Tail): 循环尾指令块
    jne .L3                  # /
.L2:
```

- **正确交错示例（Slide 11）**：$H_1 \to L_1 \to U_1 \to S_1 \to H_2 \to L_2 \to U_2 \to S_2 \to T_2 \to T_1$。线程 1 先完整执行完 $L_1, U_1, S_1$ 将 `cnt` 更新为 `1`，线程 2 随后执行 $L_2, U_2, S_2$ 读出 `1` 并更新为 `2`，结果正确（`OK`）。

- **错误交错示例（Slides 12–13）**：$H_1 \to L_1 \to U_1 \to H_2 \to L_2 \to S_1 \to T_1 \to U_2 \to S_2 \to T_2$。线程 1 刚把 `0` 读进 `%rdx_1` 加成 `1` 还没写回内存（$S_1$ 之前），线程 2 就插进来执行了 $L_2$，把内存里还是 `0` 的 `cnt` 读进了 `%rdx_2`！结果两个线程最后都往 `cnt` 写入了 `1`，白白丢失了一次自增（`Oops!`）！

#### 进度图（Progress Graphs）、临界区与不安全区（Slides 14–17）

我们将两个并发线程的执行过程建模为二维平面上的**进度图（Progress Graph）**：

- 横轴表示线程 1 依次执行的指令 $(H_1, L_1, U_1, S_i, T_1)$，纵轴表示线程 2 依次执行的指令 $(H_2, L_2, U_2, S_2, T_2)$；

- 图中的每个格点代表一个执行状态 $(\text{Inst}_1, \text{Inst}_2)$，一条从原点出发、**只能向右（线程 1 推进）或向上（线程 2 推进）**的折线路径称为一条**执行轨迹（Trajectory）**。

- **临界区（Critical Section）与不安全区（Unsafe Region，Slide 16）**：

  - 指令序列 **$L_i, U_i, S_i$** 构成了关于共享变量 `cnt` 的**临界区（Critical Section）**；

  - 两个线程的临界区指令绝对不能相互交错执行！在进度图上，横轴区間 $[L_1, S_1]$ 与纵轴区间 $[L_2, S_2]$ 围成的矩形内部状态集合（即两个线程同时处于各自临界区内的状态）称为**不安全区（Unsafe Region）**。

  - **安全轨迹定理（Slide 17）**：一条轨迹是安全的（Safe，即最终 `cnt` 结果正确），**当且仅当该轨迹不进入任何不安全区（绕着不安全区的左上侧或右下侧走）**！

### 2.3 Dijkstra 信号量（Semaphores）与互斥锁原理（Slides 18–25）

如何从机制上保证任何轨迹都绝不可能踏入不安全区？计算机科学先驱 Edsger Dijkstra 提出了经典的同步原语——**信号量（Semaphore）**。

信号量 `s` 是一个具有**非负整数值**的全局同步变量，只能通过以下两种原子操作来访问（Slide 19）：

1. **`P(s)`（在 POSIX 中为 `sem_wait(&s)`）**：

   - 若 $s > 0$，则**原子地（Atomically）**将 $s$ 减 1 并立即返回；

   - 若 $s == 0$，则挂起（Suspend）当前线程，直到另一个线程执行 `V(s)` 使 $s > 0$ 并唤醒该线程；线程被唤醒重启后，完成将 $s$ 减 1 的操作并返回。

2. **`V(s)`（在 POSIX 中为 `sem_post(&s)`）**：

   - **原子地**将 $s$ 加 1；

   - 若此时有任何线程阻塞在 `P(s)` 操作上等待 $s$ 变为非零，则唤醒其中**恰好一个**等待线程，由它完成减 1 操作并返回。

:::important[信号量不变量（Semaphore Invariant）与禁止区（Forbidden Region，Slide 24）]

`P` 和 `V` 的原子定义保证了**信号量不变量：在任何时刻恒有 $s \ge 0$（信号量 $s$ 的值绝不可能变成负数）**！

当我们将信号量 `mutex` 初始化为 `1`（称为**二元信号量 Binary Semaphore / 互斥锁 Mutex**），并在临界区 $L_i, U_i, S_i$ 前后套上 `P(&mutex)` 和 `V(&mutex)` 时：

- 如果线程 1 和线程 2 同时越过各自的 `P(s)` 进入临界区，信号量 $s$ 就必须被减两次，变成 **$s = 1 - 1 - 1 = -1$**！

- 由于信号量不变量禁止 $s < 0$，进度图中所有对应 $s = -1$ 的状态点就构成了一个硬件/内核级不可逾越的**禁止区（Forbidden Region）**，它把原本的**不安全区（Unsafe Region）完完整整地包裹在内部**！因此，任何合法的执行轨迹都被物理阻挡在不安全区之外，100% 保证了互斥访问（`goodcnt.c` 永远输出 `OK cnt=20000`）。

:::

## 三、同步进阶、经典同步模型、线程安全与死锁（Part 3 Slides 1–36）

信号量不仅可以用于**互斥（Mutual Exclusion，初始值为 1 的二元信号量）**，还可以用于**调度协调（Scheduling / Coordination，用计数信号量 Counting Semaphores 跟踪可用资源数量并通知其他线程某个条件已成立）**。讲义深入剖析了两大经典协调模型与一个综合服务器实战。

### 3.1 经典模型一：有限缓冲区上的生产者-消费者问题与 `sbuf` 包（Slides 5–10）

在多媒体处理（生成视频帧 vs. 渲染视频帧）、GUI 事件队列或预线程化服务器中，**生产者线程（Producer）** 反复等待空槽位（Slot）、插入项目（Item）并通知消费者；**消费者线程（Consumer）** 反复等待可用项目、取出项目并通知生产者。

对于一个容量为 $n$ 的循环队列缓冲区 `sbuf_t`，我们需要 **1 个互斥锁 + 2 个计数信号量**：

- **`mutex`（初值为 `1`）**：保护对缓冲区数组及队头/队尾指针 `front`/`rear` 的互斥访问；

- **`slots`（初值为 `n`）**：记录当前缓冲区中剩余的**空槽位数量**；

- **`items`（初值为 `0`）**：记录当前缓冲区中已有的**可用数据项数量**。

```c title="sbuf 有界共享缓冲区包完整声明与实现 (sbuf.h & sbuf.c, Slides 7-10)" {26-31,36-41}
typedef struct {
    int *buf;    /* 动态分配的循环队列数组 */
    int n;       /* 最大槽位数 */
    int front;   /* buf[(front+1)%n] 是队首第一个元素 */
    int rear;    /* buf[rear%n] 是队尾最后一个元素 */
    sem_t mutex; /* 保护 buf 并发读写的互斥锁 (初值 1) */
    sem_t slots; /* 统计可用空槽位数 (初值 n) */
    sem_t items; /* 统计可用数据项数 (初值 0) */
} sbuf_t;

void sbuf_init(sbuf_t *sp, int n) {
    sp->buf = Calloc(n, sizeof(int));
    sp->n = n;
    sp->front = sp->rear = 0;
    Sem_init(&sp->mutex, 0, 1);
    Sem_init(&sp->slots, 0, n);
    Sem_init(&sp->items, 0, 0);
}

void sbuf_deinit(sbuf_t *sp) {
    Free(sp->buf);
}

/* 生产者调用：向缓冲区尾部插入一个元素 item */
void sbuf_insert(sbuf_t *sp, int item) {
    P(&sp->slots);                          /* 1. 等待可用空槽位（若满则阻塞） */
    P(&sp->mutex);                          /* 2. 加锁保护缓冲区 */
    sp->buf[(++sp->rear) % (sp->n)] = item; /* 3. 插入数据项 */
    V(&sp->mutex);                          /* 4. 解锁缓冲区 */
    V(&sp->items);                          /* 5. 通知消费者可用数据项 +1 */
}

/* 消费者调用：从缓冲区头部移除并返回一个元素 */
int sbuf_remove(sbuf_t *sp) {
    int item;
    P(&sp->items);                           /* 1. 等待可用数据项（若空则阻塞） */
    P(&sp->mutex);                           /* 2. 加锁保护缓冲区 */
    item = sp->buf[(++sp->front) % (sp->n)]; /* 3. 取出数据项 */
    V(&sp->mutex);                           /* 4. 解锁缓冲区 */
    V(&sp->slots);                           /* 5. 通知生产者可用空槽位 +1 */
    return item;
}
```

:::caution[致命陷阱：为什么 `P(&sp->slots)` 必须放在 `P(&sp->mutex)` 外面？]

如果生产者先把 `P(&sp->mutex)` 锁住再去调 `P(&sp->slots)`，一旦缓冲区已满（`slots == 0`），生产者就会**带着互斥锁 `mutex` 进入睡眠阻塞**！此时消费者想去调 `sbuf_remove` 消费数据腾出空位，却在 `P(&sp->mutex)` 处永远拿不到锁，双方瞬间陷入**死锁（Deadlock）**！因此**永远要先 `P` 资源计数信号量（`slots`/`items`），最后再 `P` 互斥锁 `mutex`**！

:::

### 3.2 经典模型二：读者-写者问题（Readers-Writers Problem，Slides 11–13）

**问题描述**：一组并发线程访问同一个共享对象（如在线机票预订库、多线程 Web 代理缓存）：

- **读者线程（Readers）** 只读取对象，**不限制同时读取的读者数量（多个读者可以同时在临界区内并发读）**；

- **写者线程（Writers）** 修改对象，**写者必须拥有对对象的绝对独占访问权**（写者工作时，既不能有其他写者，也不能有任何读者）。

根据优先级倾向，分为两类变体（注意：**两类变体都可能发生饥饿 Starvation！**）：

1. **第一类读者-写者问题（First readers-writers problem，读者优先）**：只要当前没有写者正在使用对象，任何到达的读者都不需要等待（哪怕此时已经有写者在排队等待，后到的读者依然可以插队直接进去读！这可能导致写者无限期饥饿）。

2. **第二类读者-写者问题（Second readers-writers problem，写者优先）**：一旦有写者准备好要写，它应当尽可能快地完成写入；在等待的写者之后到达的读者必须排在写者后面等待（这可能导致读者饥饿）。

```c title="第一类读者-写者问题（读者优先）标准实现 (rw1.c, Slide 13)" {10-12,18-20}
int readcnt;    /* 统计当前正在读的读者数量，初值为 0 */
sem_t mutex, w; /* 初值均为 1：mutex 保护 readcnt，w 控制对共享对象的写独占锁 */

void reader(void)
{
    while (1) {
        P(&mutex);
        readcnt++;
        if (readcnt == 1) /* 第一个进入的读者负责替所有读者锁住写者锁 w！ */
            P(&w);
        V(&mutex);

        /* Critical section: Reading happens (多个读者可同时在此并发读取！) */

        P(&mutex);
        readcnt--;
        if (readcnt == 0) /* 最后一个离开的读者负责释放写者锁 w，唤醒等待的写者！ */
            V(&w);
        V(&mutex);
    }
}

void writer(void)
{
    while (1) {
        P(&w);
        /* Critical section: Writing happens (完全独占！) */
        V(&w);
    }
}
```

### 3.3 综合架构：预线程化并发服务器（Prethreaded Concurrent Server，Slides 14–18）

在前面的 `echoservert.c` 中，每来一个客户端连接都要现场调用 `pthread_create` 创建一个新线程，仍有一定创建开销。结合生产者-消费者 `sbuf` 包，我们可以构建工业级的**预线程化并发服务器（Prethreaded Concurrent Server）**：

- 服务器启动时一次性预先创建好一个包含 `NTHREADS` 个工作线程的**线程池（Pool of worker threads）**；

- **主线程（Master thread，生产者）** 只做一件事：不断 `Accept` 新连接，并调用 `sbuf_insert(&sbuf, connfd)` 将已连接描述符放入共享缓冲区；

- **工作线程（Worker threads，消费者）** 在死循环中调用 `sbuf_remove(&sbuf)` 取出 `connfd` 并调用 `echo_cnt(connfd)` 服务客户端（无需在每次请求时创建/销毁线程！）。

```c title="预线程化并发服务器完整实现 (echoservert_pre.c & echo_cnt.c, Slides 15-18)" {28-30}
sbuf_t sbuf; /* 已连接描述符的共享有界缓冲区 */

int main(int argc, char **argv) {
    int i, listenfd, connfd;
    socklen_t clientlen;
    struct sockaddr_storage clientaddr;
    pthread_t tid;

    listenfd = Open_listenfd(argv[1]);
    sbuf_init(&sbuf, SBUFSIZE);
    for (i = 0; i < NTHREADS; i++) /* 预先创建 NTHREADS 个工作线程 */
        Pthread_create(&tid, NULL, thread, NULL);
    while (1) {
        clientlen = sizeof(struct sockaddr_storage);
        connfd = Accept(listenfd, (SA *)&clientaddr, &clientlen);
        sbuf_insert(&sbuf, connfd); /* 生产者：将 connfd 插入共享队列 */
    }
}

void *thread(void *vargp) {
    Pthread_detach(pthread_self());
    while (1) {
        int connfd = sbuf_remove(&sbuf); /* 消费者：从队列取出 connfd（空则自动阻塞） */
        echo_cnt(connfd);                /* 服务客户端 */
        Close(connfd);
    }
}

/* echo_cnt.c：统计所有客户端累计接收字节数的线程安全服务函数 */
static int byte_cnt;
static sem_t mutex;
static void init_echo_cnt(void) {
    Sem_init(&mutex, 0, 1);
    byte_cnt = 0;
}

void echo_cnt(int connfd) {
    int n;
    char buf[MAXLINE];
    rio_t rio;
    static pthread_once_t once = PTHREAD_ONCE_INIT;

    Pthread_once(&once, init_echo_cnt); /* 保证第一个到达的线程只执行唯一一次初始化！ */
    Rio_readinitb(&rio, connfd);
    while ((n = Rio_readlineb(&rio, buf, MAXLINE)) != 0) {
        P(&mutex);
        byte_cnt += n;
        printf("thread %d received %d (%d total) bytes on fd %d\n",
               (int)pthread_self(), n, byte_cnt, connfd);
        V(&mutex);
        Rio_writen(connfd, buf, n);
    }
}
```

### 3.4 线程安全（Thread Safety）、四类线程不安全函数与可重入函数（Slides 19–26）

**线程安全定义**：一个函数被称为**线程安全的（Thread-safe）**，当且仅当它被多个并发线程反复调用时，总是能够产生正确的结果。

所有线程不安全函数（Thread-unsafe functions）可分为以下 **4 大类**（Slides 19–25）：

| 类别 | 特征与典型反例 | 标准修复方案 |
| :--- | :--- | :--- |
| **第 1 类（Class 1）** | **不保护共享变量的函数**（如 `badcnt.c` 中直接自增全局 `cnt`）。 | 用 `P(&mutex)` 和 `V(&mutex)` 信号量操作保护所有对共享变量的访问（优点：无需改调用者接口；缺点：加锁降低性能）。 |
| **第 2 类（Class 2）** | **跨越多次调用保持持久状态的函数**（典型代表：伪随机数生成器 `rand()`，其内部依赖静态全局变量 `static unsigned int next = 1;`）。 | **唯一办法是重写函数，使其变为可重入函数（Reentrant）**！不再用全局静态变量，而是让调用者把状态指针作为参数传进来（如标准库提供的 **`int rand_r(int *nextp)`**）。 |
| **第 3 类（Class 3）** | **返回指向静态变量指针的函数**（典型代表：`ctime`, `asctime`, `localtime`, `gethostbyname`, `gethostbyaddr`, `inet_ntoa`，它们把计算结果存在内部 `static` 缓冲区中并返回其地址，其他线程一调用就会覆写该缓冲区）。 | • **方案 1**：重写函数，让调用者传入存放结果的私有缓冲区地址（如 `ctime_r`）；<br>• **方案 2（当无法修改原库函数源码时）**：使用 **加锁-复制（Lock-and-Copy）** 包装函数（见下方 `ctime_ts` 代码）。 |
| **第 4 类（Class 4）** | **调用了线程不安全函数的函数**。 | 注意：**未必总是线程不安全的**！如果它调用的是第 1、3 类函数且外层加了互斥锁，它可以变成线程安全的；但如果它直接裸调了第 2 类函数（如 `rand()`），就必须改调可重入版本（如 `rand_r()`）。 |

```c title="第 3 类线程不安全函数的 Lock-and-Copy 包装范式 (ctime_ts, Slide 23)"
char *ctime_ts(const time_t *timep, char *privatep)
{
    char *sharedp;
    P(&mutex);                  /* 1. 加锁防止其他线程并发调用 ctime 覆写静态缓冲区 */
    sharedp = ctime(timep);
    strcpy(privatep, sharedp);  /* 2. 在解锁前将结果深拷贝到调用者提供的私有缓冲区 privatep 中 */
    V(&mutex);                  /* 3. 解锁并返回私有缓冲区指针 */
    return privatep;
}
```

#### 可重入函数（Reentrant Functions，Slides 25–26）

:::note[定义]

当一个函数被多个线程调用时，如果它**完全不访问任何共享变量（Accesses no shared variables）**，则称该函数是**可重入的（Reentrant）**。

:::

- **集合包含关系**：**可重入函数是线程安全函数的一个真子集（$\text{Reentrant} \subsetneq \text{Thread-Safe}$）**。因为可重入函数只使用局部变量和传入参数，完全不需要任何加锁同步开销，因此效率远高于靠加锁实现线程安全的函数！

- **Linux 常见线程不安全库函数及其可重入替代版本速查表（Slide 26）**：

| 线程不安全函数 | 所属类别 | 标准可重入版本（Reentrant Version） | 现代推荐替代方案 |
| :--- | :---: | :--- | :--- |
| `rand` | Class 2 | `rand_r` | `rand_r` |
| `asctime` / `ctime` / `localtime` | Class 3 | `asctime_r` / `ctime_r` / `localtime_r` | 带 `_r` 后缀版本 |
| `gethostbyaddr` / `gethostbyname` | Class 3 | `gethostbyaddr_r` / `gethostbyname_r` | **`getnameinfo` / `getaddrinfo`** |
| `inet_ntoa` | Class 3 | *(无 `_r` 版本)* | **`inet_ntop` / `getnameinfo`** |

### 3.5 竞争（Races）与死锁（Deadlock）的诊断及消除（Slides 27–36）

#### 1. 传递主线程栈变量地址引发的竞争（`race.c` vs. `norace.c`，Slides 27–31）

在 `race.c` 中，主线程在循环 `for (i = 0; i < N; i++) Pthread_create(&tid[i], NULL, thread, &i);` 中直接将循环变量 `i` 的地址 `&i` 传给每个对等线程，对等线程执行 `int myid = *((int *)vargp);`。

- **竞争根源**：主线程执行 `i++` 与对等线程执行 `*((int *)vargp)` 解引用之间发生了数据竞争！在多核服务器上实测 100 个线程（Slide 30），有的 `i` 值被多达 12 个线程重复读到，而许多 `i` 值根本没被任何线程读到！

- **消除竞争的标准方法（`norace.c`，Slide 31）**：在每次循环中调用 **`ptr = Malloc(sizeof(int)); *ptr = i;`** 为每个线程动态分配一块独立的堆内存传递 ID，并由对等线程在读取完 `*vargp` 后调用 **`Free(vargp);`**（或者直接按值强制转换传递 `(void *)(long)i`）。

#### 2. 信号量死锁的进度图可视化与锁顺序破除法则（Slides 32–36）

假设两个线程都需要同时获取两把互斥锁 $s_0$ 和 $s_1$（初值均为 1），但**加锁顺序相反**：

- **线程 0**：`P(s0); P(s1); cnt++; V(s0); V(s1);`

- **线程 1**：`P(s1); P(s0); cnt++; V(s1); V(s0);`

```
Thread 1
  ^
V(s0) |       +-------------------+
      |       | Forbidden region  |
V(s1) |       |      for s0       |-------+
      |       |                   |       |
P(s0) |       +-------------------+       |
      |       :  Deadlock :* <-- Deadlock |
      |       :  region   :      state    |
P(s1) |       +-----------+---------------+
      |                   | Forbidden     |
      |                   | region for s1 |
  ----+-------+-------+---+-------+-------+---> Thread 0
   s0=s1=1  P(s0)   P(s1)       V(s0)   V(s1)
```

- **进度图死锁区域剖析（Slide 34）**：

  - $s_0$ 的禁止区与 $s_1$ 的禁止区在左下方形成了一个带有左下凹角的交叠区域，称为**死锁区（Deadlock Region）**！

  - 一旦执行轨迹踏入这个死锁区（即线程 0 已经执行完 `P(s0)`，同时线程 1 已经执行完 `P(s1)`），轨迹向右走会被 $s_1$ 的禁止区挡住，向上走会被 $s_0$ 的禁止区挡住，最终必然卡死在右上角交点——**死锁状态（Deadlock State）**，双方永远等待对方释放锁！

- **破除死锁的黄金法则（Slides 35–36）**：

  **所有线程必须严格按照完全相同的顺序获取所有共享锁（Acquire shared resources in the same order）！**

  例如让线程 0 和线程 1 一律先执行 `P(&mutex[0])`，再执行 `P(&mutex[1])`（至于解锁 `V` 的先后顺序则完全无关紧要）。此时在进度图上，$s_0$ 的禁止区与 $s_1$ 的禁止区呈阶梯状完全嵌套对齐，左下方的凹角死锁区彻底消失，任何轨迹都绝无可能被卡住！

## 四、线程级并行（TLP）、Amdahl 定律与硬件内存一致性（Part 4 Slides 1–43）

### 4.1 多核处理器（Multicore）与超线程（Hyperthreading / SMT，Slides 3–7）

除了用多线程处理慢速 I/O，现代 CPU 还允许我们将一个计算密集型大任务拆分为多个并行子任务，利用硬件并行性加速执行：

1. **多核处理器（Multicore Processor，Slide 4）**：单颗芯片上集成多个独立处理器核心（Core $0 \dots \text{Core } n-1$），每个核心拥有私有的寄存器堆、L1 d-cache、L1 i-cache 和 L2 unified cache，所有核心共享片上 L3 unified cache 和主存。

2. **超线程（Hyperthreading，又称同时多线程 Simultaneous Multi-Threading, SMT，Slides 5–6）**：

   - 在单个乱序执行（Out-of-Order）处理器核心内部，算术运算单元（Int Arith, FP Arith, Load/Store）往往因为某个线程发生缓存不命中或分支预测惩罚而闲置。

   - **硬件实现**：只复制多份**指令控制流与架构状态硬件**（例如复制 $K=2$ 份寄存器堆 `Reg A`/`Reg B`、程序计数器 `PC A`/`PC B`、操作队列 `Op. Queue A`/`Op. Queue B`），而让这 $K$ 个硬件线程**共享同一套底层功能执行单元（Functional Units）和高速缓存**！

   - 例如講义中的基准测试机 **Shark Machine（Intel Xeon E5520，Slide 7）** 拥有 **8 个物理核心**，每个核心支持 **2 路超线程（2x Hyperthreading）**，因此操作系统可见一共 **16 个逻辑处理器核**。

### 4.2 并行求和三部曲：从性能下降到 16 倍提速（Slides 8–16）

**任务**：计算 $0 + 1 + \dots + (n-1) = \frac{n(n-1)}{2}$（取 $n = 2^{31}$），将区间均分为 $t$ 段交给 $t$ 个线程并行累加。讲义对比了三种实现方案在 8 核 16 线程 Shark Machine 上的实测运行时间（秒）：

| 实现版本 | 核心代码逻辑 | 1 线程 (1 核) | 2 线程 (2 核) | 4 线程 (4 核) | 8 线程 (8 核) | 16 线程 (8 核超线程) | 性能表现与底层原因剖析 |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **`psum-mutex`**<br>(Slides 9–12) | 循环内每次加法都加锁累加到全局变量：<br>`P(&mutex); gsum += i; V(&mutex);` | `51 s` | `456 s` | `790 s` | `536 s` | `681 s` | **灾难级负优化！** 不仅单线程因频繁原子锁极慢，而且核数越多越慢（多核争抢同一把锁导致极高同步开销与缓存行乒乓失效）。 |
| **`psum-array`**<br>(Slides 13–14) | 去掉互斥锁，线程 `myid` 在循环内直接累加到全局数组元素：<br>`psum[myid] += i;` | `5.36 s` | `4.24 s` | `2.54 s` | `1.64 s` | `0.94 s` | **比 `psum-mutex` 快上百倍！** 消除了锁同步开销，但每次循环仍需读写内存（L1 Cache）中的 `psum[myid]`。 |
| **`psum-local`**<br>(Slides 15–16) | 线程在循环内先累加到**局部自动变量（寄存器）** `sum += i;`，循环结束后只写一次 `psum[myid] = sum;` | **`1.98 s`** | **`1.14 s`** | **`0.60 s`** | **`0.32 s`** | **`0.33 s`** | **最快方案！** 将内层循环中的内存读写彻底消除，全部在 CPU 私有寄存器中完成累加，8 核仅需 `0.32 秒`（比 `psum-mutex` 快 **2400 多倍**！）。 |

:::important[并行编程第一铁律（Slide 38）]

**内层紧循环必须完全无同步且尽量减少共享内存访问（Inner loops must be synchronization free）！** 永远让每个线程在自己的局部寄存器变量上完成密集计算，只在最后汇总阶段访问一次共享内存或加一次锁。

:::

### 4.3 并行程序性能度量指标与 Amdahl 定律（Slides 17–20）

设使用 $k$ 个处理器核时的运行时间为 $T_k$，定义两大核心指标（Slide 17）：

1. **加速比（Speedup $S_p$）**：

   $$

   S_p = \frac{T_1}{T_p}

   $$

   - 若 $T_1$ 是**并行版本代码在 1 个核上**的运行时间，称为**相对加速比（Relative Speedup）**；

   - 若 $T_1$ 是**专门编写的最佳串行版本代码在 1 个核上**的运行时间，称为**绝对加速比（Absolute Speedup）**（绝对加速比更能真实衡量并行的收益）。

2. **并行效率（Efficiency $E_p$）**：

   $$

   E_p = \frac{S_p}{p} = \frac{T_1}{p T_p} \in (0, 100\%]

   $$

   用于衡量因线程创建、同步和通信带来的并行化额外开销（例如 `psum-local` 在 $p=8$ 核时 $T_1 = 1.98\text{ s}, T_8 = 0.32\text{ s} \implies S_8 = 6.19,\; E_8 = 6.19 / 8 \approx 77\%$）。

#### Amdahl 定律（Amdahl's Law，Slides 19–20）

设整个任务串行执行总时间为 $T$，其中**可以被并行加速的部分占总时间的比例为 $p$**（$0 \le p \le 1$），不可并行的纯串行部分占比为 $1 - p$。若将可并行部分加速 $k$ 倍，则总运行时间 $T_k$ 为：

$$

T_k = \frac{p T}{k} + (1 - p) T

$$

当并行度趋于无穷大（$k \to \infty$）时，理论最短可能运行时间受限于串行瓶颈：

$$

T_\infty = \lim_{k \to \infty} T_k = (1 - p) T, \quad S_\infty = \frac{T}{T_\infty} = \frac{1}{1 - p}

$$

- **课堂例题（Slide 20）**：若总时间 $T = 10$，可并行比例 $p = 0.9$，并行加速因子 $k = 9$，则：

  $$

  T_9 = \frac{0.9 \times 10}{9} + 0.1 \times 10 = 1.0 + 1.0 = 2.0, \quad T_\infty = 0.1 \times 10 = 1.0

  $$

### 4.4 分治并行实例：多线程快速排序（Parallel Quicksort，Slides 21–37）

对包含 $N = 2^{27} = 134,217,728$ 个随机数的数组进行并行快速排序（`tqsort`）：

- **基本思想（Slides 25–32）**：设定一个串行阈值 `nele_max_sort_serial = N / Serial_Fraction`（其中 `Serial_Fraction` $F$ 为切分因子）：

  - **小规模子任务（`nele <= nele_max_sort_serial`）**：不再派生新线程，直接由当前线程调用串行快速排序 `qsort_serial(base, nele)` 原地排好；

  - **大规模子任务（`nele > nele_max_sort_serial`）**：选定主元 `pivot` 执行划分 `m = partition(base, nele)`，将数组分为左半部分 $L$（$\le p$）和右半部分 $R$（$\ge p$），然后递归派生新线程分别对 $L$ 和 $R$ 排序。

- **性能曲线与 Amdahl 定律瓶颈分析（Slides 33–37）**：

  - 在 Shark Machine 上实测最佳加速比为 **$6.84\times$**（当串行切分因子 $F$ 取 $128 \sim 256$ 时达到最优，耗时约 $3.1\text{ s}$ 对比串行 $21\text{ s}$）。

  - **为什么 $F$ 不能太小也不能太大？** $F$ 太小则派生出的线程数太少，并行度不够；$F$ 太大则创建/管理成千上万个微小线程的开销剧增，甚至耗尽线程栈内存。

  - **为什么 8 核 16 线程最多只能加速到 $6.84\times$？** 因为**顶层划分步骤（Top-level `partition`）是纯串行的（加速比为 $1\times$）**！第 2 层最多只有 2 个线程并行划分（$\le 2\times$），第 $k$ 层最多 $\le 2^{k-1}\times$。如果强行把 `partition` 步骤也改成多线程并行划分（Slide 36），由于无法在原数组内原地完成，必须额外申请临时数组并来回拷贝海量数据，实测反而因为内存带宽瓶颈得不到加速（Slide 37）。

### 4.5 硬件内存一致性模型与嗅探缓存（Memory Consistency & Snoopy Caches，Slides 39–43）

当多个线程在多核处理器上同时读写不同的共享变量时，硬件会呈现怎样的行为？考虑如下经典双线程程序（初值 `int a = 1; int b = 100;`，Slide 39）：

- **Thread 1**：先执行 `Wa: a = 2;`，后执行 `Rb: print(b);`（单线程内部顺序约束：`Wa -> Rb`）；

- **Thread 2**：先执行 `Wb: b = 200;`，后执行 `Ra: print(a);`（单线程内部顺序约束：`Wb -> Ra`）。

#### 1. 顺序一致性模型（Sequential Consistency，Slides 39–40）

在**顺序一致性（Sequential Consistency）**模型下，所有内存访问表现为全局按某种顺序依次交错执行，且严格保持每个单线程内部的先后顺序（`Wa -> Rb` 且 `Wb -> Ra`）。一共有 $\binom{4}{2} = 6$ 种合法交错序列：

| 序号 | 全局合法指令交错顺序 | `Rb: print(b)` 输出值 | `Ra: print(a)` 输出值 |
| :---: | :--- | :---: | :---: |
| 1 | `Wa -> Rb -> Wb -> Ra` | `100` | `2` |
| 2 | `Wa -> Wb -> Rb -> Ra` | `200` | `2` |
| 3 | `Wa -> Wb -> Ra -> Rb` | `200` | `2` |
| 4 | `Wb -> Ra -> Wa -> Rb` | `200` | `1` |
| 5 | `Wb -> Wa -> Ra -> Rb` | `200` | `2` |
| 6 | `Wb -> Wa -> Rb -> Ra` | `200` | `2` |

:::important[核心结论：在顺序一致性下，绝不可能打印出 `(b=100, a=1)`！]

要让 `Rb` 打印旧值 `100` 且 `Ra` 打印旧值 `1`，就要求 `Rb` 发生在 `Wb` 之前（`Rb -> Wb`），同时 `Ra` 发生在 `Wa` 之前（`Ra -> Wa`）。结合单线程约束 `Wa -> Rb` 和 `Wb -> Ra`，就会导出荒谬的因果循环 `Wa -> Rb -> Wb -> Ra -> Wa`！

:::

#### 2. 非一致性缓存灾难与嗅探缓存协议（Snoopy Caches，Slides 41–43）

- **如果没有缓存一致性协调会怎样（Slide 41）？** 假设每个核心使用各自独立的写回缓存（Write-back cache）且互不通信：Thread 1 把 `a: 2` 写进自己私有的 Cache 1（主存里的 `a` 仍是 `1`），Thread 2 把 `b: 200` 写进自己私有的 Cache 2（主存里的 `b` 仍是 `100`）；接着双方去主存读 `b` 和 `a`，就会直接打印出违背顺序一致性的 **`b = 100, a = 1`**！

- **硬件解决方案：嗅探缓存（Snoopy Caches，Slides 42–43，简化版 MESI 协议）**：

  为每个缓存行附加状态标记：**`Invalid`（无效，不可使用）**、**`Shared (S)`（共享只读副本）**、**`Exclusive (E)`（独占可写副本）**：

  1. 当 Thread 1 执行 `Wa: a = 2` 时，Cache 1 获得 `a` 的独占权，标记为 **`E (a: 2)`**（并将其他核心中 `a` 的缓存行作废为 `Invalid`）；同理 Thread 2 执行 `Wb: b = 200` 时，Cache 2 标记为 **`E (b: 200)`**。

  2. 随后当 Thread 1 执行 `Rb: print(b)` 在总线上发出读 `b` 的请求时，**Cache 2 的硬件嗅探器（Snooper）在总线上监听到有人请求自己正处于 `E` 独占状态的块 `b`**，于是立即拦截请求，直接由 Cache 2 将最新值 **`b: 200`** 提供给 Cache 1，并将双方的 `b` 缓存行状态同步降级为 **`S`（Shared 共享只读）**！从而在硬件层面完美保证了多核缓存一致性。

## 五、复习检查

- [ ] 比较进程、I/O 多路复用和线程三种并发方案。
- [ ] 用共享状态与临界区分析竞争，用信号量、锁顺序和性能模型检查正确性与效率。

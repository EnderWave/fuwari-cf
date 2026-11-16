---
title: CSAPP 第8章「异常控制流（ECF）」
published: 2026-11-16
tags:
  - 计算机系统
  - csapp
  - 异常控制流
  - Linux进程
  - 信号
  - Shell
category: 计算机系统
draft: false
description: 四种硬件异常、fork/execve/waitpid 进程控制、僵尸进程、信号防丢与防死锁准则、竞态消除及 100 行实现迷你 Shell。
---
刚开始学《计算机系统》第8章时，很多人会被“异常控制流（ECF）”、“同步/异步异常”、“上下文切换”、“信号掩码与竞态”、“非本地跳转”这一连串黑话劝退。

  

其实，这一章回答的只有一个非常朴素的问题：**电脑是怎么同时干很多件事，并且随时响应突发状况的？**

  

平时我们写 C 语言代码，CPU 就像一辆在铁轨上跑的火车，只会按顺序一行行往下走，或者遇到 `if/else`、`for` 循环、函数调用时拐个弯——这叫对**程序内部变量的变化**做反应。

  

但如果程序正跑着，突然发生了**程序外部的系统突发事件**：

- 你在键盘上按下了 `Ctrl+C` 想强行关掉它；

- 网卡收到了一条新消息，或者硬盘数据读完了；

- 程序执行 `a[500] = 13` 时，发现这块内存还躺在硬盘里没搬进内存条；

  

这时候 CPU 不能装聋作哑，必须**立刻暂停手头的指令，跳去处理这些突发事件**。这种“跳出原定代码顺序”的机制，就统称为**异常控制流（Exceptional Control Flow, ECF）**。整章内容按从底层硬件到上层代码的顺序，只讲了 4 个工具：

  

| 层次 | 名字叫什么？ | 谁来实现的？ | 一句话大白话解释 |
| :--- | :--- | :--- | :--- |
| **第 1 层（最底层）** | **异常（Exceptions）** | CPU 硬件 + 操作系统内核 | CPU 发现突发事件（如按键、除 0、缺页），立刻喊操作系统内核出来救场 |
| **第 2 层（操作系统层）** | **进程上下文切换（Context Switch）** | 操作系统内核 + 硬件定时器 | 操作系统每隔几毫秒把 CPU 从进程 A 切给进程 B，让你觉得电脑能同时跑上百个软件 |
| **第 3 层（进程通信层）** | **信号（Signals）** | 操作系统内核 + 你的程序 | 内核给你的进程发一条“微信弹窗通知”（比如通知你按下 `Ctrl+C` 或子进程退出了） |
| **第 4 层（纯用户代码层）** | **非本地跳转（Nonlocal Jumps）** | C 语言库（`setjmp`/`longjmp`） | 代码里的“存档与读档回城”：不管嵌套调了多少层函数，一键直接跳回 `main` 函数 |

  

下面我们就一层一层把它们彻底剥开！

  

## 1. 硬件与内核层：异常（Exceptions）的四种面孔

  

在 CS:APP 里，**“异常（Exception）”不是报错的意思**，而是指：**只要有事件发生，CPU 就暂停当前的用户代码，查“异常表（Exception Table）”跳进操作系统内核去处理**。

  

教材把异常分成了 **1 种异步异常 + 3 种同步异常**。别死记硬背，想象你正在**自习室里按顺序做题（CPU 执行指令）**：

  

| 异常分类 | 同步还是异步？ | 自习室类比（为什么会发生？） | 电脑里的真实例子 | 内核处理完后去哪？ |
| :--- | :--- | :--- | :--- | :--- |
| **1. 中断（Interrupt）** | **异步**（跟你在写哪道题无关，外部随时发生） | 你正写着题，**手机突然响了** | 键盘按下 `Ctrl+C`、鼠标移动、硬件定时器到点、网卡收到包 | 接完电话，继续做**下一道题（$I_{\text{next}}$）** |
| **2. 陷阱（Trap）** | **同步**（当前这行指令**故意**触发的） | 遇到需要盖章的表，你**主动举手找老师帮忙** | **系统调用 `syscall`**（如调 `read`/`open`/`fork` 请求内核办事）、GDB 断点 | 老师帮你办完，继续做**下一道题（$I_{\text{next}}$）** |
| **3. 故障（Fault）** | **同步**（当前这行指令无意踩坑，但**也许能救**） | 做第 5 题时发现**参考书还在书包里没拿出来** | **缺页异常（Page Fault）**：访问的内存页还在硬盘上；或者**段错误**（越界访问非法地址） | 如果能救（把页从硬盘搬进内存），回来**重做刚才卡住的这道题（$I_{\text{curr}}$）**；救不了（地址非法）就直接退学（发 `SIGSEGV` 杀掉进程） |
| **4. 终止（Abort）** | **同步**（当前指令引发致命硬件故障，**没得救**） | 自习室**桌子直接塌了** | 内存条奇偶校验损坏、非法的机器码指令 | 直接**强制终止（Abort）**程序 |

  

> [!TIP]

> **秒杀选择题的核心区别**：

> - **中断（Interrupt）**和**陷阱（Trap）**处理完，总是往前走，去执行**下一条指令 $I_{\text{next}}$**；

> - **故障（Fault，比如缺页异常）**修复完，必须回到**刚才卡住的那条指令 $I_{\text{curr}}$ 重新执行一遍**！（因为刚才那条 `mov` 读写内存的指令还没真正成功执行完）。

  

## 2. 进程与进程控制：`fork`、`execve` 与僵尸进程

  

### 2.1 什么是进程（Process）？

  

- **程序（Program）** 是躺在硬盘上的一堆静态代码文件（就像一本**菜谱**）；

- **进程（Process）** 是这个程序正在运行的一个实例（就像照着菜谱正在炒菜的**厨房施工现场**）。

  

虽然你的 CPU 可能只有几个核，但操作系统通过两个“障眼法”，让每个进程都以为自己独占了整台电脑：

1. **独立的逻辑控制流（以为独占 CPU）**：靠**上下文切换（Context Switch）**——内核每隔几毫秒拍张照保存进程 A 的寄存器，把 CPU 借给进程 B 跑一会儿，再切回来。

2. **私有的虚拟地址空间（以为独占内存）**：靠**虚拟内存**——每个进程看到的都是从 `0x400000` 开始的干净内存空间，互不干扰。

  

> [!NOTE]

> **怎么判断两个进程是不是“并发（Concurrent）”的？**

> 只要两个进程从“开始”到“结束”的**时间段有重叠**（哪怕在单核 CPU 上是交替轮流跑的），它们就是**并发**的；只有当进程 B 彻底运行结束退出后，进程 C 才开始运行，B 和 C 才叫**顺序（Sequential）**执行。

  

### 2.2 `fork()`：孙悟空拔毫毛变分身（调用一次，返回两次）

  

父进程调用 `pid_t pid = fork();` 时，操作系统会把父进程当前的内存、变量、甚至打开的文件完完整整复印一份，创造出一模一样的**子进程（分身）**。

  

最神奇的地方在于：`fork()` 这一行代码是在父进程里调用的，但克隆完成后，**父进程和子进程都会从 `fork()` 这一行往下继续走**！那怎么区分自己到底是本体（父进程）还是分身（子进程）呢？看 `fork()` 的返回值：

- 在**子进程（分身）**里，`fork()` 返回 **`0`**（因为子进程随时可以用 `getppid()` 查自己爸爸是谁）；

- 在**父进程（本体）**里，`fork()` 返回**子进程的身份证号（`PID > 0`）**（因为一个爸爸可能有好几个孩子，必须拿到孩子的 `PID` 才能管理它）。

  

```c title="fork.c：调用一次，返回两次，变量各自独立"

int main() {

    int x = 1;

    pid_t pid = fork();      // 就在这一刻，一分为二！

  

    if (pid == 0) {          // 分身（子进程）走这里

        printf("child : x=%d\n", ++x); // 子进程把自己的 x 改成 2

        exit(0);

    }

    // 本体（父进程）走这里

    printf("parent: x=%d\n", --x);     // 父进程把自己的 x 改成 0（互不影响！）

    exit(0);

}

```

  

#### 考试必考：怎么算多道 `fork()` 的合法输出顺序？（画进程图！）

  

遇到连续好几个 `fork()` 的题目，千万别拿脑子硬想，画一张**进程图（Process Graph，箭头从左往右画）**：

- 每次遇到 `fork()`，箭头就**上下分叉**成两条线（一条代表父进程，一条代表新生的子进程）；

- **核心法则**：只要遵守“同一条线以及分叉箭头必须从左往右走”的顺序，不同分支之间的 `printf` 先后顺序可以任意穿插（即有向无环图的**拓扑排序**）！

  

来看课件里最经典的一道题 `fork4()`：

  

```c title="fork4()：只有父进程（fork() != 0）才进入 if"

void fork4() {

    printf("L0\n");

    if (fork() != 0) {       // 第一次分叉：子进程1返回0不进if，直接去最底下打印 Bye

        printf("L1\n");      // 父进程打印 L1

        if (fork() != 0) {   // 第二次分叉：子进程2返回0不进if，直接去最底下打印 Bye

            printf("L2\n");  // 父进程打印 L2

        }

    }

    printf("Bye\n");         // 父进程、子进程1、子进程2 最终都会执行这句 Bye

}

```

  

问：输出序列 `L0 -> Bye -> L1 -> Bye -> Bye -> L2` 可能出现吗？

- 点击黑幕看一眼秒杀法：:spoiler[绝对不可能！你只需要看“父进程自己那条主线”：父进程自己的代码顺序是 L0 -> L1 -> L2 -> Bye，也就是说父进程自己的那个 Bye 一定在 L2 后面打印！所以 L2 后面至少得有一个 Bye，不可能三个 Bye 全都在 L2 前面打完！]

  

### 2.3 僵尸进程（Zombie）与 `wait` / `waitpid` 收尸

  

当一个子进程执行完 `exit(0)` 终止后，操作系统**不敢直接把它的档案彻底删掉**——因为万一父进程还想问问：“我刚才派出去的孩子任务办成功了吗（退出状态码是多少）？”

  

所以，已经终止、但父进程还没来过问的子进程，就变成了**僵尸进程（Zombie Process，`ps` 命令里显示为 `<defunct>`）**——人已经死了，但还占着操作系统的进程表名额和内核内存。

  

- **怎么消除僵尸进程？** 父进程必须调用 `wait(&status)` 或 `waitpid(pid, &status, options)` 来给子进程“收尸销户（Reaping）”。

- **如果父进程自己先退出了呢？** 不用担心，系统里 `PID = 1` 的老祖宗进程 **`init`** 会自动领养所有孤儿进程，并帮它们收尸。

- **那谁最怕僵尸进程？** 像 **Shell（命令行终端）** 或 **7×24 小时运行的后台服务器**——因为它们永远不退出！如果它们生了一堆后台子进程却不收尸，成千上万个僵尸进程就会把内核撑爆！

  

### 2.4 `execve()`：借壳上市（调用一次，从不返回）

  

`fork()` 只能克隆出跟父进程一模一样的程序。如果我们在 Shell 里输入 `ls`，Shell 怎么去运行 `/bin/ls` 这个全新的程序呢？靠的就是 **`execve`**！

  

```c

int execve(const char *filename, char *const argv[], char *const envp[]);

```

  

- **它是怎么工作的？** 先由 Shell 调用 `fork()` 克隆出一个子进程；然后子进程调用 `execve("/bin/ls", argv, environ)`——把子进程脑子里的代码、数据、栈**全部清空**，换成 `/bin/ls` 的代码重头开始跑！

- **它保留了什么？** 身份证号 `PID` 不变、已经打开的文件描述符不变、信号掩码不变。

- **为什么说它“调用一次，从不返回”？** 因为一旦换脑成功，原来的程序代码已经被覆盖消失了，自然不可能再返回到原来的代码里（除非找不到 `/bin/ls` 文件报错，才会返回 `-1`）。

  

## 3. 信号（Signals）：操作系统的“微信弹窗通知”

  

### 3.1 为什么非要有“信号”不可？

  

回到刚才的 Shell 问题：如果用户输入 `sleep 5 &`（加了 `&` 表示放在**后台**运行），Shell 不能傻傻地停在原地用 `waitpid` 等它 5 秒，必须立刻打印出下一个 `msh>` 提示符让你继续敲别的命令。

  

那 5 秒后这个后台子进程结束了，变成了僵尸进程，**正忙着干别的事的 Shell 怎么知道要去给它收尸呢？**

  

这就是**信号（Signal）**的用武之地！当任何子进程退出时，操作系统内核会主动给父进程发一条编号为 `17` 的弹窗通知——**`SIGCHLD` 信号**。父进程收到通知后，暂停手头的活，跳去执行一段专门的“收尸函数（信号处理函数 Signal Handler）”，收完尸再无缝回到刚才被打断的地方继续干活！

  

常用信号你只需要记住这 6 个：

  

| 信号编号 | 信号名字 | 怎么触发的？ | 默认动作 |
| :---: | :--- | :--- | :--- |
| `2` | **`SIGINT`** | 键盘按下 **`Ctrl+C`** | 终止进程 |
| `9` | **`SIGKILL`** | 强杀命令 `kill -9` | **无条件立即杀死（神仙也拦不住，不能被捕获或忽略！）** |
| `11` | **`SIGSEGV`** | 内存越界 / 空指针解引用 | 终止进程并报 `Segmentation fault`（段错误） |
| `14` | **`SIGALRM`** | `alarm(sec)` 闹钟定时到点 | 终止进程 |
| `17` | **`SIGCHLD`** | **有子进程停止或退出了** | **默认直接忽略**（所以想自动收尸必须自己写处理函数！） |
| `20` | **`SIGTSTP`** | 键盘按下 **`Ctrl+Z`** | 暂停（挂起）进程，直到收到 `SIGCONT` 才继续 |

  

### 3.2 为什么按下 `Ctrl+C` 不会把后台运行的游戏也关掉？（进程组）

  

每个进程都属于一个**进程组（Process Group，`pgid`）**。

当你按下键盘上的 `Ctrl+C`（或 `Ctrl+Z`）时，内核会把 `SIGINT`（或 `SIGTSTP`）发送给**当前前台进程组里的所有进程**。

- 所以在写 Shell 时，如果一个命令带了 `&` 在后台跑，我们在子进程里调一句 `setpgid(0, 0)` 把它移出前台进程组（自己独立成团），这样你按 `Ctrl+C` 就只会干掉前台正在跑的命令，绝不会误伤后台任务！

- 小技巧：用命令 `/bin/kill -9 -24817`（**PID 前面加个负号**），意思就是把信号发给 **`24817` 号进程组里的所有进程**，实现“一锅端”！

  

### 3.3 信号最核心的底层秘密：两个开关面板（`pending` 与 `blocked`）

  

内核在每个进程的小本本上维护着两排开关（32 位比特位向量）：

1. **`pending`（待处理信号灯）**：第 $k$ 号信号发过来但还没处理时，第 $k$ 号灯就**亮起（置 `1`）**；等进程处理完该信号，灯就**熄灭（清 `0`）**。

2. **`blocked`（免打扰屏蔽罩，又称信号掩码）**：如果你暂时不想被第 $k$ 号信号打扰，可以把 `blocked` 的第 $k$ 位置 `1`。此时如果信号发过来，`pending` 灯依然会亮起，但进程会假装没看见，直到你解除屏蔽（清 `0`）才会去处理它。

  

每次内核准备把 CPU 交还给你的程序时，都会算一下：

$$
\text{当前必须立刻处理的信号 } \text{pnb} = \text{pending} \ \& \ \sim\text{blocked}
$$

也就是挑出那些**“灯亮着（`pending=1`），且没有开免打扰（`blocked=0`）”**的信号，挨个去执行你注册的信号处理函数！

  

> [!CAUTION]

> **全章第一大铁律：信号不会排队（Signals Are Not Queued）！最多只能亮一盏灯！**

> 因为每种信号在 `pending` 里**只有 1 个比特位（只有 1 盏灯）**！

> 假设你正在处理第 1 个子进程退出的 `SIGCHLD` 信号，这时候第 2、第 3、第 4 个子进程也同时退出了：

> - 第 2 个子进程退出时，去把门口的 `SIGCHLD` 灯按亮了（`pending = 1`）；

> - 第 3、第 4 个子进程退出时，再去按灯——**灯本来就是亮的，不会变成 3 盏灯**！所以第 3、第 4 个子进程发出的信号就这么**凭空消失（被丢弃）**了！

>

> **推论：在 `SIGCHLD` 信号处理函数里收尸，绝对不能写 `if (waitpid(...) > 0)`，必须写 `while (waitpid(-1, NULL, WNOHANG) > 0)` 循环！** 只要灯亮一次，就把门口所有已经退出的子进程一口气全领完，否则剩下的子进程就会永远变成僵尸！

  

## 4. 怎么写出不死锁、不丢信号、无竞态的代码？

  

信号处理函数最危险的地方在于：**它随时可能插队打断主程序的任何一行代码**！为了不写出诡异的 Bug，前人用血泪总结了这几个保命套路：

  

### 4.1 为什么信号处理函数里绝对不能调 `printf`？（异步信号安全）

  

很多初学者喜欢在信号处理函数里写 `printf("Caught signal!\n");`，平时跑着好像没事，但高并发下一跑就**死锁卡死**！为什么？

  

- 因为 `printf`、`malloc`、`exit` 这些标准库函数内部为了线程安全，都会先**加一把全局锁**再去操作缓冲区。

- 试想：你的 `main` 函数正调着 `printf`，刚把全局锁锁上，还没来得及解锁，突然来了个信号！CPU 立刻暂停 `main`，跳进你的信号处理函数；结果你的信号处理函数里也写了 `printf`，它伸手去拿那把锁——发现锁在 `main` 手里，于是傻等；可 `main` 又必须等信号处理函数跑完才能继续往下走去解锁！**两人大眼瞪小眼，当场死锁！**

  

> [!IMPORTANT]

> **安全信号处理六大保命准则（G0–G5）：**

> - **G0（越短越好）**：信号处理函数里尽量只改一个全局标志变量就立刻返回。

> - **G1（只调异步信号安全函数）**：严禁在信号处理函数里调 `printf`、`sprintf`、`malloc`、`exit`！如果要打印文字，只能调操作系统原生的 **`write(STDOUT_FILENO, "msg\n", 4)`**；如果要退出，只能调 **`_exit(0)`**。

> - **G2（进门存 `errno`，出门还 `errno`）**：信号处理函数里的 `waitpid` 等调用可能会修改全局的错误码 `errno`，必须在开头写 `int old = errno;`，结尾写 `errno = old;`。

> - **G3（操作共享数据前先开免打扰）**：主程序在修改跟信号处理函数共用的链表/数组前，先用 `sigprocmask` 把信号屏蔽掉，改完再放开。

> - **G4 & G5（全局标志加 `volatile sig_atomic_t`）**：`volatile` 强迫编译器每次都去内存读最新值（别偷懒只读寄存器缓存），`sig_atomic_t` 保证读写操作一步到位不可打断。

  

### 4.2 经典竞态 Bug：为什么“还没登记入职，就先来销户了”？

  

在写 Shell 的任务管理器时，父进程生出子进程后要调 `addjob(pid)` 把它记入“在职名单”；当子进程退出触发 `SIGCHLD` 时，信号处理函数会调 `deletejob(pid)` 把它从名单上划掉。

  

看看下面这段看似正常的代码，为什么会出大乱子？

  

```c title="有致命竞态 Bug 的写法 (procmask1.c)"

if ((pid = fork()) == 0) {

    execve("/bin/date", argv, NULL); // 子进程跑一个极快的命令，瞬间结束！

}

// 父进程准备把子进程加进名单...

addjob(pid);

```

  

- **悲剧重现**：如果 `fork()` 刚结束，操作系统碰巧先让子进程跑；子进程跑完 `/bin/date` 瞬间退出，立刻给父进程发了 `SIGCHLD`。父进程被迫先去执行信号处理函数里的 **`deletejob(pid)`（去名单里删这个孩子，但此时还没登记呢，删了个寂寞）**；等信号处理函数结束回到父进程，父进程才慢吞吞地执行 **`addjob(pid)`**——把一个已经死掉并收完尸的孩子永久记进了在职名单里！

- **怎么彻底解决？** 在 `fork()` 之前，父进程先用 `sigprocmask` **把 `SIGCHLD` 信号屏蔽掉（开免打扰）**！这样就算子进程瞬间死掉，信号也会在门外老老实实等着；等父进程不慌不忙地执行完 `addjob(pid)` 登记好户口后，再解除屏蔽，让信号处理函数进来执行 `deletejob(pid)` 销户！

  

```c title="正确写法：先屏蔽信号 -> fork -> 登记 addjob -> 解除屏蔽 (procmask2.c)" {2,5,9}

while (1) {

    sigprocmask(SIG_BLOCK, &mask_one, &prev_one);   // 1. fork 前先给 SIGCHLD 开免打扰！

    if ((pid = fork()) == 0) {

        sigprocmask(SIG_SETMASK, &prev_one, NULL);  // 2. 子进程出门前把继承来的免打扰关掉

        execve("/bin/date", argv, NULL);

    }

    sigprocmask(SIG_BLOCK, &mask_all, NULL);

    addjob(pid);                                    // 3. 父进程安心登记户口，绝不会被插队！

    sigprocmask(SIG_SETMASK, &prev_one, NULL);      // 4. 登记完毕，解除免打扰（如果子进程已死，此时立刻触发销户）

}

```

  

### 4.3 等待信号到来：为什么用 `sigsuspend` 代替 `pause`？

  

如果主程序想等 `SIGCHLD` 信号把全局变量 `pid` 改成非 0 再继续往下走：

- 写 `while (!pid) ;` 原地死循环：能跑对，但 CPU 风扇直接狂转（100% 忙等待浪费电）。

- 写 `while (!pid) pause();`：**有睡死过去的竞态风险！** 万一刚判断完 `!pid` 为真，还没来得及执行下一句 `pause()` 睡觉，信号就在这零点几微秒间插队进来处理完了；等下一句 `pause()` 执行时，信号早就过去了，程序将永远睡死在 `pause()` 里醒不过来！

- **终极救星 `sigsuspend(&prev)`**：它把**“解除信号屏蔽 + 进门睡觉 `pause()`”合并成了一个不可被打断的原子动作**，彻底堵死了中间被插队的缝隙：

  

```c title="用 sigsuspend 安全睡眠等待信号"

sigprocmask(SIG_BLOCK, &mask_chld, &prev); // 先屏蔽 SIGCHLD

if (fork() == 0) exit(0);

pid = 0;

while (!pid) {

    sigsuspend(&prev); // 原子地：暂时换上未屏蔽的 prev 并立刻睡觉，被信号唤醒返回后自动恢复屏蔽！

}

sigprocmask(SIG_SETMASK, &prev, NULL);     // 恢复原状

```

  

## 5. 非本地跳转（`setjmp` / `longjmp`）：代码里的“存档与读档”

  

正常情况下，函数 `main -> P1 -> P2 -> P3` 一层层调用，必须一层层 `return` 退回来。如果 `P3` 深处发生了错误，想直接一步跳回 `main` 函数怎么办？C 语言提供了 `setjmp` 和 `longjmp`（在信号处理函数里用带信号掩码恢复的 `sigsetjmp` 和 `siglongjmp`）：

  

- **`setjmp(buf)`（设存档点，调用一次，返回多次）**：把当前的栈指针、寄存器和 `PC` 位置拍张照存进 `buf` 里。**刚存档完第一次返回时，它的返回值固定是 `0`**。

- **`longjmp(buf, k)`（读档回城，调用一次，从不返回）**：不管现在在多深的函数里，直接把 `buf` 里的存档恢复出来，时光倒流跳回当初 `setjmp(buf)` 的那一行代码，并让那一行 `setjmp(buf)` **假装刚刚返回了非零值 `k`**！

  

```c title="restart.c：按下 Ctrl+C 时用 siglongjmp 直接读档重启程序"

#include <setjmp.h>

#include <signal.h>

#include <stdio.h>

#include <unistd.h>

  

sigjmp_buf buf;

  

void handler(int sig) {

    (void)sig;

    siglongjmp(buf, 1); // 收到 Ctrl+C (SIGINT) 时，直接读档跳回 main 的 sigsetjmp 处！

}

  

int main() {

    // 第一次走到这里：建立存档点，返回 0，进入 if 分支打印 starting

    // 以后每次按 Ctrl+C 读档跳回这里：返回 1，进入 else 分支打印 restarting！

    if (sigsetjmp(buf, 1) == 0) {

        signal(SIGINT, handler);

        write(STDOUT_FILENO, "starting\n", 9);

    } else {

        write(STDOUT_FILENO, "restarting\n", 11);

    }

  

    while (1) {

        sleep(1);

        write(STDOUT_FILENO, "processing...\n", 14);

    }

}

```

  

> [!WARNING]

> **存档/读档的唯一禁区**：如果建立存档点 `setjmp(buf)` 的那个函数 `P2()` **已经执行完毕 `return` 退出了**（房间都已经拆毁了），别的平级函数 `P3()` 绝不能再调 `longjmp(buf, 1)` 跳回 `P2()`，否则会跳进一片已经被销毁的废墟栈帧里导致崩溃！

  

## 6. 融会贯通：用 100 行代码写一个你自己的迷你 Shell（`msh.c`）

  

把上面学的知识串起来，就能轻松看懂我们实验8编写的迷你 Shell `msh.c` 的每一行设计巧思：

  

1. **怎么执行 `ls`、`grep`？** 父进程 `fork()` 出子进程，子进程调用 `execve()` 变身为外部命令；如果是前台命令（没带 `&`），父进程就用 `waitpid()` 等它跑完。

2. **后台命令 `&` 怎么防僵尸且不打断前台等待？** 用 `sigaction` 给 `SIGCHLD` 注册处理函数，里面用 `while (waitpid(-1, NULL, WNOHANG) > 0)` 循环收尸；并且加上 **`SA_RESTART` 标志**——万一父进程正等着前台命令时，有个后台命令退出了触发 `SIGCHLD`，内核处理完信号后会自动帮父进程重启 `waitpid`，不会报错中断！

3. **怎么实现按 `Ctrl+C` 只杀前台命令、不退出 Shell？** Shell 自己把 `SIGINT` 设为忽略（`SIG_IGN`）；`fork()` 出来的子进程在 `execve` 之前把 `SIGINT` 恢复为默认（`SIG_DFL`），且后台子进程用 `setpgid(0, 0)` 挪出前台进程组。

4. **怎么实现 `timeout <sec> <cmd>` 超时强杀？** 父进程调 `alarm(sec)` 定个闹钟；如果超时触发 `SIGALRM`，在处理函数里用 `kill(fg_pid, SIGKILL)` 强杀子进程，并用异步信号安全的 `write()` 打印 `"Timeout!\n"`！

  

```c title="msh.c：100 行五脏俱全的迷你 Shell"

#define _POSIX_C_SOURCE 200809L

#include <errno.h>

#include <signal.h>

#include <stdio.h>

#include <stdlib.h>

#include <string.h>

#include <sys/wait.h>

#include <unistd.h>

  

extern char **environ;

static volatile sig_atomic_t fg_pid = 0;

  

/* SIGCHLD：while 循环非阻塞回收所有已退出的子进程，防止僵尸进程 */

static void sigchld_handler(int sig) {

    (void)sig;

    int saved_errno = errno;

    while (waitpid(-1, NULL, WNOHANG) > 0);

    errno = saved_errno;

}

  

/* SIGALRM：timeout 超时强杀前台进程，并用异步信号安全的 write 打印 Timeout! */

static void sigalrm_handler(int sig) {

    (void)sig;

    int saved_errno = errno;

    if (fg_pid > 0) {

        kill(fg_pid, SIGKILL);

        ssize_t r = write(STDOUT_FILENO, "Timeout!\n", 9);

        (void)r;

    }

    errno = saved_errno;

}

  

/* 支持直接路径或搜索 PATH 环境变量调用 execve */

static void do_execve(char *argv[]) {

    if (strchr(argv[0], '/')) {

        execve(argv[0], argv, environ);

        perror(argv[0]);

        _exit(127);

    }

    char path[1024], full[1024];

    snprintf(path, sizeof(path), "%s", getenv("PATH") ? getenv("PATH") : "/bin:/usr/bin");

    for (char *d = strtok(path, ":"); d; d = strtok(NULL, ":")) {

        snprintf(full, sizeof(full), "%s/%s", d, argv[0]);

        execve(full, argv, environ);

    }

    fprintf(stderr, "%s: command not found\n", argv[0]);

    _exit(127);

}

  

int main(void) {

    struct sigaction sa = {0};

    sigemptyset(&sa.sa_mask);

  

    /* 1. Shell 自身忽略 Ctrl+C (SIGINT) */

    sa.sa_handler = SIG_IGN;

    sigaction(SIGINT, &sa, NULL);

  

    /* 2. SIGCHLD 设置 SA_RESTART，回收后台僵尸进程且不打断前台 waitpid */

    sa.sa_handler = sigchld_handler;

    sa.sa_flags = SA_RESTART | SA_NOCLDSTOP;

    sigaction(SIGCHLD, &sa, NULL);

  

    /* 3. SIGALRM 用于 timeout 内置命令定时强杀 */

    sa.sa_handler = sigalrm_handler;

    sa.sa_flags = SA_RESTART;

    sigaction(SIGALRM, &sa, NULL);

  

    char line[1024], *argv[64];

    while (printf("msh> "), fflush(stdout), fgets(line, sizeof(line), stdin)) {

        int argc = 0, bg = 0, t_sec = 0;

        for (char *tok = strtok(line, " \t\r\n"); tok; tok = strtok(NULL, " \t\r\n"))

            argv[argc++] = tok;

        if (argc == 0) continue;

        if (strcmp(argv[0], "exit") == 0) break;

  

        if (strcmp(argv[argc - 1], "&") == 0) {

            bg = 1;

            argv[--argc] = NULL;

        }

        argv[argc] = NULL;

        if (argc == 0) continue;

  

        char **cmd = argv;

        if (strcmp(argv[0], "timeout") == 0) {

            if (argc < 3) { fprintf(stderr, "Usage: timeout <sec> <cmd>\n"); continue; }

            t_sec = atoi(argv[1]);

            cmd = argv + 2;

        }

  

        pid_t pid = fork();

        if (pid == 0) {

            if (bg) setpgid(0, 0);        /* 后台作业放入独立进程组，免受 Ctrl+C 影响 */

            sa.sa_handler = SIG_DFL;

            sa.sa_flags = 0;

            sigaction(SIGINT, &sa, NULL); /* 子进程恢复 SIGINT 默认终止行为 */

            do_execve(cmd);

        } else if (pid > 0 && !bg) {

            fg_pid = pid;

            if (t_sec > 0) alarm(t_sec);

            while (waitpid(pid, NULL, 0) < 0 && errno == EINTR);

            if (t_sec > 0) alarm(0);      /* 若在超时前正常结束，立即取消闹钟 */

            fg_pid = 0;

        }

    }

    return 0;

}

```
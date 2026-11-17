---
title: CSAPP · 第 9 章 · 虚拟内存与动态内存分配
published: 2026-11-22
tags:
  - 计算机系统
  - csapp
  - 虚拟内存
  - 动态内存分配
  - 操作系统
category: 计算机系统
draft: false
description: 虚拟内存三大核心作用、页表与 TLB 地址翻译、14 位/12 位微缩内存系统手算实例、Intel Core i7 四级页表与 Linux 虚拟内存系统、mmap 内存映射与写时复制（COW）、显式/隐式/分离空闲链表动态内存分配器设计、垃圾回收（Mark & Sweep）及 C 语言 10 大经典内存缺陷剖析。
---

## 导读


1. **9.1–9.6 虚拟内存概念与地址翻译（Virtual Memory: Concepts）**：物理寻址与虚拟寻址、虚拟内存的三大角色（DRAM 缓存、内存管理、内存保护）、页表（Page Table）与缺页异常处理（Demand Paging）、TLB 加速与多级页表。

2. **9.6–9.8 内存系统实例、Core i7/Linux 案例与内存映射（Virtual Memory: Systems）**：14 位虚拟地址到 12 位物理地址的端到端手算翻译（TLB + 页表 + 物理寻址直接映射 Cache）、Intel Core i7 四级页表与 VIPT L1 Cache 优化、Linux 进程虚拟地址空间与 `vm_area_struct`、共享对象与写时复制（Private Copy-on-Write, COW）、`fork()` 与 `execve()` 底层原理，以及用户级内存映射 `mmap()`。

3. **9.9 动态内存分配基础（Dynamic Memory Allocation: Basic Concepts）**：`malloc`/`free`/`sbrk` 规范、吞吐率与峰值内存利用率 $U_k$、内部碎片与外部碎片、隐式空闲链表（Implicit Free List）、头部字节对齐位压缩、放置策略（First/Next/Best Fit）、分割（Splitting）与带边界标记（Boundary Tags）的 $O(1)$ 四种双向合并（Coalescing）情形。

4. **9.9–9.11 动态内存分配进阶、垃圾回收与内存缺陷（Advanced Concepts）**：显式空闲链表（Explicit Free List）与 LIFO/地址序插入策略、分离空闲链表（Segregated Free List）、垃圾回收（Mark-and-Sweep 算法与 C 语言保守式 GC 平衡树改造），以及 C 语言指针声明法则与 10 类致命内存 Bug 全解。

:::note[核心思想：程序员视角 vs. 系统视角]

* **程序员视角（Programmer's View）**：每个进程都拥有自己独占的、私有的、连续的线性虚拟地址空间（Private Linear Address Space），并且不会受到其他进程的破坏。

* **系统视角（System View）**：虚拟内存通过硬件 MMU（内存管理单元）与操作系统内核的精密配合，把主存 DRAM 作为磁盘虚存页的高速缓存（得益于局部性原理），不仅简化了链接、加载与内存分配，还在每次访存的地址翻译处提供了天然的权限检查点（Interpositioning Point）。

:::

:::tip[学习重点]

- 沿虚拟地址、TLB、页表到物理地址的路径完成地址翻译。
- 分析缺页与内存映射，再用块布局理解分配器的对齐、分割和合并。

:::

## 一、虚拟内存核心概念与地址翻译（VM: Concepts）

### 1.1 物理寻址 vs. 虚拟寻址与地址空间

计算机系统访问主存（Main Memory，即字节数组 $0, 1, \dots, M-1$）的方式分为两类：

| 寻址方式 | 数据通路与硬件机制 | 典型应用场景 |
| ----- | ----- | ----- |
| **物理寻址（Physical Addressing）** | CPU 执行加载指令时直接生成物理地址（PA，例如 `PA = 4`），通过内存总线直接访问主存并取回数据字（Data word）。 | 汽车、电梯、数码相框等嵌入式微控制器（Simple Embedded Microcontrollers）。 |
| **虚拟寻址（Virtual Addressing）** | CPU 先生成虚拟地址（VA，例如 `VA = 4100`），经过 CPU 芯片内的 **MMU（Memory Management Unit，内存管理单元）** 动态翻译为物理地址（`PA = 4`），再送往主存读取数据。 | 所有现代服务器、笔记本电脑和智能手机操作系统。 |

**地址空间（Address Spaces）的形式化定义**：

* **线性地址空间（Linear Address Space）**：连续非负整数地址构成的有序集合 $\{0, 1, 2, 3, \dots\}$。

* **虚拟地址空间（Virtual Address Space）**：含 $N = 2^n$ 个虚拟地址的集合 $V = \{0, 1, 2, \dots, N-1\}$（由虚拟地址位宽 $n$ 决定，如 32 位系统 $n=32$，64 位现代系统通常使用 $n=48$ 位虚拟地址）。

* **物理地址空间（Physical Address Space）**：含 $M = 2^m$ 个物理地址的集合 $P = \{0, 1, 2, \dots, M-1\}$（对应物理内存容量 $M$ 字节）。

:::important[为什么需要虚拟内存（Why Virtual Memory）？三大核心作用]

1. **高效使用主存（VM as a Tool for Caching）**：把主存 DRAM 作为存储在磁盘上的虚拟地址空间的高速缓存，仅将当前活跃区域保留在 DRAM 中，按需在磁盘与主存之间换入换出。

2. **简化内存管理（VM as a Tool for Memory Management）**：为每个进程提供完全一致的统一线性地址空间（Uniform Linear Address Space），从而极大简化链接（Linking）、加载（Loading）、代码共享（Sharing）和物理内存分配（Allocation）。

3. **隔离并保护地址空间（VM as a Tool for Memory Protection）**：通过在页表项中添加权限位，防止一个进程篡改另一个进程的内存，同时禁止用户程序非法访问特权级的内核代码与数据。

:::

### 1.2 虚拟内存作为缓存工具（VM as a Tool for Caching）

概念上，虚拟内存是存储在磁盘上的 $N$ 个连续字节构成的数组；磁盘上的数组内容被缓存在物理内存（称为 **DRAM Cache**）中。虚拟内存空间被划分为固定大小的块，称为**虚拟页（Virtual Pages, VP）**，每个页的大小为 $P = 2^p$ 字节（虚拟地址空间共有 $2^{n-p}$ 个虚拟页：`VP 0` 到 `VP` $2^{n-p}-1$）；类似地，物理内存被划分为大小同样为 $P = 2^p$ 字节的**物理页（Physical Pages, PP，也称页帧 Page Frames）**，共有 $2^{m-p}$ 个物理页（`PP 0` 到 `PP` $2^{m-p}-1$）。

在任意时刻，虚拟页面的集合都严格划分为三个互不相交的子集：

1. **未分配的（Unallocated）**：进程尚未申请或创建的页，不占用任何磁盘或 DRAM 空间。

2. **缓存的（Cached）**：已分配且当前缓存在物理内存 DRAM 中的页。

3. **未缓存的（Uncached）**：已分配但当前仅保存在磁盘上、尚未调入物理内存 DRAM 的页。

#### DRAM 缓存的组织结构为什么与 SRAM Cache 截然不同？

驱动 DRAM 缓存组织结构设计的最根本因素是**极其高昂的不命中惩罚（Enormous Miss Penalty）**：

* 主存 DRAM 比 CPU 片上 SRAM 大约慢 **10 倍**；

* 磁盘（Disk）比主存 DRAM 大约慢 **10,000 倍**以上！

为了尽量避免和摊销昂贵的磁盘访问开销，DRAM 缓存采取了以下四个核心设计决策：

| 设计维度 | SRAM 硬件缓存（L1/L2/L3 Cache） | 虚拟内存 DRAM 缓存 | 原因剖析 |
| ----- | ----- | ----- | ----- |
| **块/页大小（Block/Page Size）** | 较小（通常 $64\text{ Bytes}$） | 很大（通常 $4\text{ KB}$，大页可达 $2\text{ MB} / 4\text{ MB}$） | 磁盘寻道极慢，必须依靠大页面摊销寻道延迟并充分利用空间局部性。 |
| **相联度（Associativity）** | 直接映射或组相联（如 8 路/16 路） | **全相联（Fully Associative）** | 任意虚拟页（VP）可以放入任意物理页（PP），最大限度降低冲突不命中。 |
| **替换算法（Replacement Policy）** | 简单硬件逻辑（如近似 LRU） | **极其精密复杂的操作系统软件算法** | 缺页代价极高，值得耗费数百条内核指令运行复杂页面替换策略。 |
| **写策略（Write Policy）** | 直写（Write-through）或写回（Write-back） | **一律采用写回（Write-back）** | 绝不可能每次写一个字节都同步写盘；仅在页面被淘汰且脏位（Dirty bit）为 1 时才写回磁盘。 |

#### 页表（Page Table）、页命中（Page Hit）与缺页异常（Page Fault）

为了实现全相联映射，操作系统内核在 DRAM 中为**每个进程独立维护**一张**页表（Page Table）**。页表是一个由页表项（Page Table Entries, PTE）构成的数组，每个虚拟页 `VP k` 对应数组下标为 `k` 的 `PTE k`。每个 PTE 包含一个 **有效位（Valid bit）** 和一个 $m-p$ 位的地址字段：

* **情况 A：Valid = 1（已缓存 Cached）**：地址字段存储该虚拟页在 DRAM 中对应的**物理页号（PPN）**。

* **情况 B：Valid = 0 且地址字段为 `null`（未分配 Unallocated）**：该虚拟页尚未被分配。

* **情况 C：Valid = 0 且地址字段非空（未缓存 Uncached）**：地址字段指向该虚拟页在磁盘（Swap 空间或磁盘文件）上的起始位置。

```
             内存常驻页表 (Page Table in DRAM)
           +-------+--------------------------+
    PTE 0  |   0   |           null           |  --> 未分配 (Unallocated)
    PTE 1  |   1   |         PP 0 地址         |  --> 已缓存在物理页 PP 0
    PTE 2  |   1   |         PP 1 地址         |  --> 已缓存在物理页 PP 1
    PTE 3  |   0   |      磁盘 VP 3 扇区地址    |  --> 已分配但未缓存 (在磁盘上)
    PTE 4  |   1   |         PP 3 地址         |  --> 已缓存在物理页 PP 3
    PTE 5  |   0   |           null           |  --> 未分配 (Unallocated)
    PTE 6  |   0   |      磁盘 VP 6 扇区地址    |  --> 已分配但未缓存 (在磁盘上)
    PTE 7  |   1   |         PP 2 地址         |  --> 已缓存在物理页 PP 2
           +-------+--------------------------+
             Valid     PPN 或磁盘地址
```

1. **页命中（Page Hit，Slides 11）**：当 CPU 访问 `VP 2` 中的某个字时，MMU 查页表发现 `PTE 2` 的 `Valid == 1`，直接取出物理页号构造物理地址访问 DRAM，完全由硬件完成，无需操作系统介入。

2. **缺页异常（Page Fault，Slides 12–16）**：当 CPU 访问 `VP 3` 中的某个字时，MMU 查页表发现 `PTE 3` 的 `Valid == 0`，触发硬件异常——**缺页异常（Page Fault Exception）**，控制流陷入操作系统内核的**缺页异常处理程序（Page Fault Handler）**：

   * **第 1 步（选择牺牲页 Victim）**：内核选择一个当前驻留在 DRAM 中的物理页作为牺牲页（例如驻留在 `PP 3` 中的 `VP 4`）。若 `VP 4` 曾被修改过（Dirty bit = 1），内核先将其写回磁盘；随后将 `PTE 4` 的有效位置为 `0`，地址更新为磁盘地址。

   * **第 2 步（调入目标页 Page In）**：内核从磁盘将 `VP 3` 复制到物理内存的 `PP 3` 中，并将 `PTE 3` 的有效位置为 `1`、指向 `PP 3`。

   * **第 3 步（重启指令 Restart）**：缺页处理程序返回原进程，**重新执行（Restart）刚才触发缺页的那条访存指令**。此时 `VP 3` 已在 DRAM 中，再次翻译立即产生 **Page Hit**！

3. **分配新页面（Allocating Pages，Slide 17）**：当程序调用 `malloc` 申请新内存或内核分配新页（如分配 `VP 5`）时，内核在磁盘上留出空间，并将 `PTE 5` 从 `null` 更新为指向磁盘上新创建的 `VP 5`（此时 `Valid` 仍为 `0`，等到首次真正读写时再触发缺页调入）。

:::tip[关键术语：按需页面调度（Demand Paging）与工作集（Working Set / Thrashing）]

* **按需页面调度（Demand Paging）**：直到发生缺页不命中（Miss）时才把页面从磁盘换入 DRAM 的策略称为按需页面调度，所有现代操作系统均采用此策略。

* **工作集（Working Set）与抖动（Thrashing，Slide 18）**：由于时间局部性，程序在任意时刻往往只集中访问一小部分活跃的虚拟页面，这组活跃页称为**工作集（Working Set）**。

  * 若单个进程的 $\text{Working Set Size} < \text{Main Memory Size}$，在经历最初的强制性不命中（Compulsory Misses）后，工作集全部常驻内存，虚拟内存运行极快。

  * 若多个并发进程的工作集总和 $\sum (\text{Working Set Sizes}) > \text{Main Memory Size}$，系统会陷入页面在内存与磁盘之间不停换入换出的性能崩溃状态，称为**抖动（Thrashing）**。

:::

### 1.3 虚拟内存作为内存管理工具（VM as a Tool for Memory Management）

每个进程拥有独立的页表与独立的虚拟地址空间，为操作系统带来了四大管理便利（Slides 20–22）：

1. **简化内存分配（Simplifying Memory Allocation）**：用户程序申请一段连续的虚拟内存（如 `malloc` 大数组）时，操作系统无需在物理 DRAM 中寻找连续的物理内存块，只需将连续的虚拟页映射到任意离散的物理页即可。

2. **简化进程间代码与数据共享（Sharing Code and Data）**：不同进程的虚拟页可以映射到**同一个物理页**。例如所有 C 程序都需要调用标准库 `printf`（位于 `libc.so`），操作系统只需在物理内存中保存一份只读的 `libc.so` 代码页（如 `PP 6`），并将进程 1 和进程 2 各自的虚拟页都指向 `PP 6`。

3. **简化链接（Simplifying Linking）**：每个进程都拥有格式完全相同的虚拟地址空间布局。例如在 64 位 Linux 系统上，所有可执行文件的代码段（`.init`, `.text`, `.rodata`）总是固定从虚拟地址 `0x400000` 开始向上生长，紧接着是读写数据段（`.data`, `.bss`）、运行时堆（由 `malloc` 创建并通过 `brk` 指针向上扩展）、共享库内存映射区，以及从用户空间顶部向下生长的用户栈（`%rsp` 指向栈顶）；再往上是用户代码不可见的内核虚拟内存（Kernel Virtual Memory）。链接器完全不需要关心代码最终会被加载到物理内存的什么位置。

4. **简化加载（Simplifying Loading）**：Linux 的 `execve()` 加载可执行文件时，**根本不需要立即把磁盘上的 `.text` 和 `.data` 段真正读入内存**！它只需分配对应的虚拟页区域，把页表项标记为无效（`Valid = 0`）并指向可执行文件在磁盘上的对应偏移位置。当 CPU 开始从入口地址取指执行时，虚拟内存系统会通过缺页异常一页一页地按需调入。

### 1.4 虚拟内存作为内存保护工具（VM as a Tool for Memory Protection）

为了控制进程对内存的访问权限，PTE 中扩展了若干权限位（Permission Bits，Slide 24），MMU 在**每次地址翻译**时都会硬件检查这些标志位：

* **`SUP`（Supervisor 位）**：`Yes` 表示仅内核模式（Kernel Mode）可访问，`No` 表示用户模式也可访问。

* **`READ` / `WRITE` / `EXEC`**：分别控制该虚拟页是否可读、可写、可执行。

如果用户指令违反了权限条件（例如向 `WRITE = No` 的只读代码页写入数据，或在用户态访问 `SUP = Yes` 的内核页），MMU 会触发 CPU 保护异常（Protection Exception），Linux 内核通常会向违规进程发送 `SIGSEGV` 信号，终端报错为 **`Segmentation fault`（段错误）**。

### 1.5 页表与 TLB 地址翻译机制（Address Translation）

我们将地址翻译视为一个映射函数 $\text{MAP}: V \to P \cup \{\varnothing\}$：

$$

\text{MAP}(a) = \begin{cases} a', & \text{若虚拟地址 } a \text{ 处的数据位于物理内存地址 } a' \in P \text{ 中} \\ \varnothing, & \text{若虚拟地址 } a \text{ 处的数据不在物理内存中（未分配或在磁盘上）} \end{cases}

$$

#### 地址翻译符号汇总表（Slide 27）

| 类别 | 符号 | 英文全称 | 含义与位宽计算 |
| ----- | ----- | ----- | ----- |
| **基本参数** | $N = 2^n$ | Number of virtual addresses | 虚拟地址空间大小，虚拟地址共 $n$ 位 |
| **基本参数** | $M = 2^m$ | Number of physical addresses | 物理地址空间大小，物理地址共 $m$ 位 |
| **基本参数** | $P = 2^p$ | Page size (bytes) | 页面大小（字节），页内偏移共 $p$ 位 |
| **虚拟地址 (VA) 组件** | $\text{VPO}$ | Virtual Page Offset | 虚拟页偏移量，位于低 $p$ 位（bits $p-1 \dots 0$） |
| **虚拟地址 (VA) 组件** | $\text{VPN}$ | Virtual Page Number | 虚拟页号，位于高 $n-p$ 位（bits $n-1 \dots p$） |
| **虚拟地址 (VA) 组件** | $\text{TLBI}$ | TLB Index | TLB 组索引，取自 $\text{VPN}$ 的低 $t$ 位（当 TLB 有 $T=2^t$ 组时） |
| **虚拟地址 (VA) 组件** | $\text{TLBT}$ | TLB Tag | TLB 标记，取自 $\text{VPN}$ 的高 $n-p-t$ 位 |
| **物理地址 (PA) 组件** | $\text{PPO}$ | Physical Page Offset | 物理页偏移量，位于低 $p$ 位（**恒有** $\text{PPO} = \text{VPO}$） |
| **物理地址 (PA) 组件** | $\text{PPN}$ | Physical Page Number | 物理页号，位于高 $m-p$ 位（bits $m-1 \dots p$） |

#### 单级页表地址翻译流程（Slides 28–30）

CPU 内有一个控制寄存器叫**页表基址寄存器（Page Table Base Register, PTBR，在 x86-64 中为 `CR3` 寄存器）**，指向当前进程页表在物理内存中的起始地址。由于页面大小为 $2^p$ 字节且按页对齐，**虚拟页偏移** $\text{VPO}$ **与物理页偏移** $\text{PPO}$ **完全相同，无需翻译直接复制**；MMU 只需将高位的 $\text{VPN}$ 作为数组下标，结合 `PTBR` 计算出页表项物理地址 $\text{PTEA}$，从内存中取出对应的 $\text{PPN}$，与 $\text{PPO}$ 拼接成物理地址 $\text{PA} = [\text{PPN} \mid \text{PPO}]$：

* **Page Hit 的 5 步硬件流程（Slide 29）**：

  1. 处理器生成虚拟地址 $\text{VA}$ 并传给 MMU；

  2. MMU 根据 $\text{PTBR} + \text{VPN}$ 生成页表项地址 $\text{PTEA}$，向高速缓存/主存请求该 PTE；

  3. 高速缓存/主存向 MMU 返回 $\text{PTE}$；

  4. MMU 检出 `Valid == 1`，拼接构造出物理地址 $\text{PA}$ 发送给高速缓存/主存；

  5. 高速缓存/主存将最终请求的数据字（Data word）返回给处理器。

* **Page Fault 的 7 步软硬件协同流程（Slide 30）**：

  1. 处理器生成 $\text{VA}$ 传给 MMU；

  2. MMU 发送 $\text{PTEA}$ 请求页表项；

  3. 高速缓存/主存返回 $\text{PTE}$；

  4. MMU 发现 $\text{PTE}$ 中的 `Valid == 0`，触发缺页异常（Exception），将控制权移交内核缺页异常处理程序；

  5. 缺页处理程序确定物理内存中的牺牲页（若已被修改则先换出写回磁盘）；

  6. 缺页处理程序从磁盘调入所需的新页面，并更新内存中的 $\text{PTE}$（置 `Valid = 1` 及新 $\text{PPN}$）；

  7. 缺页处理程序返回原进程，**重新执行导致缺页的指令**（此时再次走步驟 1–5 的 Page Hit 流程）。

#### 虚拟内存与硬件 Cache 的集成及 TLB 加速（Slides 31–35）

在大多数系统中，SRAM 硬件缓存（L1/L2/L3 Cache）位于 MMU 之后，使用物理地址（PA）进行寻址（Physically Addressed）。页表项（PTE）本身也可以像普通数据字一样被缓存在 L1 Cache 中。但即便 PTE 在 L1 Cache 中命中，每次访存依然需要先花 1–2 个时钟周期去 L1 查 PTE，再访问真正的数据。

为了彻底消除这笔查表开销，MMU 内部集成了一个专用的小型组相联硬件缓存——**TLB（Translation Lookaside Buffer，快表/后备缓冲器）**，专门缓存少量的**完整页表项（PTE）**：

* 若 TLB 有 $T = 2^t$ 个组（Sets），则 MMU 将虚拟页号 $\text{VPN}$ 拆分为两部分：低 $t$ 位作为 $\text{TLBI}$**（TLB Index）** 选中对应组，高 $n-p-t$ 位作为 $\text{TLBT}$**（TLB Tag）** 与该组内各行的 Tag 并行比对：

  $$

  \underbrace{\overbrace{\text{TLBT}}^{n-p-t\text{ bits}} \;\; \overbrace{\text{TLBI}}^{t\text{ bits}}}_{\text{VPN } (n-p\text{ bits})} \;\; \underbrace{\text{VPO}}_{p\text{ bits}}

  $$

* **TLB 命中（TLB Hit，Slide 34）**：步骤 1（CPU 发 VA）$\to$ 步骤 2–3（MMU 在片内 TLB 中直接取出 PTE，**0 次主存/L1 访问**）$\to$ 步骤 4（MMU 发 PA 到 Cache/Memory）$\to$ 步骤 5（返回 Data）。

* **TLB 不命中（TLB Miss，Slide 35）**：MMU 必须额外访问一次 L1 Cache/主存（步骤 3–4）取出 PTE 并填入 TLB，随后再访问数据（步骤 5–6）。得益于页面较大（$4\text{ KB}$）带来的极强空间局部性，TLB 不命中在实际运行中非常罕见。

#### 多级页表（Multi-Level Page Tables，Slides 36–38）

为什么不能在 64 位系统上直接使用单级线性页表？我们算一笔账（Slide 36）：

* 假设页面大小 $P = 4\text{ KB} = 2^{12}\text{ bytes}$，虚拟地址空间为 48 位（$N = 2^{48}\text{ bytes}$），每个页表项 $\text{PTE}$ 占 $8\text{ bytes} = 2^3\text{ bytes}$。

* 单级页表需要包含 $2^{48 - 12} = 2^{36}$ 个 PTE，总大小高达：

  $$

  2^{48} \times 2^{-12} \times 2^3 = 2^{39}\text{ bytes} = 512\text{ GB}

  $$

  仅仅为了一个进程维护一张空页表就要吃掉 $512\text{ GB}$ 内存，这是完全不可接受的！

**解决方案：多级页表（**$k$**-level Page Table）**。将虚拟页号 $\text{VPN}$ 切分为 $k$ 段：$\text{VPN}_1, \text{VPN}_2, \dots, \text{VPN}_k$。以 **32 位地址、**$4\text{ KB}$ **页面、**$4\text{ Byte}$ **PTE 的二级页表（Slide 37）** 为例：

* 每个页面可容纳 $4\text{ KB} / 4\text{ B} = 1\text{K} = 1024$ 个 PTE，因此 $\text{VPN}_1$（10 bits）索引**一级页表（Level 1 Page Table）**，每个一级 PTE 管辖 $1024 \times 4\text{ KB} = 4\text{ MB}$ 的虚拟地址空间（共 1024 个虚拟页）。

* 假设某进程只分配了低地址的 2048 个虚拟页（`VP 0`–`VP 2047`，存放代码与数据）以及高地址的 1 个栈页面（`VP 9215`），中间有 6K 个未分配页：

  * 一级页表中只有 `PTE 0`（管 `VP 0..1023`）、`PTE 1`（管 `VP 1024..2047`）和 `PTE 8`（管 `VP 8192..9215`）非空并指向对应的二级页表；

  * 其余 $1024 - 3 = 1021$ 个一级 PTE 全部为 `null`，**根本不需要为它们分配任何二级页表物理内存**！而且二级页表本身也可以像普通数据页一样按需换入换出，只有一级页表（仅占 $4\text{ KB}$）需要常驻主存。

## 二、内存系统实例、Core i7/Linux 案例与内存映射（VM: Systems）

### 2.1 微缩内存系统端到端地址翻译手算实例（Slides 4–10）

这是 CS:APP 期中/期末考试必考的经典题型。给定如下微缩内存系统参数：

* **虚拟地址位宽**：$n = 14\text{ bits}$（`13..0`）；

* **物理地址位宽**：$m = 12\text{ bits}$（`11..0`）；

* **页面大小**：$P = 64\text{ bytes} = 2^6\text{ bytes} \implies p = 6\text{ bits}$。

由此立即推导出虚拟地址与物理地址的位域切分：

1. **虚拟地址（14 bits）切分**：

   * $\text{VPO}$：低 $p = 6$ 位（bits `5..0`）；

   * $\text{VPN}$：高 $n - p = 14 - 6 = 8$ 位（bits `13..6`）；

   * **TLB 参数**：共 16 个表项，4 路组相联 $\implies$ 组数 $T = 16 / 4 = 4 = 2^2 \implies t = 2\text{ bits}$。因此 $\text{TLBI}$ 为 $\text{VPN}$ 的低 2 位（bits `7..6`），$\text{TLBT}$ 为 $\text{VPN}$ 的高 6 位（bits `13..8`）。

2. **物理地址（12 bits）切分**：

   * $\text{PPO}$：低 $p = 6$ 位（bits `5..0`，直接等于 $\text{VPO}$）；

   * $\text{PPN}$：高 $m - p = 12 - 6 = 6$ 位（bits `11..6`）；

   * **L1 Cache 参数**：物理寻址、直接映射（Direct-mapped），共 16 行（Lines/Sets），每行块大小 $B = 4\text{ bytes} = 2^2\text{ bytes}$：

     * 块内偏移 $\text{CO}$（Cache Offset）：低 $b = 2$ 位（bits `1..0`）；

     * 缓存组索引 $\text{CI}$（Cache Index）：中间 $s = \log_2(16) = 4$ 位（bits `5..2`）；

     * 缓存标记 $\text{CT}$（Cache Tag）：高 $12 - 4 - 2 = 6$ 位（bits `11..6`，恰好等于 $\text{PPN}$！）。

#### 硬件状态表（TLB、页表前 16 项、直接映射 Cache）

**1. TLB 状态表（4 组** $\times$ **4 路）**：

| Set (`TLBI`) | Way 0 (Tag / PPN / Valid) | Way 1 (Tag / PPN / Valid) | Way 2 (Tag / PPN / Valid) | Way 3 (Tag / PPN / Valid) |
| ----- | ----- | ----- | ----- | ----- |
| **0** | `03` / `–` / `0` | `09` / `0D` / `1` | `00` / `–` / `0` | `07` / `02` / `1` |
| **1** | `03` / `2D` / `1` | `02` / `–` / `0` | `04` / `–` / `0` | `0A` / `–` / `0` |
| **2** | `02` / `–` / `0` | `08` / `–` / `0` | `06` / `–` / `0` | `03` / `–` / `0` |
| **3** | `07` / `–` / `0` | `03` / `0D` / `1` | `0A` / `34` / `1` | `02` / `–` / `0` |

**2. 页表（Page Table，仅展示前 16 项 `VPN 00..0F`）**：

| VPN | PPN | Valid | VPN | PPN | Valid |
| ----- | ----- | ----- | ----- | ----- | ----- |
| `00` | `28` | `1` | `08` | `13` | `1` |
| `01` | `–` | `0` | `09` | `17` | `1` |
| `02` | `33` | `1` | `0A` | `09` | `1` |
| `03` | `02` | `1` | `0B` | `–` | `0` |
| `04` | `–` | `0` | `0C` | `–` | `0` |
| `05` | `16` | `1` | `0D` | `2D` | `1` |
| `06` | `–` | `0` | `0E` | `11` | `1` |
| `07` | `–` | `0` | `0F` | `0D` | `1` |

**3. L1 Cache 状态表（16 行，每行 4 字节 `B0..B3`）**：

| Idx (`CI`) | Tag (`CT`) | Valid | `B0` | `B1` | `B2` | `B3` | Idx (`CI`) | Tag (`CT`) | Valid | `B0` | `B1` | `B2` | `B3` |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| **0** | `19` | `1` | `99` | `11` | `23` | `11` | **8** | `24` | `1` | `3A` | `00` | `51` | `89` |
| **1** | `15` | `0` | `–` | `–` | `–` | `–` | **9** | `2D` | `0` | `–` | `–` | `–` | `–` |
| **2** | `1B` | `1` | `00` | `02` | `04` | `08` | **A** | `2D` | `1` | `93` | `15` | `DA` | `3B` |
| **3** | `36` | `0` | `–` | `–` | `–` | `–` | **B** | `0B` | `0` | `–` | `–` | `–` | `–` |
| **4** | `32` | `1` | `43` | `6D` | `8F` | `09` | **C** | `12` | `0` | `–` | `–` | `–` | `–` |
| **5** | `0D` | `1` | `36` | `72` | `F0` | `1D` | **D** | `16` | `1` | `04` | `96` | `34` | `15` |
| **6** | `31` | `0` | `–` | `–` | `–` | `–` | **E** | `13` | `1` | `83` | `77` | `1B` | `D3` |
| **7** | `16` | `1` | `11` | `C2` | `DF` | `03` | **F** | `14` | `0` | `–` | `–` | `–` | `–` |

#### 例题 1：翻译虚拟地址 `VA = 0x03D4`（Slide 8）

1. **展开为 14 位二进制**：`0x03D4` $= \text{00 0011 1101 0100}_2$：

   ```
   Bit:   13 12 11 10  9  8 |  7  6 |  5  4  3  2  1  0
   Bin:    0  0  0  0  1  1 |  1  1 |  0  1  0  1  0  0
          <---- TLBT ----->   <TLBI>  <----- VPO ----->
          <--------- VPN --------->
   ```

2. **提取虚拟地址字段**：

   * $\text{VPN} = \text{00001111}_2 = \text{0x0F}$；

   * $\text{TLBI} = \text{11}_2 = \text{0x3}$，$\text{TLBT} = \text{000011}_2 = \text{0x03}$；

   * $\text{VPO} = \text{010100}_2 = \text{0x14}$。

3. **查询 TLB**：查 `Set 3`，发现 Way 1 的 `Tag = 03` 且 `Valid = 1`，命中！

   * **TLB Hit?** `Y`

   * **Page Fault?** `N`

   * $\text{PPN} = \text{0x0D} = \text{001101}_2$。

4. **构造 12 位物理地址并查询 L1 Cache**：

   * 将 $\text{PPN} = \text{001101}_2$ 与 $\text{PPO} = \text{VPO} = \text{010100}_2$ 拼接，得物理地址二进制：

     ```
     Bit:   11 10  9  8  7  6 |  5  4  3  2 |  1  0
     Bin:    0  0  1  1  0  1 |  0  1  0  1 |  0  0
            <--- PPN / CT --->  <--- CI --->  <CO>
     ```

   * $\text{CO} = \text{00}_2 = \text{0}$，$\text{CI} = \text{0101}_2 = \text{0x5}$，$\text{CT} = \text{001101}_2 = \text{0x0D}$；

   * 查 Cache 第 `5` 行：`Valid = 1` 且 `Tag = 0D` 与 $\text{CT}$ 匹配 $\implies$ **Cache Hit?** `Y`；取第 `B0` 字节，得返回值 **`Byte = 0x36`**。

#### 例题 2：翻译虚拟地址 `VA = 0x0020`（Slides 9–10）

1. **展开为 14 位二进制**：`0x0020` $= \text{00 0000 0010 0000}_2$：

   ```
   Bit:   13 12 11 10  9  8 |  7  6 |  5  4  3  2  1  0
   Bin:    0  0  0  0  0  0 |  0  0 |  1  0  0  0  0  0
          <---- TLBT ----->   <TLBI>  <----- VPO ----->
          <--------- VPN --------->
   ```

2. **提取虚拟地址字段**：

   * $\text{VPN} = \text{00000000}_2 = \text{0x00}$；

   * $\text{TLBI} = \text{00}_2 = \text{0}$，$\text{TLBT} = \text{000000}_2 = \text{0x00}$；

   * $\text{VPO} = \text{100000}_2 = \text{0x20}$。

3. **查询 TLB 与页表**：

   * 查 TLB `Set 0`：Way 2 的 `Tag = 00`，但 `Valid = 0` $\implies$ **TLB Hit?** `N`；

   * 转查内存页表 `VPN = 00`：表中 `Valid = 1`，对应 $\text{PPN} = \text{0x28} = \text{101000}_2$ $\implies$ **Page Fault?** `N`，$\text{PPN} = \text{0x28}$。

4. **构造 12 位物理地址并查询 L1 Cache**：

   * 拼接 $\text{PPN} = \text{101000}_2$ 与 $\text{PPO} = \text{100000}_2$：

     ```
     Bit:   11 10  9  8  7  6 |  5  4  3  2 |  1  0
     Bin:    1  0  1  0  0  0 |  1  0  0  0 |  0  0
            <--- PPN / CT --->  <--- CI --->  <CO>
     ```

   * $\text{CO} = \text{00}_2 = \text{0}$，$\text{CI} = \text{1000}_2 = \text{0x8}$，$\text{CT} = \text{101000}_2 = \text{0x28}$；

   * 查 Cache 第 `8` 行：`Valid = 1`，但行内 `Tag = 24` $\neq \text{0x28}$ $\implies$ **Cache Hit?** `N`，需要访问主存，记 **`Byte = Mem`**。

### 2.2 真实工业级案例：Intel Core i7 / Linux 内存系统（Slides 12–21）

#### Intel Core i7 硬件层次参数（Slides 12, 14）

在单颗四核 Intel Core i7 处理器封装（Processor Package）内：

* **每个核心私有（Per-Core）**：

  * **TLB**：L1 d-TLB（64 项，4 路组相联，即 16 组）、L1 i-TLB（128 项，4 路组相联）、L2 unified TLB（512 项，4 路组相联）。

  * **SRAM Cache**：L1 d-cache（$32\text{ KB}$，8 路组相联，64 组，块大小 $64\text{ B}$）、L1 i-cache（$32\text{ KB}$，8 路组相联）、L2 unified cache（$256\text{ KB}$，8 路组相联）。

* **所有核心共享（Shared by All Cores）**：L3 unified cache（$8\text{ MB}$，16 路组相联）以及三通道 DDR3 内存控制器（总带宽 $32\text{ GB/s}$）。

#### Core i7 端到端地址翻译与四级页表结构（Slides 14–17）

Core i7 采用 **48 位虚拟地址（VA）** 和 **52 位物理地址（PA）**，常规页大小为 $4\text{ KB} = 2^{12}\text{ B}$：

* **虚拟地址切分**：低 12 位为 $\text{VPO}$，高 36 位为 $\text{VPN}$。

  * 当访问 L1 d-TLB（16 组 $= 2^4$ 组）时，36 位 $\text{VPN}$ 拆分为 4 位 $\text{TLBI}$ 和 32 位 $\text{TLBT}$。

  * 当发生 TLB Miss 进行四级页表遍历时，36 位 $\text{VPN}$ 被均分为 **4 个 9-bit 的子页号**：$\text{VPN}_1$（9 bits）、$\text{VPN}_2$（9 bits）、$\text{VPN}_3$（9 bits）、$\text{VPN}_4$（9 bits），每个子页号索引一张包含 $2^9 = 512$ 个 8 字节 PTE（恰好占 $4\text{ KB}$ 一页）的页表，由控制寄存器 `CR3` 指向 L1 页表物理基址：

| 页表层级 | Linux 内核名称 | 索引字段 | 单个表项覆盖的虚拟地址范围 |
| ----- | ----- | ----- | ----- |
| **Level 1 PT** | Page Global Directory (`PGD`，全局页目录) | $\text{VPN}_1$ (9 bits) | $2^{39}\text{ B} = \mathbf{512\text{ GB}}$ |
| **Level 2 PT** | Page Upper Directory (`PUD`，上级页目录) | $\text{VPN}_2$ (9 bits) | $2^{30}\text{ B} = \mathbf{1\text{ GB}}$ |
| **Level 3 PT** | Page Middle Directory (`PMD`，中级页目录) | $\text{VPN}_3$ (9 bits) | $2^{21}\text{ B} = \mathbf{2\text{ MB}}$ |
| **Level 4 PT** | Page Table (`PT`，页表) | $\text{VPN}_4$ (9 bits) | $2^{12}\text{ B} = \mathbf{4\text{ KB}}$ |

* **Core i7 的 64 位 PTE 关键字段解析（Slides 15–16）**：

  * `P` (Bit 0, Present)：存在位，`1` 表示子页表/物理页在内存中，`0` 表示不在内存中（此时其余 63 位可供 OS 记录磁盘换出位置）。

  * `R/W` (Bit 1)：`0` 只读，`1` 可读写（在 L1–L3 PTE 中对所有下辖可达页生效）。

  * `U/S` (Bit 2)：`0` 仅内核态（Supervisor）可访问，`1` 用户态（User）也可访问。

  * `WT` (Bit 3)：子页表或物理页采用直写（Write-through）还是写回（Write-back）策略。

  * `CD` (Bit 4)：Cache Disable（禁用硬件缓存位）。

  * `A` (Bit 5, Reference bit)：访问位，每次读写时由 MMU 自动置 `1`，由操作系统软件定期清零，用于实现页面替换算法（近似 LRU）。

  * `D` (Bit 6, Dirty bit，**仅 Level 4 PTE 有效**) / `PS` (Bit 7, Page Size，仅 Level 1 PTE 定义为 $4\text{ KB}$ 或 $4\text{ MB}$)：在 Level 4 PTE 中，Bit 6 是脏位 `D`，由 MMU 在写入该页时自动置 `1`，指导淘汰时是否需要写盘。

  * `G` (Bit 8, Global)：全局页标志（在进程切换更新 `CR3` 时不从 TLB 中刷新出去，常用于内核公共页）。

  * `Page table / Page physical base address` (Bits `51..12`，共 40 bits)：子页表或物理页的物理基地址高 40 位（强制所有页表与物理页按 $4\text{ KB} = 2^{12}$ 对齐）。

  * `XD` (Bit 63, Execute Disable)：不可执行位（即 NX 位），置 `1` 时禁止从该页取指执行，防御缓冲区溢出代码注入攻击。

:::important[加速 L1 Cache 访问的精妙技巧：VIPT（虚拟索引、物理标记，Slide 18）]

观察 Core i7 的物理地址（52 bits）在访问 L1 d-cache（64 组 $= 2^6$ 组，块大小 $64\text{ B} = 2^6\text{ B}$）时的切分：

* 块偏移 $\text{CO}$ 占低 6 位（bits `5..0`），组索引 $\text{CI}$ 占中间 6 位（bits `11..6`），标记 $\text{CT}$ 占高 40 位（bits `51..12`，即 $\text{PPN}$）。

* 注意到 $\text{CI}$ 和 $\text{CO}$ 合计正好是低 **12 位**，落在了无需翻译、在虚拟地址与物理地址中完全一致的 $\text{VPO}/\text{PPO}$**（12 bits）** 内部！

* 因此，当 CPU 发出虚拟地址时，硬件可以**一边把** $\text{VPN}$ **送给 TLB 做地址翻译，一边同时把** $\text{VPO}$ **的高 6 位（**$\text{CI}$**）送给 L1 Cache 选中对应的缓存组并读出 8 路候选行的 Tag**！等 TLB 命中输出 40 位 $\text{PPN}$（即 $\text{CT}$）时，立即与读出的 8 个 Tag 做比对。这种设计称为 **Virtually Indexed, Physically Tagged（VIPT，虚拟索引、物理标记）**，这也是为什么 L1 Cache 容量通常被精心设计为 `组数 × 块大小 ≤ 页大小 (4 KB)`（$64 \times 64\text{ B} = 4096\text{ B}$）。

:::

#### Linux 进程虚拟地址空间与缺页异常处理（Slides 19–21）

1. **Linux 进程完整虚拟地址空间布局（Slide 19）**：

   * **下半部分（用户虚拟内存 Process Virtual Memory）**：从 `0x00400000` 起依次为 `.text`（代码段）、`.data`（已初始化数据）、`.bss`（未初始化数据）、运行时堆 `Heap`（向高地址生长，顶界为 `brk`）、共享库内存映射区（Memory-mapped region for shared libraries）、用户栈 `User stack`（从用户空间最高处随 `%rsp` 向低地址生长）。

   * **上半部分（内核虚拟内存 Kernel Virtual Memory）**：驻留在用户栈之上，分为两部分：

     * **所有进程完全相同（Identical for each process）**：内核代码与全局数据结构（Kernel code and data），以及**全部物理内存的直接连续映射（Physical memory）**（方便内核直接读写任意物理页，如页表）。

     * **每个进程各自不同（Different for each process）**：进程专属的内核数据结构，如该进程的页表（`ptables`）、`task_struct`、`mm_struct` 以及内核栈（Kernel stack）。

2. **Linux 用区域链表（Areas）组织虚拟内存（Slide 20）**：

   * 内核为每个进程维护一个任务结构 `task_struct`，其中的 `mm` 指针指向内存管理结构 `mm_struct`：

     * `pgd`：指向第一级页表（L1 Page Global Directory）基地址，进程切换时内核将 `pgd` 装入 `CR3` 寄存器；

     * `mmap`：指向一个由 **`vm_area_struct`（虚拟内存区域结构）** 构成的链表（或红黑树），每个节点描述一段具有相同属性的连续已分配虚拟地址区间：

       * `vm_start` / `vm_end`：该区域的起始与结束虚拟地址；

       * `vm_prot`：该区域内所有页面的读/写/执行权限；

       * `vm_flags`：标记该区域页面是由多进程共享（Shared）还是当前进程私有（Private）。

3. **Linux 缺页异常的三步合法性检查（Slide 21）**：

   当虚拟地址 $A$ 触发缺页异常时，Linux 缺页处理程序沿着 `vm_area_struct` 链表做三次判定：

   * **判定 ①（地址是否合法？对应图中 `1 read`）**：虚拟地址 $A$ 是否落在某个 `vm_area_struct` 定义的 `[vm_start, vm_end)` 区间内？若不在任何区间内（访问了不存在的页面），触发非法地址段错误（Segmentation fault: accessing a non-existing page）并终止进程。

   * **判定 ②（权限是否合法？对应图中 `2 write`）**：本次访存操作是否符合该区域 `vm_prot` 规定的权限（例如试图向只读的 `text` 代码区执行 `write` 写入，或用户态写只读 COW 页）？若越权，触发**保护异常（Protection exception）**，Linux 同样向用户报告为 `Segmentation fault`。

   * **判定 ③（正常缺页！对应图中 `3 read`）**：地址既合法、权限也合法（例如首次读取 `data` 段尚未调入 DRAM 的页面），则属于**正常缺页（Normal page fault）**，内核分配物理页、从磁盘读入数据并重启指令。

### 2.3 内存映射（Memory Mapping）、写时复制（COW）与 `mmap`（Slides 23–32）

Linux 通过将一个虚拟内存区域（`vm_area_struct`）与磁盘上的一个对象关联起来，以初始化该区域的内容，这一过程称为**内存映射（Memory Mapping，Slide 23）**。映射的背后对象分为两类：

1. **普通磁盘文件（Regular file on disk）**：如可执行文件 `a.out` 或动态共享库 `libc.so`，初始页面字节直接来自文件的对应片段；

2. **匿名文件（Anonymous file）**：由内核创建、不包含任何磁盘数据的逻辑文件。当 CPU 首次访问匿名页触发缺页时，内核在物理内存中找一个空闲页并**全部清零**后映射过去，因此也称为**请求二进制零的页（Demand-zero page）**（如 `.bss` 段、堆、栈）。一旦页面被写入变脏（Dirtied），换出时就会保存在专用的交换文件（Swap file）中。

#### 共享对象（Shared Objects）vs. 私有写时复制对象（Private Copy-on-Write, COW，Slides 24–27）

| 映射类型 | 多进程物理页映射机制 | 写操作行为 | 典型用途 |
| ----- | ----- | ----- | ----- |
| **共享对象（Shared Object）** | 进程 1 和进程 2 将各自的虚拟内存区域（虚拟地址可以不同）映射到**同一块物理内存页**。 | 任一进程对共享区域的写入，对另一个进程**立即直接可见**，也会同步反映到底层磁盘文件。 | 多进程共享动态库代码、进程间共享内存通信（IPC）。 |
| **私有写时复制对象（Private COW Object）** | 两个进程起初也映射到**同一块物理内存页**，但双方对应的 `vm_area_struct` 被标记为**私有写时复制（Private COW）**，且双方页表项 PTE 均被强制标记为**只读（Read-only）**。 | 只要双方都只读，就一直共享同一物理页；一旦某个进程试图写入私有页，立即触发**保护异常（Protection fault）**，故障处理程序在物理内存中**新分配一页并复制原内容**，将该进程的 PTE 重定向到新物理页并恢复为**可读写（R/W）**，然后重启写指令！ | `fork()` 创建子进程、多进程加载同一可执行文件的私有 `.data` 段。 |

#### 用虚拟内存重新审视 `fork()` 与 `execve()`（Slides 28–29）

1. **`fork()` 为何极快且拥有独立地址空间？（Slide 28）**

   当父进程调用 `fork()` 创建子进程时，内核**根本不复制任何物理内存页**！内核只需：

   * 为子进程创建当前父进程 `mm_struct`、`vm_area_struct` 链表和各级页表（Page Tables）的精确副本；

   * 将父、子进程中所有可写页面的 PTE 全部标为**只读（Read-only）**，并将双方的 `vm_area_struct` 标记为 **Private COW（私有写时复制）**；

   * `fork()` 返回时，父子进程虚拟内存内容一模一样且共享全部物理页；后续任一进程发生写入时，才通过 COW 机制按需复制被修改的单个物理页。

2. **`execve("a.out", ...)` 是如何替换当前进程程序的？（Slide 29）**

   在当前进程中加载并运行新程序 `a.out` 仅需以下 4 步（零磁盘数据拷贝启动）：

   * **步骤 1**：删除当前进程用户空间已有的全部旧 `vm_area_struct` 和页表；

   * **步骤 2**：为新程序创建新的 `vm_area_struct` 区域和空页表：

     * 将代码段 `.text` 和已初始化数据段 `.data` 映射为私有的、文件支持的（Private, file-backed）区域，关联到磁盘上的 `a.out`；

     * 将未初始化数据 `.bss`、运行时堆（Heap）和用户栈（User stack）映射为私有的、请求二进制零的（Private, demand-zero）匿名文件区域；

     * 若 `a.out` 链接了共享库（如 `libc.so`），将其映射为共享的、文件支持的（Shared, file-backed）区域；

   * **步骤 3**：将程序计数器 `PC`（`%rip`）指向 `.text` 段的入口点（Entry point）；

   * **步骤 4**：开始执行指令，Linux 通过缺页异常按需将代码页和数据页从磁盘换入内存。

#### 用户级内存映射函数 `mmap` 与 `mmapcopy.c` 实战（Slides 30–32）

应用程序可以直接调用 `mmap` 函数创建新的虚拟内存区域并将文件对象映射进去：

```
#include "csapp.h"

// 原型：void *mmap(void *start, int len, int prot, int flags, int fd, int offset);
// prot: PROT_READ, PROT_WRITE, PROT_EXEC, PROT_NONE
// flags: MAP_ANON (匿名映射), MAP_PRIVATE (私有 COW), MAP_SHARED (共享映射)

void mmapcopy(int fd, int size)
{
    /* Ptr to memory mapped area */
    char *bufp;
    bufp = Mmap(NULL, size, PROT_READ, MAP_PRIVATE, fd, 0);
    Write(1, bufp, size);
    return;
}

int main(int argc, char **argv)
{
    struct stat stat;
    int fd;
    if (argc != 2) {
        printf("usage: %s <filename>\n", argv[0]);
        exit(0);
    }
    fd = Open(argv[1], O_RDONLY, 0);
    Fstat(fd, &stat);
    mmapcopy(fd, stat.st_size);
    exit(0);
}
```

## 三、动态内存分配基础与隐式空闲链表（Basic Concepts）

### 3.1 动态内存分配器规范、性能目标与碎片分类（Slides 3–14）

动态内存分配器（Dynamic Memory Allocator）管理进程虚拟内存中的**堆（Heap）**区域（位于 `.bss` 上方，顶界为 `brk` 指针）。分配器将堆维护为一组大小可变的**块（Blocks）**的集合，每个块要么是**已分配的（Allocated）**，要么是**空闲的（Free）**。分配器分为两类：

* **显式分配器（Explicit Allocator）**：应用显式申请并显式释放空间（如 C 中的 `malloc` 与 `free`）；

* **隐式分配器（Implicit Allocator / Garbage Collector）**：应用只管申请而不显式释放，由垃圾回收器自动检测并回收不再使用的块（如 Java、Python、Lisp）。

#### `malloc` 包规范与分配器六大硬约束（Slides 5, 9）

* `void *malloc(size_t size)`：成功时返回指向至少 `size` 字节内存块的指针，且地址严格满足 **8 字节对齐（x86 32 位）** 或 **16 字节对齐（x86-64 64 位）**；若 `size == 0` 返回 `NULL`；若内存不足返回 `NULL` 并设置 `errno`。

* `void free(void *p)`：将 `p` 指向的块归还给可用内存池（`p` 必须来自此前 `malloc`/`calloc`/`realloc` 的返回值）。

* 辅助函数：`calloc`（分配并清零）、`realloc`（改变已分配块大小）、`sbrk`（分配器内部调用以向内核申请扩大或缩小堆顶 `brk`）。

* **分配器必须遵守的 6 条硬约束（Slide 9）**：

  1. 无法预知或控制未来分配块的数量与大小；

  2. 必须立即响应 `malloc` 请求（禁止缓存或重排请求顺序）；

  3. 只能从空闲内存中分配块；

  4. 必须对齐块以满足所有对齐要求（8B 或 16B 对齐）；

  5. 只能操作和修改空闲内存；

  6. **一旦块被 `malloc` 分配出去，绝不允许移动或压缩已分配的块（Compaction is not allowed）**！

#### 两大相互冲突的性能目标：吞吐率 vs. 峰值内存利用率（Slides 10–11）

给定一串共 $n$ 个分配与释放请求序列 $R_0, R_1, \dots, R_k, \dots, R_{n-1}$：

1. **最大化吞吐率（Throughput）**：单位时间内完成的请求数（例如 10 秒内完成 5,000 次 `malloc` 和 5,000 次 `free`，则吞吐率为 $1,000\text{ ops/sec}$）。

2. **最大化峰值内存利用率（Peak Memory Utilization** $U_k$**）**：

   * **有效载荷（Payload）**：调用 `malloc(p)` 分配的块中，供应用真正使用的 $p$ 字节称为 Payload；

   * **聚合有效载荷（Aggregate Payload** $P_k$**）**：请求 $R_k$ 完成后，当前所有处于已分配状态的块的 Payload 字节总和；

   * **当前堆大小（Current Heap Size** $H_k$**）**：请求 $R_k$ 完成时的堆总字节数（假设随 `sbrk` 单调非减）；

   * **前** $k+1$ **个请求后的峰值内存利用率** $U_k$：

     $$

     U_k = \frac{\max_{i \le k} P_i}{H_k}

     $$

#### 为什么内存利用率会下降？内部碎片 vs. 外部碎片（Slides 12–14）

| 碎片类型 | 定义与产生原因 | 取决于什么 | 能否精确度量 |
| ----- | ----- | ----- | ----- |
| **内部碎片（Internal Fragmentation）** | 发生在**单个已分配块内部**：当分配块的实际大小（Block Size）大于应用请求的 Payload 时，多出的头部/脚部元数据开销（Header/Footer）以及为了对齐填充的字节（Padding）就是内部碎片。 | **仅取决于以往已发生请求的模式**（Previous requests）。 | **容易精确测量**（就是当前已分配块总大小减去 $P_k$）。 |
| **外部碎片（External Fragmentation）** | 发生在**整个堆的空闲块之间**：当堆中所有空闲块的总容量足够满足新的 `malloc` 请求，但**没有任何一个单独的连续空闲块足够大**时（例如释放 `p2` 后左侧空出 5 个字、右侧剩 2 个字，合计 7 个空闲字，此时请求 `p4 = malloc(6)` 却无法放进任何一个空闲块，只能向 OS 调 `sbrk` 扩堆）。 | **取决于未来请求的模式**（Future requests）。 | **极难度量与预测**。 |

### 3.2 隐式空闲链表（Implicit Free List）的设计与实现（Slides 15–33）

设计一个显式分配器必须解决 **5 个核心实现问题（Slide 15）**：

1. 只有一个指针 `p`，`free(p)` 如何知道要释放多少内存？

2. 如何跟踪记录堆中的所有空闲块（Free Block Organization）？

3. 当选中的空闲块比请求的块大时，多出来的额外空间怎么处理（Splitting）？

4. 当有多个空闲块都能放得下时，如何挑选哪一个（Placement Policy）？

5. 块被释放后，如何重新插入并处理相邻空闲块（Coalescing）？

#### 头部字段（Header）与最低位压缩技巧（Slides 16, 19–20）

为了知道每个块的大小和分配状态，我们在每个块的 Payload 前面加 1 个字（1 word = 4 Bytes）的**头部（Header）**。如果用两个字分别存 `size` 和 `allocated` 太浪费空间；注意到如果所有块都按双字（8 字节）对齐，块大小 `size` 必定是 8 的倍数，其二进制最低 3 位恒为 `000`！因此我们可以直接利用最低 1 位（Bit 0）作为分配标志位 $a$：

$$

\text{Header Word} = \text{Block Size} \mid a, \quad \text{其中 } a = \begin{cases} 1, & \text{Allocated block (已分配)} \\ 0, & \text{Free block (空闲块)} \end{cases}

$$

读取块大小时，只需用位掩码抹去最低位：`size = *p & -2`（或按 8 字节对齐用 `*p & ~0x7`）。通过每个块头部的 `size` 字段，我们可以把堆中**所有的块（无论已分配还是空闲）**像隐式链表一样从头到尾串联起来（最后以一个 `size=0, a=1` 即 `0/1` 的特殊终止头部 Epilogue 结尾），这称为**隐式空闲链表（Implicit Free List）**。

#### 三大放置策略（Placement Policies，Slide 21）

当应用请求大小为 `len` 的块时，分配器如何搜索隐式空闲链表？

1. **首次适配（First Fit）**：从堆起始位置开始线性扫描，选择**第一个**大小满足要求的空闲块：

   ```
   p = start;
   while ((p < end) &&              // 尚未到达堆尾
          ((*p & 1) ||              // 已分配块则跳过
           (*p <= len)))            // 空闲但太小也跳过
       p = p + (*p & -2);           // 跳到下一个块起始处
   ```

   * *优缺点*：实现简单，但最坏耗时与堆中总块数（含已分配和空闲块）成线性关系 $O(N)$，且容易在链表开头堆积许多微小的空闲碎片（"splinters"）。

2. **下一次适配（Next Fit）**：由 Knuth 提出，不从头开始找，而是从**上一次查找结束的位置**继续往后找。

   * *优缺点*：避免重复扫描链表头部无用的小碎片，速度通常比 First Fit 快得多；但研究表明其内存碎片率（峰值利用率）通常比 First Fit 更差。

3. **最佳适配（Best Fit）**：完整扫描整个链表，选择能放得下且剩余字节最少（最接近请求大小）的空闲块。

   * *优缺点*：能把切剩下的碎片压到最小，内存利用率通常最高；但每次分配都必须遍历整条链表，吞吐率较慢。

#### 分割空闲块（Splitting，Slide 22）

如果找到的空闲块大小 `oldsize` 大于对齐后的所需块大小 `newsize`，可以把空闲块一分为二：

```
void addblock(ptr p, int len) {
    int newsize = ((len + 1) >> 1) << 1; // 向上取整到偶数个字（双字对齐）
    int oldsize = *p & -2;               // 屏蔽最低位，取出原空闲块大小
    *p = newsize | 1;                    // 写入新块大小并置 allocated = 1
    if (newsize < oldsize)
        *(p + newsize) = oldsize - newsize; // 在剩余部分的头部写入剩余空闲长度 (allocated = 0)
}
```

#### 假碎片（False Fragmentation）与边界标记双向合并（Boundary Tags，Slides 23–31）

如果 `free(p)` 只简单地清除分配位 `*p = *p & -2`，会出现两个物理上紧挨着的空闲块（如两个大小为 `4` 和 `2` 的空闲块）却没有合并成一个大小为 `6` 的大空闲块，导致随后 `malloc(5)` 失败——这种现象称为**假碎片（False Fragmentation，Slide 23）**。

因此，释放块时必须将它与物理相邻的前、后空闲块合并（**Coalescing**）：

* **向后合并（与下一个块 Next Block 合并，Slide 24）**：非常容易！当前块头部在 `p`，大小为 `*p & -2`，则下一个块的头部就在 `next = p + (*p & -2)`，检查 `(*next & 1) == 0` 即可在 $O(1)$ 时间内合并。

* **向前合并（与前一个块 Previous Block 合并，Slide 25）**：如果只有头部，链表只能单向往后走，怎么在 $O(1)$ 时间内知道**前一个块**的大小和分配状态？

  * **Donald Knuth 的经典发明——边界标记（Boundary Tags, \[Knuth73\]）**：在每个块的**末尾（底部）**复制一份与头部完全相同的 `Size | a` 字，称为**脚部（Footer / Boundary Tag）**！

  * 有了脚部，当前块头部 `p` 往前退 1 个字（`p - 1`）就正好是**前一个块的脚部（Footer of Previous Block）**！读取 `p - 1` 就能在 $O(1)$ 常数时间内直接获知前一个块是否空闲及其总大小。

#### 常数时间合并的 4 种标准情形（Constant Time Coalescing，Slides 26–30）

设当前正在释放的块大小为 $n$，其物理前驱块大小为 $m_1$，物理后继块大小为 $m_2$。根据前驱与后继是否空闲，共有 4 种 $O(1)$ 合并情形：

| 情形 | 前驱块状态 | 后继块状态 | $O(1)$ 边界标记更新操作 | 合并后新空闲块大小 |
| ----- | ----- | ----- | ----- | ----- |
| **Case 1** | Allocated ($m_1/1$) | Allocated ($m_2/1$) | 仅将当前块的 Header 和 Footer 分配位清零（$n/1 \to n/0$）。 | $n$ |
| **Case 2** | Allocated ($m_1/1$) | **Free (**$m_2/0$**)** | 将当前块的 Header 与后继块的 Footer 均更新为 $(n+m_2)/0$。 | $n + m_2$ |
| **Case 3** | **Free (**$m_1/0$**)** | Allocated ($m_2/1$) | 读 `p-1` 得 $m_1$，将前驱块的 Header 与当前块的 Footer 均更新为 $(n+m_1)/0$。 | $n + m_1$ |
| **Case 4** | **Free (**$m_1/0$**)** | **Free (**$m_2/0$**)** | 同时吸收前后两块，将前驱块的 Header 与后继块的 Footer 均更新为 $(n+m_1+m_2)/0$。 | $n + m_1 + m_2$ |

:::tip[边界标记的工程优化：如何省掉已分配块的 Footer？（Slide 31）]

* **问题**：每个块都带 Header + Footer 会额外消耗 2 个字，增加内部碎片。哪些块才真正需要 Footer？

* **解答**：我们在向前合并时，只有在前一个块是空闲块（Free）时才需要通过它的 Footer 查出它的长度 $m_1$；如果前一个块是已分配的（Allocated），我们根本不需要知道它的长度，只需要知道“它是已分配的”即可！

* **优化方案**：利用当前块 Header 中闲置的次低位（Bit 1）记录“前一个物理块是否已分配（Prev-Allocated Bit）”**。这样一来，**已分配块完全不需要 Footer（省出的 1 个字直接归入 Payload）**，只有**空闲块才需要保留 Footer！

:::

## 四、显式/分离空闲链表、垃圾回收与 C 内存缺陷（Advanced Concepts）

### 4.1 显式空闲链表（Explicit Free Lists，Slides 4–12）

隐式空闲链表的致命弱点是 `malloc` 必须遍历**所有块（含已分配块）**，当堆快满时分配极慢。

**显式空闲链表（Explicit Free List）** 的核心思想是：**只把空闲块组织成双向链表**！

* 因为空闲块的 Payload 区域本来就没有存用户数据，我们可以直接复用空闲块内部的 Payload 空间，存入两个指针：**`Next`（后继空闲块指针）** 和 **`Prev`（前驱空闲块指针）**，同时依然保留头尾的 Boundary Tags 以便按物理地址合并（Slide 4）：

  ```
  已分配块 (Allocated):                空闲块 (Free Block):
  +--------------------+              +--------------------+
  |      Size      | a |  <-- Header  |      Size      | a |  (a = 0)
  +--------------------+              +--------------------+
  |                    |              |    Next 指针        |  \
  |  Payload & Padding |              +--------------------+   +-- 复用原 Payload 空间
  |                    |              |    Prev 指针        |  /
  +--------------------+              +--------------------+
  |      Size      | a |  <-- Footer  |   (剩余空闲空间)     |
  +--------------------+              +--------------------+
                                      |      Size      | a |  (a = 0)
                                      +--------------------+
  ```

* **优势**：首次适配分配时间从 $O(\text{全部块总数})$ 降低为 $O(\text{空闲块数量})$，当内存大部分已分配时速度极快！代价是每个空闲块至少需要容纳 `Header + Next + Prev + Footer`，从而增大了最小块大小（Minimum Block Size），略微增加了内部碎片。

#### 显式空闲链表的插入策略：LIFO vs. 地址序（Slides 7–11）

当一个块被 `free(p)` 释放（并完成必要的物理相邻合并）后，应该把它插到空闲链表的什么位置？

1. **LIFO（后进先出）策略**：总是将新释放（或合并后）的空闲块直接插入到空闲双向链表的**表头（Root）**。

   * **4 种 LIFO 释放合并情形（Slides 8–11）**：

     * **Case 1（物理前后均已分配）**：直接将当前块插到 `Root` 表头（$O(1)$）。

     * **Case 2（物理前驱已分配，物理后继空闲）**：先通过双向链表指针把物理后继块从空闲链表中摘除（Splice out），与当前块合并成一个大块后，将新块插到 `Root` 表头（$O(1)$）。

     * **Case 3（物理前驱空闲，物理后继已分配）**：将物理前驱块从链表中摘除，与当前块合并后，将新块插到 `Root` 表头（$O(1)$）。

     * **Case 4（物理前驱与后继均空闲）**：将物理前驱块和物理后继块**全部从空闲链表中摘除**，三块合并为一个大块后，插入到 `Root` 表头（$O(1)$）。

   * *优缺点*：释放与合并严格 $O(1)$ 常数时间且极其简单；但碎片率通常高于地址序策略。

2. **按地址排序（Address-ordered）策略**：始终保持空闲链表按块的物理地址从小到大排列：$\text{addr}(\text{prev}) < \text{addr}(\text{curr}) < \text{addr}(\text{next})$。

   * *优缺点*：`free` 时需要线性搜索找到正确的插入位置，耗时较长；但实验表明其内存碎片率显著低于 LIFO。

### 4.2 分离空闲链表（Segregated Free Lists / Seglist Allocators，Slides 14–17）

现代高性能分配器（如 GNU `glibc` 使用的 `ptmalloc` / `dlmalloc`）普遍采用**分离空闲链表（Seglist）**：

* 维护一个**空闲链表数组**，每个链表对应一个特定的**大小类（Size Class）**：

  * 对小尺寸块，往往每个大小单独设一类（例如 `{1-2}`, `{3}`, `{4}` 字）；

  * 对较大尺寸块，按 2 的幂次划分大小类（例如 `{5-8}`, `{9-16}`, $\dots$, `{1025-2048}`, $\dots$）。

* **分配块 `malloc(n)` 流程（Slide 16）**：

  1. 根据请求大小 $n$ 定位到对应的大小类空闲链表，搜索其中大小 $m \ge n$ 的块；

  2. 若找到：可选地分割该块（Split），将切剩下的残余碎片插入到对应较小尺寸类的空闲链表中；

  3. 若当前链表未找到：依次搜索**下一个更大的大小类链表**，直到找到为止；

  4. 若所有链表均未找到：调用 `sbrk()` 向操作系统申请额外的堆内存，从中切出 $n$ 字节返回，并将剩余部分作为一个大空闲块插入到最大的大小类链表中。

* **释放块 `free(p)` 流程（Slide 17）**：执行边界标记合并（Coalesce），并将合并后的块插入到与其新大小匹配的大小类链表中。

* **为什么 Seglist 既快又省内存？（Slide 17）**：

  * **高吞吐率**：按 2 的幂划分大小类使得定位链表只需对数时间；

  * **高内存利用率**：**在分离空闲链表上做 First-fit 搜索，其效果等价于在整个堆上做近似的 Best-fit 搜索**！极端情况下，若每个块大小都有独立链表，就严格等价于全局 Best-fit，却完全免去了遍历全堆的开销。

### 4.3 垃圾回收（Garbage Collection）与 Mark-and-Sweep 算法（Slides 19–27）

垃圾回收器（Garbage Collector, GC）将内存视为一张**有向可达图（Directed Reachability Graph，Slide 23）**：

* 图中的节点（Nodes）分为两类：

  * **根节点（Root nodes）**：不在堆中、但包含指向堆内指针的位置（例如 CPU 寄存器、栈上的局部变量、全局变量）；

  * **堆节点（Heap nodes）**：堆中分配的各个内存块。

* 图中的**有向边（Edges）** $p \to q$ 表示块 $p$ 内部某个字存有指向块 $q$ 的指针。

* **可达性判据**：若存在一条从任意根节点出发到达节点 $u$ 的有向路径，则称块 $u$ 是**可达的（Reachable）**；所有**不可达（Not-reachable）**的节点都是应用绝不可能再使用到的**垃圾（Garbage）**，应当被自动回收。

#### McCarthy 经典标记-清除算法（Mark-and-Sweep，1960，Slides 24–26）

Mark-and-Sweep 建立在 `malloc/free` 之上，平时直接调用 `malloc` 分配，直到空间耗尽时启动以下两个阶段（利用每个块 Header 中的 1 个额外 `mark bit`）：

1. **标记阶段（Mark Phase）**：从所有根节点 `root` 出发，对可达图执行**深度优先遍历（DFS）**，将每个访问到的可达块头部的 `mark bit` 置为 `1`。

2. **清除阶段（Sweep Phase）**：从堆头 `start` 到堆尾 `end` 线性扫描所有块：

   * 若某块的 `mark bit == 1`（说明本轮可达），则将其 `mark bit` 清零（留待下次 GC 使用）；

   * 若某块的 `mark bit == 0` 且处于已分配状态（说明不可达，是垃圾），则直接调用 `free(p)` 将其回收归还给空闲链表！

```
// 阶段 1：从每个 root 调用 mark(root)，深度优先标记所有可达块
ptr mark(ptr p) {
    if (!is_ptr(p)) return;          // 若 p 不是指向堆内已分配块的指针，直接返回
    if (markBitSet(p)) return;       // 若已经标记过，直接返回（防止有向环死循环！）
    setMarkBit(p);                   // 将块 p 的 mark bit 置 1
    for (i = 0; i < length(p); i++)  // 递归标记块 p 内部包含的所有指针字
        mark(p[i]);
    return;
}

// 阶段 2：线性扫描全堆，回收所有未标记的已分配块
ptr sweep(ptr p, ptr end) {
    while (p < end) {
        if (markBitSet(p))
            clearMarkBit();          // 保留可达块，清除标记位供下次 GC 使用
        else if (allocateBitSet(p))
            free(p);                 // 未被标记的已分配块即为垃圾，立即释放！
        p += length(p);              // 沿隐式链表跳向下一个物理块
    }
}
```

:::caution[为什么 C/C++ 只能实现“保守式垃圾回收（Conservative GC）”？（Slide 27）]

1. **缺乏精确指针类型信息**：C 语言允许任意整数与指针强制类型转换，如果某个 `int` 变量的值恰好等于堆中某个垃圾块的地址，GC 无法区分它是整数还是指针，只能保守地（Conservatively）将其当作指针，导致部分垃圾无法被回收。

2. **指针可以指向块的中间（Interior Pointers）**：在 C 语言中，指针 `ptr` 往往通过指针算术指向一个已分配块的内部中间位置（而非头部起始处），此时怎么找到该块的 Header 来读取长度和置 `mark bit`？

   * **解决方案**：使用一棵平衡二叉树（Balanced Binary Tree，如红黑树）维护当前所有已分配块，以块的起始地址（Start-of-block）作为键值 Key，并在每个已分配块的 Header 中额外增加两个字存放左、右子树指针 `Left`（较小地址）和 `Right`（较大地址），从而在 $O(\log N)$ 时间内由任意内部指针定位到所属块的头部。

:::

### 4.4 C 语言运算符优先级、复杂指针声明与 10 大内存缺陷（Slides 28–44）

#### C 运算符优先级核心口诀与复杂指针声明解读（Slides 30–31）

* **优先级铁律（K&R p.53）**：后缀运算符 `()`、`[]`、`->`、`.` 的优先级**最高**（自左向右结合）；单目运算符 `!`、`~`、`++`、`--`、`+`、`-`、`*`（解引用）、`&`（取地址）、`(type)`、`sizeof` 的优先级**紧随其后**（**自右向左结合**！）。因此 `*p++` 等价于 `*(p++)`，`*size--` 等价于 `*(size--)`！

* **K&R 第 5.12 节经典指针声明自测表（Slide 31，由内向外顺时针剥洋葱法）**：

| C 语言声明表达式 | 精确结构解读（谁先和标识符结合，谁就是主干） |
| ----- | ----- |
| `int *p` | `p` 是一个指向 `int` 的指针（pointer to `int`）。 |
| `int *p[13]` / `int *(p[13])` | `[]` 优先级高于 `*`：`p` 是一个含 13 个元素的**数组**，每个元素是指向 `int` 的指针（array\[13\] of pointer to `int`）。 |
| `int **p` | `p` 是一个指向“指向 `int` 的指针”的二级指针（pointer to a pointer to an `int`）。 |
| `int (*p)[13]` | 括号强制 `*` 先结合：`p` 是一个**指针**，指向一个含 13 个 `int` 的数组（pointer to an array\[13\] of `int`）。 |
| `int *f()` | `()` 优先级高于 `*`：`f` 是一个**函数**，返回值是指向 `int` 的指针（function returning a pointer to `int`）。 |
| `int (*f)()` | `f` 是一个**函数指针**，指向返回值为 `int` 的函数（pointer to a function returning `int`）。 |
| `int (*(*f())[13])()` | `f` 是一个函数，返回一个指向含 13 个元素数组的指针，数组元素是指向返回 `int` 的函数的函数指针。 |
| `int (*(*x[3])())[5]` | `x` 是一个含 3 个元素的数组，元素是函数指针，所指函数返回指向含 5 个 `int` 数组的指针。 |

#### 10 大经典 C 语言内存 Bug 逐一诊断与修复（Slides 32–43）

1. **Bug 1：解引用坏指针（Dereferencing Bad Pointers，Slide 32）**

   * *错误代码*：`int val; scanf("%d", val);`

   * *病因与后果*：漏写了取地址符 `&`，把未初始化的 `val` 值当作内存地址写入，轻则立即触发 `Segmentation fault`，重则静默篡改内存。应改为 `scanf("%d", &val);`。

2. **Bug 2：读取未初始化的堆内存（Reading Uninitialized Memory，Slide 33）**

   * *错误代码*：`int *y = malloc(N * sizeof(int));` 后未清零直接执行 `y[i] += A[i][j] * x[j];`。

   * *病因与后果*：**`malloc` 绝不会自动将分配的堆内存清零**！`y[i]` 初始值是旧垃圾数据。应显式用 `calloc(N, sizeof(int))` 或 `memset` 清零。

3. **Bug 3：分配了错误大小的对象（Allocating Wrong Sized Object，Slide 34）**

   * *错误代码*：`int **p = malloc(N * sizeof(int));`（随后往 `p[i]` 里存 `int *` 指针）。

   * *病因与后果*：在 64 位系统上，`sizeof(int) = 4` 而 `sizeof(int *) = 8`！只分配了一半空间，后续循环写入 `p[i]` 会越界覆写堆中相邻块的 Header，导致后续 `free` 或 `malloc` 崩溃。应改为 `malloc(N * sizeof(int *))`。

4. **Bug 4：差一错误（Off-by-one Error，Slide 35）**

   * *错误代码*：`int **p = malloc(N * sizeof(int *)); for (i = 0; i <= N; i++) p[i] = ...;`

   * *病因与后果*：合法下标是 `0` 到 `N-1`，`i <= N` 越界写了第 `N+1` 个元素 `p[N]`，覆写后续块的边界标记。

5. **Bug 5：不检查最大输入字符串长度（Buffer Overflow，Slide 36）**

   * *错误代码*：`char s[8]; gets(s); /* 输入 "123456789" */`

   * *病因与后果*：`gets` 不限制读取长度，超出 8 字节后直接冲垮栈帧（古典栈溢出攻击的根源）。应一律改用限制长度的 `fgets(s, sizeof(s), stdin)`。

6. **Bug 6：误解指针算术（Misunderstanding Pointer Arithmetic，Slide 37）**

   * *错误代码*：`int *search(int *p, int val) { while (*p && *p != val) p += sizeof(int); return p; }`

   * *病因与后果*：C 语言中对类型为 `T *` 的指针做 `p + k`，硬件地址自动前进 `k * sizeof(T)` 字节！写 `p += sizeof(int)` 实际上每次跳过了 $4 \times 4 = 16$ 字节（4 个 `int`）。应改为 `p++` 或 `p += 1`。

7. **Bug 7：运算符优先级陷阱——修改了指针本身而非所指对象（Slide 38）**

   * *错误代码*：在二叉堆删除函数 `BinheapDelete(int **binheap, int *size)` 中写 `*size--;`。

   * *病因与后果*：因为后缀 `--` 与单目 `*` **自右向左结合**，`*size--` 等价于 `*(size--)`——它把指针 `size` 本身减了 1，而根本没有把 `*size` 的整数值减 1！紧接着下一行 `Heapify(binheap, *size, 0)` 解引用了越界野指针。必须加括号写成 **`(*size)--`** 或 `--(*size)`！

8. **Bug 8：引用已消亡的栈上局部变量（Referencing Nonexistent Variables，Slide 39）**

   * *错误代码*：`int *foo() { int val; return &val; }`

   * *病因与后果*：局部变量 `val` 分配在 `foo` 的栈帧中，一旦 `foo` 返回，该栈帧即被弹出失效，返回的悬垂指针（Dangling Pointer）随时会被后续其他函数调用的栈帧覆盖。

9. **Bug 9 & 10：重复释放（Double Free）、使用已释放块（Use-After-Free）与内存泄漏（Memory Leaks，Slides 40–43）**

   * **Double Free（Slide 40）**：对同一个指针 `x` 调用两次 `free(x)`，会彻底破坏显式空闲链表的双向指针结构；

   * **Use-After-Free（Slide 41）**：`free(x)` 后继续在循环里读写 `x[i]`，此时该块可能已被重新 `malloc` 给变量 `y` 或存有空闲链表指针；

   * **Memory Leak（Slides 42–43）**：分配后忘记 `free`，或释放单链表 `struct list *head` 时只调用了 `free(head)` 而没有遍历释放后续节点，成为长期运行后台服务的慢性杀手。

   * **调试利器（Slide 44）**：使用 `gdb` 定位空指针/坏指针解引用，编写堆一致性检查器（Heap Consistency Checker），使用二进制动态插桩工具 **`valgrind`** 检测未初始化读取、越界读写、Double Free 和内存泄漏，或设置环境变量 `MALLOC_CHECK_=3` 开启 `glibc` 内置分配检查。

## 五、复习检查

- [ ] 沿虚拟地址、TLB、页表到物理地址的路径完成地址翻译。
- [ ] 分析缺页与内存映射，再用块布局理解分配器的对齐、分割和合并。

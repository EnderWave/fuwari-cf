---
title: 生成函数 · 笔记（三） · 指数公式与组合计数
published: 2026-11-21
tags:
  - 生成函数
  - 指数公式
  - 图论计数
  - 整数分拆
  - Generatingfunctionology
category: 生成函数
draft: false
description: 有标号计数的纸牌-牌组-手牌模型、指数公式三步证明、第一类与第二类斯特林数、奇轮换排列与抛硬币对偶、对合排列、2-正则图、连通图、二分图二染色去重、Cayley 树定理、二项式型多项式、无标号预制件 Prefabs、找零钱导体与 Schur 定理、整数分拆与无标号有根树，附 3.19 节全部 22 道大题完整折叠解答。
---

## 导读

本篇讨论指数公式与组合计数，结合推导、例题与代码说明方法的使用条件。

:::tip[学习重点]

- 先确定对象是否有标号，再选择组合模型。
- 用指数公式连接部件与整体，检查计数是否重复。

:::

## 一、3.1–3.4 纸牌、牌组与手牌：指数公式的公理化建模（The Exponential Formula）

在组合计数中，大量核心问题都具有同一个模式：**已知“连通部件（Connected Pieces）”在每个规模下的数量，求由这些连通部件组装而成的“一般结构（Structures）”在每个规模下的数量**（或者反过来，已知一般结构总数，反推连通部件数量）。

例如，$n \le 3$ 个顶点的有标号连通无向图个数依次为 $d_1 = 1, \ d_2 = 1, \ d_3 = 4$（共 6 个，见原书图 3.1）；而 $3$ 个顶点的不一定连通的有标号无向图共有 $h_3 = 2^{\binom{3}{2}} = 8$ 个（见原书图 3.2）。二者之间究竟有什么普适的定量关系？

为了涵盖图、排列、集合划分等一切有标号组合结构，Wilf 采纳了 Adriano Garsia 的建议，引入了极具直观性的**纸牌（Cards）、牌组（Decks）与手牌（Hands）**公理体系（Section 3.2）：

:::note[指数族（Exponential Family）六大公理化定义（Definitions 3.1–3.6）]

设 $P$ 是一个抽象的“图案（pictures）”集合：

1. **纸牌（Card）$\mathcal{C}(S, p)$**：由一个正整数有限子集 $S$（称为**标号集 Label Set**）与一个图案 $p \in P$ 组成的二元组。纸牌的**权重（Weight）**定义为 $n = |S|$。若标号集恰好是标准集合 $[n] = \{1, 2, \dots, n\}$，则称该纸牌为**标准纸牌（Standard Card）**。

2. **手牌（Hand）$H$**：由若干张纸牌组成的集合，要求这些纸牌的标号集两两不相交、非空，且并集恰好构成某个 $[n]$（即这些纸牌的标号集构成 $[n]$ 的一个集合划分）。

3. **手牌的权重（Weight of a Hand）**：手牌中所有纸牌的权重之和 $n$。

4. **重标号（Relabeling）**：将纸牌 $\mathcal{C}(S, p)$ 的标号集替换为另一个等势集合 $S' \ (|S'| = |S|)$，保持原有标号的大小相对顺序不变，得到新纸牌 $\mathcal{C}(S', p)$。若取 $S' = [|S|]$，则称为**标准重标号（Standard Relabeling）**。

5. **牌组（Deck）$\mathcal{D}_n$**：权重全为 $n$、且图案互不相同的有限张**标准纸牌**的集合（代表所有规模为 $n$ 的不同连通构件原型），其包含的纸牌张数记为 $d_n = |\mathcal{D}_n|$。

6. **指数族（Exponential Family）$\mathcal{F}$**：由一系列牌组 $\mathcal{D}_1, \mathcal{D}_2, \dots$ 组成的集合系。定义**牌组枚举器（Deck Enumerator）**为序列 $\{d_n\}_{n=1}^\infty$ 的 EGF：

$$
\mathcal{D}(x) = \sum_{n \ge 1} d_n \frac{x^n}{n!}
$$

记权重为 $n$、恰好由 $k$ 张纸牌组成的手牌个数为 $h(n, k)$（允许从同一牌组多次抽取同一张标准纸牌的副本，只要赋以不相交的不同标号集即可），定义**二元手牌枚举器（2-variable Hand Enumerator）**：

$$
\mathcal{H}(x, y) = \sum_{n, k \ge 0} h(n, k) \frac{x^n}{n!} y^k, \qquad \mathcal{H}(x) = \mathcal{H}(x, 1) = \sum_{n \ge 0} h(n) \frac{x^n}{n!}
$$

*（注意 $\mathcal{H}(x, y)$ 是混合型生成函数：关于权重变量 $x$ 是 EGF，关于纸牌张数变量 $y$ 是 OGF！）*

:::

### 两个核心指数族原型（Examples 3.8 & 3.9）

- **原型一：全体有标号无向图 $\mathcal{F}_1$（Example 3.8）**

  - **纸牌**：连通有标号图 $G$（图案 $p$ 是将其顶点保序重标号为 $[n]$ 后的标准连通图）。

  - **牌组 $\mathcal{D}_n$**：$n$ 个顶点的标准有标号连通无向图全体，$d_n$ 为 $n$ 阶有标号连通图个数。

  - **手牌 $H$**：由 $k$ 个连通分量组成的 $n$ 阶标准有标号无向图，$h(n, k)$ 为 $n$ 个顶点、$k$ 个连通分量的有标号图个数，总手牌数 $h(n) = 2^{\binom{n}{2}}$。

- **原型二：全体排列与轮换分解 $\mathcal{F}_2$（Example 3.9）**

  - **纸牌**：标号集 $S$ 上的单个有向轮换（Cyclic Permutation）。

  - **牌组 $\mathcal{D}_n$**：集合 $[n]$ 上的全体单轮换排列，共有 $d_n = (n-1)!$ 张牌（圆排列数）。

  - **手牌 $H$**：因为 $[n]$ 的每个排列都能唯一分解为不相交轮换之积，故权重为 $n$、含 $k$ 张牌的手牌一一对应于 **$[n]$ 中恰有 $k$ 个轮换的排列**！总手牌数 $h(n) = n!$。

### 从涓流到洪流：指数公式的三步严格证明（Section 3.4）

首先定义两个图案集不相交的指数族 $\mathcal{F}', \mathcal{F}''$ 的**合并（Merger）** $\mathcal{F} = \mathcal{F}' \oplus \mathcal{F}''$：将各自权重为 $n$ 的牌组并起来，使 $d_n = d'_n + d''_n$。

:::important[引理 3.10（有标号计数基本引理）与定理 3.11（指数公式）]

**引理 3.10**：若 $\mathcal{F} = \mathcal{F}' \oplus \mathcal{F}''$，则它们的二元手牌枚举器满足乘积关系：

$$
\mathcal{H}(x, y) = \mathcal{H}'(x, y) \mathcal{H}''(x, y)
$$

*证明*：合并族中权重为 $n$、含 $k$ 张牌的手牌 $H$，由来自 $\mathcal{F}'$ 的子手牌 $H'$（权重 $n'$、含 $k'$ 张牌）与来自 $\mathcal{F}''$ 的子手牌 $H''$（权重 $n-n'$、含 $k-k'$ 张牌）唯一确定，其中只需从 $[n]$ 中选出 $n'$ 个标号分配给 $H'$（共 $\binom{n}{n'}$ 种选法），故：

$$
h(n, k) = \sum_{n', k'} \binom{n}{n'} h'(n', k') h''(n - n', k - k') = \left[\frac{x^n}{n!} y^k\right] \mathcal{H}'(x, y) \mathcal{H}''(x, y)
$$

借助基本引理，按“魔法师的学徒”三步曲推进：

1. **Step 1: 涓流（The Trickle）**：设整个指数族只有第 $r$ 号牌组 $\mathcal{D}_r$ 含 $d_r = 1$ 张牌，其余牌组全空（即 $\mathcal{D}(x) = \frac{x^r}{r!}$）。此时含 $k$ 张牌的手牌权重必为 $n = kr$，将 $[kr]$ 划分为 $k$ 个大小为 $r$ 的无序标号集共有 $h(kr, k) = \frac{1}{k!} \binom{n}{r}\binom{n-r}{r}\cdots = \frac{(kr)!}{k!(r!)^k}$ 种方案。故：

$$
\mathcal{H}(x, y) = \sum_{k \ge 0} \frac{(kr)!}{k!(r!)^k} \frac{x^{kr}}{(kr)!} y^k = \sum_{k \ge 0} \frac{1}{k!}\left(\frac{y x^r}{r!}\right)^k = \exp\left\{\frac{y x^r}{r!}\right\}
$$

2. **Step 2: 水流（The Flow）**：设只有第 $r$ 号牌组非空，但含有 $d_r$ 张不同的牌。这等价于将 $d_r$ 个 Step 1 的单牌族合并，由引理 3.10 连乘 $d_r$ 次立得：

$$
\mathcal{H}(x, y) = \exp\left\{\frac{y d_r x^r}{r!}\right\}
$$

3. **Step 3: 洪流（The Flood — 定理 3.11 指数公式）**：一般指数族 $\mathcal{F}$ 正是 $r = 1, 2, \dots$ 的所有单牌组族 $\mathcal{F}_r$ 的无穷合并！将各 $\mathcal{F}_r$ 的手牌枚举器相乘（指数相加），即得**指数公式**：

$$
\mathcal{H}(x, y) = \prod_{r=1}^\infty \exp\left\{\frac{y d_r x^r}{r!}\right\} = \exp\left\{y \sum_{r=1}^\infty d_r \frac{x^r}{r!}\right\} = e^{y \mathcal{D}(x)} \quad (3.5)
$$

:::

由指数公式立即导出三个极其强大的推论：

- **精确牌数公式（式 3.6）**：$h(n, k) = \left[\frac{x^n}{n!}\right] \left\{\frac{\mathcal{D}(x)^k}{k!}\right\}$。

- **推论 3.12（一维指数公式）**：令 $y = 1$，不限制连通块个数时，$\mathcal{H}(x) = e^{\mathcal{D}(x)}$。

- **推论 3.13（受限连通块个数指数公式）**：若限制手牌中的纸牌张数 $k$ 必须属于集合 $T$，定义截断指数函数 $e_T(x) = \sum_{k \in T} \frac{x^k}{k!}$，则受限手牌数 $h_n(T)$ 的 EGF 为：

$$
\left\{h_n(T)\right\}_0^\infty \stackrel{egf}{\longleftrightarrow} e_T(\mathcal{D}(x)) \quad (3.8)
$$

---

## 二、3.5–3.12 有标号组合计数的典型应用

### 3.5 排列与轮换：第一类斯特林数 $\begin{bmatrix} n \\ k \end{bmatrix}$

在排列族 $\mathcal{F}_2$ 中，$d_n = (n-1)!$，故牌组枚举器为：

$$
\mathcal{D}(x) = \sum_{n \ge 1} (n-1)! \frac{x^n}{n!} = \sum_{n \ge 1} \frac{x^n}{n} = \log\frac{1}{1-x}
$$

代入指数公式 (3.5) 立得：

$$
\mathcal{H}(x, y) = \exp\left\{y \log\frac{1}{1-x}\right\} = \frac{1}{(1-x)^y}
$$

此处 $h(n, k) = \begin{bmatrix} n \\ k \end{bmatrix}$ 就是 **$n$ 元排列中恰有 $k$ 个轮换的个数（无符号第一类斯特林数）**！

- **按 $x$ 提取系数（固定 $n$ 的行生成函数，式 3.10）**：由式 (2.39)，

$$
\sum_k \begin{bmatrix} n \\ k \end{bmatrix} y^k = \left[\frac{x^n}{n!}\right] (1-x)^{-y} = n! \binom{y+n-1}{n} = y(y+1)(y+2)\cdots(y+n-1)
$$

即第一类斯特林数是上升阶乘（Rising Factorial）的展开系数！

- **按 $y$ 提取系数（固定 $k$ 的列生成函数，式 3.11）**：

$$
\begin{bmatrix} n \\ k \end{bmatrix} = \left[\frac{x^n}{n!}\right] \frac{1}{k!}\left\{\log\frac{1}{1-x}\right\}^k
$$

### 3.6 集合划分：重逢第二类斯特林数 $\begin{Bmatrix} n \\ k \end{Bmatrix}$ 与贝尔数

构造集合划分族 $\mathcal{F}_3$：对每个 $n \ge 1$，牌组 $\mathcal{D}_n$ 只有 $d_n = 1$ 张牌（Wilf 幽默地说：牌上画一只微笑的兔子，因为只有一张牌，图案是什么根本无所谓）。

此时手牌 $H$ 的各张牌标号集直接构成 $[n]$ 的一个集合划分！故 $h(n, k) = \begin{Bmatrix} n \\ k \end{Bmatrix}$，牌组枚举器为 $\mathcal{D}(x) = \sum_{n \ge 1} \frac{x^n}{n!} = e^x - 1$。由指数公式立得：

$$
\mathcal{H}(x, y) = e^{y(e^x - 1)}, \qquad \begin{Bmatrix} n \\ k \end{Bmatrix} = \left[\frac{x^n}{n!}\right] \left\{\frac{(e^x - 1)^k}{k!}\right\} \quad (3.13)
$$

令 $y = 1$ 即一行重证第 1 章的贝尔数生成函数 $B(x) = e^{e^x - 1}$！

### 3.7 奇轮换偶个数排列 vs. 抛硬币正面恰为一半（A Subclass of Permutations）

**问题**：$n$ 个元素的排列中，有多少个排列满足“**所有轮换长度都是奇数，且轮换总个数是偶数**”？

- 只允许奇数长度的轮换，意味着只保留奇数号牌组 $\mathcal{D}_1, \mathcal{D}_3, \mathcal{D}_5, \dots$，故牌组枚举器为：

$$
\mathcal{D}(x) = \sum_{n \text{ odd}} (n-1)! \frac{x^n}{n!} = \sum_{r \ge 0} \frac{x^{2r+1}}{2r+1} = \frac{1}{2}\log\frac{1+x}{1-x} = \log\sqrt{\frac{1+x}{1-x}}
$$

- 要求轮换个数 $k$ 为偶数，即限制集合 $T = \{0, 2, 4, \dots\}$，此时截断指数函数为 $e_T(u) = \sum_{k \text{ even}} \frac{u^k}{k!} = \cosh u = \frac{e^u + e^{-u}}{2}$！

- 由推论 3.13（式 3.8），所求排列数的 EGF 为：

$$
\cosh\left\{\log\sqrt{\frac{1+x}{1-x}}\right\} = \frac{1}{2}\left(\sqrt{\frac{1+x}{1-x}} + \sqrt{\frac{1-x}{1+x}}\right) = \frac{1}{\sqrt{1-x^2}} = \sum_{m \ge 0} \binom{2m}{m} \frac{x^{2m}}{2^{2m}}
$$

提取 $[x^n / n!]$ 可知：当 $n$ 为奇数时为 $0$；当 $n$ 为偶数时为 $\binom{n}{n/2} \frac{n!}{2^n}$！除以 $n!$ 立即得到令人拍案叫绝的 **定理 3.14**：

> **在 $n$ 元排列中随机抽一个排列，它“由偶数个奇轮换组成”的概率，精确等于把一枚均匀硬币抛 $n$ 次恰好出现 $n/2$ 次正面的概率 $\binom{n}{n/2} 2^{-n}$！**

### 3.8 对合排列与满足 $\sigma^m = 1$ 的排列（Involutions, etc.）

**引理 3.15**：排列 $\sigma$ 满足 $\sigma^m = \text{id}$（恒等排列）当且仅当 $\sigma$ 的每一个轮换长度 $r$ 都是 $m$ 的约数（$r \mid m$）。

因此，只保留 $r \mid m$ 的轮换牌组（$d_r = (r-1)!$），立得 **定理 3.16**：满足 $\sigma^m = 1$ 的 $n$-排列数的 EGF 为：

$$
\exp\left(\sum_{d \mid m} \frac{x^d}{d}\right) \quad (3.15)
$$

特别地，取 $m = 2$，满足 $\sigma^2 = 1$ 的排列称为**对合排列（Involutions）**，其轮换长度只能为 $1$ 或 $2$，记个数为 $t_n$，则：

$$
\sum_{n \ge 0} \frac{t_n}{n!} x^n = e^{x + \frac{1}{2}x^2} \quad (3.16)
$$

### 3.9 2-正则图计数（2-Regular Graphs）

每个顶点度数均为 $2$ 的 $n$ 阶有标号无向图称为 **2-正则图**。它的每个连通分量都是一个长度 $n \ge 3$ 的无向简单环！

在 $n \ge 3$ 个顶点上，有向圆排列有 $(n-1)!$ 个，抹去顺逆时针方向后，无向环共有 $d_n = \frac{(n-1)!}{2}$ 个（而 $d_1 = d_2 = 0$，因为简单无向图无自环与重边）。故牌组枚举器为：

$$
\mathcal{D}(x) = \sum_{n \ge 3} \frac{(n-1)!}{2 n!} x^n = \frac{1}{2}\sum_{n \ge 3} \frac{x^n}{n} = \frac{1}{2}\left\{\log\frac{1}{1-x} - x - \frac{x^2}{2}\right\}
$$

由指数公式立得 2-正则图个数 $g(n)$ 的 EGF（式 3.17）：

$$
\sum_{n \ge 0} g(n)\frac{x^n}{n!} = \exp\left\{\frac{1}{2}\log\frac{1}{1-x} - \frac{x}{2} - \frac{x^2}{4}\right\} = \frac{e^{-\frac{1}{2}x - \frac{1}{4}x^2}}{\sqrt{1-x}}
$$

### 3.10 连通有标号无向图计数与通用递推（Counting Connected Graphs）

回到全体无向图族 $\mathcal{F}_1$：这次我们已知手牌总数 $h_n = 2^{\binom{n}{2}}$，反求牌组数（连通无向图个数）$d_n$！

虽然 $\mathcal{H}(x) = \sum_{n \ge 0} 2^{\binom{n}{2}}\frac{x^n}{n!}$ 对一切 $x \neq 0$ 都发散，但在形式幂级数环中对 $\mathcal{H}(x) = e^{\mathcal{D}(x)}$ 施展第 1.6.1 节的 $x D \log$ 法则，立即得到对任意指数族均成立的 **定理 3.17**：

$$
n h_n = \sum_{k=1}^n \binom{n}{k} k d_k h_{n-k} \quad (n \ge 1; \ h_0 = 1) \quad (3.18)
$$

代入 $h_n = 2^{\binom{n}{2}}$，连通有标号图个数 $d_n$ 满足递推式（式 3.19）：

$$
n 2^{\binom{n}{2}} = \sum_{k=1}^n \binom{n}{k} k d_k 2^{\binom{n-k}{2}} \implies d_1=1, d_2=1, d_3=4, d_4=38, d_5=728, d_6=26704
$$

### 3.11 有标号二分图计数：二染色去重魔法（Counting Labeled Bipartite Graphs）

要求 $n$ 个顶点的有标号二分图个数 $\beta(n)$。如果直接枚举顶点集划分 $[n] = A \cup B$ 再在 $A, B$ 间连边（$2^{|A||B|}$ 种），一个具有 $c$ 个连通分量的二分图会被重复计数 $2^c$ 次（因为每个连通分量的左右部 $A_i, B_i$ 都可以独立交换放入 $A$ 或 $B$）。

Wilf 给出了绝妙的破局方案——**先构造“2-染色二分图”指数族 $\mathcal{F}_6$**：

1. **计数 2-染色二分图（手牌）**：先选 $k$ 个点染红色，其余 $n-k$ 个点染绿色，只在红绿点之间连边，这样每张 2-染色二分图都被唯一生成一次！故手牌数为：

$$
\gamma_n = \sum_{k=0}^n \binom{n}{k} 2^{k(n-k)} \quad (3.20)
$$

2. **用 $\log$ 求连通 2-染色二分图（牌组）**：由指数公式，连通 2-染色二分图的 EGF 为 $\mathcal{D}(x) = \log\left\{\sum_{n \ge 0} \frac{\gamma_n}{n!} x^n\right\}$。

3. **除以 2 抹去颜色**：每个**连通**无色二分图恰好有 $2$ 种合法的红绿二染色（红绿整体互换），因此**连通无色二分图**的牌组 EGF 就是 $\frac{1}{2}\mathcal{D}(x)$！

4. **再次 $\exp$ 拼回一般无色二分图**：将 $\frac{1}{2}\mathcal{D}(x)$ 代入指数公式，立得 **定理 3.18**：

$$
\sum_{n \ge 0} \frac{\beta(n)}{n!} x^n = \exp\left\{\frac{1}{2}\log\sum_{n \ge 0} \frac{\gamma_n}{n!} x^n\right\} = \sqrt{\sum_{n \ge 0} \frac{\gamma_n}{n!} x^n} \quad (3.23)
$$

**所有关于 $2^c$ 重数的组合麻烦，在生成函数里竟然只是一次开平方根！**

### 3.12 有标号树计数与 Pólya 森林双射（Counting Labeled Trees）

**定理 3.19（Cayley 定理）**：$n$ 个顶点的有标号无根树恰有 $n^{n-2}$ 棵。

为了用指数公式证明它，设 $n$ 个顶点的**有标号有根树（纸牌）**有 $t_n$ 棵（由于无根树选根有 $n$ 种方式，显然 $t_n = n \cdot (\text{无根树数})$），其 EGF 为 $\mathcal{D}(x) = \sum_{n \ge 1} t_n \frac{x^n}{n!}$。

那么在有根树指数族 $\mathcal{F}_7$ 中，**手牌**是什么？手牌是由若干棵有根树组成的**有根森林（Rooted Labeled Forest）**，设其数量为 $f_n$，则由指数公式有 $\mathcal{H}(x) = e^{\mathcal{D}(x)}$。

另一方面，Pólya 发现了一个极其简单的双射：给定 $n$ 个顶点的任意有根森林 $F$，引入一个新顶点 $v$ 赋予标号 $j \in [n+1]$，将原森林的 $n$ 个顶点保序重标号为 $[n+1] \setminus \{j\}$，再把 $v$ 连向森林中每一棵树的根，以 $v$ 为总根，就唯一得到一棵 $n+1$ 个顶点的有根树！因此：

$$
t_{n+1} = (n+1) f_n \quad (n \ge 0) \implies \mathcal{H}(x) = \sum_{n \ge 0} \frac{t_{n+1}}{(n+1)!} x^n = \frac{1}{x} \mathcal{D}(x)
$$

联立 $\mathcal{H}(x) = e^{\mathcal{D}(x)}$ 与 $\mathcal{H}(x) = \frac{1}{x}\mathcal{D}(x)$，立即得到著名的隐式函数方程（式 3.26）：

$$
\mathcal{D}(x) = x e^{\mathcal{D}(x)}
$$

（在第 5.1 节中，用拉格朗日反演三行即可解出 $t_n = n^{n-1}$，从而无根树为 $n^{n-2}$。）

---

## 三、3.13 指数族与“二项式型多项式”（Polynomials of Binomial Type）

对每个指数族，定义行生成多项式序列 $\phi_n(y) = \sum_k h(n, k) y^k \ (n \ge 0)$。由二元指数公式 $\sum_{n \ge 0} \phi_n(y) \frac{x^n}{n!} = e^{y \mathcal{D}(x)}$，注意到 $e^{(u+v)\mathcal{D}(x)} = e^{u\mathcal{D}(x)} e^{v\mathcal{D}(x)}$，由 EGF 二项卷积法则（Rule 3'）立即得到 Rota 与 Mullin 命名的**二项式型恒等式**：

$$
\phi_n(u + v) = \sum_{r=0}^n \binom{n}{r} \phi_r(u) \phi_{n-r}(v) \quad (n \ge 0)
$$

例如：幂函数 $y^n$（对应 $\mathcal{D}(x)=x$）、上升阶乘 $y^{\overline{n}}$（对应排列轮换 $\mathcal{D}(x)=\log\frac{1}{1-x}$）、下降阶乘 $y^{\underline{n}}$（对应 $\mathcal{D}(x)=\log(1+x)$）以及贝尔多项式 $\sum_k \begin{Bmatrix} n \\ k \end{Bmatrix} y^k$（对应 $\mathcal{D}(x)=e^x-1$）全都是二项式型多项式！

---

## 四、3.14–3.17 无标号计数：预制件（Prefabs）、找零钱、整数分拆与有根树

当组合结构**没有标号**（Unlabeled）时，手牌只是纸牌的**多重集（Multiset）**，拼接时不再有二项式系数 $\binom{n}{n'}$。这类系统称为**预制件（Prefab）$\mathcal{P}$**，我们改用纯 OGF：记 $\mathcal{D}(x) = \sum_{n \ge 1} d_n x^n$，$\mathcal{H}(x, y) = \sum_{n, k \ge 0} h(n, k) x^n y^k$。

:::important[无标号预制件主定理（Theorem 3.21 & 3.22）与通用递推]

- **引理 3.20**：合并不相交预制件 $\mathcal{P} = \mathcal{P}' \oplus \mathcal{P}''$ 时，$\mathcal{H}(x, y) = \mathcal{H}'(x, y) \mathcal{H}''(x, y)$。

- **定理 3.21（无标号指数公式模拟）**：单张重量为 $r$ 的纸牌可重复选取 $k \ge 0$ 次，生成函数为 $\sum_{k \ge 0} (y x^r)^k = \frac{1}{1 - y x^r}$。合并所有牌组（第 $n$ 号牌组有 $d_n$ 张不同纸牌）立得：

$$
\mathcal{H}(x, y) = \prod_{n=1}^\infty \frac{1}{(1 - y x^n)^{d_n}}, \qquad \mathcal{H}(x) = \mathcal{H}(x, 1) = \prod_{r=1}^\infty \frac{1}{(1 - x^r)^{d_r}} \quad (3.32, \ 3.34)
$$

- **定理 3.22（受限重数预制件定理）**：若每张纸牌在手牌中出现的重数必须属于集合 $W \ (0 \in W)$，记 $w(t) = \sum_{k \in W} t^k$，则：

$$
\mathcal{H}(x, y; W) = \prod_{r \ge 1} w(y x^r)^{d_r} \quad (3.37)
$$

特别地，当 $W = \{0, 1\}$（每张牌最多选 1 次，即互异构件）时，$\mathcal{H}(x, y; \{0, 1\}) = \prod_{r \ge 1}(1 + y x^r)^{d_r} = \frac{1}{\mathcal{H}(x, -y; \mathbb{Z}^+)}$。

- **通用 $O(n^2)$ 递推公式（对式 3.32/3.34 施展 $y D \log$ 与 $x D \log$）**：

$$
m h(n, m) = \sum_{r, m' \ge 1} h(n - r m', m - m') d_r, \qquad n h_n = \sum_{m=1}^n D_m h_{n-m} \quad \left(\text{其中 } D_m = \sum_{r \mid m} r d_r\right) \quad (3.33, \ 3.35)
$$

:::

### 3.15 找零钱问题、导体（Conductor）与 Schur 定理

给定 $M$ 种正整数硬币面额 $1 \le a_1 < a_2 < \dots < a_M$（对应只有这 $M$ 个牌组各有 $1$ 张牌），表出 $n = x_1 a_1 + \dots + x_M a_M \ (x_i \ge 0)$ 的方案数 $h_n$ 满足：

$$
\mathcal{H}(x, y) = \frac{1}{(1 - y x^{a_1})\cdots(1 - y x^{a_M})}, \qquad \mathcal{H}(x) = \frac{1}{(1 - x^{a_1})(1 - x^{a_2})\cdots(1 - x^{a_M})}
$$

设 $\gcd(a_1, \dots, a_M) = 1$，记不可表出的最大整数加 1 为该面额集的**导体（Conductor）$\kappa(\mathcal{S})$**（即对一切 $n \ge \kappa(\mathcal{S})$ 均可表出）：

- **定理 3.23（两枚互素硬币 $a, b$ 的完整结构）**：当 $\gcd(a, b) = 1$ 时：

  1. 导体为 **$\kappa = (a-1)(b-1)$**，所有 $n \ge (a-1)(b-1)$ 均可非负表出；

  2. 最大不可表出整数为 **$\kappa - 1 = ab - a - b$**（证明：任何整数 $m$ 可唯一写为 $m = xa + yb \ (0 \le x < b)$，当 $x=b-1, y=-1$ 时取得最大不可表出数 $(b-1)a - b$）；

  3. 在 $0, 1, \dots, \kappa - 1$ 这 $\kappa$ 个整数中，**恰好一半可表出、一半不可表出**（因为 $m$ 与 $m' = \kappa - 1 - m = (b-1-x)a + (-1-y)b$ 中，$y$ 与 $-1-y$ 恰有一个 $\ge 0$、一个 $< 0$，构成完美配对！）。

- **定理 3.24（Schur 渐近定理）**：当 $\gcd(a_1, \dots, a_M) = 1$ 时，在 $\mathcal{H}(x)$ 的所有单位根极点中，$x = 1$ 是唯一的 $M$ 阶极点（其余单位根 $\omega = e^{2\pi i r / s}$ 的重数等于被 $s$ 整除的 $a_i$ 个数，必严格小于 $M$）。由于 $r$ 阶极点对系数的贡献量级为 $O(n^{r-1})$，主项完全由 $x = 1$ 处的最高阶项 $\frac{c}{(1-x)^M} \ (c = \frac{1}{a_1\cdots a_M})$ 主导：

$$
h_n \sim \frac{n^{M-1}}{(M-1)! a_1 a_2 \cdots a_M} \quad (n \to \infty) \quad (3.42)
$$

- **Example 3.25（两枚硬币找零的准多项式周期结构）**：对 $\gcd(a, b) = 1$，部分分式展开给出：

$$
f(n) = \frac{n}{ab} + \frac{a+b}{2ab} + \text{per}(n) \quad (3.46)
$$

其中 $\text{per}(n)$ 是以 $ab$ 为周期、均值为 $0$ 的周期函数！

### 3.16 整数分拆（Partitions of Integers）

当每个正整数 $r \ge 1$ 都有 $d_r = 1$ 种面额时，手牌就是正整数 $n$ 的**无序分拆（Partitions）** $n = r_1 + r_2 + \dots + r_k \ (r_1 \ge \dots \ge r_k \ge 1)$。分拆数 $p(n)$ 的生成函数为：

$$
\sum_{n, k \ge 0} p(n, k) x^n y^k = \prod_{r=1}^\infty \frac{1}{1 - y x^r}, \qquad \sum_{n \ge 0} p(n) x^n = \prod_{r=1}^\infty \frac{1}{1 - x^r}
$$

若限制分拆的每一部分属于集合 $R$、重数属于集合 $W$，则生成函数为 $\prod_{r \in R}\left(\sum_{k \in W} y^k x^{kr}\right)$（式 3.51）。

- **定理 3.27（欧拉分拆定理）**：将 $n$ 分拆为**互异部分（$W=\{0,1\}, R=\mathbb{Z}^+$）**的方案数，等于将 $n$ 分拆为**奇数部分**的方案数：

$$
\prod_{r \ge 1} (1 + x^r) = \prod_{r \ge 1} \frac{1 - x^{2r}}{1 - x^r} = \frac{1}{(1-x)(1-x^3)(1-x^5)\cdots}
$$

- **定理 3.29（Glaisher 推广定理）**：对任意 $q \ge 1$，将 $n$ 分拆为**每部分出现次数不超过 $q$ 次（$W=\{0,1,\dots,q\}$）**的方案数，等于将 $n$ 分拆为**每部分均不被 $q+1$ 整除**的方案数（利用 $\prod_{r \ge 1}(1+t^r+\dots+t^{qr}) = \prod_{r \ge 1}\frac{1-t^{r(q+1)}}{1-t^r}$ 约分即证）。

### 3.17 无标号有根树与森林（Rooted Trees and Forests）

设 $n$ 个顶点的**无标号有根树**有 $t(n)$ 棵（作为牌组，$d_n = t(n)$），无标号有根森林有 $h(n)$ 个（作为手牌）。一方面由式 (3.34) 有 $\sum_n h(n) x^n = \prod_{n \ge 1} (1 - x^n)^{-t(n)}$；另一方面，在 $n$ 个顶点的无标号有根森林上方加一个新根连向各棵树的根，就一一对应于 $n+1$ 个顶点的无标号有根树（即 $h(n) = t(n+1)$）！由此得到决定无标号有根树数量的 **Otter-Cayley 函数方程（Equation 3.54）**：

$$
\sum_{n \ge 0} t(n+1) x^n = \prod_{n \ge 1} \frac{1}{(1 - x^n)^{t(n)}}
$$

前几项为 $t(1)=1, \ t(2)=1, \ t(3)=2, \ t(4)=4, \ t(5)=9, \ t(6)=20, \dots$。

---

## 五、3.19 第 3 章课后习题解答（Complete Solutions to All 22 Exercises）

本节完整收录《generatingfunctionology》第 3.19 节全部 22 道大题（含所有子题）的推导与折叠解答。

### Exercise 1：奇分拆与互异分拆的显式双射

**题目**：给出正整数 $n$ 的“拆分为互异部分”与“拆分为奇数部分”之间的显式一一对应（双射），并求奇数分拆 $39 = 3 + 3 + 7 + 7 + 19$ 对应的互异分拆。

**解答**：:spoiler[设奇数分拆合并同类项后为 $n = r_1 \cdot 1 + r_3 \cdot 3 + r_5 \cdot 5 + \dots$，将每个重数 $r_{2k-1}$ 写成唯一的二进制幂和 $r_{2k-1} = 2^{a_1} + 2^{a_2} + \dots \ (0 \le a_1 < a_2 < \dots)$，展开后得到一系列形如 $2^a \cdot (2k-1)$ 的数。因为每个正整数都能唯一分解为 $2^a \times (\text{奇数})$，所以展开后的各部分两两互不相同！反之，将互异分拆中的每个数提取 $2$ 的最高次幂并按奇数核合并即可逆转。对于 $39 = 2 \cdot 3 + 2 \cdot 7 + 1 \cdot 19$，重数均为二进制幂，直接对应互异分拆 $39 = 6 + 14 + 19$！]

### Exercise 2：轮换长度均为 $k$ 的倍数的排列计数

**题目**：固定正整数 $n, k$，设 $f(n, k)$ 为所有轮换长度均能被 $k$ 整除的 $n$-排列个数。求 $\{f(n, k)\}_{n \ge 0}$ 的简洁 EGF 及 $f(n, k)$ 的显式通项公式。

**解答**：:spoiler[牌组仅保留长度 $m k \ (m \ge 1)$ 的轮换，其牌数为 $d_{mk} = (mk - 1)!$。故牌组枚举器为 $\mathcal{D}(x) = \sum_{m \ge 1} \frac{(mk-1)!}{(mk)!} x^{mk} = \frac{1}{k}\sum_{m \ge 1} \frac{x^{mk}}{m} = \frac{1}{k}\log\frac{1}{1-x^k}$。由指数公式立得手牌 EGF 为 $\mathcal{H}(x) = \exp(\mathcal{D}(x)) = (1 - x^k)^{-1/k} = \sum_{r \ge 0} \binom{-1/k}{r}(-1)^r x^{rk}$。因此当 $k \nmid n$ 时 $f(n, k) = 0$；当 $n = rk$ 时，$f(rk, k) = (rk)! (-1)^r \binom{-1/k}{r} = \frac{n!}{r! k^r} (k+1)(2k+1)\cdots((r-1)k+1)$。]

### Exercise 3：各块大小均为素数的集合划分 EGF

**题目**：求集合 $[n]$ 的所有满足“每个等价类的大小都是素数”的划分数的指数生成函数。

**解答**：:spoiler[在集合划分族中，只保留素数大小 $p \in \{2, 3, 5, 7, 11, \dots\}$ 的牌组（每组 $d_p = 1$ 张牌），故牌组枚举器为 $\mathcal{D}(x) = \sum_{p \text{ prime}} \frac{x^p}{p!}$，由指数公式立得所求 EGF 为 $\exp\left\{\sum_{p \text{ prime}} \frac{x^p}{p!}\right\}$。]

### Exercise 4：置换群中元素的阶（Order of a Permutation）

**题目**：群 $\Gamma$ 中元素 $g$ 的阶（Order）是使 $g^\rho = 1_\Gamma$ 的最小正整数 $\rho$：(a) 用排列 $\sigma$ 的各轮换长度表示 $\sigma$ 的阶；(b) 设 $g(n, k)$ 为阶恰为 $k$ 的 $n$-排列个数，$\tilde{g}(n, m)$ 为所有轮换长度均整除 $m$ 的 $n$-排列个数，用 $\tilde{g}$ 表出 $g(n, k)$。

**解答**：:spoiler[(a) 排列 $\sigma$ 的阶等于其所有轮换长度的**最小公倍数（lcm）**。(b) $\sigma$ 的所有轮换长度均整除 $k$ 当且仅当 $\sigma$ 的阶 $d$ 整除 $k$（即 $\tilde{g}(n, k) = \sum_{d \mid k} g(n, d)$）。对第二个变量 $k$ 应用莫比乌斯反演（式 2.69），立得 $g(n, k) = \sum_{d \mid k} \mu(k/d) \tilde{g}(n, d)$，其中 $\tilde{g}(n, d) = [x^n/n!] \exp\left(\sum_{r \mid d} \frac{x^r}{r}\right)$ 已在定理 3.16 中求出！]

### Exercise 5：对合排列数 $T_n$ 的递推、数值与组合证明

**题目**：设 $T_n$ 为 $n$ 元对合排列（Involutions）个数：(a) 导出 $T_n$ 满足的递推关系；(b) 计算 $T_1, \dots, T_6$；(c) 给出该递推关系的直接组合构造解释。

**解答**：:spoiler[(a) 对 $T(x) = e^{x + x^2/2}$ 求导得 $T'(x) = (1 + x)T(x)$，提取 $[x^{n-1}/(n-1)!]$ 得 $T_n = T_{n-1} + (n-1)T_{n-2} \ (n \ge 2; \ T_0 = T_1 = 1)$。(b) $T_1=1, \ T_2=2, \ T_3=4, \ T_4=10, \ T_5=26, \ T_6=76$。(c) 组合解释：在对合排列中，元素 $n$ 要么是不动点（1-轮换），此时剩余 $n-1$ 个元素构成对合，有 $T_{n-1}$ 种；要么 $n$ 与前 $n-1$ 个元素中的某一个 $j$ 构成 2-轮换 $(n \ j)$（共 $n-1$ 种选法），剩余 $n-2$ 个元素构成对合，有 $(n-1)T_{n-2}$ 种。]

### Exercise 6：不含长度 $\le 3$ 轮换的排列 EGF

**题目**：求不含任何长度 $\le 3$ 的轮换的 $n$-排列数的闭式 EGF（结果中不得含有无穷级数）。

**解答**：:spoiler[牌组枚举器只保留 $n \ge 4$ 的轮换：$\mathcal{D}(x) = \sum_{n \ge 4} \frac{x^n}{n} = \log\frac{1}{1-x} - x - \frac{x^2}{2} - \frac{x^3}{3}$。由指数公式得手牌 EGF 为 $\mathcal{H}(x) = \exp(\mathcal{D}(x)) = \frac{e^{-x - x^2/2 - x^3/3}}{1 - x}$。]

### Exercise 7：顶点度数为 1 或 2 且连通分量数为奇数的图计数

**题目**：求所有顶点度数均为 1 或 2、且连通分量个数为奇数的有标号无向图的生成函数，并计算 $n = 0, \dots, 8$ 的方案数。

**解答**：:spoiler[每个顶点度数为 1 或 2 的连通无向图，要么是一条长度 $n \ge 2$ 的无向路径（Path，$n!$ 种排法抹去首尾方向除以 $2$，共 $n!/2$ 种），要么是一个长度 $n \ge 3$ 的无向环（Cycle，共 $(n-1)!/2$ 种）。故牌组枚举器为 $\mathcal{D}(x) = \sum_{n \ge 2} \frac{n!/2}{n!} x^n + \sum_{n \ge 3} \frac{(n-1)!/2}{n!} x^n = \frac{1}{2}\left(\frac{x^2}{1-x} + \log\frac{1}{1-x} - x - \frac{x^2}{2}\right) = \frac{1}{2}\left(\frac{1}{1-x} - \log(1-x) - 1 - 2x - \frac{x^2}{2}\right)$。限制连通分量个数为奇数（$T = \{1, 3, 5, \dots\}$），对应截断指数函数 $e_T(u) = \sinh u$，故所求 EGF 为 $\sinh\left(\frac{1}{2(1-x)} - \frac{1}{2}\log(1-x) - \frac{1}{2} - x - \frac{x^2}{4}\right)$。展开前 9 项（$n=0,\dots,8$）依次为：$0, 0, 1, 4, 15, 72, 435, 3300, 30310$。]

### Exercise 8：第一类斯特林数的三项递推与组合证明

**题目**：由式 (3.10) $\sum_k \begin{bmatrix} n \\ k \end{bmatrix} y^k = y(y+1)\cdots(y+n-1)$ 导出第一类斯特林数满足的三项递推关系，并给出不借助生成函数的直接组合证明。

**解答**：:spoiler[由 $y(y+1)\cdots(y+n-1) = (y + n - 1) \cdot y(y+1)\cdots(y+n-2)$，对比两侧 $y^k$ 的系数立得：$\begin{bmatrix} n \\ k \end{bmatrix} = \begin{bmatrix} n-1 \\ k-1 \end{bmatrix} + (n-1)\begin{bmatrix} n-1 \\ k \end{bmatrix}$。组合证明：将 $[n]$ 的含 $k$ 个轮换的排列按元素 $n$ 的去向分类：若 $n$ 独占一个 1-轮换 $(n)$，其余 $n-1$ 个元素构成 $k-1$ 个轮换，有 $\begin{bmatrix} n-1 \\ k-1 \end{bmatrix}$ 种；若 $n$ 不独占轮换，则它可以插入到 $[n-1]$ 的任意一个含 $k$ 个轮换的排列中某个现有元素 $j \in [n-1]$ 的正后方（共 $n-1$ 个插入位置），有 $(n-1)\begin{bmatrix} n-1 \\ k \end{bmatrix}$ 种。]

### Exercise 9：奇数个偶轮换组成的排列计数

**题目**：仿照 3.7 节，求满足“(a) 轮换个数为奇数，且 (b) 每个轮换长度都是偶数”的 $n$-排列数 $g(n)$ 的 EGF 与显式通项公式。

**解答**：:spoiler[只保留偶数长度 $2m \ (m \ge 1)$ 的轮换牌组，故 $\mathcal{D}(x) = \sum_{m \ge 1} \frac{(2m-1)!}{(2m)!} x^{2m} = \frac{1}{2}\sum_{m \ge 1} \frac{x^{2m}}{m} = \frac{1}{2}\log\frac{1}{1-x^2} = \log\frac{1}{\sqrt{1-x^2}}$。限制轮换个数为奇数对应 $e_T(u) = \sinh u = \frac{e^u - e^{-u}}{2}$，故 EGF 为 $\mathcal{H}(x) = \sinh\left(\log\frac{1}{\sqrt{1-x^2}}\right) = \frac{1}{2}\left(\frac{1}{\sqrt{1-x^2}} - \sqrt{1-x^2}\right) = \frac{x^2}{2\sqrt{1-x^2}}$。提取 $[x^n/n!]$ 知：当 $n$ 为奇数或 $n=0$ 时 $g(n) = 0$；当 $n = 2m \ge 2$ 为偶数时，$g(n) = \frac{n!}{2^{n-1}}\binom{n-2}{n/2 - 1}$。]

### Exercise 10 & 11：第二类斯特林数二项展开与双受限集合划分

**题目**：

- **10.** 将式 (3.13) $\begin{Bmatrix} n \\ k \end{Bmatrix} = [x^n/n!] \frac{(e^x - 1)^k}{k!}$ 中的 $(e^x - 1)^k$ 用二项式定理展开，重证式 (1.38)。

- **11.** 设 $S, T$ 为给定的正整数集，$f(n; S, T)$ 为将 $[n]$ 划分为“每个块大小均属于 $S$，且块的总数属于 $T$”的方案数。证明其 EGF 为 $e_T(e_S(x))$，其中 $e_S(x) = \sum_{s \in S} \frac{x^s}{s!}$。

**解答**：

- **10.** :spoiler[$\frac{(e^x-1)^k}{k!} = \frac{1}{k!}\sum_{r=0}^k (-1)^{k-r} \binom{k}{r} e^{rx}$，提取 $[x^n/n!]$ 即得 $\begin{Bmatrix} n \\ k \end{Bmatrix} = \frac{1}{k!}\sum_{r=1}^k (-1)^{k-r}\binom{k}{r} r^n = \sum_{r=1}^k (-1)^{k-r}\frac{r^{n-1}}{(r-1)!(k-r)!}$。]

- **11.** :spoiler[限制块大小属于 $S$ 意味着牌组枚举器只保留 $s \in S$ 的项，即 $\mathcal{D}(x) = \sum_{s \in S} \frac{x^s}{s!} = e_S(x)$；限制块数（手牌张数）属于 $T$ 直接调用推论 3.13（式 3.8），立得手牌 EGF 为 $e_T(\mathcal{D}(x)) = e_T(e_S(x))$！]

### Exercise 12：最长轮换长度恰为 $k$ 的排列 EGF

**题目**：固定 $k > 0$，设 $f(n, k)$ 为最长轮换长度恰好等于 $k$ 的 $n$-排列个数。求 $\{f(n, k)\}_{n \ge 0}$ 的 EGF。

**解答**：:spoiler[先求所有轮换长度均 $\le k$ 的排列数的 EGF：牌组只取 $1 \le r \le k$，故 $F_k(x) = \exp\left(x + \frac{x^2}{2} + \dots + \frac{x^k}{k}\right)$。“最长轮换长度恰为 $k$”等价于“所有轮换长度 $\le k$”减去“所有轮换长度 $\le k-1$”，故所求 EGF 为 $F_k(x) - F_{k-1}(x) = \exp\left(\sum_{j=1}^{k-1} \frac{x^j}{j}\right)\left(e^{x^k / k} - 1\right)$。]

### Exercise 13：对合排列与两个 2-正则图的精妙双射（Katzman 双射）

**题目**：设 $T(x) = e^{x + x^2/2}$ 为对合排列的 EGF，$G(x) = \frac{e^{-x/2 - x^2/4}}{\sqrt{1-x}}$ 为 2-正则图的 EGF。注意到 $T(x) G(x)^2 = \frac{1}{1-x}$！(a) 写出对应的序列恒等式；(b) 解释其组合含义；(c) 构造一个显式双射。

**解答**：:spoiler[(a) $\sum_{i+j+k=n} \frac{n!}{i!j!k!} t_i g_j g_k = n!$。(b) 左侧计数三元组 $(\tau, G_1, G_2)$，其中标号集 $R, S, T$ 划分 $[n]$，$\tau$ 是 $R$ 上的对合排列，$G_1, G_2$ 分别是 $S, T$ 上的 2-正则无向图；右侧计数 $[n]$ 上的全体排列 $\sigma$。(c) Douglas Katzman 给出的显式双射：给定排列 $\sigma$，将其所有长度为 $1$ 和 $2$ 的轮换放入 $R$ 组成对合 $\tau$；对于 $\sigma$ 中每个长度 $\ge 3$ 的有向轮换，找到该轮换中**标号最小的顶点 $v$**，观察 $v$ 在原轮换中有向边指向的邻居 $u$：若 $u$ 在 $v$ 的两个邻居中标号**较大**，则抹去该轮换的方向放入无向图 $G_1$；若 $u$ 在两个邻居中标号**较小**，则抹去方向放入无向图 $G_2$！反之，从 $G_1, G_2$ 的每个无向环最小顶点出发按上述规则赋予唯一方向即可还原 $\sigma$。]

### Exercise 14：二项式型多项式的算子恒等式（Umbral Calculus 核心定理）

**题目**：设指数族 $\mathcal{F}$ 的牌组枚举器为 $\mathcal{D}(x)$，关联的二项式型多项式为 $\{\phi_n(y)\}$：(a) 记微分算子 $D_y = \frac{\partial}{\partial y}$，$\mathcal{D}^{(-1)}$ 为 $\mathcal{D}(x)$ 的复合逆函数，证明 $\mathcal{D}^{(-1)}(D_y) \phi_n(y) = n \phi_{n-1}(y)$；(b) 在排列轮换族中具体验证该恒等式。

**解答**：:spoiler[(a) 对生成关系 $\sum_{n \ge 0} \phi_n(y) \frac{x^n}{n!} = e^{y \mathcal{D}(x)}$，注意到每次作用 $D_y$ 都会在右侧乘上一个因子 $\mathcal{D}(x)$，故对任意形式幂级数 $f$，有 $f(D_y) e^{y \mathcal{D}(x)} = f(\mathcal{D}(x)) e^{y \mathcal{D}(x)}$。取 $f = \mathcal{D}^{(-1)}$，则 $\mathcal{D}^{(-1)}(D_y) e^{y \mathcal{D}(x)} = \mathcal{D}^{(-1)}(\mathcal{D}(x)) e^{y \mathcal{D}(x)} = x e^{y \mathcal{D}(x)} = \sum_{n \ge 1} n \phi_{n-1}(y) \frac{x^n}{n!}$，对比两侧 $[x^n/n!]$ 即证！(b) 在排列族中 $\phi_n(y) = y(y+1)\cdots(y+n-1)$，$\mathcal{D}(x) = -\log(1-x)$，其复合逆为 $\mathcal{D}^{(-1)}(u) = 1 - e^{-u}$。由泰勒平移公式 $e^{-D_y} \phi_n(y) = \phi_n(y-1)$，故 $(1 - e^{-D_y})\phi_n(y) = \phi_n(y) - \phi_n(y-1) = y\cdots(y+n-1) - (y-1)\cdots(y+n-2) = n y(y+1)\cdots(y+n-2) = n \phi_{n-1}(y)$！]

### Exercise 15：各轮换长度两两不同的排列概率与欧拉常数 $\gamma$

**题目**：(a) 在指数族 $\mathcal{F}$ 中，设各张纸牌权重两两不同的手牌数为 $\tilde{h}(n)$，证明 $\sum_{n \ge 0} \frac{\tilde{h}(n)}{n!} x^n = \prod_{k=1}^\infty \left(1 + \frac{d_k}{k!} x^k\right)$；(b) 设 $n$-排列的各轮换长度两两不同的概率为 $p_n$，证明 $\{p_n\} \stackrel{ops}{\longleftrightarrow} \prod_{k \ge 1}\left(1 + \frac{x^k}{k}\right)$；(c) 通过插入因子 $e^{-x^k/k}$ 确定当 $x \to 1^-$ 时该生成函数的渐近增长，从而求出 $\lim_{n \to \infty} p_n$。

**解答**：:spoiler[(a) 每种权重 $k$ 最多选 1 张牌，单牌组手牌枚举器为 $1 + d_k \frac{x^k}{k!}$，由合并引理 3.10 连乘即得。(b) 排列族中 $d_k = (k-1)! \implies \frac{d_k}{k!} = \frac{1}{k}$，且 $\frac{\tilde{h}(n)}{n!} = p_n$。(c) 将乘积写为 $p(x) = \left(\prod_{k=1}^\infty e^{x^k / k}\right) \prod_{k=1}^\infty \left(1 + \frac{x^k}{k}\right)e^{-x^k / k} = \frac{1}{1-x} \prod_{k=1}^\infty \left(1 + \frac{x^k}{k}\right)e^{-x^k / k}$。当 $x \to 1^-$ 时，右侧无穷乘积收敛于常数 $\prod_{k=1}^\infty \left(1 + \frac{1}{k}\right)e^{-1/k} = \lim_{N \to \infty} (N+1) e^{-H_N} = e^{-\gamma}$（其中 $\gamma \approx 0.5772$ 为欧拉常数），故 $\lim_{n \to \infty} p_n = e^{-\gamma} \approx 0.56146$！]

### Exercise 16, 17, 18 & 19：幂指展开整除性、斯特林互逆与树分拆关系

**题目**：

- **16.** 设 $x^x = 1 + \sum_{n \ge 1} \frac{c_n}{n!}(x-1)^n$，证明 $n \mid c_n$，且 $n(n-1) \mid c_n \iff (n-1) \mid (n-2)!$（即威尔逊定理判据：$n-1$ 为合数且 $n-1 \neq 4$）。

- **17.** 由式 (3.10) 和 (1.36) 证明两类斯特林数矩阵互逆（已在正文精选习题中详证）。

- **18.** 设 $a_n$ 为每个连通分量都是路径（Path）或环（Cycle）的 $n$ 阶**无标号**无向图个数，用整数分拆生成函数 $P(x) = \prod_{j \ge 1}(1-x^j)^{-1}$ 表示 $\{a_n\}$ 的 OGF $F(x)$。

- **19.** 设 $a_n$ 为根节点度数恰为 $2$ 的 $n$ 阶无标号有根树个数，$T(x) = \sum_{n \ge 1} t_n x^n$ 为全体无标号有根树的 OGF，证明 $\sum_n a_n x^{n-1} = \frac{1}{2}\left(T(x)^2 + T(x^2)\right)$。

**解答**：

- **16.** :spoiler[令 $t = x - 1$，则 $(1+t)^{1+t} = (1+t)\sum_{k \ge 0} \binom{t}{k} t^k = (1+t)\sum_{k \ge 0} \frac{t^k}{k!}\sum_r (-1)^{k-r}\begin{bmatrix} k \\ r \end{bmatrix} t^r$。提取 $[t^n/n!]$ 可得 $\frac{c_n}{n} = (n-1)!\sum_{k=1}^n \frac{(-1)^{n-k}}{k!}\left(\begin{bmatrix} k \\ n-k \end{bmatrix} - \begin{bmatrix} k \\ n-k-1 \end{bmatrix}\right)$，因为当 $k \le n-1$ 时 $\frac{(n-1)!}{k!}$ 必为整数，而 $k = n$ 项只剩 $(-1)^0 \frac{(n-1)!}{n!} \begin{bmatrix} n \\ 0 \end{bmatrix} = 0 \ (n \ge 2)$，故 $c_n / n$ 恒为整数！再模 $n-1$ 分析 $k = n-1$ 项即得 $(n-1) \mid (n-2)!$ 条件。]

- **18.** :spoiler[无标号连通图预制件中，$n=1, 2$ 时只有路径（$d_1 = d_2 = 1$）；$n \ge 3$ 时既有 1 条路径又有 1 个环（$d_n = 2$）。由定理 3.21，$F(x) = \frac{1}{(1-x)(1-x^2)} \prod_{j \ge 3} \frac{1}{(1-x^j)^2} = \frac{P(x)^2}{(1-x)(1-x^2)}$。]

- **19.** :spoiler[删去度数为 2 的根节点后，剩下两棵无序的无标号有根子树，其顶点数之和为 $n-1$。当两棵子树规模不同或相同时，无序对计数等价于在 $2$ 元预制件中选 $2$ 张牌（式 3.31 或 Burnside 引理）：当 $n-1$ 为奇数时 $a_n = \frac{1}{2}\sum_j t_j t_{n-1-j}$；当 $n-1$ 为偶数时同一棵规模为 $(n-1)/2$ 的树选两次有 $\binom{t_{(n-1)/2} + 1}{2} = \frac{t^2 + t}{2}$ 种，多出的 $\frac{1}{2}t_{(n-1)/2}$ 恰好由 $\frac{1}{2}T(x^2)$ 提供！]

### Exercise 20, 21 & 22：三硬币 Frobenius 导体与精化多元指数公式

**题目**：

- **20.** 求不能表示为 $6x + 10y + 15z \ (x, y, z \ge 0, \ x,y,z \in \mathbb{Z})$ 的最大正整数，并给出严格证明。

- **21.** 证明用 1, 2, 3 分硬币找零 $n$ 分钱的方案数等于离 $(n+3)^2 / 12$ 最近的整数（已在正文精选题中详证）。

- **22（精化多元指数公式，第 4.7 节对称群循环指标的母定理）**：(a) 在指数族 $\mathcal{F}$ 中，证明权重为 $n$、且恰好包含 $a_1$ 张权重为 1 的牌、$a_2$ 张权重为 2 的牌……（$\sum i a_i = n$）的手牌数，等于 $\exp\left\{\sum_{i \ge 1} \frac{x_i d_i t^i}{i!}\right\}$ 中 $\frac{t^n}{n!} x_1^{a_1} x_2^{a_2}\cdots$ 的系数；(b) 设 $f(n, r, s)$ 为 $[n]$ 的划分中恰有 $r$ 个大小为 1 的块和 $s$ 个大小为 2 的块的划分数，证明 $\sum_{n, r, s} f(n, r, s) x^r y^s \frac{t^n}{n!} = \exp\left(xt + \frac{yt^2}{2} + e^t - 1 - t - \frac{t^2}{2}\right)$。

**解答**：

- **20.** :spoiler[最大不可表出整数是 **$29$**！证明：（1）为什么 $29$ 不可表出？若 $29 = 6x + 10y + 15z$，由于 $6x + 10y$ 是偶数而 $29$ 是奇数，$z$ 必须取正奇数。若 $z = 1$，则 $6x + 10y = 14 \implies 3x + 5y = 7$，但 $\kappa(\{3, 5\}) - 1 = 3 \times 5 - 3 - 5 = 7$ 恰好不可非负表出！若 $z \ge 3$，则 $15z \ge 45 > 29$，矛盾。（2）为什么所有 $n \ge 30$ 均可表出？只需验证连续 6 个数 $30, 31, 32, 33, 34, 35$ 均可表出（之后不断加 $6$ 即可覆盖全部 $\ge 30$ 的整数）：$30 = 6 \times 5$，$31 = 6 + 10 + 15$，$32 = 6 \times 2 + 10 \times 2$，$33 = 6 \times 3 + 15$，$34 = 6 \times 4 + 10$，$35 = 10 \times 2 + 15$，证毕！]

- **22.** :spoiler[(a) 选出 $a_i$ 张权重为 $i$ 的牌并分配标号，方案数为 $\frac{n!}{\prod_{i \ge 1} (i!)^{a_i} a_i!} \prod_{i \ge 1} d_i^{a_i}$，乘上 $\frac{t^n}{n!} \prod x_i^{a_i}$ 并对所有非负整数 $a_1, a_2, \dots$ 求和，恰好分解为无穷乘积 $\prod_{i \ge 1} \sum_{a_i \ge 0} \frac{1}{a_i!}\left(\frac{x_i d_i t^i}{i!}\right)^{a_i} = \exp\left\{\sum_{i \ge 1} \frac{x_i d_i t^i}{i!}\right\}$！(b) 在集合划分族中所有 $d_i = 1$，令 $x_1 = x, \ x_2 = y$，且对一切 $i \ge 3$ 令 $x_i = 1$，代入 (a) 立得 $\exp\left(xt + y\frac{t^2}{2} + \sum_{i \ge 3} \frac{t^i}{i!}\right) = \exp\left(xt + \frac{yt^2}{2} + e^t - 1 - t - \frac{t^2}{2}\right)$。]

---
title: 生成函数 · 笔记（四） · 概率矩、容斥与组合求和
published: 2026-12-01
tags:
  - 生成函数
  - 容斥原理
  - Snake_Oil
  - WZ证明对
  - Generatingfunctionology
category: 生成函数
draft: false
description: 均值与方差对数求导公式、生成函数筛法与棋盘车多项式、Snake Oil 求和法全部 9 大算例、WZ 自动证明对与 Gosper 算法、对数凹性与单峰性、模 2 同余性质、对称群循环指标与随机排列泊松分布、排列开 k 次方根、水平凸多联骨牌、精确覆盖序列 ECS、抛硬币等待字符串与不含连续 k 个 1 的 0-1 串，附 4.13 节全部 29 道大题完整折叠解答。
---

## 导读

本篇讨论概率矩、容斥与组合求和，结合推导、例题与代码说明方法的使用条件。

:::tip[学习重点]

- 用生成函数计算概率矩，并把容斥与求和转化为系数问题。
- 检查 Snake Oil 与 WZ 方法中的求和范围和边界项。

:::

## 一、4.1 生成函数计算均值、方差与指数族平均牌数（Generating Functions Find Averages, etc.）

设有限集 $S$ 中共有 $N$ 个对象，其中具有 $n$ 个性质的对象有 $f(n)$ 个，定义普通生成函数 $F(x) = \sum_{n \ge 0} f(n) x^n \ (F(1) = N)$。

- **均值（Mean）$\mu$**：
$$
\mu = \frac{1}{N} \sum_n n f(n) = \frac{F'(1)}{F(1)} = \left.(\log F(x))'\right|_{x=1}
$$

- **方差（Variance）$\sigma^2$**：将 $(n - \mu)^2 = n^2 - 2\mu n + \mu^2$ 转化为算子 $(xD)^2 - 2\mu(xD) + \mu^2$ 作用在 $F(x)$ 上并令 $x = 1$（式 4.3）：

$$
\sigma^2 = \frac{F''(1)}{F(1)} + \frac{F'(1)}{F(1)} - \left(\frac{F'(1)}{F(1)}\right)^2 = \left.\left\{(\log F)' + (\log F)''\right\}\right|_{x=1}
$$

:::important[定理 4.1：指数族中手牌的平均纸牌张数与轮换数渐近正态分布（Example 4.2）]

在指数族 $\mathcal{F}$ 中，权重为 $n$ 的手牌平均包含多少张纸牌（连通分量）$\mu(n)$？

对二元指数公式 $\sum_{n, k} h(n, k)\frac{x^n}{n!} y^k = e^{y \mathcal{D}(x)}$ 关于 $y$ 求偏导后令 $y = 1$，得 $\sum_n \frac{x^n}{n!} \sum_k k h(n, k) = \mathcal{D}(x) e^{\mathcal{D}(x)} = \mathcal{D}(x) \mathcal{H}(x)$，提取系数即得**定理 4.1**：

$$
\mu(n) = \frac{1}{h(n)} \sum_r \binom{n}{r} d_r h(n - r)
$$

在全体排列族 $\mathcal{F}_2$ 中，$h(n) = n!, \ d_r = (r-1)!$，代入立即发现：**$n$ 元随机排列的平均轮换个数恰好是第 $n$ 个调和数**：

$$
\mu(n) = \frac{1}{n!} \sum_{r=1}^n \binom{n}{r} (r-1)!(n-r)! = 1 + \frac{1}{2} + \frac{1}{3} + \dots + \frac{1}{n} = H_n \sim \log n
$$

再将 $F(x) = x(x+1)\cdots(x+n-1)$ 代入对数二阶导数公式 (4.3)，得方差为：

$$
\sigma^2 = H_n - \sum_{j=1}^n \frac{1}{j^2} = \log n + \gamma - \frac{\pi^2}{6} + o(1), \qquad \sigma \sim \sqrt{\log n}
$$

:::

---

## 二、4.2 筛法（容斥原理）的生成函数视角（A Generatingfunctionological View of the Sieve Method）

设对象集为 $\Omega$，性质集为 $P$。对任意含 $r$ 个性质的子集 $S \subseteq P$，记“至少具有 $S$ 中所有性质”的对象数为 $N(\supseteq S)$，定义未筛选计数和 $N_r = \sum_{|S|=r} N(\supseteq S)$。

若某对象 $\omega$ 恰好具有 $|P(\omega)| = t$ 个性质，它会对 $N_r$ 贡献 $\binom{t}{r}$ 次计数。因此，记“恰好具有 $t$ 个性质”的对象数为 $e_t$，则有（式 4.9）：

$$
N_r = \sum_{t \ge 0} \binom{t}{r} e_t \quad (r = 0, 1, 2, \dots)
$$

定义生成函数 $N(x) = \sum_{r \ge 0} N_r x^r$ 与 $E(x) = \sum_{t \ge 0} e_t x^t$。将上式乘 $x^r$ 对 $r$ 求和：

$$
N(x) = \sum_t e_t \sum_r \binom{t}{r} x^r = \sum_t e_t (x+1)^t = E(x+1) \iff \boxed{E(x) = N(x - 1)}
$$

:::tip[生成函数筛法四步曲（Section 4.2.1）与五大经典案例]

只需算出更容易求的 $N_r$，拼成多项式 $N(x)$，**将 $x$ 替换为 $x - 1$**，展开即得所有 $e_t = \sum_{r \ge t} (-1)^{r-t}\binom{r}{t} N_r$！且平均性质个数直接等于 $N_1 / |\Omega|$。

1. **排列的不动点分布（Example 4.3）**：固定 $r$ 个不动点有 $N_r = \binom{n}{r}(n-r)! = \frac{n!}{r!}$。故 $N(x) = n! \exp|_n(x)$，代入 $x-1$ 得 $E(x) = n! \exp|_n(x-1)$，恰有 $t$ 个不动点的排列数为 $e_t = \frac{n!}{t!} \exp|_{n-t}(-1) \sim \frac{n!}{e \cdot t!}$。平均不动点数为 $N_1/n! = 1$。

2. **排列中长度为 $k$ 的轮换个数分布（Example 4.4）**：选出 $r$ 个不相交的 $k$-轮换共有 $\frac{1}{r!}\binom{n}{k, k, \dots, n-kr} ((k-1)!)^r$ 种方式，乘上剩余 $(n-kr)!$ 个元素的自由排列，得 $N_r = \frac{n!}{k^r r!} \ (0 \le r \le n/k)$。故：

$$
N(x) = n! \exp|_{\lfloor n/k \rfloor}\left(\frac{x}{k}\right) \implies E(x) = n! \exp|_{\lfloor n/k \rfloor}\left(\frac{x-1}{k}\right)
$$

平均每个排列含有的 $k$-轮换个数直接为 $N_1 / n! = 1/k$！

3. **用分球入盒筛出第二类斯特林数恒等式（Example 4.5）**：将 $n$ 个有标号球放入 $k$ 个有标号盒子（$|\Omega| = k^n$），性质 $P_i$ 定义为“第 $i$ 个盒子为空”。则 $N_r = \binom{k}{r}(k-r)^n$，而恰有 $t$ 个空盒的方案数为 $e_t = \binom{k}{t}(k-t)!\begin{Bmatrix} n \\ k-t \end{Bmatrix} = \frac{k!}{t!}\begin{Bmatrix} n \\ k-t \end{Bmatrix}$。由 $E(x) = N(x-1)$ 立得式 (4.21)，再与 EGF 卷积对比导出惊人恒等式（式 4.22）：

$$
\sum_{1 \le k \le n} \begin{Bmatrix} n \\ k \end{Bmatrix} y^k = e^{-y} \sum_{r \ge 1} \frac{r^n}{r!} y^r
$$

4. **棋盘车多项式（Rooks on Chessboards, Example 4.6）**：在棋盘 $C \subseteq [n]\times[n]$ 上放 $k$ 个互不攻击的车的方案数为 $r_k$，则 $N_k = r_k (n-k)!$，排列 $\sigma$ 恰好踩中 $C$ 中 $j$ 个格子的方案数为 $[x^j] \sum_k (n-k)! r_k (x-1)^k$。

5. **子集筛选导出二项式恒等式（Example 4.7）**：在 $[2n]$ 的 $\binom{2n}{n}$ 个 $n$-子集中，定义性质 $i \ (1 \le i \le n)$ 为“元素 $i$ 不在子集中”。一方面 $N_r = \binom{n}{r}\binom{2n-r}{n}$；另一方面恰缺前一半中 $j$ 个元素的子集数显然为 $e_j = \binom{n}{j}^2$。由 $E(t) = N(t-1)$ 不费吹灰之力证得恒等式（式 4.25）：

$$
\sum_j \binom{n}{j}^2 t^j = \sum_r \binom{n}{r}\binom{2n-r}{n}(t-1)^r
$$

:::

---

## 三、4.3 组合求和的“求和技巧”：Snake Oil 方法（Section 4.3）

面对组合恒等式 $\sum_k (\cdots) = f(n)$，与在求和号内部做精细下标变形的“内部法（Internal Method）”不同，Wilf 的 **Snake Oil（外部生成函数法）** 遵循一套完全机械化的五步曲：

1. 认准自由变量 $n$，记和式为 $f(n)$，定义 OGF $F(x) = \sum_n f(n) x^n$（或 EGF）。

2. 两边乘 $x^n$ 对 $n$ 求和，**立刻交换内外层求和顺序**（将只依赖外层 $k$ 的因子全部提到内层求和号外）。

3. 利用三大基本级数（式 4.26–4.28）：$\sum_{r \ge 0} \binom{r}{k} x^r = \frac{x^k}{(1-x)^{k+1}}$、$\sum_r \binom{n}{r} x^r = (1+x)^n$、卡特兰级数 $\sum_n \frac{1}{n+1}\binom{2n}{n} x^n = \frac{1-\sqrt{1-4x}}{2x}$ 将内层对 $n$ 的求和化为闭式。

4. 计算外层对 $k$ 的级数和，得到 $F(x)$ 的闭式。

5. 提取系数 $[x^n] F(x)$ 即得原和式的闭式解！

### 书本 9 大典型算例全覆盖（Examples 4.8–4.16）

- **Example 4.8（热身）**：求 $f(n) = \sum_{k \ge 0} \binom{k}{n-k}$。乘 $x^n$ 交换求和得 $F(x) = \sum_{k \ge 0} x^k \sum_n \binom{k}{n-k} x^{n-k} = \sum_{k \ge 0} x^k (1+x)^k = \frac{1}{1 - x - x^2}$，故 $f(n) = F_{n+1}$。

- **Example 4.9（卡特兰抵消）**：求 $\sum_k \binom{n+k}{m+2k}\binom{2k}{k}\frac{(-1)^k}{k+1}$。乘 $x^n$ 交换求和后内层产生 $\frac{x^{m+2k}}{(1-x)^{m+2k+1}}$，外层由卡特兰级数 (4.28) 化简得 $F(x) = \frac{x^m}{(1-x)^m}$，提取 $[x^n]$ 得 $\binom{n-1}{m-1}$。

- **Example 4.10（探索未知参数和与连环恒等式，式 4.30–4.34）**：化简 $f_n = \sum_{k \le n/2} (-1)^k \binom{n-k}{k} y^{n-2k}$。乘 $x^n$ 交换求和得：

$$
F(x) = \sum_{k \ge 0} (-1)^k x^k y^{-k} \sum_{n \ge 2k} \binom{n-k}{k} (xy)^{n-k} = \sum_{k \ge 0} (-1)^k x^k y^{-k} \frac{(xy)^k}{(1-xy)^{k+1}} = \frac{1}{1 - xy + x^2}
$$

部分分式展开后，做精妙的变量代换 $y \gets x + 1/x, \ t = x^2$，立即拿到一串宝石般的恒等式：

$$
\sum_{k \le n/2} (-1)^k \binom{n-k}{k} (t+1)^{n-2k} t^k = \frac{1 - t^{n+1}}{1 - t}, \qquad \sum_{k \le n/2} (-1)^k \binom{n-k}{k}\binom{n-2k}{m-k} = [0 \le m \le n]
$$

- **Example 4.11**：求 $\sum_k \binom{n+k}{2k} 2^{n-k}$。乘 $x^n$ 求和得 $F(x) = \frac{1-2x}{(1-4x)(1-x)} = \frac{2}{3(1-4x)} + \frac{1}{3(1-x)}$，故通项为 $\frac{2^{2n+1}+1}{3}$。

- **Example 4.12（Reed Dawson 恒等式）**：对 $f_n(y) = \sum_k \binom{n}{k}\binom{2k}{k} y^k$，算出 $F(x, y) = \frac{1}{\sqrt{(1-x)(1-x(1+4y))}}$。特取 $y = -1/4$ 得 $2^{-2n}\binom{2n}{n}$；特取 $y = -1/2$ 得 $F(x, -1/2) = \frac{1}{\sqrt{1-x^2}}$，从而当 $n$ 为偶数时等于 $\binom{n}{n/2} 2^{-n}$，为奇数时等于 $0$！

- **Example 4.13（不求值直接证两侧相等）**：要证 $\sum_k \binom{m}{k}\binom{n+k}{m} = \sum_k \binom{m}{k}\binom{n}{k} 2^k$，分别对左右两侧关于自由变量 $n$ 乘 $x^n$ 求和，发现两侧的 OGF 全都等于 $\frac{(1+x)^m}{(1-x)^{m+1}}$！

- **Example 4.14（二项反演对）**：$a_r = \sum_s \binom{r}{s} b_s \iff A(x) = e^x B(x) \iff B(x) = e^{-x} A(x) \iff b_n = \sum_m \binom{n}{m}(-1)^{n-m} a_m$。

- **Example 4.15（超越超几何级数：斯特林数与伯努利数卷积）**：求 $f(n) = \sum_k \begin{bmatrix} n \\ k \end{bmatrix} B_k$。此和式相邻项之比不是有理函数（非超几何级数），但 Snake Oil 照样通杀！取 EGF 乘 $x^n/n!$ 求和：

$$
F(x) = \sum_k B_k \sum_n \begin{bmatrix} n \\ k \end{bmatrix} \frac{x^n}{n!} = \sum_k \frac{B_k}{k!} \left(\log\frac{1}{1-x}\right)^k = \frac{u}{e^u - 1} = \frac{1-x}{x}\log\frac{1}{1-x} \implies f(n) = -\frac{(n-1)!}{n+1} \ (n \ge 1)
$$

- **Example 4.16（自由变量出现多次时的分裂泛化技巧）**：若自由变量 $n$ 在和式中出现多次（如 $\sum_i \binom{n}{i}\binom{2n}{n-i}$），只需将其分裂为独立自由变量 $\sum_i \binom{n}{i}\binom{m}{r-i}$，对只出现一次的 $r$ 使用 Snake Oil 算出 $\binom{n+m}{r}$，再令 $m=2n, r=n$ 得 $\binom{3n}{n}$！

---

## 四、4.4 WZ 证明对与机器自动证明（WZ Pairs Prove Harder Identities）

当遇到极其困难的超几何恒等式 $\sum_k U(n, k) = \text{rhs}(n) \ (n \ge 0)$ 时，先两侧同除以 $\text{rhs}(n)$ 化为标准形式 $\sum_k F(n, k) = 1$。

:::important[定理 4.17（Wilf-Zeilberger 定理）与有理证书验证六步法]

若存在伴侣函数 $G(n, k) = R(n, k) F(n, k-1)$（其中 $R(n, k)$ 是关于 $n, k$ 的**有理函数证书 Rational Function Certificate**），满足**裂项差分方程（式 4.49）**：

$$
F(n+1, k) - F(n, k) = G(n, k+1) - G(n, k)
$$

且满足边界消失条件 $\lim_{k \to \pm\infty} G(n, k) = 0$，则将该方程对所有整数 $k$ 求和后右侧裂项相消为 $0$，从而 $\sum_k F(n+1, k) = \sum_k F(n, k) = \text{const.}$！只需再检验 $n = 0$ 时和为 $1$，恒等式即被严格证毕！

- **定理 4.20**：$\sum_k (-1)^k \binom{n}{k}\binom{2k}{k} 4^{n-k} = \binom{2n}{n}$，证书为 $R(n, k) = \frac{2k-1}{2n+1}$。

- **定理 4.21**：$\sum_k (-1)^k \binom{n}{k} / \binom{k+a}{k} = \frac{a}{n+a}$，证书为 $R(n, k) = \frac{k}{n+a}$。

- **定理 4.22**：$\sum_k (-1)^{n-k} \binom{2n}{k}^2 = \binom{2n}{n}$，证书为 $R(n, k) = -\frac{10n^2 - 6kn + 17n + k^2 - 5k + 7}{2(2n - k + 2)^2}$。

- **定理 4.24（Pfaff-Saalschütz 恒等式）**：证书为 $R(n, k) = -\frac{(b+k)(a+k)}{(c-b+n+1)(c-a+n+1)}$。

- **定理 4.25（Dixon 恒等式）**：$\sum_k (-1)^k \binom{n+b}{n+k}\binom{n+c}{c+k}\binom{b+c}{b+k} = \frac{(n+b+c)!}{n!b!c!}$，证书为 $R(n, k) = \frac{(c+1-k)(b+1-k)}{2(n+k)(n+b+c+1)}$。

*（注：给定超几何项 $f_k = F(n+1, k) - F(n, k)$，判定并求出使 $f_k = g_{k+1} - g_k$ 的超几何项 $g_k$ 的完备决策算法正是著名的 **Gosper 算法**！）*

:::

---

## 五、4.5–4.12 单峰性、同余、循环指标、排列方根、多联骨牌、精确覆盖与字符串

### 4.5 单峰性与对数凹性（Unimodality & Log-Concavity）

正数序列 $c_0, c_1, \dots, c_n$ 若满足 $c_{\mu-1} c_{\mu+1} \le c_\mu^2 \ (1 \le \mu \le n-1)$，则称为**对数凹（Log-concave）**；**命题 4.26** 证明对数凹序列必为**单峰（Unimodal）**序列。

- **定理 4.27（实根蕴含严格对数凹）**：**若生成多项式 $p(x) = \sum_{r=0}^n c_r x^r$ 的所有零点都是负实数，则系数序列 $\{c_r\}$ 严格对数凹（从而单峰）！**

  - *证明核心（引理 4.28）*：对齐次化多项式 $f(x, y) = \sum_{j=0}^n \binom{n}{j} p_j x^{n-j} y^j$（其根 $x/y$ 全为实数）作用微分算子 $D_x^m D_y^{n-m-2}$，由罗尔定理知所得二次三项式 $\binom{n}{m+1}(p_{n-m-2} x^2 + 2p_{n-m-1} xy + p_{n-m} y^2)$ 必有两个实根，故判别式 $\Delta \ge 0 \implies p_{n-m-1}^2 \ge p_{n-m-2} p_{n-m} \implies c_{n-m-1}^2 > c_{n-m-2} c_{n-m}$！

  - *三大推论（Corollaries 4.29–4.31）*：二项式系数 $\binom{n}{k}$（根全为 $-1$）、第一类斯特林数 $\begin{bmatrix} n \\ k \end{bmatrix}$（根为 $-1, -2, \dots, -(n-1)$）、以及第二类斯特林数 $\begin{Bmatrix} n \\ k \end{Bmatrix}$（利用 $e^y A_n(y) = y(e^y A_{n-1}(y))'$ 归纳证得根全为负实数）全都严格对数凹且单峰！

  - *反例警示*：实根只是充分条件而非必要条件！排列逆序对数生成多项式 $\prod_{j=1}^n (1+x+\dots+x^{j-1})$ 的根均匀分布在单位圆周上（无负实根除 $-1$），但逆序对序列依然是单峰的！

### 4.6 生成函数证明同余（Proving Congruences）

- **定理 4.33**：在模 2 意义下，$\sum_k \begin{bmatrix} n \\ k \end{bmatrix} x^k = x(x+1)\cdots(x+n-1) \equiv x^{\lceil n/2 \rceil}(x+1)^{\lfloor n/2 \rfloor} \pmod 2$，故 $\begin{bmatrix} n \\ k \end{bmatrix} \equiv \binom{\lfloor n/2 \rfloor}{k - \lceil n/2 \rceil} \pmod 2$。

- **定理 4.35**：在模 2 意义下，$\sum_n \begin{Bmatrix} n \\ k \end{Bmatrix} x^n = \frac{x^k}{(1-x)(1-2x)\cdots(1-kx)} \equiv \frac{x^k}{(1-x)^{\lceil k/2 \rceil}} \pmod 2$，故 $\begin{Bmatrix} n \\ k \end{Bmatrix} \equiv \binom{\lceil k/2 \rceil + n - k - 1}{n - k} \pmod 2$。

### 4.7 对称群的循环指标与随机排列的渐近泊松定理（Cycle Index of $S_n$）

设 $n$-排列 $\sigma$ 的轮换类型向量为 $\boldsymbol{a} = (a_1, a_2, \dots)$（即含 $a_j$ 个长为 $j$ 的轮换，$\sum j a_j = n$）。

- **定理 4.37（Cauchy 公式）**：具有轮换类型 $\boldsymbol{a}$ 的 $n$-排列个数为 $c(\boldsymbol{a}) = \frac{n!}{\prod_{j \ge 1} (a_j! j^{a_j})}$。

- **定理 4.38（循环指标生成函数）**：记对称群循环指标为 $\phi_n(\boldsymbol{x}) = \sum_{\boldsymbol{a}} c(\boldsymbol{a}) x_1^{a_1} x_2^{a_2}\cdots$，则其指数生成函数为：

$$
C(\boldsymbol{x}, t) = \sum_{n \ge 0} \phi_n(\boldsymbol{x}) \frac{t^n}{n!} = \exp\left(\sum_{j \ge 1} \frac{x_j t^j}{j}\right) \quad (4.69)
$$

- **定理 4.40（随机排列轮换的渐近独立泊松分布）**：设正整数子集 $S$ 满足 $\sum_{s \in S} \frac{1}{s} < \infty$。在 $C(\boldsymbol{x}, t)$ 中令所有 $i \notin S$ 的 $x_i = 1$，则 $C(\boldsymbol{x}, t) = \frac{1}{1-t}\exp\left(\sum_{s \in S} \frac{(x_s - 1)t^s}{s}\right)$。由 **引理 4.39**（若 $\sum b_j$ 收敛，则 $[t^n] \frac{1}{1-t}\sum b_j t^j = \sum_{j \le n} b_j \to \sum_{j \ge 0} b_j$），当 $n \to \infty$ 时，随机排列在 $S$ 中各长度 $s$ 的轮换个数为 $a_s$ 的极限概率为：

$$
\prod_{s \in S} \left(\frac{e^{-1/s} (1/s)^{a_s}}{a_s!}\right) \quad (4.72)
$$

这意味着：**当 $n \to \infty$ 时，随机排列中长为 $s$ 的轮换个数渐近服从均值为 $1/s$ 的相互独立泊松分布！**（例如：没有任何一个轮换长度是完全平方数的极限概率为 $\exp(-\sum_{k \ge 1} 1/k^2) = e^{-\pi^2/6} \approx 0.193025$；1-轮换与 2-轮换个数相等的极限概率为 $e^{-3/2}\sum_{j \ge 0} \frac{1}{2^j (j!)^2} \approx 0.34944$。）

### 4.8 多少个排列有平方根与 $k$ 次方根？（Square Roots & $k$th Roots of Permutations）

对排列 $\tau$ 取平方 $\tau^2$ 时，长为 $2m$ 的偶轮换会分裂为**两个**长为 $m$ 的轮换，而长为 $2m+1$ 的奇轮换仍保持为一个长为 $2m+1$ 的轮换。

- **定理 4.41 & 式 (4.73)**：排列 $\sigma$ 存在平方根（$\sigma = \tau^2$）**当且仅当 $\sigma$ 中每个偶数长度的轮换个数都是偶数**！在循环指标 $C(\boldsymbol{x}, t)$ 中对奇下标保留完整指数 $e^{t^{2m-1}/(2m-1)}$、对偶下标只保留偶次幂 $\cosh(t^{2m}/(2m))$，立得具有平方根的排列数 $f(n, 2)$ 的 EGF：

$$
\sum_{n \ge 0} f(n, 2)\frac{t^n}{n!} = \sqrt{\frac{1+t}{1-t}} \prod_{m \ge 1} \cosh\left(\frac{t^{2m}}{2m}\right)
$$

且因其具有 $\frac{1}{1-t} \times (\text{偶函数})$ 的形式，立得**推论 4.42**：$p(2n) = p(2n+1)$！

- **定理 4.43 & 4.44（$k$ 次方根推广，Knopfmacher-Warlimont 定理）**：定义 $((m, k)) = \prod_{p \mid m} p^{e(p, k)}$（其中 $e(p, k)$ 是整除 $k$ 的最高素数幂指数）。则 $\sigma$ 存在 $k$ 次方根 **当且仅当对每个 $m \ge 1$，$\sigma$ 中 $m$-轮换的个数都是 $((m, k))$ 的倍数**！其 EGF 为 $\prod_{m=1}^\infty \exp_{((m, k))}\left(\frac{x^m}{m}\right)$。

### 4.9 水平凸多联骨牌计数（Horizontally Convex Polyominoes）

每一行都是单个连续方格块的连通多联骨牌称为**水平凸多联骨牌（HC-polyomino）**。设 $f(n, k, t)$ 为共有 $n$ 个方格、$k$ 行、且最顶行有 $t$ 个方格的 HC-骨牌数。剥去最顶行（$t$ 个方格与次顶行 $r$ 个方格共有 $r + t - 1$ 种水平搭接方式），得递推 $f(n, k, t) = \sum_{r \ge 1} (r + t - 1) f(n-t, k-1, r)$。

引入生成函数 $U_k(x) = \sum_{r \ge 1} F_{k, r}(x)$ 与 $V_k(x) = \sum_{r \ge 1} r F_{k, r}(x)$，消去 $V_k$ 得到关于 $U_k$ 的三项递推式 (4.81)，再乘 $y^k$ 求和解出二元生成函数（式 4.83）与 **Klarner 定理（定理 4.45）**：

$$
\sum_{n, k} g(n, k) x^n y^k = \frac{xy(1-x)^3}{(1-x)^4 - xy(1-x-x^2+x^3+x^2y)}, \qquad \sum_{n \ge 1} f(n) x^n = \frac{x(1-x)^3}{1 - 5x + 7x^2 - 4x^3}
$$

由分母最小模根 $1/\xi_1$（其中 $\xi_1 \approx 3.20556943$）立得渐近公式 $f(n) \sim 0.1809155 \cdot (3.20556943)^n$。

### 4.10 精确覆盖序列（Exact Covering Sequences, ECS）

若非负整数对 $(a_i, b_i)_{i=1}^k \ (0 \le a_i < b_i)$ 使得每个非负整数 $n$ 恰好满足唯一一个同余式 $n \equiv a_i \pmod{b_i}$，则称为**精确覆盖序列（ECS）**（例如 $(1,2), (0,4), (2,4)$）。

- **定理 4.46**：$\{(a_i, b_i)\}$ 是 ECS 当且仅当 $\sum_{i=1}^k \frac{x^{a_i}}{1 - x^{b_i}} = \frac{1}{1 - x}$。

- **定理 4.47（分圆多项式整除判据）**：展开部分分式对比单位根留数可知，$\{(a_i, b_i)\}$ 是 ECS 当且仅当 $\sum_{j=1}^k \frac{1}{b_j} = 1$，且对每个 $s > 1$，多项式 $\psi_s(z) = \sum_{j: s \mid b_j} \frac{z^{a_j}}{b_j}$ 均被第 $s$ 个分圆多项式 $\Phi_s(z)$ 整除！

  - *Mirsky-Newman 推论*：取 $s = B = \max\{b_j\}$，因 $\psi_B(z) \neq 0$ 必须被 $\Phi_B(z)$（至少含两个单项式）整除，故**最大模数 $B$ 在模数集中至少出现两次**！

### 4.11 等待特定字符串出现（Waiting for a String）

连续抛均匀硬币，长为 $k$ 的目标串 $w \in \{H, T\}^k$ 在第 $n$ 次开始首次出现的概率记为 $p_n$。设给定位置 $i$ 出现了 $w$ 的条件下、位置 $i+u$ 再次出现 $w$ 的自相关重叠概率为 $g_u \ (0 \le u < k, \ g_0 = 1$；当 $u \ge k$ 时 $g_u = 2^{-k}$），记重叠多项式为 $\phi_{k-1}(x) = (1-x)\sum_{u=0}^{k-1} g_u x^u + \dots$。由全概率分解 $\frac{1}{2^k} = \sum_{j=1}^n p_j g_{n-j}$ 导出（式 4.91 & 4.92）：

$$
P(x) = \frac{x}{x^k + 2^k(1-x)\phi_{k-1}(x)}, \qquad \text{首次出现期望时间 } P'(1) = 2^k \phi_{k-1}(1) - (k - 1)
$$

### 4.12 不含连续 $k$ 个 1 的 0-1 串（Blocks of 1's）

求长为 $n$、恰含 $m$ 个 `1`、且不含 $k$ 个连续 `1` 的 0-1 串个数 $f(n, m, k)$：

1. **游程组合分解**：每个 `1` 游程长度属于 $\{1, \dots, k-1\}$（生成函数为 $x + x^2 + \dots + x^{k-1} = x\frac{1-x^{k-1}}{1-x}$），将其插入 `0` 的间隙可得二元生成函数（式 4.95）：

$$
\sum_{n, m \ge 0} f(n, m, k) t^n y^m = \frac{1 - t^k y^k}{1 - t - ty + t^{k+1} y^k}
$$

2. **显式公式（式 4.96）**：$f(n, m, k) = \sum_{0 \le j \le m/k} (-1)^j \binom{n-m+1}{j}\binom{n-kj}{n-m}$。

3. **递推关系（式 4.97）**：$f(n, m, k) = f(n-1, m, k) + f(n-1, m-1, k) - f(n-k-1, m-k, k) + \delta_{n,0}\delta_{m,0} - \delta_{n,k}\delta_{m,k}$。

4. **最长连续 1 块长度的期望生成函数（式 4.98）**：令 $y = 1$ 得最长 `1` 块 $< k$ 的串数生成函数为 $\frac{1-t^k}{1-2t+t^{k+1}}$，从而最长连续 `1` 块长度均值 $\overline{X}(n)$ 的生成函数为 $\left(\frac{1-t/2}{1-t}\right)\sum_{k=0}^\infty \frac{t^k}{2^k(1 - t + t^{k+1}/2^{k+1})}$。

---

## 六、4.13 第 4 章课后习题解答（Complete Solutions to All 29 Exercises）

本节完整收录《generatingfunctionology》第 4.13 节全部 29 道大题（含所有子题）的推导与折叠解答。

### Exercise 1：几何分布的 PGF、均值与标准差

**题目**：硬币每次出现正面的概率为 $p$，设首次出现正面是在第 $n$ 次投掷的概率为 $p_n$。求 $p_n$、其 OGF $P(x)$，并用 $P(x)$ 求首次出现正面所需投掷次数的均值与标准差。

**解答**：:spoiler[前 $n-1$ 次反面、第 $n$ 次正面，故 $p_n = (1-p)^{n-1} p \ (n \ge 1)$。其 OGF 为 $P(x) = \sum_{n \ge 1} p(1-p)^{n-1} x^n = \frac{px}{1 - (1-p)x}$。因为 $\log P(x) = \log p + \log x - \log(1 - (1-p)x)$，求导得 $(\log P)' = \frac{1}{x} + \frac{1-p}{1-(1-p)x}$，代入 $x=1$ 得均值 $\mu = 1 + \frac{1-p}{p} = \frac{1}{p}$；二阶导数 $(\log P)'' = -\frac{1}{x^2} + \frac{(1-p)^2}{(1-(1-p)x)^2}$，代入式 (4.3) 得方差 $\sigma^2 = \frac{1}{p} - 1 + \frac{(1-p)^2}{p^2} = \frac{1-p}{p^2}$，标准差 $\sigma = \frac{\sqrt{1-p}}{p}$。]

### Exercise 2：集卡问题（Coupon Collector's Problem）解答

**题目**：共 $d$ 种球星卡，每次随机得一张，第 $n$ 次恰好首次集齐的概率为 $p_n$：(a) 证明 $p_n = \frac{d!}{d^n}\begin{Bmatrix} n-1 \\ d-1 \end{Bmatrix}$；(b) 证明 OGF $p(x) = \frac{(d-1)! x^d}{(d-x)(d-2x)\cdots(d-(d-1)x)}$；(c) 求期望次数；(d) 求标准差；(e) 计算 $d=10$ 时的期望与标准差。

**解答**：:spoiler[(a) 前 $n-1$ 次恰好收集了 $d-1$ 种卡片（选出最后缺的那 1 种有 $d$ 种选法，前 $n-1$ 次按出现种类划分为 $d-1$ 个有序非空类有 $(d-1)!\begin{Bmatrix} n-1 \\ d-1 \end{Bmatrix}$ 种），除以 $d^n$ 即得。(b) 由式 (1.36) $\sum_n \begin{Bmatrix} n-1 \\ d-1 \end{Bmatrix} (x/d)^n = \frac{x}{d}\frac{(x/d)^{d-1}}{(1-x/d)\cdots(1-(d-1)x/d)}$，乘 $d!$ 上下同乘 $d^d$ 即得。(c) 取对数 $\log p(x) = \text{const} + d\log x - \sum_{j=1}^{d-1} \log(d - jx)$，求导代入 $x=1$ 得 $\mu = p'(1) = d + \sum_{j=1}^{d-1} \frac{j}{d-j} = d\left(1 + \frac{1}{2} + \dots + \frac{1}{d}\right) = d H_d$。(d) 方差 $\sigma^2 = (\log p)'(1) + (\log p)''(1) = d H_d - d + \sum_{j=1}^{d-1} \frac{j^2}{(d-j)^2} = d^2 \sum_{i=1}^d \frac{1}{i^2} - d H_d$。(e) 当 $d=10$ 时，期望约为 $29.29$ 盒，标准差约为 $11.21$ 盒。]

### Exercise 3：树上随机游走的首次返回时间（First Return Times on Trees）

**题目**：在图上进行均匀随机游走。设 $T_1, T_2$ 为两棵树，$v_i \in T_i$ 的度数为 $d_i$，在 $v_1, v_2$ 之间连一条新边构成树 $T$。记从 $v$ 出发首次返回 $v$ 恰用 $j$ 步的概率生成函数为 $F(x; v; T)$：(a) 证明 $F(x; v_1; T) = \frac{1}{d_1+1}\left\{d_1 F_1(x; v_1) + \frac{x^2}{d_2 + 1 - d_2 F_2(x; v_2)}\right\}$；(b) 求导证明平均首次返回步数满足 $\mu_T(v_1) = \frac{1}{d_1+1}(2 + d_1 \mu_{T_1}(v_1) + d_2 \mu_{T_2}(v_2))$；(c) 证明在 $n+1$ 个顶点的路径（Path）上，从两端点出发的平均返回步数为 $2n$，从任意内部点出发的平均返回步数全为 $n$；(d) 求 $n$ 个顶点的路径端点首次返回 PGF $P_n(x)$ 的显式公式。

**解答**：:spoiler[(a) 在 $T$ 中 $v_1$ 的度数为 $d_1 + 1$。第一步以 $\frac{d_1}{d_1+1}$ 概率走向 $T_1$ 内部，此时首次返回 $v_1$ 的生成函数就是 $F_1(x; v_1)$；第一步以 $\frac{1}{d_1+1}$ 概率跨过新边走到 $v_2$，到达 $v_2$ 后可能先在 $T_2$ 内部往返 $m \ge 0$ 次（每次以 $\frac{d_2}{d_2+1}$ 概率进入 $T_2$ 并经历 $F_2(x; v_2)$ 返回 $v_2$），最后以 $\frac{1}{d_2+1}$ 概率跨回 $v_1$（往返新边共耗 $x^2$），对 $m \ge 0$ 求几何级数得 $\frac{x^2}{d_2+1} \sum_{m \ge 0}\left(\frac{d_2 F_2}{d_2+1}\right)^m = \frac{x^2}{d_2 + 1 - d_2 F_2(x; v_2)}$，相加即证！(b) 对 (a) 在 $x=1$ 处求导（利用 $F_1(1)=F_2(1)=1$）即得。(c) 对路径归纳：单边树（$n=1$）端点返回期望为 $2$；每增加一条边，$d_1=0, d_2=1 \implies \mu_{n+1} = 2 + \mu_n = 2n$；内部点将路径劈成长为 $k$ 和 $n-k$ 的两段，$d_1=d_2=1 \implies \mu = \frac{1}{2}(2 + 2k + 2(n-k)) = n$（与内部点位置无关！因为无向图稳态分布正比于度数 $d(v)/\sum d$，故 $\mu(v) = 2|E|/d(v)$！）。(d) 路径满足分式线性递推 $P_n(x) = \frac{x^2}{2 - P_{n-1}(x)} \ (P_1=0, P_2=x^2)$，设 $P_n = A_n / B_n$ 解三项递推得 $P_n(x) = x^2 \frac{r_+^{n-2} + r_-^{n-2}}{r_+^{n-1} + r_-^{n-1}}$（或差号，其中 $r_{\pm} = 1 \pm \sqrt{1-x^2}$）。]

### Exercise 4, 5, 6 & 7：筛法前缀和、棋盘重证错排与 Bonferroni 不等式

**题目**：

- **4.** 用未筛选生成函数 $N(x)$ 表示“至多具有 $m$ 个性质”的序列 $\{e_{\le m}\}$ 和“至少具有 $m$ 个性质”的序列 $\{e_{\ge m}\}$ 的 OGF。

- **5.** 用什么棋盘 $C$ 可以从例 4.6（式 4.23）直接导出错排数公式？

- **6 & 7（Bonferroni 容斥不等式）**：在筛法公式 $e_0 = \sum_{r \ge 0} (-1)^r N_r$ 中，若在 $r = m$ 处截断，证明当 $m$ 为偶数时高估 $e_0$、为奇数时低估 $e_0$。更一般地，对任意 $e_k$，定义截断余项 $\gamma(k, t) = (-1)^{t+1}\left\{e_k - \sum_{j \le t} (-1)^j \binom{k+j}{j} N_{k+j}\right\}$，证明其二元 OGF 为 $\Gamma(x, y) = \frac{E(x + 1 + y) - E(x)}{1 + y}$，从而一切 $\gamma(k, t) = \sum_{r > k} \binom{r}{k}\binom{r-k-1}{t} e_r \ge 0$！

**解答**：

- **4.** :spoiler[由 OGF 前缀和法则（Rule 5），$\{e_{\le m}\}$ 的 OGF 为 $\frac{E(x)}{1-x} = \frac{N(x-1)}{1-x}$；而 $e_{\ge m} = N_0 - e_{\le m-1}$，故 $\{e_{\ge m}\}$ 的 OGF 为 $\frac{N(0)}{1-x} - x\frac{N(x-1)}{1-x} = \frac{N(0) - x N(x-1)}{1-x}$。]

- **5.** :spoiler[取 $n \times n$ 棋盘的主对角线 $C = \{(1,1), (2,2), \dots, (n,n)\}$！在主对角线上任选 $k$ 个格子都互不攻击，故 $r_k = \binom{n}{k}$，代入式 (4.23) 取 $j=0$（不踩中主对角线即无不动点）立得 $\sum_{k=0}^n (n-k)!\binom{n}{k}(-1)^k = n!\sum_{k=0}^n \frac{(-1)^k}{k!}$。]

- **6 & 7.** :spoiler[直接对 $\gamma(k, t)$ 乘 $x^k y^t$ 求和：利用 $N_{k+j} = [u^{k+j}] E(u+1)$，交换求和可得 $\Gamma(x, y) = \frac{E(x+1+y) - E(x)}{1+y}$。将 $E(u) = \sum_{r \ge 0} e_r u^r$ 代入展开：$\frac{(x+1+y)^r - x^r}{1+y} = \sum_{k < r} \binom{r}{k} x^k (1+y)^{r-k-1} = \sum_{k < r, t \ge 0} \binom{r}{k}\binom{r-k-1}{t} x^k y^t$，因为所有 $e_r \ge 0$ 且二项式系数非负，故一切 $\gamma(k, t) \ge 0$，一步证毕 Bonferroni 交替不等式！]

### Exercise 8, 9 & 10：Knuth 取整和、图的色多项式与避串计数

**题目**：

- **8.** 证明 $\sum_r \binom{n}{\lfloor r/2 \rfloor} x^r = (1+x)(1+x^2)^n$，并用 Snake Oil 求 $\sum_k \binom{n}{k}\binom{n-k}{\lfloor (m-k)/2 \rfloor} y^k$ 的生成函数及 $y = \pm 2$ 时的闭式值。

- **9（色多项式 Chromatic Polynomial）**：设 $P(\lambda; x; G)$ 为用 $\lambda$ 种颜色给图 $G$ 的顶点染色、使得恰有 $x$ 条边两端同色的方案数。将其建模为筛法问题，求 $P(\lambda; x; G)$ 的公式。

- **10.** 设字母表大小为 $k$，长为 $m$ 的模式串 $w$ 满足“没有任何非空真后缀同时是其前缀（无自重叠）”：(a) 用筛法求长为 $n$ 且不含子串 $w$ 的字符串个数；(b) 用 Snake Oil 求其生成函数。

**解答**：

- **8.** :spoiler[拆分为偶次 $r=2j$ 与奇次 $r=2j+1$：$\sum_j \binom{n}{j}(x^{2j} + x^{2j+1}) = (1+x)(1+x^2)^n$。记待求和式为 $f_m(y)$，乘 $x^m$ 对自由变量 $m$ 求和：$\sum_m f_m(y) x^m = \sum_k \binom{n}{k} (xy)^k \sum_m \binom{n-k}{\lfloor (m-k)/2 \rfloor} x^{m-k} = (1+x)\sum_k \binom{n}{k}(xy)^k (1+x^2)^{n-k} = (1+x)(1 + xy + x^2)^n$！当 $y = 2$ 时为 $(1+x)^{2n+1}$，故系数为 $\binom{2n+1}{m}$；当 $y = -2$ 时为 $(1+x)(1-x)^{2n}$，系数为 $(-1)^m\left(\binom{2n}{m} - \binom{2n}{m-1}\right)$。]

- **9.** :spoiler[对象集 $\Omega$ 为全部 $\lambda^n$ 种染色；每条边 $e \in E(G)$ 对应一个性质 $P(e)$：“边 $e$ 的两端同色”。对边子集 $S \subseteq E$，若 $S$ 中所有边两端同色，则生成子图 $G_S = (V, S)$ 的每个连通分量内部必须染同一种颜色！设 $G_S$ 有 $\kappa(S)$ 个连通分量，则 $N(\supseteq S) = \lambda^{\kappa(S)}$。由筛法公式立得 $P(\lambda; x; G) = \sum_{r \ge 0} N_r (x-1)^r = \sum_{S \subseteq E(G)} \lambda^{\kappa(S)} (x-1)^{|S|}$。令 $x = 0$ 即得 Birkhoff-Whitney 色多项式！]

- **10.** :spoiler[(a) 对象集为 $k^n$ 个字符串，性质 $i \ (1 \le i \le n-m+1)$ 为“位置 $i$ 开始出现 $w$”。因 $w$ 无自重叠，选出的 $r$ 个起始位置 $S$ 必须两两间距 $\ge m$（否则为 0）。在 $[n-m+1]$ 中选 $r$ 个两两间距 $\ge m$ 的位置的方案数为 $\binom{n - mr + r}{r}$，其余 $n - mr$ 个字母任取有 $k^{n-mr}$ 种，故 $N_r = \binom{n-mr+r}{r} k^{n-mr}$，不含 $w$ 的串数为 $e_0 = \sum_{r \ge 0} (-1)^r \binom{n-mr+r}{r} k^{n-mr}$。(b) 对自由变量 $n$ 乘 $x^n$ 用 Snake Oil 求和：$\sum_{r \ge 0} (-1)^r k^{-mr} x^{(m-1)r} \sum_n \binom{n-mr+r}{r} (kx)^{n-mr+r} = \frac{1}{1-kx}\sum_{r \ge 0}\left(\frac{-x^m}{1-kx}\right)^r = \frac{1}{1 - kx + x^m}$！]

### Exercise 11, 12, 13, 14, 15 & 16：Snake Oil 十八般兵器大演练

**题目**：

- **11.** 用 Snake Oil 计算：(a) $\sum_{k \ge 0} \binom{k}{n-k} t^k$；(c) Moriarty 恒等式 $\sum_k \binom{2n+1}{2p+2k+1}\binom{p+k}{k}$；(d) 范德蒙卷积 $\sum_m \binom{r}{m}\binom{s}{t-m} = \binom{r+s}{t}$ 及 $\sum_k \binom{n}{k}^2 = \binom{2n}{n}$；(e) $\sum_k \binom{2n+1}{2k}\binom{m+k}{2n} = \binom{2m+1}{2n}$；(f) $\sum_k \binom{n}{k}\binom{k}{j} x^k = \binom{n}{j} x^j (1+x)^{n-j}$；(g) $x\sum_k \binom{n+k}{2k}\left(\frac{x^2-1}{4}\right)^{n-k} = \left(\frac{x-1}{2}\right)^{2n+1} + \left(\frac{x+1}{2}\right)^{2n+1}$；(h) $\sum_{k \ge 1} \binom{n+k-1}{2k-1}\frac{(x-1)^{2k} x^{n-k}}{k} = \frac{(x^n-1)^2}{n}$。

- **12（Stirling 变换与指数族复合）**：设 $b_n = \sum_k \begin{bmatrix} n \\ k \end{bmatrix} a_k$，序列 $\{a_n\}, \{b_n\}$ 的 EGF 分别为 $A(x), B(x)$：(a) 证明 $B(x) = A\left(\log\frac{1}{1-x}\right)$；(b) 若 $\tilde{b}_k$ 为有序贝尔数，证明 $\sum_k \begin{bmatrix} n \\ k \end{bmatrix} \tilde{b}_k = n! 2^{n-1}$；(c) 若 $a_k = D_k$ 为错排数，求 $B(x)$；(d)(e) 推广到第二类斯特林数与一般指数族。

- **13.** 将 $\sum_k (-1)^{n-k}\binom{2n}{k}^2 = \binom{2n}{n}$ 嵌入双参数和式并用 Snake Oil 证明。

- **14.** 用卷积识别法 $[x^n]\{F(x)G(x)\}$ 计算 $S(n) = \sum_k \frac{1}{k+1}\binom{2k}{k}\frac{1}{n-k+1}\binom{2n-2k}{n-k}$。

- **15.** 证明 Jacobi 多项式的三种等价表示。

- **16.** 证明：若 $f_n = \sum_k \binom{n+k}{m+2k} c_k$，则它们的 OGF 满足 $F(x) = \frac{x^m}{(1-x)^{m+1}} C\left(\frac{x}{(1-x)^2}\right)$。

**解答**：

- **11.** :spoiler[(a) 乘 $x^n$ 求和得 $\sum_{k \ge 0} (tx)^k (1+x)^k = \frac{1}{1 - tx(1+x)}$，部分分式展开即得无求和号闭式；(c) 对自由变量 $n$（或令 $N=2n+1$）乘 $x^N$ 求和，内层为 $\frac{x^{2p+2k+1}}{(1-x)^{2p+2k+2}}$，外层对 $k$ 求和得 $\binom{p+k}{k}$ 级数 $\left(1 - \frac{x^2}{(1-x)^2}\right)^{-(p+1)} = \left(\frac{(1-x)^2}{1-2x}\right)^{p+1}$，化简提取系数得 $2^{2n-2p}\binom{2n-p}{p} + \dots$；(d) 对自由变量 $t$ 乘 $x^t$ 求和，瞬间分离为 $(1+x)^r (1+x)^s = (1+x)^{r+s}$；(f) 对自由变量 $n$ 乘 $y^n$ 求和，内层为 $\frac{y^k}{(1-y)^{k+1}}$，外层为 $\frac{(xy)^j}{(1-y-xy)^{j+1}}$，提取 $[y^n]$ 即得；(g)(h) 对 $n$ 乘 $y^n$ 求和，有理化分母后提取 $[y^n]$ 即证。]

- **12.** :spoiler[(a) $B(x) = \sum_k a_k \sum_n \begin{bmatrix} n \\ k \end{bmatrix} \frac{x^n}{n!} = \sum_k \frac{a_k}{k!}\left(\log\frac{1}{1-x}\right)^k = A\left(\log\frac{1}{1-x}\right)$！(b) 有序贝尔数的 EGF 为 $A(u) = \frac{1}{2 - e^u}$（式 5.17），代入 $u = \log\frac{1}{1-x}$ 得 $B(x) = \frac{1}{2 - \frac{1}{1-x}} = \frac{1-x}{1-2x} = 1 + \sum_{n \ge 1} 2^{n-1} x^n$，故 $b_n = n! 2^{n-1}$！(c) 错排数 EGF 为 $A(u) = \frac{e^{-u}}{1-u}$，代入得 $B(x) = \frac{1-x}{1 + \log(1-x)}$。(d)(e) 对第二类斯特林数有 $B(x) = A(e^x - 1)$；对一般指数族 $b_n = \sum_k h(n, k) a_k$ 有 $B(x) = A(\mathcal{D}(x))$！]

- **13.** :spoiler[泛化为 $g(m) = \sum_k (-1)^k \binom{n}{k}\binom{n}{n-m+k}$（原题取 $n \gets 2n, \ m \gets 2n$），对 $m$ 乘 $x^m$ 求和得 $x^n (1+x)^n (1 - 1/x)^n = (-1)^n (1 - x^2)^n$，提取 $[x^n]$ 即证。]

- **14.** :spoiler[$S(n)$ 恰是卡特兰数 $C_k$ 与自身做 Cauchy 卷积，故 $S(n) = [x^n] F(x)^2$。由 $x F(x)^2 = F(x) - 1$ 知 $F(x)^2 = \frac{F(x)-1}{x}$，故 $S(n) = [x^{n+1}] F(x) = C_{n+1} = \frac{1}{n+2}\binom{2n+2}{n+1}$！]

- **15.** :spoiler[(a) 对自由变量 $q$（或 $n-q$）乘 $u^{n-q}$ 用 Snake Oil 求和，两侧同为 $(1+u)^{n-m}(1 + u(t-1))^m$；(b) 在 $P_n^{(a,b)}(x)$ 中令 $t = \frac{x+1}{x-1}$ 套用 (a) 即得第二式；(c) 在第二式中对 $n$ 用 Snake Oil 提取 $[t^{n+a+b}]$ 即得第三式。]

- **16.** :spoiler[$F(x) = \sum_k c_k x^{-k} \sum_{n \ge 0} \binom{n+k}{m+2k} x^{n+k} = \sum_k c_k x^{-k} \frac{x^{m+2k}}{(1-x)^{m+2k+1}} = \frac{x^m}{(1-x)^{m+1}} C\left(\frac{x}{(1-x)^2}\right)$。例 4.9 之所以能消去根号，是因为 $C(z)$ 恰好选了卡特兰级数，而 $1 + \frac{4x}{(1-x)^2} = \left(\frac{1+x}{1-x}\right)^2$ 是完全平方！]

### Exercise 17, 18, 19 & 20：连续 WZ 对（高斯傅里叶变换）、树叶子分布、不同尺寸牌数与抛硬币淘汰博弈

**题目**：

- **17（连续版 WZ 方法）**：(a) 若 $F_x = G_y$ 且 $\lim_{y \to \pm\infty} G(x, y) = 0$，证明 $\int_{-\infty}^\infty F(x, y)dy = \text{const.}$；(b)(c) 若 $f(z) = F + iG$ 解析，由 Cauchy-Riemann 方程 $F_x = G_y$ 导出相同结论；(d) 对 $f(z) = e^{z^2} \ (z = x + iy)$ 应用此法，证明 $e^{-y^2}$ 的傅里叶变换等于自身：$\int_{-\infty}^\infty e^{-y^2}\cos(2xy)dy = \sqrt{\pi} e^{-x^2}$。

- **18.** 用多元生成函数与筛法求有标号树度数分布与叶子数期望（已在正文精选习题中详证）。

- **19（不同尺寸纸牌种类数）**：在指数族 $\mathcal{F}$ 中，设手牌中出现的**不同纸牌重量种类数**为 $k$ 的手牌数为 $\rho(n, k)$：(a)–(d) 用容斥证明 $\sum_{n, k \ge 0} \frac{\rho(n, k)}{n!} x^n y^k = \prod_{t \ge 1}\left\{1 + y\left(e^{d_t x^t / t!} - 1\right)\right\}$；(e) 证明 $n$-排列中出现的**不同轮换长度种类数**的均值 $c_n$ 满足 $\sum_{n \ge 0} c_n x^n = \frac{1}{1-x}\sum_{t \ge 1}\left(1 - e^{-x^t / t}\right)$。

- **20（抛硬币淘汰游戏）**：初始有 $n$ 个元素，每轮对幸存的每个元素抛一次均匀硬币，正面留下、反面淘汰，直到全军覆没停止。记 $k$ 轮后恰剩 $r$ 个元素的概率为 $f(n, k, r)$，求 $f(n, k, r)$ 的显式公式及游戏结束步数的均值。

**解答**：

- **17.** :spoiler[(a) $\frac{d}{dx}\int_{-B}^A F(x, y)dy = \int_{-B}^A F_x dy = \int_{-B}^A G_y dy = G(x, A) - G(x, -B) \to 0 \ (A, B \to \infty)$。(d) 取 $f(z) = e^{z^2} = e^{x^2 - y^2}(\cos(2xy) + i\sin(2xy))$，实部为 $F(x, y) = e^{x^2 - y^2}\cos(2xy)$，虚部 $G(x, y) = e^{x^2 - y^2}\sin(2xy)$ 在 $y \to \pm\infty$ 时趋于 $0$，故 $\int_{-\infty}^\infty e^{x^2 - y^2}\cos(2xy)dy = \text{const} = \int_{-\infty}^\infty e^{-y^2}dy = \sqrt{\pi} \implies \int_{-\infty}^\infty e^{-y^2}\cos(2xy)dy = \sqrt{\pi} e^{-x^2}$！]

- **19.** :spoiler[(a)–(d) 对每个固定重量 $t \ge 1$，不选该重量的牌贡献 $1$，至少选 1 张该重量的牌（从而种类数 $+1$，乘上 $y$）贡献 $y(e^{d_t x^t / t!} - 1)$，对所有 $t \ge 1$ 合并相乘立得 $\prod_{t \ge 1}\{1 + y(e^{d_t x^t / t!} - 1)\}$。(e) 在排列族中 $d_t / t! = 1/t$，对 $y$ 求偏导后令 $y = 1$，并利用 $\prod_{t \ge 1} e^{x^t/t} = \frac{1}{1-x}$：$\sum_{n \ge 0} c_n x^n = \left.\frac{\partial \mathcal{H}}{\partial y}\right|_{y=1} = \frac{1}{1-x}\sum_{t \ge 1} \frac{e^{x^t/t} - 1}{e^{x^t/t}} = \frac{1}{1-x}\sum_{t \ge 1}\left(1 - e^{-x^t / t}\right)$！]

- **20.** :spoiler[每个初始元素独立经历 $k$ 轮投掷后仍幸存的概率为 $p = 2^{-k}$，被淘汰的概率为 $1 - 2^{-k}$。故 $k$ 轮后恰剩 $r$ 个元素服从二项分布：$f(n, k, r) = \binom{n}{r} (2^{-k})^r (1 - 2^{-k})^{n-r}$！特别地，$\le k$ 轮内游戏结束的概率为 $f(n, k, 0) = (1 - 2^{-k})^n$，故游戏总步数 $T$ 的期望为 $E[T] = \sum_{k \ge 0} P(T > k) = \sum_{k \ge 0} \left(1 - (1 - 2^{-k})^n\right) = \sum_{j=1}^n (-1)^{j-1}\binom{n}{j} \frac{1}{1 - 2^{-j}}$。]

### Exercise 21–29：三元 HC-骨牌、ECS 奇偶定理、贝塞尔函数与广义指数公式

**题目**：

- **21.** 求 4.9 节 HC-多联骨牌的三元生成函数 $\sum_{n, k, t} f(n, k, t) x^n y^k z^t$。

- **22 & 25 & 27（精确覆盖序列 ECS 深入性质）**：(22) 证明在 ECS 中 $\sum_{j: a_j \text{ even}} \frac{1}{b_j} = \frac{1}{2} = \sum_{j: a_j \text{ odd}} \frac{1}{b_j}$；(25) 证明只需检验 $0 \le n \le N = \text{lcm}\{b_1, \dots, b_k\}$ 即可判定 ECS；(27) 证明 Fraenkel 伯努利多项式判据：$\sum_{i=1}^k b_i^{n-1} B_n(a_i / b_i) = B_n \ (\forall n \ge 0)$。

- **23.** 求随机排列中 $r$-轮换与 $s$-轮换个数相等的极限概率（用修正贝塞尔函数 $I_0$ 表示）。

- **24.** 求周长为 $2n+8$ 的凸多联骨牌数 $c_n = (2n+11)4^n - 4(2n+1)\binom{2n}{n}$ 满足的多项式系数三项递推关系。

- **26.** (a) 证明若限制每种重量 $i$ 的纸牌张数属于集合 $S_i$，则手牌 EGF 为 $\prod_{i=1}^\infty \exp_{S_i}\left(\frac{d_i t^i}{i!}\right)$；(b) 求满足“大小为 $i$ 的块数能被 $i$ 整除（$\forall i \ge 1$）”的集合划分数 $f(n)$ 的 EGF。

- **28.** 求给定排列 $\sigma$ 拥有的平方根个数公式，并指出什么样的排列有唯一平方根。

- **29.** 用对 $n$ 的数学归纳法直接证明式 (4.22) $\sum_{1 \le k \le n} \begin{Bmatrix} n \\ k \end{Bmatrix} y^k = e^{-y}\sum_{r \ge 1} \frac{r^n}{r!} y^r$。

**解答**：

- **21.** :spoiler[对式 (4.78) $F_{k, t}(x) = x^t(V_{k-1}(x) + (t-1)U_{k-1}(x))$ 乘 $y^k z^t$ 求和，利用 $\sum_{t \ge 1} (xz)^t = \frac{xz}{1-xz}$ 和 $\sum_{t \ge 1} (t-1)(xz)^t = \frac{x^2 z^2}{(1-xz)^2}$，代入已求出的 $\sum U_k y^k$ 与 $\sum V_k y^k$ 化简即得 $\frac{xyz(1-x)^2((1-xz)(1-x)^2 + x^2 y(z-1))}{(1-xz)^2((1-x)^4 - xy(1-x-x^2+x^3+x^2y))}$。]

- **22 & 25 & 27.** :spoiler[(22) 若某个奇数模 $b_j$ 存在，由周期性展开为 $\text{lcm}$ 后奇偶平衡；更直接地，在 $\sum \frac{x^{a_j}}{1-x^{b_j}} = \frac{1}{1-x}$ 中当所有 $b_j$ 为偶数时，在式 (4.87) 中取 $s=2, \ \omega=-1$ 得 $\sum (-1)^{a_j}/b_j = 0$，与 $\sum 1/b_j = 1$ 相加减即得偶余数与奇余数的 $\sum 1/b_j$ 均为 $1/2$！(25) 因为同余系以 $N = \text{lcm}\{b_i\}$ 为周期。(27) 将 $\sum_{i=1}^k \frac{e^{a_i t}}{e^{b_i t} - 1} = \frac{1}{e^t - 1}$ 两侧同乘 $t$，写为 $\sum_{i=1}^k \frac{1}{b_i} \frac{(b_i t) e^{(a_i/b_i)(b_i t)}}{e^{b_i t} - 1} = \frac{t}{e^t - 1}$，展开伯努利多项式生成函数对比 $[t^n/n!]$ 即证！]

- **23.** :spoiler[由定理 4.40，长为 $r$ 和 $s$ 的轮换数渐近独立服从 $\text{Poisson}(1/r)$ 和 $\text{Poisson}(1/s)$，故两者相等的概率为 $\sum_{j=0}^\infty \frac{e^{-1/r}(1/r)^j}{j!} \frac{e^{-1/s}(1/s)^j}{j!} = e^{-(1/r + 1/s)} \sum_{j=0}^\infty \frac{(rs)^{-j}}{(j!)^2} = e^{-(1/r + 1/s)} I_0\left(\frac{2}{\sqrt{rs}}\right)$。]

- **24.** :spoiler[设 $u_n = (2n+11)4^n$（特征根为二重根 $4$，满足 $(E-4)^2 u_n = 0$）与 $v_n = 4(2n+1)\binom{2n}{n}$（满足一阶超几何递推 $(n+1)(2n+1)v_{n+1} - 2(2n+3)(2n+1)v_n = 0 \implies (n+1)v_{n+1} - 2(2n+3)v_n = 0$）。消去两项即可拼出二阶多项式系数递推：$(n+2)(2n+1)c_{n+2} - 2(4n^2+10n+5)c_{n+1} + 8(2n+3)(n+1)c_n = 0$。]

- **26.** :spoiler[(a) 在习题 3.22(a) 中对每个 $i$ 限制 $a_i \in S_i$ 即得 $\prod_{i=1}^\infty \exp_{S_i}\left(\frac{d_i t^i}{i!}\right)$。(b) 集合划分中 $d_i = 1, \ S_i = \{0, i, 2i, 3i, \dots\}$，故 EGF 为 $\prod_{i=1}^\infty \exp_{\{0, i, 2i, \dots\}}\left(\frac{t^i}{i!}\right) = \prod_{i=1}^\infty \left(\sum_{m \ge 0} \frac{(t^i / i!)^{mi}}{(mi)!}\right)$。]

- **28.** :spoiler[排列 $\sigma$ 的平方根唯一 **当且仅当 $\sigma$ 没有任何偶数长度的轮换，且每个奇数长度的轮换最多只有 1 个**（即所有轮换长度均为互不相同的奇数）！因为若有两个同长度 $2m+1$ 的奇轮换，既可以各自独立开方（$1$ 种），也可以把它们交错穿插成一个 $4m+2$ 轮换（$2m+1$ 种）；而偶轮换两两配对穿插长 $2m$ 时有 $2m$ 种穿法。]

- **29.** :spoiler[记 $\phi_n(y) = \sum_{k=1}^n \begin{Bmatrix} n \\ k \end{Bmatrix} y^k$。当 $n=1$ 时 $e^{-y}\sum_{r \ge 1} \frac{r y^r}{r!} = e^{-y}(y e^y) = y = \phi_1(y)$ 成立。归纳步：由式 (1.39) $\phi_n(y) = y \phi_{n-1}(y) + y \frac{d}{dy}\phi_{n-1}(y) = y\left(e^{-y}\sum \frac{r^{n-1}}{r!}y^r\right) + y\frac{d}{dy}\left(e^{-y}\sum \frac{r^{n-1}}{r!}y^r\right)$，由莱布尼茨求导法则，对 $e^{-y}$ 求导产生的 $-y e^{-y}\sum \frac{r^{n-1}}{r!}y^r$ 与第一项精确抵消，只剩对 $y^r$ 求导乘 $y$ 产生的 $e^{-y}\sum \frac{r^n}{r!}y^r$，归纳证毕！]

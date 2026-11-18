---
title: 生成函数 · 笔记（五） · 拉格朗日反演与渐近分析
published: 2026-12-11
tags:
  - 生成函数
  - 拉格朗日反演
  - 渐近分析
  - 鞍点法
  - Generatingfunctionology
category: 生成函数
draft: false
description: 拉格朗日反演公式（LIF）及其复围道积分证明、亚纯函数极点主部法、代数支点 Darboux 定理与 Szegö 定理、整函数 Hayman 容许鞍点法、高次幂渐近截断法则，以及附录 A 的 Mathematica/Maple 符号计算，附 5.5 节全部 10 道大题与附录 A 全部 6 道习题完整折叠解答。
---

## 导读

本篇讨论拉格朗日反演与渐近分析，结合推导、例题与代码说明方法的使用条件。

:::tip[学习重点]

- 用拉格朗日反演提取隐式函数的系数。
- 根据奇点类型选择渐近方法，并检查适用条件。

:::

## 一、5.1 拉格朗日反演公式（The Lagrange Inversion Formula）

在前四章中，我们从递推关系出发得到的生成函数方程要么是线性方程（如有理生成函数），要么是二次代数方程（如卡特兰数），要么是常微分方程（如对合排列与贝尔数）。然而在第 3.12 节枚举有标号有根树时，我们遇到了形如 $\mathcal{D}(x) = x e^{\mathcal{D}(x)}$ 的**超越隐式函数方程**。

**拉格朗日反演公式（Lagrange Inversion Formula, LIF）** 正是求解一般隐式方程：

$$
u = t \phi(u) \quad (5.1)
$$

（即将 $u$ 解为 $t$ 的幂级数 $u = u(t)$，甚至直接求其复合函数 $f(u(t))$ 展开系数）的一种系数提取方法！

:::important[定理 5.1：拉格朗日反演公式（Lagrange Inversion Formula）]

设 $f(u)$ 和 $\phi(u)$ 是关于 $u$ 的形式幂级数，且满足常数项 **$\phi(0) = 1$**（或非零常数）。则隐式方程 $u = t \phi(u)$ 存在唯一的形式幂级数解 $u = u(t) \ (u(0) = 0)$。进一步地，将 $f(u(t))$ 在 $t = 0$ 处展开为 $t$ 的幂级数，其第 $n$ 项系数（$n \ge 1$）精确满足：

$$
[t^n] \left\{f(u(t))\right\} = \frac{1}{n} [u^{n-1}] \left\{f'(u) \phi(u)^n\right\} \quad (5.2)
$$

特别地，当取 $f(u) = u^k$（求未知函数 $u(t)$ 的 $k$ 次幂展开系数）时，因 $f'(u) = k u^{k-1}$，立得：

$$
[t^n] \left\{u(t)^k\right\} = \frac{k}{n} [u^{n-1}] \left\{u^{k-1} \phi(u)^n\right\} = \frac{k}{n} [u^{n-k}] \left\{\phi(u)^n\right\}
$$

此外，若在式 (5.2) 中取满足 $f'(u) = 1/\phi(u)$ 的函数 $f(u)$，并利用对 $u = t\phi(u)$ 求导得到的 $\frac{t u'(t)}{u(t)} = \frac{1}{1 - t\phi'(u(t))}$，可导出 **LIF 的第二种等价形式（习题 5.3）**：

$$
[u^n] \left\{\phi(u)^n\right\} = [t^n] \left\{\frac{t u'(t)}{u(t)}\right\} = [t^n] \left\{\frac{1}{1 - t\phi'(u(t))}\right\}
$$

:::

### 严格证明：形式截断 + 复变留数换元（Equation 5.3）

1. **形式截断归约为多项式**：对固定的 $n$，将 $f(u)$ 和 $\phi(u)$ 中高于 $u^n$ 的项全部截断丢弃，完全不影响式 (5.2) 两侧的第 $n$ 项系数。故只需对多项式 $f, \phi$ 证明。

2. **留数积分换元**：由于 $\phi(0) = 1$，映射 $t = g(u) = u / \phi(u) = u + c u^2 + \dots$ 在原点 $u = 0$ 的某个小邻域 $\Re$ 内是一一保角映射（Conformal Map），具有解析逆映射 $u = u(t)$。取围绕原点的小圆周积分围道，由柯西留数定理（$[u^{-1}] h(u) = \frac{1}{2\pi i}\oint h(u) du$）：

$$
\begin{aligned}

[u^{n-1}] \left\{f'(u) \phi(u)^n\right\} &= [u^{n-1}] \left\{f'(u) (u/t)^n\right\} = [u^{-1}] \left\{\frac{f'(u)}{t(u)^n}\right\} \\

&= \frac{1}{2\pi i} \oint \frac{f'(u)}{t(u)^n} du = \frac{1}{2\pi i} \oint t^{-n} f'(u(t)) u'(t) dt \\

&= [t^n] \left\{t \frac{d}{dt} f(u(t))\right\} = n [t^n] f(u(t))

\end{aligned}
$$

两侧同除以 $n$，证毕！

### 两大经典实战（Examples 5.2 & 5.3）

- **Example 5.2（终结 Cayley 树定理）**：有标号有根树的 EGF 满足 $\mathcal{D}(x) = x e^{\mathcal{D}(x)}$。这是 $\phi(u) = e^u, \ f(u) = u$ 的 LIF：

$$
[x^n] \mathcal{D}(x) = \frac{1}{n} [u^{n-1}] \left\{e^{nu}\right\} = \frac{1}{n} \frac{n^{n-1}}{(n-1)!} = \frac{n^{n-1}}{n!} \implies t_n = n^{n-1}
$$

每个无根树有 $n$ 种选根方式，故 $n$ 阶有标号无根树恰有 $n^{n-2}$ 棵！

- **Example 5.3（用 LIF 隐式求逆导出切比雪夫型反演对）**：已知 $b_n = \sum_k \binom{k}{n-k} a_k$，如何反解 $a_n$？

  - 第一步：对已知式两边乘 $x^n$ 求和（Snake Oil），得 $B(x) = \sum_k a_k x^k (1+x)^k = A(x(1+x))$。

  - 第二步：令 $y = x + x^2$，则 $A(y) = B(x(y)) = \sum_k b_k x(y)^k$。**千万不要硬解二次方程 $x = \frac{\sqrt{1+4y}-1}{2}$ 再去展开根号的 $k$ 次幂！** 而是把 $y = x(1+x)$ 改写为 LIF 标准型：

  $$
  x = \frac{y}{1 + x} \quad \left(\text{即 } t = y, \ u = x, \ \phi(x) = \frac{1}{1+x}, \ f(x) = x^k\right)
  $$

  - 第三步：直接套用 LIF 算 $[y^n] \{x(y)^k\}$：

  $$
  [y^n] \{x(y)^k\} = \frac{1}{n} [x^{n-1}] \left\{\frac{k x^{k-1}}{(1+x)^n}\right\} = \frac{k}{n} [x^{n-k}] \frac{1}{(1+x)^n} = \frac{k}{n} (-1)^{n-k} \binom{2n-k-1}{n-k}
  $$

  代回 $a_n = [y^n] A(y)$，立即得到反演公式（式 5.7）：

  $$
  n a_n = \sum_k \binom{2n-k-1}{n-k} (-1)^{n-k} k b_k
  $$

---

## 二、5.2 解析性与渐近方法（I）：亚纯函数的极点主部法（Poles of Meromorphic Functions）

:::important[渐近分析第一定律（The First Law of Doing Asymptotics）]

**寻找生成函数 $f(z)$ 距离原点最近的奇点（Singularities nearest to the origin）！**

为什么？因为幂级数在以原点为中心、不含奇点的最大圆盘 $|z| < R$ 内收敛，主奇点的模长 $R = |z_0|$ 直接决定了系数的指数增长率 $|a_n| \approx R^{-n}$；而主奇点的**局部性质（极点阶数、支点幂次）**则决定了系数的多项式修正因子！

**核心赢家策略**：构造一个极其简单的初等函数 $g(z)$，使其在收敛圆周 $|z| = R$ 上拥有与 $f(z)$ **完全相同的奇点性态**。那么差函数 $h(z) = f(z) - g(z)$ 在 $|z| = R$ 上的奇点就全部被消去（可去奇点），从而在更大的圆盘 $|z| < R' \ (R' > R)$ 内解析！由定理 2.25，$h(z)$ 的系数至多为 $O((1/R' + \epsilon)^n)$，相对于 $f(z)$ 的主项可以忽略不计，因此 **$f(z)$ 的系数渐近等于简单函数 $g(z)$ 的系数**！

:::

### 洛朗展开主部（Principal Part）与定理 5.5

设 $f(z)$ 是区域 $\Re$ 内的**亚纯函数（Meromorphic Function，即只有有限阶极点）**。若 $z_0$ 是 $f(z)$ 的 $r$ 阶极点，则在 $z_0$ 的去心邻域内有洛朗展开（式 5.11）：

$$
f(z) = \underbrace{\sum_{j=1}^r \frac{a_{-j}}{(z - z_0)^j}}_{\text{主部 } \text{PP}(f; z_0)} + \sum_{j=0}^\infty a_j (z - z_0)^j
$$

其中包含负幂次的有限和称为 $f$ 在 $z_0$ 处的**主部（Principal Part）**，记作 $\text{PP}(f; z_0)$。显然 $f(z) - \text{PP}(f; z_0)$ 在 $z_0$ 处解析！

将主部 $\text{PP}(f; z_0)$ 在原点 $z = 0$ 处展开为幂级数（式 5.14 & 5.15）：

$$
\text{PP}(f; z_0) = \sum_{j=1}^r \frac{(-1)^j a_{-j}}{z_0^j (1 - z/z_0)^j} = \sum_{n \ge 0} z^n \left\{\sum_{j=1}^r \frac{(-1)^j a_{-j}}{z_0^{n+j}} \binom{n+j-1}{j-1}\right\}
$$

:::important[定理 5.5（亚纯函数极点渐近主定理）]

设 $f(z)$ 在包含原点的区域内除有限个极点外解析。设距离原点最近的极点模长为 $R > 0$，圆周 $|z| = R$ 上的全部极点为 $z_0, z_1, \dots, z_s$；次近极点的模长为 $R' > R$。则对任意 $\epsilon > 0$：

$$
[z^n] f(z) = [z^n] \left\{\sum_{j=0}^s \text{PP}(f; z_j)\right\} + O\left(\left(\frac{1}{R'} + \epsilon\right)^n\right) \quad (5.16)
$$

（若希望获得更高精度的多层渐近展开，只需按模从小到大的顺序继续减去外圈极点的主部即可！）

:::

### 三大精妙算例（Examples 5.4, 5.6 & 5.7）

1. **热身算例（Example 5.4）**：$f(z) = \frac{e^z}{z - 1}$ 在全平面只有唯一极点 $z_0 = 1$（主部为 $\frac{e}{z-1}$）。减去主部后 $\frac{e^z - e}{z - 1}$ 是**整函数（Entire Function，$R' = \infty$）**！故对一切 $\epsilon > 0$ 都有 $[z^n] f(z) = -e + O(\epsilon^n)$（真实系数为 $-\sum_{k=0}^n \frac{1}{k!}$，误差为 $O(1/(n+1)!)$）。

2. **有序贝尔数的惊人精度（Ordered Bell Numbers, Example 5.6）**：将集合 $[n]$ 划分为若干个**有序**非空类的方案数称为有序贝尔数 $\tilde{b}(n) = \sum_{k=1}^n k! \begin{Bmatrix} n \\ k \end{Bmatrix}$。在式 (4.22) 两侧同乘 $e^{-y}$ 并对 $y \in (0, \infty)$ 积分（利用 $\int_0^\infty y^k e^{-2y} dy = \frac{k!}{2^{k+1}}$），立得 $\tilde{b}(n) = \sum_{r \ge 0} \frac{r^n}{2^{r+1}}$，其 EGF 为（式 5.17）：

$$
f(z) = \sum_{n \ge 0} \frac{\tilde{b}(n)}{n!} z^n = \frac{1}{2 - e^z}
$$

   - **极点分析**：$2 - e^z = 0$ 的全部根为简单极点 $z_k = \log 2 + 2k\pi i \ (k \in \mathbb{Z})$。离原点最近的极点是正实轴上的 **$z_0 = \log 2 \approx 0.6931$**！次近极点是共轭对 $z_{\pm 1} = \log 2 \pm 2\pi i$，模长为 $R' = \sqrt{(\log 2)^2 + 4\pi^2} \approx 6.321 \ (1/R' \approx 0.158 < 0.16)$。

   - **主部提取**：在 $z_0 = \log 2$ 处留数为 $\lim_{z \to \log 2} \frac{z - \log 2}{2 - e^z} = \frac{1}{-e^{\log 2}} = -\frac{1}{2}$，故主部为 $\frac{-1/2}{z - \log 2} = \sum_{n \ge 0} \frac{z^n}{2(\log 2)^{n+1}}$。

   - **结论（式 5.18）**：
   $$
   \tilde{b}(n) = \frac{n!}{2(\log 2)^{n+1}} + O\left((0.16)^n n!\right)
   $$

   当 $n = 10$ 时，精确值为 $102247563$，而主项近似算出的也是 $102247563$，相对误差不到 $10^{-8}$！

3. **无短轮换排列的渐近独立性（Permutations with No Small Cycles, Example 5.7）**：固定正整数 $q$，所有轮换长度均 $> q$ 的 $n$-排列数 $f(n, q)$ 的 EGF 为（式 5.19）：

$$
f_q(z) = \exp\left(\sum_{n > q} \frac{z^n}{n}\right) = \frac{e^{-\{z + z^2/2 + \dots + z^q/q\}}}{1 - z}
$$

该函数在全有限平面只有 $z = 1$ 一个一阶极点，主部为 $\frac{e^{-H_q}}{1 - z}$！减去主部后是整函数，故对一切 $\epsilon > 0$：

$$
\frac{f(n, q)}{n!} = e^{-H_q} + O(\epsilon^n) \quad (n \to \infty) \quad (5.20)
$$

（即随机排列不含任何长度 $\le q$ 的轮换的极限概率为 $e^{-H_q} \sim \frac{e^{-\gamma}}{q}$，且收敛速度是超指数级的！）

---

## 三、5.3 解析性与渐近方法（II）：代数支点与 Darboux 定理（Algebraic Singularities）

如果距离原点最近的奇点不是极点，而是形如 $(z_0 - z)^\beta g(z)$（其中 $\beta \notin \{0, 1, 2, \dots\}$ 为非整数实数，如平方根 $\sqrt{1-z}$）的**代数支点（Algebraic Singularity / Branch Point）**，该怎么办？

（通过缩放变量 $z \gets z z_0$，总可不妨设主奇点位于 $z_0 = 1$。）

Wilf 采用了 Knuth 与 Wilf (1989) 给出的极简初等证明路线（引理 5.8–5.10）：

- **引理 5.8**：若 $a_n = O(n^{-\gamma})$ 且 $b_n = O(\theta^n) \ (0 < \theta < 1)$，则卷积 $\sum_k a_k b_{n-k} = O(n^{-\gamma})$。

- **引理 5.9（基本二项式支点展开）**：若 $\beta \notin \{0, 1, 2, \dots\}$，由伽马函数与 Stirling 公式有：

$$
[z^n] (1 - z)^\beta = (-1)^n \binom{\beta}{n} = \binom{n - \beta - 1}{n} = \frac{\Gamma(n - \beta)}{\Gamma(-\beta)\Gamma(n+1)} \sim \frac{n^{-\beta - 1}}{\Gamma(-\beta)} \quad (5.23)
$$

- **引理 5.10**：若 $v(z)$ 在更大圆盘 $|z| < 1 + \eta \ (\eta > 0)$ 内解析，则 $[z^n] \{(1-z)^\gamma v(z)\} = O(n^{-\gamma - 1})$。

:::important[定理 5.11（Darboux 定理）与定理 5.13（Szegö 多奇点推广）]

**定理 5.11（Darboux）**：设 $v(z)$ 在圆盘 $|z| < 1 + \eta \ (\eta > 0)$ 内解析，且在 $z = 1$ 邻域内有泰勒展开 $v(z) = \sum_{j \ge 0} v_j (1 - z)^j$。设 $\beta \notin \{0, 1, 2, \dots\}$，则对任意非负整数 $m$：

$$
[z^n] \left\{(1 - z)^\beta v(z)\right\} = \sum_{j=0}^m v_j \binom{n - \beta - j - 1}{n} + O\left(n^{-m - \beta - 2}\right) \quad (5.25)
$$

结合二项式系数的渐近展开式 (5.27)：

$$
\binom{n - \alpha - 1}{n} \approx \frac{n^{-\alpha - 1}}{\Gamma(-\alpha)}\left[1 + \frac{\alpha(\alpha+1)}{2n} + \frac{\alpha(\alpha+1)(\alpha+2)(3\alpha+1)}{24n^2} + \dots\right]
$$

即可将 $v(z)$ 在 $z = 1$ 处的泰勒展开逐项“提升（lift）”为系数的完整渐近级数！

**定理 5.13（Szegö 定理）**：若 $h(w)$ 在 $|w| = 1$ 上有有限个代数奇点 $\{e^{i\phi_k}\}_{k=1}^r$，在每个奇点附近展开为 $\sum_{\nu \ge 0} c_\nu^{(k)} (1 - w e^{-i\phi_k})^{\alpha_k + \nu\beta_k} \ (\beta_k > 0)$，则总系数渐近级数为各奇点贡献之和：

$$
[w^n] h(w) \approx \sum_{\nu \ge 0} \sum_{k=1}^r c_\nu^{(k)} \binom{\alpha_k + \nu\beta_k}{n} (-e^{i\phi_k})^n
$$

:::

### Darboux 方法实战：2-正则图的精细渐近展开（Example 5.12）

2-正则图的 EGF 为 $f(z) = (1 - z)^{-1/2} v(z)$，其中 $\beta = -1/2$，解析部分 $v(z) = e^{-z/2 - z^2/4}$。

在 $z = 1$ 处（令 $u = 1 - z, \ z = 1 - u$），有 $-\frac{z}{2} - \frac{z^2}{4} = -\frac{3}{4} + u - \frac{u^2}{4}$，故：

$$
v(z) = e^{-3/4} e^{u - u^2/4} = e^{-3/4}\left(1 + (1-z) + \frac{1}{4}(1-z)^2 + \dots\right)
$$

代入 Darboux 定理（取 $m = 2, \ \Gamma(1/2) = \sqrt{\pi}$）及式 (5.27)，立得 2-正则图个数 $\gamma(n)$ 的三阶渐近展开（式 5.26 & 5.28）：

$$
\frac{\gamma(n)}{n!} = e^{-3/4}\left\{\binom{n-1/2}{n} + \binom{n-3/2}{n} + \frac{1}{4}\binom{n-5/2}{n}\right\} + O(n^{-7/2})
$$

$$
\gamma(n) \approx \frac{n! e^{-3/4}}{\sqrt{n\pi}}\left\{1 - \frac{5}{8n} + \frac{1}{128n^2} + \dots\right\}
$$

---

## 四、5.4 解析性与渐近方法（III）：整函数的 Hayman 鞍点法（Hayman's Method）

如果生成函数 $f(z)$ 在有限复平面上**根本没有任何奇点**（即 $f(z)$ 是整函数 Entire Function，如 $e^z$、对合排列 $e^{z + z^2/2}$、贝尔数 $e^{e^z - 1}$），前面两节找奇点的方法彻底失效，该怎么办？

先看 $f(z) = e^z$：由柯西不等式，$\frac{1}{n!} = [z^n] e^z \le \min_{r > 0} \frac{e^r}{r^n}$。对 $\frac{e^r}{r^n}$ 求导找极小值点（鞍点 Saddle Point），得 $r = n$，给出上界 $\frac{1}{n!} \le \left(\frac{e}{n}\right)^n$，与真实的 Stirling 公式 $\frac{1}{\sqrt{2\pi n}}\left(\frac{e}{n}\right)^n$ 只差一个高斯积分宽度因子 $\frac{1}{\sqrt{2\pi n}}$！

W. K. Hayman (1956) 将这一思想提炼为一套完全机械化的定理：

:::important[定理 5.15（Hayman 容许函数渐近主定理）]

对于在 $|z| < R \ (0 < R \le \infty)$ 内解析的函数 $f(z) = \sum_{n \ge 0} a_n z^n$，定义两个辅助函数（式 5.32 & 5.33）：

$$
a(r) = r \frac{f'(r)}{f(r)}, \qquad b(r) = r a'(r) = r \frac{f'(r)}{f(r)} + r^2 \frac{f''(r)}{f(r)} - r^2 \left(\frac{f'(r)}{f(r)}\right)^2
$$

若 $f(z)$ 是 **Hayman 容许函数（Admissible Function）**，记方程 **$a(r_n) = n$** 的唯一正实根为 $r_n$，则当 $n \to +\infty$ 时：

$$
a_n \sim \frac{f(r_n)}{r_n^n \sqrt{2\pi b(r_n)}} \quad (5.34)
$$

:::

### 容许函数（Admissibility）的五大免检闭包判据（Page 199–200）

直接验证 Hayman 容许性的定义（在主方向 $|\theta| \le \delta(r)$ 内高斯近似 $f(r e^{i\theta}) \sim f(r) e^{i\theta a(r) - \frac{1}{2}\theta^2 b(r)}$、在 $|\theta| \ge \delta(r)$ 上一致可忽略、且 $b(r) \to +\infty$）较为繁琐，但以下 **5 条充分判据** 让我们一眼就能判定常见组合生成函数的容许性：

1. **(a)** 若 $f(z)$ 容许，则 **$e^{f(z)}$ 也容许**。

2. **(b)** 若 $f(z)$ 和 $g(z)$ 在 $|z| < R$ 内同为容许函数，则乘积 **$f(z)g(z)$ 也容许**。

3. **(c)** 若 $f(z)$ 容许，实系数多项式 $P(z)$ 满足最高次项系数为正（当 $R=\infty$）或 $P(R) > 0$（当 $R < \infty$），则 **$f(z)P(z)$ 容许**。

4. **(d)** 若 $f(z)$ 容许，$P(z)$ 为实系数多项式，则 $f(z) + P(z)$ 容许；若 $P$ 的最高次项系数为正，则复合 **$P[f(z)]$ 也容许**。

5. **(e)（最常用！）**：设 $P(z)$ 是非常数实系数多项式，令 **$f(z) = e^{P(z)}$**。只要对一切充分大的 $n$ 都有 $[z^n] f(z) > 0$，则 **$f(z) = e^{P(z)}$ 在全平面上是 Hayman 容许的**！

### Hayman 方法实战与 $r_n^n$ 截断铁律（Examples 5.16 & 5.17）

- **Example 5.16（三行证出 Stirling 公式）**：对 $f(z) = e^z$，有 $a(r) = r, \ b(r) = r$。鞍点方程 $a(r_n) = n \implies r_n = n$。代入式 (5.34) 立得 $\frac{1}{n!} \sim \frac{e^n}{n^n \sqrt{2\pi n}}$！

- **Example 5.17（对合排列数 $t_n$ 的渐近公式）**：对 $f(z) = e^{z + z^2/2} = \sum \frac{t_n}{n!} z^n$，由判据 (e) 知其全平面容许。计算得 $a(r) = r + r^2, \ b(r) = r + 2r^2$。解鞍点方程 $r_n + r_n^2 = n$：

$$
r_n = \sqrt{n + \frac{1}{4}} - \frac{1}{2} = \sqrt{n} - \frac{1}{2} + \frac{1}{8\sqrt{n}} - \frac{1}{128 n^{3/2}} + \dots \quad (5.36)
$$

  - **第一项 $f(r_n)$**：利用 $r_n + r_n^2 = n \implies r_n + \frac{1}{2}r_n^2 = \frac{1}{2}(n + r_n) = \frac{n}{2} + \frac{\sqrt{n}}{2} - \frac{1}{4} + O(n^{-1/2})$，故 $f(r_n) \sim \exp\left(\frac{n}{2} + \frac{\sqrt{n}}{2} - \frac{1}{4}\right)$。

  - **第二项 $b(r_n)$**：$b(r_n) = r_n + 2r_n^2 \sim 2n$。

  - **第三项 $r_n^n$（核心难点与截断铁律！）**：

:::caution[计算 $(1 + \epsilon_n)^n$ 型高次幂的黄金截断准则（Page 201–202）]

在渐近等式两侧**绝不能随意同时取 $n$ 次幂**（例如 $1 + \frac{1}{n} \sim 1$，但 $\left(1 + \frac{1}{n}\right)^n \sim e \neq 1$；又如 $\left(1 + \frac{1}{\sqrt{n}}\right)^n = \exp\left\{n\left(\frac{1}{\sqrt{n}} - \frac{1}{2n} + O(n^{-3/2})\right)\right\} \sim e^{\sqrt{n} - 1/2}$）！

**黄金法则**：要计算 $(1 + \delta_n)^n$ 的渐近主项，必须先改写为 $\exp\{n \log(1 + \delta_n)\} = \exp\{n(\delta_n - \delta_n^2/2 + \delta_n^3/3 - \dots)\}$，将指数上的级数展开到**最后一个乘以 $n$ 后不趋于 $0$ 的项为止**（即忽略所有 $o(n^{-1})$ 的项，保留所有 $\ge \Omega(n^{-1})$ 的项）！

在式 (5.38) 中，$r_n^n = n^{n/2}\left\{1 - \frac{1}{2\sqrt{n}} + \frac{1}{8n} - \dots\right\}^n$，取对数展开到 $O(n^{-1})$ 阶：

$$
n\left[\left(-\frac{1}{2\sqrt{n}} + \frac{1}{8n}\right) - \frac{1}{2}\left(-\frac{1}{2\sqrt{n}} + \frac{1}{8n}\right)^2 + O(n^{-3/2})\right] = n\left[-\frac{1}{2\sqrt{n}} + \left(\frac{1}{8n} - \frac{1}{8n}\right) + O(n^{-3/2})\right] = -\frac{\sqrt{n}}{2} + o(1)
$$

故 $r_n^n \sim n^{n/2} \exp(-\sqrt{n}/2)$！

:::

将三项代入式 (5.34) 并乘以 $n! \sim \sqrt{2\pi n}(n/e)^n$，立即得到对合排列的 Moser-Wyman 渐近公式（式 5.41）：

$$
t_n \sim \frac{1}{\sqrt{2}} n^{n/2} \exp\left(-\frac{n}{2} + \sqrt{n} - \frac{1}{4}\right)
$$

---

## 五、附录 A：使用 Maple 与 Mathematica 进行符号计算（Appendix A）

Wilf 在附录 A 中展示了如何用计算机代数系统（CAS）自动化完成生成函数的三大日常任务：

1. **级数展开与系数提取（Section A.1）**：

   - 在 Mathematica 中用 `Series[f, {x, x0, m}]` 展开前 $m$ 项，用 `CoefficientList[%, x]` 或 `Coefficient[%, x, k]` 提取系数；对 EGF 则配合 `Table[j! Coefficient[%, x, j], {j, 0, 12}]`（例如展开 `Exp[Exp[x]-1]` 秒出前 12 个贝尔数）。

2. **符号求解递推关系 `RSolve.m`（Section A.2）**：

   - Marko Petkovšek 编写的 `DiscreteMath/RSolve.m` 包支持：

     - `RSolve[{eqn, init}, f[n], n]`：直接求递推关系的闭式通项；

     - `GeneratingFunction[{eqn, init}, f[n], n, x]`：直接求递推关系的 OGF（甚至能自动解出硬币块状喷泉的卷积递推 `f[k]==1+Sum[(k-j)f[j],{j,1,k}]`！）；

     - `ExponentialGeneratingFunction[...]`：求递推关系的 EGF；

     - `PowerSum[formula, {x, n}]`：已知通项公式反求闭式幂级数和。

3. **自动渐近展开 `asympt`（Section A.3）**：

   - 在 Maple 中调用 `asympt(f, n, k);` 即可直接输出当 $n \to \infty$ 时函数的前 $k$ 项渐近级数（如 `asympt(n!, n, 5)` 直接输出 5 阶 Stirling 级数，还能自动处理第 5 章习题 8(c) 中复杂的分数次幂求逆与乘方）。

---

## 六、5.5 第 5 章与附录 A 课后习题解答（Exercises and Solutions）

本节完整收录《generatingfunctionology》第 5.5 节全部 10 道大题（含所有子题）以及附录 A 全部 6 道计算机实验题的推导与折叠答案。

### Exercise 1：用 LIF 证明无穷二项式级数满足三项代数方程

**题目**：设 $A > 1$ 且正整数 $L > 0$。利用拉格朗日反演公式证明无穷级数：

$$
\xi = \sum_{s \ge 0} \binom{sL+1}{s} \frac{A^{-sL-1}}{sL+1}
$$

满足代数方程 $\xi^L - A\xi + 1 = 0$。

**解答**：:spoiler[将目标方程 $\xi^L - A\xi + 1 = 0$ 变形为 $\xi = \frac{1}{A}(1 + \xi^L)$。令 $t = 1/A, \ \phi(u) = 1 + u^L, \ f(u) = u$，则隐式方程 $u = t \phi(u)$ 恰为 $u = \frac{1}{A}(1 + u^L)$！由 LIF（式 5.2），其唯一形式幂级数解为 $u(t) = \sum_{n \ge 1} \frac{t^n}{n} [u^{n-1}] (1 + u^L)^n$。注意在 $(1 + u^L)^n = \sum_{s \ge 0} \binom{n}{s} u^{sL}$ 中，只有当 $n - 1 = sL$（即 $n = sL + 1$）时 $[u^{n-1}]$ 才非零且等于 $\binom{sL+1}{s}$。代回 $t = A^{-1}$ 立得 $u = \sum_{s \ge 0} \binom{sL+1}{s} \frac{A^{-sL-1}}{sL+1} = \xi$，故 $\xi$ 满足 $\xi^L - A\xi + 1 = 0$！]

### Exercise 2：勒让德多项式（Legendre Polynomials）的 Darboux 渐近公式

**题目**：勒让德多项式 $\{P_n(x)\}$ 由 $\frac{1}{\sqrt{1 - 2xt + t^2}} = \sum_{n \ge 0} P_n(x) t^n$ 生成。设复数 $x \notin [-1, 1]$，记二次方程 $\tau^2 - 2x\tau + 1 = 0$ 的两个根中模严格大于 $1$ 的那个根为 $\tau \ (|\tau| > 1)$。用 Darboux 方法证明当 $n \to \infty$ 时：

$$
P_n(x) \sim \frac{\tau^{n+1}}{\sqrt{n\pi(\tau^2 - 1)}}
$$

**解答**：:spoiler[由于 $\tau$ 与 $\tau^{-1}$ 是 $\tau^2 - 2x\tau + 1 = 0$ 的两根，分母可因式分解为 $1 - 2xt + t^2 = (1 - \tau t)(1 - \tau^{-1} t)$。因为 $|\tau| > 1$，两个代数支点 $t_1 = \tau^{-1}$ 和 $t_2 = \tau$ 中，**距离原点最近的主奇点是 $t_1 = \tau^{-1} \ (|t_1| < 1 < |t_2|)$**！作变量缩放令 $z = \tau t$，则 $[t^n] (1 - 2xt + t^2)^{-1/2} = \tau^n [z^n] (1 - z)^{-1/2} (1 - \tau^{-2} z)^{-1/2}$。这里 $\beta = -1/2$，解析部分 $v(z) = (1 - \tau^{-2} z)^{-1/2}$ 在 $z = 1$ 处的取值为 $v(1) = (1 - \tau^{-2})^{-1/2} = \frac{\tau}{\sqrt{\tau^2 - 1}}$。由 Darboux 定理（$\Gamma(1/2) = \sqrt{\pi}$），主项为 $\tau^n \cdot \frac{\tau}{\sqrt{\tau^2 - 1}} \cdot \frac{n^{-1/2}}{\sqrt{\pi}} = \frac{\tau^{n+1}}{\sqrt{n\pi(\tau^2 - 1)}}$！]

### Exercise 3：拉格朗日反演公式的第二种形式（对数导数型 LIF）

**题目**：设 $u = u(t)$ 满足 $u = t \phi(u)$ 且 $n \ge 0$，证明：

$$
[u^n] \left\{\phi(u)^n\right\} = [t^n] \left\{\frac{t u'(t)}{u(t)}\right\} = [t^n] \left\{\frac{1}{1 - t\phi'(u(t))}\right\}
$$

**解答**：:spoiler[当 $n = 0$ 时三式均为 $1$。对 $n \ge 1$，在 LIF 式 (5.2) $\frac{1}{n}[u^{n-1}]\{f'(u)\phi(u)^n\} = [t^n] f(u(t))$ 中，选取满足 $f'(u) = \frac{\phi(u)}{u}$ 的形式函数（严谨写法：先令 $f'(u) = \frac{1}{\phi(u)}$，则 $\frac{1}{n}[u^{n-1}]\{\phi(u)^{n-1}\} = [t^n] f(u(t)) = \frac{1}{n}[t^{n-1}] \left\{\frac{d}{dt} f(u(t))\right\} = \frac{1}{n}[t^{n-1}] \left\{\frac{u'(t)}{\phi(u(t))}\right\} = \frac{1}{n}[t^{n-1}] \left\{\frac{t u'(t)}{u(t)}\right\} = \frac{1}{n}[t^n] \left\{\frac{t u'(t)}{u(t)}\right\}$，两边乘 $n$ 并将 $n-1$ 换为 $n$ 即得第一等式！）。再对 $u(t) = t \phi(u(t))$ 两边关于 $t$ 求导：$u'(t) = \phi(u) + t \phi'(u) u'(t) = \frac{u}{t} + t \phi'(u) u'(t)$，移项解出 $\frac{t u'(t)}{u(t)} = \frac{1}{1 - t\phi'(u(t))}$，证毕！]

### Exercise 4：中心三项式系数 $\gamma_n = [x^n](1 + x + x^2)^n$ 的生成函数与渐近

**题目**：定义 $\gamma_n = [x^n] (1 + x + x^2)^n \ (n \ge 0)$：(a) 利用习题 3 证明 $\gamma_n = [x^n] \left\{\frac{1}{\sqrt{1 - 2x - 3x^2}}\right\}$；(b) 利用习题 2 的勒让德多项式记号证明 $\gamma_n = (\sqrt{3}/i)^n P_n(i/\sqrt{3})$，并求出 $\gamma_n$ 当 $n \to \infty$ 时的渐近行为。

**解答**：:spoiler[(a) 在习题 3 中取 $\phi(u) = 1 + u + u^2$，则 $u = t(1 + u + u^2) \iff t u^2 + (t-1)u + t = 0$，解出满足 $u(0)=0$ 的根 $u(t) = \frac{1 - t - \sqrt{(1-t)^2 - 4t^2}}{2t} = \frac{1 - t - \sqrt{1 - 2t - 3t^2}}{2t}$。于是 $1 - t\phi'(u(t)) = 1 - t(1 + 2u(t)) = \sqrt{1 - 2t - 3t^2}$，由习题 3 立得 $\gamma_n = [t^n] \frac{1}{\sqrt{1 - 2t - 3t^2}}$！(b) 对照 $\frac{1}{\sqrt{1 - 2xt + t^2}}$，令 $t = i\sqrt{3} x = \frac{\sqrt{3}}{i} x$ 且 $2x_{\text{Leg}} t = 2x \implies x_{\text{Leg}} = \frac{i}{\sqrt{3}}$，故 $\gamma_n = (\sqrt{3}/i)^n P_n(i/\sqrt{3})$。直接对 $\frac{1}{\sqrt{(1-3x)(1+x)}}$ 在主奇点 $x_0 = 1/3$ 处用 Darboux 定理（或套用习题 2，其中 $\tau = \sqrt{3}i$），立得 $\gamma_n \sim \frac{3^{n + 1/2}}{2\sqrt{\pi n}}$！]

### Exercise 5：二项式截断和 $S_p(n) = \sum_{k=0}^n \binom{pn}{k}$ 的反向 LIF 与 Darboux 分析

**题目**：固定整数 $p \ge 3$，定义 $S_p(n) = \sum_{k=0}^n \binom{pn}{k} \ (n \ge 0)$：

- **(a)** 将 $S_p(n)$ 表为某个依赖 $n$ 的普通幂级数中 $[x^n]$ 的系数。

- **(b)** 逆向运用拉格朗日反演公式证明：

$$
\sum_{n \ge 0} S_p(n) x^n (1 + x)^{-pn - 1} = \frac{1}{(1 - x)(1 - (p - 1)x)}
$$

- **(c)** 由 (b) 导出 $\{S_p(n)\}$ 满足的恒等递推：$\sum_k (-1)^k \binom{pn - (p-1)k}{k} S_p(n-k) = \frac{(p-1)^{n+1} - 1}{p - 2}$。

- **(d) & (e)** 设 $F(u) = \sum_{n \ge 0} S_p(n) u^n$，在 (b) 中令 $x = \frac{1}{p-1} - \epsilon \ (\epsilon \to 0)$，证明 $g(x) = F\left(\frac{(p-1)^{p-1}}{p^p} x\right)$ 在 $x \to 1^-$ 时满足 $g(x) = \frac{1}{p-2}\sqrt{\binom{p}{2}} \frac{1}{\sqrt{1-x}} + O(1)$。

- **(f)** 用 Darboux 方法证明：$S_p(n) \sim \frac{1}{p-2}\sqrt{\frac{\binom{p}{2}}{n\pi}} \left(\frac{p^p}{(p-1)^{p-1}}\right)^n \ (n \to \infty)$。

- **(g)** 当 $p = 3$ 时，由 (b) 证明 $\sum_{n \ge 0} S_3(n)\left(\frac{4u^2}{27}\right)^n = \frac{u}{u - 2\sin(\frac{1}{3}\arcsin u)} - \frac{2u}{2u - 3\sin(\frac{1}{3}\arcsin u)}$。

**解答**：

- **(a)** :spoiler[因为 $(1+x)^{pn} = \sum_{k \ge 0} \binom{pn}{k} x^k$，由前缀和法则（Rule 5）除以 $(1-x)$ 即得 $S_p(n) = [x^n] \left\{\frac{(1+x)^{pn}}{1 - x}\right\}$。]

- **(b)** :spoiler[在 LIF 中令 $\phi(x) = (1+x)^p$，隐式方程为 $x = t(1+x)^p \iff t = x(1+x)^{-p}$。由习题 3 的变体（或取 $f'(x) = \frac{1}{(1-x)(1+x)^p}$），有 $S_p(n) = [x^n] \frac{\phi(x)^n}{1-x} = [t^n] \left\{\frac{1}{1 - x(t)} \cdot \frac{t x'(t)}{x(t)}\right\}$。因为 $t = x(1+x)^{-p} \implies \frac{dt}{dx} = (1+x)^{-p-1}(1 - (p-1)x)$，故 $\sum_{n \ge 0} S_p(n) t^n = \frac{1}{(1-x)(1-(p-1)x)}$，将 $t = x(1+x)^{-p}$ 代入两侧同除以 $(1+x)$ 即得 $\sum_{n \ge 0} S_p(n) x^n (1+x)^{-pn-1} = \frac{1}{(1-x)(1-(p-1)x)}$！]

- **(c)** :spoiler[将 (b) 左端按 $(1+x)^{-pn-1} = \sum_k (-1)^k \binom{pn+k}{k} x^k$ 展开提取 $[x^n]$，右端部分分式展开为 $\frac{1}{p-2}\left(\frac{p-1}{1-(p-1)x} - \frac{1}{1-x}\right)$，对比 $[x^n]$ 即得该递推式！]

- **(d)–(f)** :spoiler[在 $t(x) = x(1+x)^{-p}$ 中，导数 $t'(x) = 0$ 的鞍点（分支奇点）位于 $x_0 = \frac{1}{p-1}$，此时 $t_0 = \frac{(p-1)^{p-1}}{p^p}$。令 $x = \frac{1}{p-1} - \epsilon$，泰勒展开 $t(x) = t_0\left\{1 - \frac{(p-1)^3}{2p}\epsilon^2 + O(\epsilon^3)\right\}$。而 (b) 右侧乘 $(1+x)$ 在 $x \to \frac{1}{p-1}$ 时主部为 $\frac{p/(p-1)}{(1 - \frac{1}{p-1})(p-1)\epsilon} = \frac{p}{(p-1)(p-2)\epsilon}$。令 $1 - X = \frac{(p-1)^3}{2p}\epsilon^2 \implies \epsilon = \sqrt{\frac{2p}{(p-1)^3}}\sqrt{1-X}$，代入即得 $g(X) = \frac{1}{p-2}\sqrt{\binom{p}{2}}\frac{1}{\sqrt{1-X}} + O(1)$！再应用 Darboux 定理（$[X^n](https://www.google.com/search?q=1-X)^{-1/2} \sim \frac{1}{\sqrt{\pi n}}$）并还原缩放因子 $t_0^{-n}$，立得 (f)！]

- **(g)** :spoiler[当 $p = 3$ 时，三次方程 $x(1+x)^{-3} = \frac{4u^2}{27}$ 可通过三角代换 $\frac{x}{1+x} = \frac{2}{3}u \sin\theta$（利用三倍角公式 $\sin(3\theta) = 3\sin\theta - 4\sin^3\theta$）解出 $\theta = \frac{1}{3}\arcsin u$，代回 $\frac{1+x}{(1-x)(1-2x)}$ 即得！]

### Exercise 6：非负系数多项式指数 $e^{P(z)}$ 满足 Hayman 容许性的充要条件

**题目**：设 $P(z) = \sum_{j=1}^k c_j z^{n_j} \ (c_j > 0)$ 是具有正实系数的多项式。需要满足什么附加条件，才能保证存在 $N$ 使得对一切 $n > N$ 都有 $[z^n] e^{P(z)} > 0$（从而满足 5.4 节判据 (e) 成为 Hayman 容许函数）？

**解答**：:spoiler[因为 $e^{P(z)} = \prod_{j=1}^k e^{c_j z^{n_j}}$，其展开式中非零项的幂次恰好是由 $\{n_1, n_2, \dots, n_k\}$ 生成的非负整数线性组合 $x_1 n_1 + \dots + x_k n_k \ (x_j \ge 0)$！由第 3.15 节的 **Schur 定理（定理 3.24）**，所有充分大的整数 $n > N$ 都能被这样表出的充要条件是：**$P(z)$ 中所有正系数项的指数的最大公约数为 1，即 $\gcd(n_1, n_2, \dots, n_k) = 1$**！]

### Exercise 7：高次幂 $(1 + \epsilon_n)^n$ 的精细渐近截断计算

**题目**：当 $n \to \infty$ 时，求 $(1 + \epsilon_n)^n$ 的主项渐近公式：(a) $\epsilon_n = n^a \ (0 < a < 1)$；(b) $\epsilon_n = n^{-a} \ (0 < a < 1)$；(c) $\epsilon_n = n^{-a} \log n \ (1 < a < 2)$。

**解答**：

- **(a)** :spoiler[当 $\epsilon_n = n^a \to \infty$ 时，先提出主因子 $n^{na}$：$(1 + n^a)^n = n^{na} (1 + n^{-a})^n = n^{na} \exp\left\{n\left(n^{-a} - \frac{1}{2}n^{-2a} + \frac{1}{3}n^{-3a} - \dots\right)\right\} \sim n^{na} \exp\left(n^{1-a} - \frac{1}{2}n^{1-2a} + \dots\right)$，其中指数上的级数在最后一个非负幂次项 $1 - k a \ge 0 \ (k \le 1/a)$ 处截断！]

- **(b)** :spoiler[与 (a) 中提取 $n^{na}$ 后的剩余部分完全相同：$(1 + n^{-a})^n \sim \exp\left(n^{1-a} - \frac{1}{2}n^{1-2a} + \frac{1}{3}n^{1-3a} - \dots\right)$（保留所有 $k \le 1/a$ 的项）。]

- **(c)** :spoiler[因为 $a > 1$，故 $n \epsilon_n = n^{1-a} \log n \to 0 \ (n \to \infty)$，由 $\exp(o(1)) \sim 1$ 知 $(1 + n^{-a}\log n)^n \sim 1$！]

### Exercise 8：用 Hayman 方法 + LIF 求轮换长度均 $\le 3$ 的排列渐近数

**题目**：设 $a_n$ 为所有轮换长度均 $\le 3$ 的 $n$-排列个数，其 EGF 为 $f(z) = \exp\left\{z + \frac{z^2}{2} + \frac{z^3}{3}\right\}$：

- **(a)** 证明 $f(z)$ 在全平面上是 Hayman 容许的。

- **(b)** 鞍点方程为三次方程 $r_n + r_n^2 + r_n^3 = n$。令 $u = 1/r_n, \ t = n^{-1/3}, \ \phi(u) = (1 + u + u^2)^{1/3}$，证明 $u$ 满足 LIF 标准方程 $u = t \phi(u)$。

- **(c) & (d)** 用 LIF 证明 $\frac{1}{r_n} = n^{-1/3} + \frac{1}{3}n^{-2/3} + \frac{1}{3}n^{-1} + \frac{8}{81}n^{-4/3} + O(n^{-5/3})$，并解释为什么至少必须保留这 4 项。

- **(e)–(h)** 证明 $\frac{1}{r_n^n} \sim n^{-n/3}\exp\left(\frac{1}{3}n^{2/3} + \frac{5}{18}n^{1/3}\right)$，$b(r_n) \sim 3n$，$f(r_n) \sim \exp\left(\frac{1}{3}n + \frac{1}{6}n^{2/3} + \frac{5}{9}n^{1/3} - \frac{29}{162}\right)$，并合并不等式证得：

$$
a_n \sim \frac{n^{2n/3}}{\sqrt{3}} \exp\left\{-\frac{2n}{3} + \frac{1}{2}n^{2/3} + \frac{5}{6}n^{1/3} - \frac{29}{162}\right\}
$$

**解答**：:spoiler[(a) 由习题 6，$\gcd(1, 2, 3) = 1$，满足判据 (e)，故全平面容许。(b) $a(r) = r + r^2 + r^3 = n \implies r_n^3(1 + r_n^{-1} + r_n^{-2}) = n \implies u^{-3}(1 + u + u^2) = t^{-3} \implies u = t(1 + u + u^2)^{1/3} = t \phi(u)$！(c) 由 LIF，$[t^k] u(t) = \frac{1}{k}[u^{k-1}](1 + u + u^2)^{k/3}$，依次计算 $k = 1, 2, 3, 4$：当 $k=1$ 时为 $1$；当 $k=2$ 时为 $\frac{1}{2}[u^1](1 + \frac{2}{3}u) = \frac{1}{3}$；当 $k=3$ 时为 $\frac{1}{3}[u^2](1 + u + u^2) = \frac{1}{3}$；当 $k=4$ 时为 $\frac{1}{4}[u^3](1 + u + u^2)^{4/3} = \frac{8}{81}$。(d) 为什么必须保留到 $n^{-4/3}$？因为计算 $r_n^{-n} = (u(t))^n = n^{-n/3}(1 + \frac{1}{3}n^{-1/3} + \frac{1}{3}n^{-2/3} + \frac{8}{81}n^{-1} + O(n^{-4/3}))^n$ 时，指数上要乘以 $n$，所有 $\Omega(n^{-1})$ 的项都会对常数因子产生非零贡献（少算 $n^{-4/3}$ 项就会漏掉 $n^{-1}$ 项从而算错常数项 $e^{-29/162}$）！(e)–(h) 按黄金截断法则展开 $n \log(r_n^{-1})$ 与 $f(r_n)$，代入式 (5.34) 并乘 $n! \sim \sqrt{2\pi n}(n/e)^n$，化简指数即得最终渐近式！]

### Exercise 9：用 LIF 证明卡特兰级数 $k$ 次幂展开公式 (2.48)

**题目**：利用拉格朗日反演公式证明式 (2.48)：

$$
\left(\frac{1 - \sqrt{1-4x}}{2x}\right)^k = \sum_{n \ge 0} \frac{k(2n+k-1)!}{n!(n+k)!} x^n \quad (k \ge 1)
$$

**解答**：:spoiler[设卡特兰生成函数为 $F(x) = \frac{1-\sqrt{1-4x}}{2x}$，它满足 $F(x) = 1 + x F(x)^2$。令 $u = F(x) - 1 = x F(x)^2$，则 $F(x) = 1 + u$，且 $u$ 满足标准 LIF 方程 $u = x(1 + u)^2$（即 $t = x, \ \phi(u) = (1+u)^2$）！我们要求 $[x^n] F(x)^k = [x^n] (1+u)^k$，故在 LIF 式 (5.2) 中取 $f(u) = (1+u)^k \implies f'(u) = k(1+u)^{k-1}$。对 $n \ge 1$：

$$
[x^n] F(x)^k = \frac{1}{n} [u^{n-1}] \left\{k(1+u)^{k-1} (1+u)^{2n}\right\} = \frac{k}{n} [u^{n-1}] (1+u)^{2n+k-1} = \frac{k}{n}\binom{2n+k-1}{n-1} = \frac{k(2n+k-1)!}{n!(n+k)!}
$$

证毕！]

### Exercise 10：对合排列中轮换个数的精确公式与渐近期望

**题目**：设 $\sigma(n, k)$ 为 $n$ 元对合排列中恰含 $k$ 个轮换的个数，$t_n = \sum_k \sigma(n, k)$ 为总对合数：(a) 证明 $\sum_{n, k} \frac{\sigma(n, k)}{n!} x^n y^k = e^{y(x + x^2/2)}$；(b) 导出 $\sigma(n, k) = \frac{n!}{(n-k)!(2k-n)! 2^{n-k}}$；(c) 证明随机对合排列的平均轮换个数精确等于 $\frac{n}{2}\left\{1 + \frac{t_{n-1}}{t_n}\right\}$；(d) 利用式 (5.41) 证明该平均轮换个数渐近等于 $\frac{n}{2} + \frac{1}{2}\sqrt{n}(1 + o(1))$。

**解答**：:spoiler[(a) 对合排列牌组枚举器为 $\mathcal{D}(x) = x + \frac{1}{2}x^2$，代入二元指数公式 (3.5) 即得。(b) 设 1-轮换有 $a$ 个、2-轮换有 $b$ 个，则 $a + 2b = n, \ a + b = k \implies b = n - k, \ a = 2k - n$，展开 $\frac{(yx)^a}{a!}\frac{(yx^2/2)^b}{b!}$ 乘 $n!$ 即得 $\frac{n!}{(n-k)!(2k-n)! 2^{n-k}}$。(c) 对 $e^{y(x+x^2/2)}$ 关于 $y$ 求导后令 $y=1$，得 $\left(x + \frac{x^2}{2}\right)\sum_{m \ge 0} \frac{t_m}{m!} x^m$。提取 $[x^n/n!]$ 得总轮换数为 $n t_{n-1} + \frac{n(n-1)}{2} t_{n-2}$。利用习题 3.5 的递推式 $(n-1)t_{n-2} = t_n - t_{n-1}$ 代入消去 $t_{n-2}$，总轮换数化为 $n t_{n-1} + \frac{n}{2}(t_n - t_{n-1}) = \frac{n}{2}(t_n + t_{n-1})$，除以 $t_n$ 即得 $\frac{n}{2}\left(1 + \frac{t_{n-1}}{t_n}\right)$！(d) 由 Moser-Wyman 渐近公式 (5.41)（或直接由鞍点 $\frac{t_{n-1}/(n-1)!}{t_n/n!} \sim r_n \sim \sqrt{n} \implies \frac{t_{n-1}}{t_n} = \frac{r_n}{n}(1+o(1)) \sim \frac{1}{\sqrt{n}}$），立得平均轮换数为 $\frac{n}{2} + \frac{1}{2}\sqrt{n}(1 + o(1))$！]

---

### Appendix A Exercises（附录 A 计算机符号实验习题 1–6 解答）

**题目与参考结果**：

- **A.1–A.3**：用 `Series` 与 `RSolve` 验证第 1、2 章基础级数与递推（结果见第 1、2 章对应习题解答）。

- **A.4**：用 `series` 命令求 2-正则图 EGF（式 3.17）的前 15 项系数 $g(n) \ (n = 0, \dots, 15)$。

  - **解答**：:spoiler[由 $g(n) = n! [x^n] \frac{e^{-x/2 - x^2/4}}{\sqrt{1-x}}$（满足递推 $g(n) = (n-1)g(n-1) + \binom{n-1}{2}g(n-2)$），$n = 0, \dots, 15$ 的精确值依次为：$1, 0, 0, 1, 3, 12, 70, 465, 3507, 30016, 286884, 3026655, 34944085, 438263364, 5933502822, 86248951243$。]

- **A.5**：由式 (3.16) 列出 $n \le 15$ 的对合排列数 $t_n$。

  - **解答**：:spoiler[由 $t_n = t_{n-1} + (n-1)t_{n-2}$，$n = 0, \dots, 15$ 的值依次为：$1, 1, 2, 4, 10, 26, 76, 232, 764, 2620, 9496, 35696, 140152, 568504, 2390480, 10349536$。]

- **A.6**：求下列函数的前几项渐近展开：(a) $(1 + 1/\sqrt{n})^n$；(b) $\sqrt{n!}$；(c) $(1 + 1/n)^{\sqrt{n}}$；(d) $\sin(\sin(1/x)) \ (x \to \infty)$。

  - **解答**：:spoiler[(a) $\exp(\sqrt{n} - 1/2)\left(1 + \frac{1}{3\sqrt{n}} - \frac{7}{36n} + \frac{1}{162n^{3/2}} + \dots\right)$；(b) $(2\pi n)^{1/4} (n/e)^{n/2} \left(1 + \frac{1}{24n} + \frac{1}{1152n^2} - \frac{1003}{414720n^3} + \dots\right)$；(c) $1 + \frac{1}{\sqrt{n}} + \frac{1}{2n} - \frac{1}{3n^{3/2}} - \frac{7}{24n^2} + \dots$；(d) $\frac{1}{x} - \frac{1}{3x^3} + \frac{1}{10x^5} - \frac{8}{315x^7} + \frac{13}{2520x^9} - \dots$。]

---
title: 生成函数 · 笔记（二） · 形式幂级数与狄利克雷级数
published: 2026-11-11
tags:
  - 生成函数
  - 形式幂级数
  - 狄利克雷级数
  - 莫比乌斯反演
  - Generatingfunctionology
category: 生成函数
draft: false
description: 形式幂级数环的严格代数理论、倒数与复合逆、OGF 五大法则与硬币喷泉、EGF 三大法则与卡特兰/错排、复分析收敛半径与单位根反演、25 个核心幂级数大字典、狄利克雷级数与欧拉乘积、莫比乌斯反演与分圆多项式，附 2.7 节全部 34 道大题完整折叠解答。
---

## 导读

本篇讨论形式幂级数与狄利克雷级数，结合推导、例题与代码说明方法的使用条件。

:::tip[学习重点]

- 区分形式幂级数恒等式与解析收敛问题。
- 比较 OGF、EGF 与狄利克雷级数中的乘积和卷积。

:::

## 一、2.1 形式幂级数环：代数运算与收敛性（Formal Power Series）

在第 1 章使用生成函数解递推关系时，我们经常在不知道级数是否收敛的情况下就对它求导、移项甚至做代数运算。万一最后算出来的生成函数处处发散怎么办？例如阶乘级数（式 2.1）：

$$
f(x) = 1 + x + 2x^2 + 6x^3 + 24x^4 + 120x^5 + \dots + n! x^n + \dots
$$

除了 $x = 0$ 之外对任何复数 $x$ 都发散！Wilf 在第 2.1 节指出：**不必有任何负罪感！因为一切代数与形式微积分操作都在“形式幂级数环（Ring of Formal Power Series）”中进行，在这里，收敛性问题根本不存在。**

### 形式幂级数的四则运算与乘法倒数（Reciprocal）

形式幂级数 $f = \sum_{n \ge 0} a_n x^n$ 只是一个纯代数对象（系数序列 $\{a_n\}_0^\infty$ 的载体）。两个级数相等当且仅当每一项系数都相等；加减法按同次幂系数相加减；乘法按 **Cauchy 卷积法则**（式 2.2）定义：

$$
\left(\sum_n a_n x^n\right)\left(\sum_n b_n x^n\right) = \sum_n c_n x^n, \qquad c_n = \sum_{k=0}^n a_k b_{n-k}
$$

为什么 Cauchy 积在组合学中无处不在？因为如果构造一个规模为 $n$ 的组合对象可以拆分为“选一个规模为 $k$ 的第一部分（$a_k$ 种）”与“选一个规模为 $n-k$ 的第二部分（$b_{n-k}$ 种）”并拼接起来，总方案数就恰好是 $\sum_k a_k b_{n-k}$！

:::important[命题 2.1：形式幂级数存在乘法倒数的充要条件]

形式幂级数 $f = \sum_{n \ge 0} a_n x^n$ 存在乘法倒数 $1/f = \sum_{n \ge 0} b_n x^n$（满足 $f \cdot (1/f) = 1$）**当且仅当常数项非零（$a_0 \neq 0$）**。此时倒数唯一，且系数可通过以下有限步递推唯一确定（式 2.3）：

$$
b_0 = \frac{1}{a_0}, \qquad b_n = -\frac{1}{a_0} \sum_{k=1}^n a_k b_{n-k} \quad (n \ge 1)
$$

因此，全体形式幂级数构成一个交换环 $\mathbb{C}[[x]]$，其中的可逆元（Units）恰好是常数项非零的级数。

:::

### 复合运算 $f(g(x))$ 与复合逆（Inverse Series）

千万不要把乘法倒数 $1/f(x)$ 与**复合逆（Inverse）** $g(x)$（满足 $f(g(x)) = g(f(x)) = x$）混为一谈！

首先，什么时候复合级数 $f(g(x)) = \sum_{n \ge 0} a_n g(x)^n$ 在形式幂级数环中有定义？

- 如果 $g(x)$ 的常数项 $g_0 \neq 0$，那么每一项 $a_n g(x)^n$ 都会对常数项、一次项、乃至 $x^{57}$ 项产生贡献，计算单个系数需要进行无穷次加法，这在纯代数形式理论中是不允许的（除非 $f$ 是有限次多项式）！

- 反之，**如果 $g(0) = g_0 = 0$**，那么 $g(x) = g_1 x + g_2 x^2 + \dots = x(g_1 + g_2 x + \dots)$，从而 $a_n g(x)^n = a_n x^n (g_1 + g_2 x + \dots)^n$。这意味着所有 $n > 57$ 的项只包含高于 $57$ 次的幂，计算 $[x^{57}] f(g(x))$ 只需要有限步运算！

:::warning[经典辨析：为什么 $e^{e^x - 1}$ 是合法形式级数，而 $e^{e^x}$ 不是？]

在 $f(g(x)) = \exp(g(x))$ 中，外层 $f(u) = e^u$ 是无穷级数。

- 对于 $e^{e^x - 1}$，内层 $g(x) = e^x - 1 = x + \frac{x^2}{2!} + \dots$ 满足 **$g(0) = 0$**，因此它是良定义的形式幂级数！

- 对于 $e^{e^x}$，内层 $g(x) = e^x$ 的常数项为 $g(0) = 1 \neq 0$，展开后常数项为 $1 + 1 + \frac{1}{2!} + \dots = e$，无法通过有限步代数运算定义！

**命题 2.2（复合逆存在定理）**：设 $f(0) = 0$，则 $f(x)$ 存在形式复合逆级数 $g(x)$（满足 $f(g(x)) = g(f(x)) = x$）**当且仅当一次项系数非零（$f_1 \neq 0$）**。（证明：若 $f = f_r x^r + \dots, \ g = g_s x^s + \dots$，则 $f(g(x)) = f_r g_s^r x^{rs} + \dots = x \implies rs = 1 \implies r = s = 1$。）

:::

### 形式导数与微分方程

形式幂级数 $f = \sum_{n \ge 0} a_n x^n$ 的形式导数定义为 $f' = \sum_{n \ge 1} n a_n x^{n-1}$，完全不涉及极限，且满足微积分的和、积、商求导法则。许多分析性质在形式环中证起来反而更简单：

- **命题 2.3**：若 $f' = 0$，则 $f = a_0$ 为常数（因为 $a_1 = 2a_2 = 3a_3 = \dots = 0 \implies a_j = 0 \ (\forall j \ge 1)$）。

- **命题 2.4**：若 $f' = f$，则 $f = a_0 e^x$（对比 $[x^n]$ 得 $(n+1)a_{n+1} = a_n \implies a_n = a_0 / n!$）。

---

## 二、2.2 形式普通生成函数（OGF）的五大运算法则（Calculus of Formal OGFs）

记 $f \stackrel{ops}{\longleftrightarrow} \{a_n\}_0^\infty$ 表示 $f(x) = \sum_{n \ge 0} a_n x^n$ 是序列 $\{a_n\}$ 的普通生成函数（opsgf）。本节建立从“序列关系”一眼翻译到“级数关系”的五大法则：

:::important[OGF 五大黄金运算法则（Rules 1–5）]

- **Rule 1（下标左移 $h$ 位）**：对正整数 $h > 0$，

$$
\{a_{n+h}\}_0^\infty \stackrel{ops}{\longleftrightarrow} \frac{f(x) - a_0 - a_1 x - \dots - a_{h-1} x^{h-1}}{x^h}
$$

（例如斐波那契 $F_{n+2} = F_{n+1} + F_n$ 一眼就能直接翻译为 $\frac{f - x}{x^2} = \frac{f}{x} + f$！）

- **Rule 2（乘以关于 $n$ 的多项式 $P(n)$）**：记微分算子 $D = \frac{d}{dx}$，则

$$
P(xD) f(x) \stackrel{ops}{\longleftrightarrow} \{P(n) a_n\}_{n \ge 0}
$$

（例如对 $(n+1)a_{n+1} = 3a_n + 1 \ (a_0=1)$，左侧为 $D f(x) = f'(x)$，直接化为一阶常微分方程 $f' = 3f + \frac{1}{1-x}$！）

- **Rule 3（两序列 Cauchy 卷积）**：若 $f \stackrel{ops}{\longleftrightarrow} \{a_n\}$ 且 $g \stackrel{ops}{\longleftrightarrow} \{b_n\}$，则

$$
f(x)g(x) \stackrel{ops}{\longleftrightarrow} \left\{\sum_{r=0}^n a_r b_{n-r}\right\}_{n=0}^\infty
$$

- **Rule 4（$k$ 重有序拆分卷积）**：对正整数 $k$，

$$
f(x)^k \stackrel{ops}{\longleftrightarrow} \left\{\sum_{n_1 + n_2 + \dots + n_k = n} a_{n_1} a_{n_2} \cdots a_{n_k}\right\}_{n=0}^\infty
$$

- **Rule 5（前缀和算子）**：将 OGF 除以 $(1-x)$，等价于把原序列替换为它的**前缀和序列（Partial Sums）**：

$$
\frac{f(x)}{1-x} \stackrel{ops}{\longleftrightarrow} \left\{\sum_{j=0}^n a_j\right\}_{n \ge 0}
$$

:::

### 经典算例精讲（Examples 2.6–2.12）

1. **形式与解析的无缝切换（Example 2.6 & 2.7）**：求级数和 $\sum_{n \ge 0} \frac{n^2 + 4n + 5}{n!}$。由 Rule 2，级数 $\sum_{n \ge 0} \frac{n^2+4n+5}{n!} x^n = \{(xD)^2 + 4(xD) + 5\} e^x = (x^2 + 5x + 5)e^x$。由于该级数在全平面解析收敛，我们可以合法代入 $x = 1$ 得到答案 $11e$！同理，对 $\sum_{n=0}^N x^n = \frac{x^{N+1}-1}{x-1}$ 作用 $(xD)^2$ 后取 $x \to 1$，即可机械导出平方和 $\sum_{n=1}^N n^2 = \frac{N(N+1)(2N+1)}{6}$。

2. **用 Rule 4 求非负整数有序拆分（Example 2.8）**：将非负整数 $n$ 写为 $k$ 个非负整数的有序和 $n = n_1 + \dots + n_k$ 的方案数 $f(n, k)$，对应 $a_n = 1 \implies f(x) = \frac{1}{1-x}$，故 $f(x)^k = \frac{1}{(1-x)^k} \stackrel{ops}{\longleftrightarrow} \{f(n, k)\}$，由式 (1.31) 立得 $f(n, k) = \binom{n+k-1}{n}$。

3. **用 Rule 2 + Rule 5 再次秒杀平方和（Example 2.9）**：由于 $\frac{1}{1-x} \stackrel{ops}{\longleftrightarrow} \{1\}$，作用 $(xD)^2$ 得 $\frac{x(1+x)}{(1-x)^3} \stackrel{ops}{\longleftrightarrow} \{n^2\}$，再由 Rule 5 除以 $(1-x)$ 得前缀和生成函数 $\frac{x(1+x)}{(1-x)^4} \stackrel{ops}{\longleftrightarrow} \left\{\sum_{j=0}^n j^2\right\}$！提取 $[x^n] \frac{x + x^2}{(1-x)^4} = \binom{n+2}{3} + \binom{n+1}{3} = \frac{n(n+1)(2n+1)}{6}$。

4. **调和数 $H_n$ 的生成函数（Example 2.10）**：$H_n = \sum_{j=1}^n \frac{1}{j}$ 是 $\{1/n\}_{n \ge 1}$ 的前缀和。因 $\sum_{n \ge 1} \frac{x^n}{n} = \log\frac{1}{1-x}$，由 Rule 5 立得 $\sum_{n=1}^\infty H_n x^n = \frac{1}{1-x}\log\left(\frac{1}{1-x}\right)$。

5. **斐波那契前缀和（Example 2.11）**：要证 $F_0 + F_1 + \dots + F_n = F_{n+2} - 1$，左侧 OGF（Rule 5）为 $\frac{F(x)}{1-x}$，右侧 OGF（Rule 1）为 $\frac{F(x) - x}{x^2} - \frac{1}{1-x}$，代入 $F(x) = \frac{x}{1-x-x^2}$ 检验两侧恒等，一行证毕！

6. **硬币块状喷泉问题（Block Fountains of Coins, Example 2.12）**：将硬币按行堆叠，底层有 $k$ 枚连续硬币，往上每一枚硬币恰好压在下一层相邻两枚硬币的缝隙上。若要求**每一层都是单独一段连续的硬币块**（称为块状喷泉 Block Fountain），问底层恰好有 $k$ 枚硬币的块状喷泉有多少种 $f(k)$？

   - **递推建模**：剥去底层 $k$ 枚硬币后，第二层是一段连续的 $j$ 枚硬币（$0 \le j \le k-1$）。若 $j = 0$，只有 $1$ 种方案；若 $1 \le j \le k-1$，这 $j$ 枚硬币在 $k-1$ 个缝隙中可以左右滑动，共有 $(k - j)$ 种合法的水平缩进位置！因此：

   $$
   f(k) = \sum_{j=1}^k (k - j) f(j) + 1 \quad (k = 1, 2, \dots; \ f(0) = 1)
   $$

   - **Rule 3 卷积求解**：看到求和号下的 $(k - j) f(j)$，条件反射认出它是序列 $\{j\}_{j \ge 1}$（OGF 为 $\frac{x}{(1-x)^2}$）与序列 $\{f(j)\}_{j \ge 1}$（OGF 为 $F(x) - 1$）的 Cauchy 卷积！两边乘 $x^k$ 对 $k \ge 1$ 求和：

   $$
   F(x) - 1 = \frac{x}{(1-x)^2}(F(x) - 1) + \frac{x}{1-x} \implies F(x) = \frac{1 - 2x}{1 - 3x + x^2}
   $$

   展开得 $1, 1, 2, 5, 13, 34, 89, \dots$，正是奇数项斐波那契数 $f(k) = F_{2k-1} \ (k \ge 1)$！（详见习题 2.19。）

---

## 三、2.3 形式指数生成函数（EGF）的运算法则与经典范例（Calculus of Formal EGFs）

记 $f \stackrel{egf}{\longleftrightarrow} \{a_n\}_0^\infty$ 表示 $f(x) = \sum_{n \ge 0} a_n \frac{x^n}{n!}$。与 OGF 相比，EGF 的三大法则在移位和重标号组合中展现出独特的威力：

:::important[EGF 三大黄金运算法则（Rules 1'–3'）]

- **Rule 1'（下标左移 $h$ 位即求导）**：对整数 $h \ge 0$，

$$
\{a_{n+h}\}_0^\infty \stackrel{egf}{\longleftrightarrow} D^h f(x) = f^{(h)}(x)
$$

（对比 OGF：EGF 的下标平移不需要减初值再除以 $x^h$，直接求导即可！初值条件留在最后解微分方程时确定积分常数。）

- **Rule 2'（乘以多项式 $P(n)$）**：与 OGF 完全相同，

$$
P(xD) f(x) \stackrel{egf}{\longleftrightarrow} \{P(n) a_n\}_{n \ge 0}
$$

- **Rule 3'（二项卷积 Binomial Convolution）**：若 $f \stackrel{egf}{\longleftrightarrow} \{a_n\}$ 且 $g \stackrel{egf}{\longleftrightarrow} \{b_n\}$，则

$$
f(x)g(x) \stackrel{egf}{\longleftrightarrow} \left\{\sum_{r=0}^n \binom{n}{r} a_r b_{n-r}\right\}_{n=0}^\infty
$$

推广到 $k$ 个 EGF 相乘（式 2.23）：$f(x)^k \stackrel{egf}{\longleftrightarrow} \left\{\sum_{r_1+\dots+r_k=n} \frac{n!}{r_1! r_2! \cdots r_k!} a_{r_1}\cdots a_{r_k}\right\}_{n=0}^\infty$。

**组合直觉**：当把大小为 $r$ 的有标号结构与大小为 $n-r$ 的有标号结构拼成大小为 $n$ 的有标号结构时，需要先用 $\binom{n}{r}$ 种方式从 $n$ 个标号中选出 $r$ 个分配给第一个结构（relabeling），这就必然呼唤 EGF！

:::

### 四大对比范例（Examples 2.14–2.18）

- **Example 2.14（用 EGF 求斐波那契数）**：由 Rule 1'，$F_{n+2} = F_{n+1} + F_n$ 直接变成二阶常系数微分方程 $f'' = f' + f$，通解为 $f(x) = c_1 e^{r_+ x} + c_2 e^{r_- x}$。代入 $f(0) = 0, \ f'(0) = 1$ 得 $f(x) = \frac{e^{r_+ x} - e^{r_- x}}{\sqrt{5}}$，提取 $[x^n/n!]$ 无需部分分式直接拿到 Binet 公式！

  - *Wilf 的方法论总结*：对线性递推，OGF 给出更容易解的**代数方程**，但需要部分分式展开才能拿通项；EGF 给出**微分方程**，但一旦解出指数和，拿通项无需部分分式！

- **Example 2.15（三行重证贝尔数 EGF）**：已知贝尔数递推 $b(n+1) = \sum_k \binom{n}{k} b(k)$。左侧 EGF 由 Rule 1' 为 $B'(x)$；右侧是 $\{b(n)\}$ 与全 $1$ 序列 $\{1\}$（其 EGF 为 $e^x$）的二项卷积（Rule 3'），即 $e^x B(x)$！解微分方程 $B' = e^x B \ (B(0)=1)$，瞬间得 $B(x) = \exp(e^x - 1)$！

- **Example 2.16（合法括号序列与卡特兰数——为什么选 OGF？）**：定义长度为 $2k$ 的非空合法括号串为**原初串（Primitive）**，若其首个左右括号数相等的前缀就是整个串 $2k$。**引理 2.17** 证明：长为 $2k$ 的原初合法串个数 $g(k) = f(k-1)$（只需在长为 $2k-2$ 的任意合法串首尾套上一对括号 `( ... )` 即构成双射）。按首个合法前缀长 $2k$ 分解得 $f(n) = \sum_k f(k-1)f(n-k) \ (n \neq 0; \ f(0)=1)$。因为卷积不含 $\binom{n}{k}$，故选用 OGF 得 $F(x) - 1 = x F(x)^2 \implies F(x) = \frac{1 - \sqrt{1-4x}}{2x}$（由 $F(0)=1$ 及洛必达法则舍去正号）。

- **Example 2.18（错排问题 Derangements——为什么选 EGF？）**：按排列的不动点个数 $k$ 分类得 $n! = \sum_k \binom{n}{k} D_{n-k}$。由于出现 $\binom{n}{k}$ 二项卷积，果断取两侧 EGF（左侧 $\sum_{n \ge 0} n! \frac{x^n}{n!} = \frac{1}{1-x}$，右侧由 Rule 3' 为 $e^x D(x)$），立得 $D(x) = \frac{e^{-x}}{1-x}$，再由 OGF 的前缀和法则（Rule 5）读取 $[x^n] D(x)$ 即得 $\frac{D_n}{n!} = \sum_{j=0}^n \frac{(-1)^j}{j!}$。

---

## 四、2.4 幂级数的解析理论与单位根筛选法（Power Series, Analytic Theory）

当形式幂级数 $f(z) = \sum_{n \ge 0} a_n z^n$ 在复平面圆盘 $|z| < R$ 内收敛时，它就代表一个复解析函数，从而可以用复分析工具反推系数 $\{a_n\}$ 的渐近增长率！

### 上极限（Limit Superior）与收敛半径定理

**定义 2.20（上极限 $\limsup_{n \to \infty} x_n$）**：实数列 $\{x_n\}$ 的上极限 $L$ 是使得“对任意 $\epsilon > 0$，除有限项外均有 $x_n < L + \epsilon$，且有无穷多项满足 $x_n > L - \epsilon$”的唯一扩展实数（即全体聚点集的最小上界）。

:::important[解析幂级数三大基石定理（Theorems 2.19, 2.21 & 2.25）]

1. **定理 2.19（Cauchy-Hadamard 收敛半径公式）**：幂级数 $\sum a_n z^n$ 的收敛半径 $R \in [0, +\infty]$ 由下式给出：

$$
R = \frac{1}{\limsup_{n \to \infty} |a_n|^{1/n}} \quad (1/0 = \infty, \ 1/\infty = 0)
$$

级数在 $|z| < R$ 内绝对收敛，在 $|z| > R$ 内发散。

2. **定理 2.21（奇点阻断定理）**：若幂级数在 $|z| < R$ 内收敛于解析函数 $f(z)$ 且在 $|z| > R$ 发散，则 **$f(z)$ 在收敛圆周 $|z| = R$ 上至少存在一个奇点**！（证明：若圆周上无奇点，由 Heine-Borel 有限覆盖定理可将解析域扩大到 $|z| < R + \epsilon$，由柯西不等式 $|a_n| \le M/(R+\epsilon)^n$ 知收敛半径 $\ge R+\epsilon$，矛盾！）

   - **推论**：寻找已知函数 $f(z)$ 幂级数收敛半径 $R$ 的最佳方法，就是找 **$f(z)$ 离原点最近的奇点 $z_0$**，则 $R = |z_0|$！

3. **定理 2.25（系数量级估计）**：设 $f(z)$ 在原点附近解析，模最小的奇点为 $z_0 \neq 0$，则对任意 $\epsilon > 0$，存在 $N$ 使得 $n > N$ 时 $|a_n| < \left(\frac{1}{|z_0|} + \epsilon\right)^n$，且有无穷多个 $n$ 满足 $|a_n| > \left(\frac{1}{|z_0|} - \epsilon\right)^n$。

:::

- **Example 2.23**：$f(z) = \frac{1}{2 - e^z}$ 的奇点满足 $e^z = 2 \iff z = \log 2 + 2k\pi i$，离原点最近的是 $z_0 = \log 2$，故收敛半径 $R = \log 2$。

- **Example 2.24（伯努利数增长率）**：$f(z) = \frac{z}{e^z - 1} = \sum_{n \ge 0} a_n z^n$（其中 $a_n = B_n / n!$）。虽然 $z = 0$ 使分母为 $0$，但 $\lim_{z \to 0} \frac{z}{e^z-1} = 1$，故 $z=0$ 是**可去奇点**！真正离原点最近的奇点是 $z_0 = \pm 2\pi i$，收敛半径 $R = 2\pi$，从而 $|a_n| \approx (2\pi)^{-n}$（即 $|B_{2n}| \sim 4\sqrt{\pi n}\left(\frac{n}{\pi e}\right)^{2n}$）。

- **柯西积分公式与柯西不等式（式 2.25 & 2.26）**：

$$
a_n = \frac{1}{2\pi i} \oint \frac{f(z) dz}{z^{n+1}} \implies |a_n| \le \frac{M(r)}{r^n} \quad \left(0 < r < R, \ M(r) = \max_{|z|=r} |f(z)|\right)
$$

### 单位根筛选法（Roots of Unity Filter, Equations 2.27–2.32）

要从幂级数 $f(x) = \sum_{n \ge 0} a_n x^n$ 中筛选出指数是 $r$ 的倍数的子级数 $\sum_{k \ge 0} a_{rk} x^{rk}$，利用 $r$ 次单位根 $\omega^r = 1$ 的几何级数求和正交性质（式 2.32）：

$$
\frac{1}{r} \sum_{\omega^r = 1} \omega^n = \frac{1}{r} \sum_{j=0}^{r-1} e^{2\pi i j n / r} = \begin{cases} 1, & \text{if } r \mid n \\ 0, & \text{otherwise} \end{cases}
$$

可得通用筛选公式：

$$
\sum_{k \ge 0} a_{rk} x^{rk} = \frac{1}{r} \sum_{j=0}^{r-1} f(\omega_j x) \quad (\omega_j = e^{2\pi i j / r})
$$

- **三步跳项指数级数（式 2.27 & 2.30）**：取 $f(x) = e^x, \ r = 3$（$\omega_{1,2} = -\frac{1}{2} \pm i\frac{\sqrt{3}}{2}$），立得：

$$
g(x) = \sum_{n \ge 0} \frac{x^{3n}}{(3n)!} = \frac{1}{3}\left(e^x + e^{\omega_1 x} + e^{\omega_2 x}\right) = \frac{1}{3}\left(e^x + 2e^{-x/2}\cos\left(\frac{\sqrt{3}x}{2}\right)\right)
$$

- **Example 2.26**：求 $\lambda_n = \sum_k (-1)^k \binom{n}{3k}$。令 $F(x) = (1+x)^n$，则 $f(x) = \sum_k \binom{n}{3k} x^{3k} = \frac{1}{3}\{(1+x)^n + (1+\omega_1 x)^n + (1+\omega_2 x)^n\}$。代入 $x = -1$（因 $\binom{n}{3k}(-1)^k = \binom{n}{3k}((-1)^3)^k$），利用 $1 - \omega_{1,2} = \frac{3 \mp \sqrt{3}i}{2} = \sqrt{3} e^{\mp i\pi/6}$，化简得 $\lambda_n = f(-1) = 2 \cdot 3^{n/2 - 1} \cos\left(\frac{n\pi}{6}\right) \ (n > 0)$。

---

## 五、2.5 常用幂级数速查表（Some Useful Power Series, Equations 2.33–2.57）

Wilf 在第 2.5 节汇总了全书反复调用的 **25 个核心幂级数展开式**（式 2.33 至 2.57），这里完整收录供随时查阅：

:::note[基础初等与二项式级数（2.33–2.43）]

$$
\begin{aligned}

\frac{1}{1-x} &= \sum_{n \ge 0} x^n \quad (2.33) & \log\frac{1}{1-x} &= \sum_{n \ge 1} \frac{x^n}{n} \quad (2.34) \\

e^x &= \sum_{n \ge 0} \frac{x^n}{n!} \quad (2.35) & \sin x &= \sum_{n \ge 0} (-1)^n \frac{x^{2n+1}}{(2n+1)!} \quad (2.36) \\

\cos x &= \sum_{n \ge 0} (-1)^n \frac{x^{2n}}{(2n)!} \quad (2.37) & (1+x)^\alpha &= \sum_k \binom{\alpha}{k} x^k \quad (2.38) \\

\frac{1}{(1-x)^{k+1}} &= \sum_n \binom{n+k}{n} x^n \quad (2.39) & \frac{x}{e^x - 1} &= \sum_{n \ge 0} \frac{B_n x^n}{n!} \quad (2.40) \\

\tan^{-1} x &= \sum_{n \ge 0} (-1)^n \frac{x^{2n+1}}{2n+1} \quad (2.41) & \frac{1 - \sqrt{1-4x}}{2x} &= \sum_{n \ge 0} \frac{1}{n+1}\binom{2n}{n} x^n \quad (2.42) \\

\frac{1}{\sqrt{1-4x}} &= \sum_{k \ge 0} \binom{2k}{k} x^k \quad (2.43)

\end{aligned}
$$

:::

:::note[伯努利数、卡特兰幂次、反三角与调和级数（2.44–2.57）]

- **三角函数与伯努利数 $B_{2k}$**（其中 $B_0=1, B_1=-1/2, B_2=1/6, B_4=-1/30, B_6=1/42, B_8=-1/30, B_{10}=5/66, B_{12}=-691/2730$）：

$$
x \cot x = \sum_{k \ge 0} \frac{(-4)^k B_{2k}}{(2k)!} x^{2k} \quad (2.44), \qquad \tan x = \sum_{r \ge 1} (-1)^{r-1} \frac{2^{2r}(2^{2r}-1)B_{2r}}{(2r)!} x^{2r-1} \quad (2.45)
$$

$$
\frac{x}{\sin x} = \sum_{r \ge 0} (-1)^{r-1} \frac{(4^r - 2)B_{2r}}{(2r)!} x^{2r} \quad (2.46)
$$

- **广义卡特兰级数 $k$ 次幂**（拉格朗日反演核心公式）：

$$
\frac{1}{\sqrt{1-4x}}\left(\frac{1-\sqrt{1-4x}}{2x}\right)^k = \sum_{n \ge 0} \binom{2n+k}{n} x^n \quad (2.47)
$$

$$
\left(\frac{1-\sqrt{1-4x}}{2x}\right)^k = \sum_{n \ge 0} \frac{k(2n+k-1)!}{n!(n+k)!} x^n \quad (k \ge 1) \quad (2.48)
$$

- **反三角、调和数与超几何特种展开**：

$$
\sin^{-1} x = \sum_{n \ge 0} \frac{(2n)!}{2^{2n}(n!)^2} \frac{x^{2n+1}}{2n+1} \quad (2.49), \qquad e^x \sin x = \sum_{n \ge 1} \frac{2^{n/2}\sin(n\pi/4)}{n!} x^n \quad (2.50)
$$

$$
\frac{1}{2}\tan^{-1}(x)\log(1+x^2) = \sum_{r \ge 1} (-1)^{r-1} H_{2r} \frac{x^{2r+1}}{2r+1} \quad (2.51)
$$

$$
\frac{1}{4}\tan^{-1}(x)\log\frac{1+x}{1-x} = \sum_{r \ge 0} \frac{x^{4r+2}}{4r+2}\left(1 - \frac{1}{3} + \frac{1}{5} - \dots + \frac{1}{4r+1}\right) \quad (2.52)
$$

$$
\frac{1}{2}\left\{\log\frac{1}{1-x}\right\}^2 = \sum_{r \ge 2} \frac{H_{r-1}}{r} x^r \quad (2.53), \qquad \sqrt{\frac{1-\sqrt{1-x}}{x}} = \sum_{k=0}^\infty \frac{(4k)!}{16^k \sqrt{2}(2k)!(2k+1)!} x^k \quad (2.54)
$$

$$
e^{\arcsin x} = \sum_{k=0}^\infty \frac{\prod_{j=0}^{k-1}(4j^2+1)}{(2k)!} x^{2k} + \sum_{k=0}^\infty \frac{4^k \prod_{j=1}^k(\frac{1}{2}-j+j^2)}{(2k+1)!} x^{2k+1} \quad (2.55)
$$

$$
\left(\frac{\arcsin x}{x}\right)^2 = \sum_{k=0}^\infty \frac{4^k (k!)^2}{(k+1)(2k+1)!} x^{2k} \quad (2.56), \qquad \left(x + \sqrt{1+x^2}\right)^a = \sum_{k=0}^\infty \frac{2^k (a/2 - k/2 + 1)^{\overline{k}}}{(1 + k/a) k!} x^k \quad (2.57)
$$

:::

---

## 六、2.6 狄利克雷级数、莫比乌斯反演与分圆多项式（Dirichlet Series, Formal Theory）

当组合或数论问题中的两个序列按**约数整除卷积** $\sum_{d \mid n} a_d b_{n/d}$ 结合时（即规模为 $n$ 的对象由 $d$ 个规模为 $n/d$ 的构件拼成），最匹配的工具是**狄利克雷级数生成函数（Dsgf, Definition 2.27）**：

$$
f(s) = \sum_{n=1}^\infty \frac{a_n}{n^s} \stackrel{Dir}{\longleftrightarrow} \{a_n\}_{n=1}^\infty
$$

:::important[狄利克雷级数运算法则与欧拉乘积定理]

- **Rule 1''（约数卷积）**：若 $f(s) \stackrel{Dir}{\longleftrightarrow} \{a_n\}$ 且 $g(s) \stackrel{Dir}{\longleftrightarrow} \{b_n\}$，则

$$
f(s)g(s) \stackrel{Dir}{\longleftrightarrow} \left\{\sum_{d \mid n} a_d b_{n/d}\right\}_{n=1}^\infty \quad (2.59)
$$

- **Rule 2''（$k$ 重有序因子分解）**：$f(s)^k$ 的第 $n$ 项系数是 $n$ 分解为 $k$ 个正整数有序乘积 $n = n_1 n_2 \cdots n_k$ 上 $a_{n_1}\cdots a_{n_k}$ 的总和。特别地，黎曼 $\zeta$ 函数 $\zeta(s) = \sum_{n=1}^\infty \frac{1}{n^s} \stackrel{Dir}{\longleftrightarrow} \{1\}$，故 $\zeta^2(s) \stackrel{Dir}{\longleftrightarrow} \{d(n)\}$（约数个数），$(\zeta(s)-1)^k$ 生成将 $n$ 分解为 $k$ 个 $\ge 2$ 的因子的有序分解数。

- **定理 2.29（积性函数的欧拉乘积公式）**：若数论函数 $f(n)$ 是**积性函数**（即 $\gcd(m,n)=1 \implies f(mn)=f(m)f(n)$，完全由其在素数幂 $p^a$ 上的取值决定），则有形式恒等式：

$$
\sum_{n=1}^\infty \frac{f(n)}{n^s} = \prod_{p \text{ prime}} \left\{1 + f(p)p^{-s} + f(p^2)p^{-2s} + f(p^3)p^{-3s} + \dots\right\} \quad (2.63)
$$

:::

### 莫比乌斯反演与两大经典应用（Examples 2.30 & 2.31）

在欧拉乘积中取 $f(n) = 1$ 得 $\zeta(s) = \prod_p \frac{1}{1-p^{-s}}$；取**莫比乌斯函数 $\mu(n)$**（定义为 $\mu(1)=1, \ \mu(p)=-1, \ \mu(p^a)=0 \ (\forall a \ge 2)$），欧拉乘积括号内只剩两项：

$$
\sum_{n \ge 1} \frac{\mu(n)}{n^s} = \prod_p (1 - p^{-s}) = \frac{1}{\zeta(s)} \implies \frac{1}{\zeta(s)} \stackrel{Dir}{\longleftrightarrow} \{\mu(n)\}_{n=1}^\infty
$$

因此，序列关系 $a_n = \sum_{d \mid n} b_d$ 等价于 $A(s) = B(s)\zeta(s) \iff B(s) = A(s)/\zeta(s)$，直接读取系数即得**莫比乌斯反演公式（Equation 2.69）**：

$$
a_n = \sum_{d \mid n} b_d \quad (n \ge 1) \iff b_n = \sum_{d \mid n} \mu\left(\frac{n}{d}\right) a_d \quad (n \ge 1)
$$

1. **原初 0-1 字符串计数（Primitive Bit Strings, Example 2.30）**：若长为 $n$ 的 0-1 串不能表示为某个更短子串的多次重复拼接，则称为**原初串（Primitive）**（如 `1101` 是原初串，而 `100100100` 不是）。任意长为 $n$ 的 0-1 串（共 $2^n$ 个）都能唯一表示为某个长为 $d \ (d \mid n)$ 的原初串重复 $n/d$ 次，故 $2^n = \sum_{d \mid n} f(d)$。由莫比乌斯反演立得：

$$
f(n) = \sum_{d \mid n} \mu\left(\frac{n}{d}\right) 2^d \quad (n = 1, 2, \dots)
$$

2. **分圆多项式（Cyclotomic Polynomials, Example 2.31）**：$n$ 次本原单位根（即不是任何更小 $m < n$ 次单位根的根）共有 $\phi(n)$ 个：$\{e^{2\pi i r / n} : 0 \le r < n, \ \gcd(r, n) = 1\}$。以它们为单根的首一多项式称为**第 $n$ 个分圆多项式 $\Phi_n(x)$**。因为每个 $n$ 次单位根恰是某个唯一约数 $d \mid n$ 的 $d$ 次本原单位根，故有乘积分解：

$$
\prod_{d \mid n} \Phi_d(x) = x^n - 1 \quad (\text{或按书中符号 } 1 - x^n)
$$

两边取对数把乘积化为求和 $\sum_{d \mid n} \log \Phi_d(x) = \log(1 - x^n)$，套用莫比乌斯反演后再取指数，立即得到分圆多项式的显式公式（式 2.73）：

$$
\Phi_n(x) = \prod_{d \mid n} (1 - x^d)^{\mu(n/d)}
$$

例如计算 $\Phi_{12}(x)$：12 的约数中 $\mu(1)=1, \mu(2)=-1, \mu(3)=-1, \mu(4)=0, \mu(6)=1, \mu(12)=0$，故：

$$
\Phi_{12}(x) = \frac{(1-x^2)(1-x^{12})}{(1-x^4)(1-x^6)} = 1 - x^2 + x^4
$$

高斯证明了所有分圆方程 $\Phi_n(z) = 0$ 均可根式求解，例如正十七边形尺规作图对应的华丽根式：

$$
\cos\frac{2\pi}{17} = \frac{1}{16}\left\{-1 + \sqrt{17} + \sqrt{2(17-\sqrt{17})} + 2\sqrt{17 + 3\sqrt{17} - \sqrt{2(17-\sqrt{17})} - 2\sqrt{2(17+\sqrt{17})}}\right\}
$$

---

## 七、2.7 第 2 章课后习题解答（Complete Solutions to All 34 Exercises）

本节完整收录《generatingfunctionology》第 2.7 节全部 34 道大题（含所有子题）的推导与折叠答案。

### Exercise 1：求形式幂级数的乘法倒数前 3 项系数

**题目**：计算下列函数幂级数的乘法倒数（Reciprocal）的前三项非零系数：

- **(a)** $\cos x$

- **(b)** $(1 + x)^m$

- **(c)** $1 + t^2 + t^3 + t^5 + t^7 + t^{11} + \dots$（素数次幂级数）

**解答**：

- **(a)** :spoiler[利用 $\frac{1}{1-u} = 1 + u + u^2 + \dots$：$\frac{1}{\cos x} = \frac{1}{1 - (x^2/2 - x^4/24 + \dots)} = 1 + \left(\frac{x^2}{2} - \frac{x^4}{24}\right) + \left(\frac{x^2}{2}\right)^2 + O(x^6) = 1 + \frac{1}{2}x^2 + \frac{5}{24}x^4 + \dots$，前三项系数为 $1, \frac{1}{2}, \frac{5}{24}$（若计入奇次零项则前三个系数为 $1, 0, \frac{1}{2}$）。]

- **(b)** :spoiler[由负指数二项式定理 $(1+x)^{-m} = \sum_{k \ge 0} \binom{-m}{k} x^k = 1 - mx + \frac{m(m+1)}{2}x^2 - \frac{m(m+1)(m+2)}{6}x^3 + \dots$，前三项系数为 $1, -m, \frac{m(m+1)}{2}$。]

- **(c)** :spoiler[令 $u = t^2 + t^3 + t^5 + \dots$，则 $\frac{1}{1+u} = 1 - u + u^2 - u^3 + \dots = 1 - (t^2 + t^3 + t^5) + (t^4 + 2t^5) + O(t^6) = 1 - t^2 - t^3 + t^4 + t^5 + \dots$，前三个非零项为 $1 - t^2 - t^3$（按幂次前 3 项系数为 $1, 0, -1$）。]

### Exercise 2：求形式幂级数的复合逆前 3 项系数

**题目**：计算下列函数幂级数的复合逆（Inverse Series）的前三项系数：

- **(a)** $\sin x$

- **(b)** $\tan x$

- **(c)** $x + x^2\sqrt{1+x}$

- **(d)** $x + x^3$

- **(e)** $\log(1-x)$

**解答**：

- **(a)** :spoiler[设复合逆为 $g(x) = x + bx^2 + cx^3 + \dots$，代入 $\sin(g(x)) = g(x) - \frac{g(x)^3}{6} + \dots = x + bx^2 + (c - 1/6)x^3 + \dots = x$，解得 $b = 0, \ c = 1/6$，故 $\arcsin x = x + \frac{1}{6}x^3 + \frac{3}{40}x^5 + \dots$。]

- **(b)** :spoiler[由 $\tan x = x + \frac{1}{3}x^3 + \frac{2}{15}x^5 + \dots$，代入 $g(x) + \frac{1}{3}g(x)^3 + \dots = x$ 得 $b = 0, \ c = -1/3$，即 $\arctan x = x - \frac{1}{3}x^3 + \frac{1}{5}x^5 - \dots$。]

- **(c)** :spoiler[先展开 $f(x) = x + x^2(1 + \frac{1}{2}x - \dots) = x + x^2 + \frac{1}{2}x^3 + \dots$。设逆为 $g(x) = x + bx^2 + cx^3 + \dots$，代入 $g + g^2 + \frac{1}{2}g^3 = x + (b+1)x^2 + (c + 2b + \frac{1}{2})x^3 + \dots = x$，解得 $b = -1, \ c = \frac{3}{2}$，即 $x - x^2 + \frac{3}{2}x^3 + \dots$。]

- **(d)** :spoiler[代入 $g(x) + g(x)^3 = x + bx^2 + (c+1)x^3 + \dots = x$，得 $b = 0, \ c = -1$，即 $x - x^3 + 3x^5 - \dots$。]

- **(e)** :spoiler[设 $y = g(x)$，则 $\log(1-y) = x \implies 1 - y = e^x \implies y = 1 - e^x = -x - \frac{1}{2}x^2 - \frac{1}{6}x^3 - \dots$。]

### Exercise 3：用形式幂级数严格证明 $f'' + f = 0$ 的通解

**题目**：设形式幂级数 $f(x) = \sum_{k \ge 0} a_k x^k$ 满足 $f'' + f = 0$。给出 $f(x) = A\sin x + B\cos x$ 的严格代数证明。

**解答**：:spoiler[计算形式导数得 $0 = f'' + f = \sum_{k \ge 0} \{(k+2)(k+1)a_{k+2} + a_k\} x^k$。由形式级数零元定义，每一项系数均为 $0$，即 $a_{k+2} = -\frac{a_k}{(k+1)(k+2)} \ (\forall k \ge 0)$。固定任意常数 $a_0 = B, \ a_1 = A$，对 $k$ 归纳立得偶次项 $a_{2k} = (-1)^k \frac{B}{(2k)!}$ 与奇次项 $a_{2k+1} = (-1)^k \frac{A}{(2k+1)!}$，代回即得 $f(x) = A\sin x + B\cos x$。]

### Exercise 4：常见变体数列的 OGF 闭式求解

**题目**：求下列序列的闭式普通生成函数（OGF）：

- **(a)** $\{n + 7\}_{n=0}^\infty$

- **(b)** $\{1\}_{n=4}^\infty$（即前 4 项为 $0$，从 $n=4$ 起全为 $1$）

- **(c)** $\{1, 0, 1, 0, 1, 0, \dots\}$

- **(d)** $\{1/(n+1)\}_{n=2}^\infty$（即 $\sum_{n \ge 2} \frac{x^n}{n+1}$）

- **(e)** $\{1/(n+5)!\}_{n=0}^\infty$

- **(f)** $F_1, 2F_2, 3F_3, 4F_4, \dots$（$F_n$ 为斐波那契数，下标从 $n=1$ 开始或作为 $x^n$ 系数）

- **(g)** $\{(n^2 + n + 1)/n!\}_{n=1}^\infty$

**解答**：

- **(a)** :spoiler[$\sum_{n \ge 0} (n+7)x^n = \frac{x}{(1-x)^2} + \frac{7}{1-x} = \frac{7 - 6x}{(1-x)^2}$。]

- **(b)** :spoiler[$\sum_{n \ge 4} x^n = \frac{x^4}{1-x}$。]

- **(c)** :spoiler[$\sum_{k \ge 0} x^{2k} = \frac{1}{1-x^2}$。]

- **(d)** :spoiler[$\sum_{n \ge 2} \frac{x^n}{n+1} = \frac{1}{x}\sum_{m \ge 3} \frac{x^m}{m} = \frac{1}{x}\left\{\log\frac{1}{1-x} - x - \frac{x^2}{2}\right\}$。]

- **(e)** :spoiler[由 Rule 1 左移 5 位：$\sum_{n \ge 0} \frac{x^n}{(n+5)!} = \frac{e^x - 1 - x - x^2/2! - x^3/3! - x^4/4!}{x^5}$。]

- **(f)** :spoiler[对 $F(x) = \frac{x}{1-x-x^2}$ 作用 $xD$ 得 $\sum_{n \ge 1} n F_n x^n = x \frac{d}{dx}\left(\frac{x}{1-x-x^2}\right) = \frac{x(1+x^2)}{(1-x-x^2)^2}$（若从常数项 $F_1$ 开始排则再除以 $x$ 得 $\frac{1+x^2}{(1-x-x^2)^2}$）。]

- **(g)** :spoiler[对 $e^x - 1 = \sum_{n \ge 1} \frac{x^n}{n!}$ 作用算子 $(xD)^2 + (xD) + 1$，得 $\{(x^2+x) + x + 1\}e^x - 1 = (1+x)^2 e^x - 1$。]

### Exercise 5：用生成函数证明 $\sum_k \binom{n}{k} = 2^n$

**题目**：使用生成函数证明 $\sum_k \binom{n}{k} = 2^n$。

**解答**：:spoiler[在二项式生成函数 $\sum_k \binom{n}{k} x^k = (1+x)^n$ 中直接代入 $x = 1$；或者对两边乘 $y^n$ 求和：左侧 $\sum_{n \ge 0} y^n \sum_k \binom{n}{k} = \sum_{k \ge 0} \frac{y^k}{(1-y)^{k+1}} = \frac{1}{1-y}\frac{1}{1 - y/(1-y)} = \frac{1}{1-2y} = \sum_{n \ge 0} 2^n y^n$，对比 $[y^n]$ 即证。]

### Exercise 6 & 7：正整数有序拆分的乘积和与带下界拆分

**题目**：

- **6.** 将 $n$ 表为 $k$ 个非负整数的有序和 $n = n_1 + \dots + n_k$，记 $S = n_1 \cdots n_k$ 为这 $k$ 个数的乘积，$f(n, k)$ 为所有此类拆分的 $S$ 之和。求 $f(n, k)$ 的 OGF 与显式通项。

- **7.** 设 $f(n, k, h)$ 为将 $n$ 表为 $k$ 个均 $\ge h$ 的整数的有序和的方案数，求 $\sum_n f(n, k, h) x^n$。

**解答**：

- **6.** :spoiler[单个分量的加权生成函数为 $\sum_{r \ge 0} r x^r = \frac{x}{(1-x)^2}$。由 Rule 4（$k$ 重卷积），$\sum_{n \ge 0} f(n, k) x^n = \left(\frac{x}{(1-x)^2}\right)^k = \frac{x^k}{(1-x)^{2k}}$。提取 $[x^n]$ 得 $f(n, k) = [x^{n-k}] (1-x)^{-2k} = \binom{n+k-1}{n-k} = \binom{n+k-1}{2k-1}$（当 $n < k$ 时为 $0$，因为至少有一个分量 $n_i = 0$ 导致乘积 $S = 0$）。]

- **7.** :spoiler[每个分量可选取 $\ge h$ 的整数，其生成函数为 $\sum_{r \ge h} x^r = \frac{x^h}{1-x}$。$k$ 个独立有序分量的生成函数即为 $\left(\frac{x^h}{1-x}\right)^k = \frac{x^{kh}}{(1-x)^k}$（显式通项为 $[x^n] = \binom{n - kh + k - 1}{k - 1}$）。]

### Exercise 8, 9, 10, 11 & 12：上极限与收敛半径的严格分析

**题目**：

- **8.** 求下列序列的上极限 $\limsup_{n \to \infty}$：(a) $1, 0, 1, 0, \dots$；(b) $\{(-1)^n\}$；(c) $\{\cos(n\pi / k)\} \ (k \neq 0)$；(d) $\{1 + (-1)^n / n\}$；(e) $\{n^{1/n}\}$。

- **9 & 10.** 证明：若序列有极限 $L$，则其上极限等于 $L$；且任何序列不可能有两个不同的上极限。

- **11.** 求下列幂级数的收敛半径 $R$：(a) $\sum_{n \ge 1} x^n / n^2$；(b) $1 + x^3 + x^6 + x^9 + \dots$；(c) $1 + 5x^2 + 25x^4 + 125x^6 + \dots$；(d) $1 + 2! x^2 + 4! x^4 + 6! x^6 + \dots$；(e) $\sum_{n \ge 0} x^{n!}$。

- **12.** 补全定理 2.19（Cauchy-Hadamard 定理）在 $R = 0$ 和 $R = \infty$ 时的证明。

**解答**：

- **8.** :spoiler[五个序列的上极限全部为 $1$！(a)(b) 最大聚点显然为 $1$；(c) 当 $n$ 取 $2k$ 的倍数时 $\cos(2m\pi) = 1$，且 $\cos \le 1$；(d)(e) 序列本身收敛于极限 $1$，故上极限为 $1$。]

- **9 & 10.** :spoiler[若 $\lim x_n = L$，对任意 $\epsilon > 0$，存在 $N$ 使 $n > N$ 时 $L - \epsilon < x_n < L + \epsilon$，完全满足定义 2.20 的 (i)(ii)，故 $\limsup x_n = L$。若有两个上极限 $L_1 < L_2$，取 $\epsilon = (L_2 - L_1)/3$，由 $L_1$ 定义知除有限项外 $x_n < L_1 + \epsilon = L_2 - 2\epsilon$，这与 $L_2$ 定义中“有无穷多项 $x_n > L_2 - \epsilon$”矛盾！]

- **11.** :spoiler[(a) $\lim (n^{-2})^{1/n} = 1 \implies R = 1$；(b) $\limsup |a_n|^{1/n} = 1 \implies R = 1$；(c) 偶次项系数 $a_{2k} = 5^k$，故 $\limsup |a_n|^{1/n} = \lim (5^k)^{1/(2k)} = \sqrt{5} \implies R = 5^{-1/2}$；(d) $((2k)!)^{1/(2k)} \to \infty \implies R = 0$；(e) 非零项系数为 $1$，其余为 $0$，$\limsup |a_n|^{1/n} = 1 \implies R = 1$。]

- **12.** :spoiler[当 $R = 0$ 时，$\limsup |a_n|^{1/n} = +\infty$，对任意 $z \neq 0$，取 $M = 2/|z|$，有无穷多个 $n$ 满足 $|a_n|^{1/n} > 2/|z| \implies |a_n z^n| > 2^n \to \infty$，级数发散；当 $R = +\infty$ 时，$\limsup |a_n|^{1/n} = 0$，对任意 $z \in \mathbb{C}$，取 $\epsilon = 1/(2|z|)$，充分大的 $n$ 满足 $|a_n|^{1/n} < \epsilon \implies |a_n z^n| < (1/2)^n$，由几何级数审敛法知处处绝对收敛。]

### Exercise 13, 14, 15, 16, 17 & 18：积性函数、欧拉函数 $\phi(n)$ 与狄利克雷级数大演练

**题目**：

- **13.** 证明：若 $f(n)$ 是积性函数，则其约数和 $g(n) = \sum_{d \mid n} f(d)$ 也是积性函数。

- **14.** 用直接计数法证明恒等式 $\sum_{d \mid n} \phi(d) = n$。

- **15 & 16.** 证明 (a) $\phi(n)$、(b) 约数和 $\sigma(n)$、(c) $|\mu(n)|$ 均为积性函数，求出它们在素数幂 $p^a$ 上的值、对任意 $n$ 的显式公式，并用定理 2.29 求出它们用 $\zeta(s)$ 表示的狄利克雷生成函数（Dsgf）。

- **17.** 求下列序列的 Dsgf：(a) $\{n\}$；(b) $\{n^\alpha\}$；(c) $\{\log n\}$；(d) $\left\{\sum_{d \mid n} d^q\right\}$。

- **18.** 用 Dsgf 证明恒等式：(a) $\sum_{d \mid n} \phi(d) = n$；(b) $\sum_{d \mid n} \mu(d) = \delta_{n, 1}$；(c) $\sum_{\delta \mid n} \mu(\delta) d(n/\delta) = 1$。

**解答**：

- **13.** :spoiler[设 $\gcd(a, b) = 1$，则 $ab$ 的任意约数 $d$ 可唯一分解为 $d = d' d'' \ (d' \mid a, \ d'' \mid b, \ \gcd(d', d'') = 1)$。故 $g(ab) = \sum_{d'\mid a, d''\mid b} f(d'd'') = \left(\sum_{d'\mid a} f(d')\right)\left(\sum_{d''\mid b} f(d'')\right) = g(a)g(b)$。]

- **14.** :spoiler[考察 $n$ 个分数 $\frac{1}{n}, \frac{2}{n}, \dots, \frac{n}{n}$。将每个分数化为最简分数 $\frac{h}{d}$，则分母 $d$ 必是 $n$ 的某个约数（$d \mid n$），且分子满足 $1 \le h \le d, \ \gcd(h, d) = 1$。对每个固定的约数 $d \mid n$，这样的最简分数恰有 $\phi(d)$ 个，故总数 $\sum_{d \mid n} \phi(d) = n$。]

- **15 & 16.** :spoiler[(a) 对 $\sum_{d \mid n} \phi(d) = n$ 用莫比乌斯反演得 $\phi(n) = \sum_{d \mid n} \mu(n/d) d$，由 13 题知 $\phi$ 是积性函数；$\phi(p^a) = p^a - p^{a-1}$，$\phi(n) = n\prod_{p \mid n}(1 - 1/p)$，其 Dsgf 为 $\frac{\zeta(s-1)}{\zeta(s)}$。(b) $\sigma(p^a) = \frac{p^{a+1}-1}{p-1}$，其 Dsgf 为 $\zeta(s)\zeta(s-1)$。(c) $|\mu(p^a)| = [a \le 1]$，其 Dsgf 为 $\prod_p (1 + p^{-s}) = \frac{\zeta(s)}{\zeta(2s)}$。]

- **17.** :spoiler[(a) $\sum \frac{n}{n^s} = \zeta(s-1)$；(b) $\sum \frac{n^\alpha}{n^s} = \zeta(s-\alpha)$；(c) 对 $\zeta(s) = \sum n^{-s}$ 求导得 $\zeta'(s) = -\sum (\log n) n^{-s}$，故 Dsgf 为 $-\zeta'(s)$；(d) 是 $\{1\}$ 与 $\{n^q\}$ 的狄利克雷卷积，故为 $\zeta(s)\zeta(s-q)$。]

- **18.** :spoiler[(a) 左侧 Dsgf 为 $\frac{\zeta(s-1)}{\zeta(s)} \cdot \zeta(s) = \zeta(s-1)$，与右侧 $\{n\}$ 的 Dsgf 相同；(b) 左侧 Dsgf 为 $\frac{1}{\zeta(s)} \cdot \zeta(s) = 1 = 1 \cdot 1^{-s}$，故仅 $n=1$ 时为 $1$；(c) 左侧 Dsgf 为 $\frac{1}{\zeta(s)} \cdot \zeta^2(s) = \zeta(s)$，对应常序列 $\{1\}$。]

### Exercise 19 & 20：硬币喷泉与二项式/多项式定理的 EGF 证明

**题目**：

- **19.** 证明例 2.12 中的块状硬币喷泉数满足 $f(k) = F_{2k-1} \ (k \ge 1)$。

- **20.** 通过对比 $e^{t(x+y)} = e^{tx} e^{ty}$ 两侧 $t^n / n!$ 的系数证明二项式定理；并用同样方法证明多项式定理 $(x_1 + \dots + x_k)^n = \sum_{r_1+\dots+r_k=n} \frac{n!}{r_1!\cdots r_k!} x_1^{r_1}\cdots x_k^{r_k}$。

**解答**：

- **19.** :spoiler[对式 (2.12) $F(x) = \frac{1-2x}{1-3x+x^2}$ 做部分分式分解：分母 $1 - 3x + x^2 = (1 - \alpha_+ x)(1 - \alpha_- x)$，其中 $\alpha_{\pm} = \frac{3 \pm \sqrt{5}}{2} = \left(\frac{1 \pm \sqrt{5}}{2}\right)^2 = r_{\pm}^2$！展开得 $F(x) = \frac{1}{10}\left(\frac{5-\sqrt{5}}{1-\alpha_+ x} + \frac{5+\sqrt{5}}{1-\alpha_- x}\right)$，对 $k \ge 1$ 提取 $[x^k]$ 并化简 $\frac{5 \mp \sqrt{5}}{10} r_{\pm}^{2k} = \frac{1}{\sqrt{5}} r_{\pm}^{2k-1}$，立得 $f(k) = \frac{1}{\sqrt{5}}(r_+^{2k-1} - r_-^{2k-1}) = F_{2k-1}$！]

- **20.** :spoiler[一方面 $[t^n/n!] e^{t(x+y)} = (x+y)^n$；另一方面由 EGF 乘法法则（Rule 3'），$[t^n/n!](e^{tx} e^{ty}) = \sum_{k=0}^n \binom{n}{k} x^k y^{n-k}$，两者相等即证二项式定理。同理对比 $e^{t(x_1+\dots+x_k)} = e^{tx_1}\cdots e^{tx_k}$ 两侧 $[t^n/n!]$ 的系数（式 2.23）即证多项式定理。]

### Exercise 21, 22 & 23：受限整数有序表示与自然数幂和（Faulhaber 公式）

**题目**：

- **21.** 设 $T, S$ 为给定的非负整数集：(a) 求将 $n$ 表为 $k$ 个取自 $T$ 的整数的有序和的方案数 $f(n, k, T)$ 的生成函数 $\sum_n f(n, k, T) x^n$；(b) 若要求这 $k$ 个取自 $T$ 的整数**互不相同**，记方案数为 $g(n, k, T)$，求其生成函数；(c) 若要求取自 $T$ 的每个整数出现的重数都属于集合 $S$，求 $f(n, k, S, T)$ 的生成函数。

- **22.** 设 $f(n)$ 为将正整数 $n$ 表为“偶数个正整数的有序和”的方案数减去表为“奇数个正整数的有序和”的方案数之差，求 $\sum_n f(n) x^n$ 及 $f(n)$。

- **23.** 利用生成函数 $\frac{x(e^{mx}-1)}{e^x-1}$ 的两种展开方式，导出前 $m$ 个正整数的 $n$ 次幂和 $S_n(m) = \sum_{j=1}^m j^n$ 用伯努利数表示的显式公式，并写出 $n=1, 2, 3$ 的结果。

**解答**：

- **21.** :spoiler[(a) 由 Rule 4 直接得 $\left(\sum_{t \in T} x^t\right)^k$；(b) 选出 $k$ 个互异元素后再做 $k!$ 种全排列，故为 $k! [y^k] \prod_{t \in T} (1 + y x^t)$；(c) 用 EGF 跟踪排列位置、用 $y$ 跟踪元素个数，得 $k! [y^k] \prod_{t \in T} \left(\sum_{s \in S} \frac{y^s x^{st}}{s!}\right)$。]

- **22.** :spoiler[单个正整数分量的 OGF 为 $\frac{x}{1-x}$，$k$ 个正整数有序和的 OGF 为 $\left(\frac{x}{1-x}\right)^k$。带符号求和得 $\sum_{n \ge 1} f(n) x^n = \sum_{k \ge 1} (-1)^k \left(\frac{x}{1-x}\right)^k = \frac{-x/(1-x)}{1 + x/(1-x)} = -x$！因此 $f(1) = -1$，而对一切 $n \ge 2$ 都有 $f(n) = 0$（偶拆分与奇拆分个数完全相等）！]

- **23.** :spoiler[一方面 $\frac{x(e^{mx}-1)}{e^x-1} = x\sum_{j=0}^{m-1} e^{jx} = \sum_{r \ge 0} \frac{x^{r+1}}{r!} S_r(m-1)$；另一方面它等于 $\left(\sum_k \frac{B_k x^k}{k!}\right)\left(\sum_{j \ge 1} \frac{m^j x^j}{j!}\right)$。对比 $[x^{n+1}]$ 并把 $m-1$ 替换为 $m$，得 $S_n(m) = \frac{1}{n+1}\sum_{r=1}^{n+1} \binom{n+1}{r} B_{n+1-r} (m+1)^r$。代入 $B_0=1, B_1=-1/2, B_2=1/6, B_3=0$ 得：$S_1(m) = \frac{m^2}{2}+\frac{m}{2}$，$S_2(m) = \frac{m^3}{3}+\frac{m^2}{2}+\frac{m}{6}$，$S_3(m) = \frac{m^4}{4}+\frac{m^3}{2}+\frac{m^2}{4}$。]

### Exercise 24 & 25：原初串列表与编码理论中的 Varshamov-Tenengolts 码界

**题目**：

- **24.** 列出 $n = 1, \dots, 12$ 的原初 0-1 串个数 $f(n)$（式 2.70），并验证 $f(6) = 54$。

- **25（编码理论中的生成函数）**：设 $A(n, d)$ 为长度为 $n$、任意两个码字至少在 $d$ 个比特位上不同的最长二进制码本长度。对每个码字 $\epsilon = (\epsilon_1, \dots, \epsilon_n) \in \{0, 1\}^n$，定义其“颜色”为 $\sum_{j=1}^n j \epsilon_j \bmod 2n$：(a) 证明若两个码字仅在 1 或 2 个位置不同，则颜色必不同；(b) 推出 $A(n, 3) \ge 2^n / (2n)$；(c) 记 $\sum_r r \epsilon_r = j$ 的码字数为 $a_j$，写出 $f(z) = \sum_j a_j z^j$ 的乘积形式；(d) 记颜色为 $r$ 的码字数为 $\beta_r$，用 2.4 节的单位根筛选法证明 $\beta_r = \frac{1}{2n}\sum_{j=1}^{n''} 2^{2^a(j, n'')} e^{-2\pi i r j / n''}$（其中 $n = 2^a n''$，$n''$ 为奇数）；(e) 证明 $\beta_0$ 最大，从而改进下界。

**解答**：

- **24.** :spoiler[由 $f(n) = \sum_{d \mid n} \mu(n/d) 2^d$，前 12 项依次为：$f(1)=2, f(2)=2, f(3)=6, f(4)=12, f(5)=30, f(6)=2^6 - 2^3 - 2^2 + 2^1 = 54, f(7)=126, f(8)=240, f(9)=504, f(10)=990, f(11)=2046, f(12)=4020$。长为 6 的非原初串只有周期为 1（`000000`, `111111`，共 2 个）、周期为 2（`010101`, `101010`，共 2 个）和周期为 3（6 个原初 3-串重复两次，共 6 个），故 $64 - 2 - 2 - 6 = 54$。]

- **25.** :spoiler[(a) 若仅在第 $j$ 位不同，颜色差为 $\pm j \not\equiv 0 \pmod{2n}$；若在第 $j, k \ (1 \le j < k \le n)$ 两位不同，颜色差为 $\pm(j+k)$ 或 $\pm(j-k)$，因 $0 < k-j < j+k < 2n$，均不可能被 $2n$ 整除！(b) 同一种颜色的所有码字两两距离至少为 $3$，由鸽巢原理最大的颜色类至少含 $2^n/(2n)$ 个码字。(c) $f(z) = \prod_{k=1}^n (1 + z^k)$。(d) $\beta_r = \sum_{m \equiv r \pmod{2n}} a_m = \frac{1}{2n}\sum_{s=0}^{2n-1} \omega^{-rs} \prod_{k=1}^n (1 + \omega^{sk})$（$\omega = e^{\pi i / n}$）。当 $s$ 为奇数时，$k = n$ 因子为 $1 + \omega^{sn} = 1 + (-1)^s = 0$，故只有偶数 $s = 2j$ 有贡献，化简单位根乘积即得所示公式。(e) 对 $r=0$，所有项取正实部最大值，故 $\beta_0 \ge \beta_r$。]

### Exercise 26, 27, 28, 29 & 30：错排递推、广义莫比乌斯反演与完全积性函数

**题目**：

- **26.** 由式 (2.38) 证明负二项恒等式 $\binom{-n}{k} = (-1)^k \binom{n+k-1}{k}$。

- **27.** 对错排数 $D(n)$：(a) 写出其 EGF；(b) 证明 $D(n+1) = (n+1)D(n) + (-1)^{n+1}$；(c) 证明 $D(n+1) = n(D(n) + D(n-1))$，并证明恰有 1 个不动点的排列数与错排数之差为 $(-1)^n$；(d) 记恰有 $k$ 个不动点的 $n$-排列数为 $D_k(n)$，证明 $\sum_{k, n \ge 0} D_k(n) \frac{x^n y^k}{n!} = \frac{e^{-x(1-y)}}{1-x}$。

- **28.** 证明函数序列的莫比乌斯反演：若 $a_n(x) = \sum_{d \mid n} b_{n/d}(x^d)$，则 $b_n(x) = \sum_{d \mid n} \mu(n/d) a_d(x^{n/d})$。

- **29 & 30.** 计算 $\phi(2592)$；求 $\{\sqrt{n}\}$ 的 Dsgf；证明强积性刘维尔函数 $\lambda(n)$ 满足 $\sum_{d \mid n} \lambda(d) = [n \text{ 为平方数}]$。

**解答**：

- **26.** :spoiler[$\binom{-n}{k} = \frac{(-n)(-n-1)\cdots(-n-k+1)}{k!} = (-1)^k \frac{(n+k-1)(n+k-2)\cdots n}{k!} = (-1)^k \binom{n+k-1}{k}$。]

- **27.** :spoiler[(a) $D(x) = \frac{e^{-x}}{1-x}$。(b) 对 $(1-x)D(x) = e^{-x}$ 两边求导得 $(1-x)D'(x) - D(x) = -e^{-x}$，提取 $[x^n/n!]$ 得 $D(n+1) - n D(n) - D(n) = (-1)^{n+1} \implies D(n+1) = (n+1)D(n) + (-1)^{n+1}$。(c) 将 (b) 中 $n$ 与 $n-1$ 的式子相加消去 $(-1)^{n+1}$ 即得 $D(n+1) = n(D(n)+D(n-1))$；恰有 1 个不动点的排列数为 $D_1(n) = n D(n-1)$，由 (b) 知 $D(n) - n D(n-1) = (-1)^n$。(d) $D_k(n) = \binom{n}{k} D(n-k)$，故 $\sum_{n, k} \binom{n}{k} D(n-k) \frac{x^n y^k}{n!} = \left(\sum_k \frac{(xy)^k}{k!}\right)\left(\sum_m D(m)\frac{x^m}{m!}\right) = e^{xy} \cdot \frac{e^{-x}}{1-x} = \frac{e^{-x(1-y)}}{1-x}$。]

- **28.** :spoiler[直接代入右侧：$\sum_{d \mid n} \mu(n/d) \sum_{\delta \mid d} b_{d/\delta}(x^{(n/d)\delta})$，令 $r = d/\delta$，则 $r \mid n$ 且 $\frac{n}{d} \mid \frac{n}{r}$，$x$ 的指数为 $x^{n/r}$，系数为 $\sum_{m \mid (n/r)} \mu(m) = \delta_{r, n}$，故只剩 $r = n$ 项 $b_n(x)$！]

- **29 & 30.** :spoiler[因 $2592 = 2^5 \cdot 3^4$，故 $\phi(2592) = 2592(1 - 1/2)(1 - 1/3) = 864$。$\sum_{n \ge 1} \frac{\sqrt{n}}{n^s} = \sum \frac{1}{n^{s - 1/2}} = \zeta(s - 1/2)$。刘维尔函数 Dsgf 为 $\prod_p (1 + p^{-s})^{-1} = \frac{\zeta(2s)}{\zeta(s)}$，乘以 $\zeta(s)$ 得 $\zeta(2s) = \sum_{k \ge 1} (k^2)^{-s}$，证毕。]

### Exercise 31, 32, 33 & 34：Lambert 级数、高阶前缀和算子与分圆多项式进阶性质

**题目**：

- **31.** 设 Lambert 级数 $f(x) = \sum_{n \ge 1} a_n \frac{x^n}{1-x^n} = \sum_{n \ge 1} b_n x^n$：(a) 用 $a$ 表示 $b$；(b) 证明 $\sum_{n \ge 1} \frac{\mu(n)x^n}{1-x^n} = x$；(c) 求 $\sum_{n \ge 1} \frac{\phi(n)x^n}{1-x^n}$。

- **32.** 设算子 $S$ 将序列 $\boldsymbol{a} = \{a_n\}_{n \ge 0}$ 变为其前缀和序列 $(S\boldsymbol{a})_n = a_0 + \dots + a_n$：(a)(b) 若 $\boldsymbol{a}$ 的 OGF 为 $f(x)$，求 $S^r \boldsymbol{a}$ 的 OGF；(c) 若 $\boldsymbol{a} = \{1, 1, \dots\}$，求 $S^r \boldsymbol{a}$；(d) 对一般序列 $\boldsymbol{a}$，求 $(S^r \boldsymbol{a})_n$ 的单重求和显式公式；(e) 若对未知序列 $\boldsymbol{a}$ 迭代作用 $r$ 次 $S$ 后得到 $\{1, 0, 0, \dots\}$，求 $\boldsymbol{a}$。

- **33.** 对分圆多项式 $\Phi_n(x)$：(a) 写出前 12 个 $\Phi_n(x)$；(b) 当 $n = p^a$ 为素数幂时求 $\Phi_{p^a}(x)$；(c) 证明对 $n \ge 1$，当 $n = 1$ 时 $\Phi_1(1) = 0$，当 $n = p^k$ 为素数幂时 $\Phi_{p^k}(1) = p$，当 $n > 1$ 不是素数幂时 $\Phi_n(1) = 1$。

- **34.** 设多项式 $\psi_n(x) = \sum_{1 \le m \le n, \gcd(m,n)=1} x^m$：(a) 证明 $\sum_{d \mid n} \psi_{n/d}(x^d) = \frac{x(1-x^n)}{1-x}$；(b) 用习题 28 证明 $\psi_n(x) = (1-x^n)\sum_{d \mid n} \mu(d)\frac{x^d}{1-x^d}$；(c) 证明在每个 $n$ 次本原单位根 $\omega$ 处有 $\psi_n(\omega) = \mu(n)$，从而 $\Phi_n(x) \mid (\psi_n(x) - \mu(n))$。

**解答**：

- **31.** :spoiler[(a) 展开 $\frac{x^n}{1-x^n} = \sum_{m \ge 1} x^{mn}$，按 $r = mn$ 收集系数得 $b_n = \sum_{d \mid n} a_d$；(b) 取 $a_n = \mu(n)$，则 $b_n = \sum_{d \mid n} \mu(d) = \delta_{n, 1}$，故级数为 $x$；(c) 取 $a_n = \phi(n)$，则 $b_n = \sum_{d \mid n} \phi(d) = n$，故级数为 $\sum_{n \ge 1} n x^n = \frac{x}{(1-x)^2}$。]

- **32.** :spoiler[(a) $\frac{f(x)}{1-x}$；(b) $\frac{f(x)}{(1-x)^r}$；(c) OGF 为 $\frac{1}{(1-x)^{r+1}}$，通项为 $\binom{n+r}{n}$；(d) $(S^r \boldsymbol{a})_n = [x^n] \frac{f(x)}{(1-x)^r} = \sum_{m=0}^n \binom{m+r-1}{m} a_{n-m}$；(e) 由 $\frac{f(x)}{(1-x)^r} = 1 \implies f(x) = (1-x)^r$，故 $a_n = (-1)^n \binom{r}{n}$。]

- **33.** :spoiler[(a) $\Phi_1 = x-1, \Phi_2 = x+1, \Phi_3 = x^2+x+1, \Phi_4 = x^2+1, \Phi_5 = x^4+x^3+x^2+x+1, \Phi_6 = x^2-x+1, \Phi_7 = \sum_{j=0}^6 x^j, \Phi_8 = x^4+1, \Phi_9 = x^6+x^3+1, \Phi_{10} = x^4-x^3+x^2-x+1, \Phi_{11} = \sum_{j=0}^{10} x^j, \Phi_{12} = x^4-x^2+1$（若按书中常数项在前则符号对应 $1-x$）。(b) $\Phi_{p^a}(x) = \frac{1 - x^{p^a}}{1 - x^{p^{a-1}}} = 1 + x^{p^{a-1}} + x^{2p^{a-1}} + \dots + x^{(p-1)p^{a-1}}$。(c) 由 $\prod_{m \mid n, m > 1} \Phi_m(1) = \lim_{x \to 1} \frac{1-x^n}{1-x} = n$，结合 (b) 知 $\Phi_{p^a}(1) = p$，对合数归纳消去所有素数幂约数因子后，剩余合数约数的 $\Phi_m(1)$ 乘积为 $1$，且正定，故非素数幂时 $\Phi_n(1) = 1$。]

- **34.** :spoiler[(a) 对每个 $1 \le r \le n$，令 $d = \gcd(r, n)$，则 $r = m d$ 且 $\gcd(m, n/d) = 1$，故 $x^r = (x^d)^m$ 唯一出现在 $\psi_{n/d}(x^d)$ 中，求和即为 $\sum_{r=1}^n x^r = \frac{x(1-x^n)}{1-x}$。(b) 直接套用习题 28 的反演公式即得。(c) 令 $x \to \omega$（$n$ 次本原单位根），当 $d < n \ (d \mid n)$ 时 $\omega^d \neq 1$，而 $\lim_{x \to \omega} (1-x^n) = 0$，故所有 $d < n$ 的项极限均为 $0$！只有 $d = n$ 那一项满足 $\lim_{x \to \omega} \frac{1-x^n}{1-x^n} \mu(n) \omega^n = \mu(n)$，因此 $\psi_n(\omega) = \mu(n)$，即 $\Phi_n(x)$ 的所有单根都是 $\psi_n(x) - \mu(n)$ 的根，故 $\Phi_n(x) \mid (\psi_n(x) - \mu(n))$。]

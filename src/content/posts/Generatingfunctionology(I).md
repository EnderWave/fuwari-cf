---
title: 生成函数 · 笔记（一） · 生成函数与递推建模
published: 2026-11-01
tags:
  - 生成函数
  - 组合数学
  - 算法竞赛
  - 斯特林数
  - Generatingfunctionology
category: 生成函数
draft: false
description: 晾衣绳思想、Wilf 六步法、留数掩盖法、三项边值问题与三次样条插值及数值积分修正、二元生成函数、广义二项式系数、第二类斯特林数的两套算子解法、贝尔数 Dobinski 公式与 xD log 对数微分法，附 1.7 节全部 20 道大题（含所有子题）完整折叠解答。
---

## 导读

Herbert S. Wilf 在《generatingfunctionology》第 1 章开篇给出了组合数学史上最著名的一个比喻：

:::important[核心隐喻：生成函数是一根晾衣绳（Clothesline）]
**“A generating function is a clothesline on which we hang up a sequence of numbers for display.”**

假设某个离散数学问题的答案是一串未知数列 $a_0, a_1, a_2, \dots$。如果能直接找到像 $a_n = n^2 + 3$ 这样简单的显式公式固然最好；但许多组合序列（例如第 $n$ 个素数、整数分拆数、复杂图结构的计数）根本不存在简单的初等通项公式。

生成函数的核心思想是：**放弃孤立地追问单个** $a_n$ **是多少，而是以** $x^0, x^1, x^2, \dots$ **为夹子，把整个无穷序列打包挂到同一根“幂级数晾衣绳”** $A(x) = \sum_{n \ge 0} a_n x^n$ **上。哪怕单个系数** $a_n$ **难以直接求解，这根晾衣绳整体** $A(x)$ **往往却有着极其优美、紧凑的闭式表达！**

:::

例如，斐波那契数列满足 $F_{n+1} = F_n + F_{n-1} \ (n \ge 1; \ F_0 = 0, \ F_1 = 1)$。在生成函数学家眼中，“$F_n$ 是有理函数 $\frac{x}{1 - x - x^2}$ 在原点处幂级数展开的 $x^n$ 项系数”就已经是一个有效的表示。原因在于，一旦握住了这根“晾衣绳”，我们就能顺藤摸瓜完成以下 **7 大核心任务**：

1. **寻找精确通项公式（Exact Formula）**：通过部分分式分解（Partial Fractions）或泰勒级数展开直接读取 $a_n$。

2. **推导新的递推关系（Recurrence Formula）**：我们通常从递推式出发求生成函数，但反过来，通过对生成函数做代数变形或对数求导（如 1.6.1 节的 $x D \log$ 法），常常能发现意想不到的全新递推式。

3. **秒算均值、方差等统计特征（Statistical Properties）**：无需解出 $a_n$，直接在 $x=1$ 处对生成函数求导，即可瞬间导出随机变量的期望与方差（详见第 4.1 节）。

4. **推导渐近公式（Asymptotic Formulas）**：这是生成函数最深刻、最强大的威力所在。通过分析生成函数在复平面上距离原点最近的奇点（极点、代数支点或鞍点），几乎“目测”就能给出 $n \to \infty$ 时 $a_n$ 的主项量级（详见第 5 章）。

5. **证明单峰性与凹凸性（Unimodality & Convexity）**：组合序列常呈现“先单调递增、后单调递减”的单峰形态。通过分析生成多项式的零点分布（如负实根性质），可以轻松证明系数的对数凹性与单峰性（详见第 4.5 节）。

6. **机械化证明组合恒等式（Proving Identities）**：要证 $\sum_{j=0}^n \binom{n}{j}^2 = \binom{2n}{n}$，只需证明左右两侧对应的生成函数是同一个函数（详见第 4.3 节 Snake Oil 方法与 4.4 节 WZ 方法）。

7. **挖掘同余性质与未知问题间的隐秘等价（Congruences & Hidden Connections）**：两个表面毫无关联的组合问题，如果算出了相同的生成函数，无需知道通项即可断定它们的答案完全相等！

:::tip[学习重点]

- 把初值与递推关系转换成生成函数方程。
- 用移位、求导和系数提取还原数列，核对边界项。

:::

## 一、1.1 简单二项递推：基本方法（An Easy Two Term Recurrence）

考察递推关系：

$$

a_{n+1} = 2a_n + 1 \quad (n \ge 0; \ a_0 = 0)

$$

通过前几项 $0, 1, 3, 7, 15, 31, \dots$ 我们很容易猜出 $a_n = 2^n - 1$ 并用数学归纳法证明。但为了演示生成函数这套“重型机械”的威力，我们假装看不出规律，定义普通生成函数（OGF）：

$$

A(x) = \sum_{n \ge 0} a_n x^n

$$

### 第一步：两侧乘以 $x^n$ 并对有效范围求和

将递推式两侧同时乘以 $x^n$，并对递推式成立的所有指标 $n \ge 0$ 求和：

$$

\sum_{n \ge 0} a_{n+1} x^n = \sum_{n \ge 0} (2a_n + 1) x^n

$$

### 第二步：用未知函数 $A(x)$ 表出左右两侧

* **处理左侧（下标错位平移技巧）**：左侧级数 $\sum_{n \ge 0} a_{n+1} x^n = a_1 + a_2 x + a_3 x^2 + \dots$ 中，$a$ 的下标比 $x$ 的幂次恰好大 $1$。只需补上常数项 $a_0$ 再整体除以 $x$：

  $$

  \sum_{n \ge 0} a_{n+1} x^n = \frac{(a_0 + a_1 x + a_2 x^2 + \dots) - a_0}{x} = \frac{A(x) - a_0}{x} = \frac{A(x)}{x}

  $$

* **处理右侧（几何级数求和）**：利用熟悉的几何级数 $\sum_{n \ge 0} x^n = \frac{1}{1-x} \ (\vert{}x\vert{} < 1)$：

  $$

  \sum_{n \ge 0} (2a_n + 1) x^n = 2\sum_{n \ge 0} a_n x^n + \sum_{n \ge 0} x^n = 2A(x) + \frac{1}{1-x}

  $$

### 第三步：解代数方程并作部分分式展开

联立左右两侧：

$$

\frac{A(x)}{x} = 2A(x) + \frac{1}{1-x} \implies A(x) = \frac{x}{(1-x)(1-2x)}

$$

为了提取 $x^n$ 的系数，我们将有理分式拆成部分分式（Partial Fractions）：

$$

A(x) = x\left\{\frac{2}{1-2x} - \frac{1}{1-x}\right\} = x\left\{\sum_{n \ge 0} 2 \cdot 2^n x^n - \sum_{n \ge 0} x^n\right\} = \sum_{n \ge 1} (2^n - 1) x^n

$$

对比 $x^n$ 的系数，立得 $a_n = 2^n - 1 \ (n \ge 0)$。

## 二、1.2 进阶二项递推、微分算子与留数掩盖法（A Slightly Harder Two Term Recurrence）

现在增加难度，在递推式中加入关于 $n$ 的一次项：

$$

a_{n+1} = 2a_n + n \quad (n \ge 0; \ a_0 = 1)

$$

手算前几项为 $1, 2, 5, 12, 27, 58, 121, \dots$，已经很难一眼看出通项了。我们继续使用生成函数 $A(x) = \sum_{j \ge 0} a_j x^j$。

:::caution[细节铁律：绝不接受没有标明自由变量范围的递推式]
Wilf 特别强调：**“Don't settle for a recurrence that has an unqualified free variable.”** 在動手乘 $x^n$ 求和之前，第一步永远是确认递推式对哪些整数 $n$ 成立（本题为 $n = 0, 1, 2, \dots$），因为求和上下界完全由这个有效范围决定！

:::

两侧乘 $x^n$ 并对 $n \ge 0$ 求和：

* **左侧**：$\sum_{n \ge 0} a_{n+1} x^n = \frac{A(x) - a_0}{x} = \frac{A(x) - 1}{x}$。

* **右侧**：$2A(x) + \sum_{n \ge 0} n x^n$。

如何化简 $\sum_{n \ge 0} n x^n = x + 2x^2 + 3x^3 + \dots$？Wilf 介绍了全书你将使用“4993 次”的**算子** $x \frac{d}{dx}$ **技巧**：

:::important[核心算子技巧：用 $x \frac{d}{dx}$ 生成因子 $n$（Equation 1.3）]
对幂级数逐项求导 $\frac{d}{dx}$ 会把 $x^n$ 变成 $n x^{n-1}$（成功造出了系数 $n$，但幂次降低了 $1$），紧接着乘上 $x$ 就能把幂次恢复为 $x^n$！因此：

$$

\sum_{n \ge 0} n x^n = \sum_{n \ge 0} \left(x \frac{d}{dx}\right) x^n = x \frac{d}{dx} \left(\sum_{n \ge 0} x^n\right) = x \frac{d}{dx}\left(\frac{1}{1-x}\right) = \frac{x}{(1-x)^2}

$$

*注：在解析视角下该式要求* $\vert{}x\vert{} < 1$*；但在形式幂级数环（第 2.1 节）中，它是无需任何收敛条件的形式代数恒等式。*

:::

于是递推方程化为：

$$

\frac{A(x) - 1}{x} = 2A(x) + \frac{x}{(1-x)^2} \implies A(x) = \frac{1 - 2x + 2x^2}{(1-x)^2(1-2x)}

$$

### 部分分式分解的“快速掩盖与特值作弊法”

为了展开 $A(x)$，设其部分分式形式为：

$$

\frac{1 - 2x + 2x^2}{(1-x)^2(1-2x)} = \frac{A}{(1-x)^2} + \frac{B}{1-x} + \frac{C}{1-2x}

$$

:::tip[Heaviside 留数掩盖法 + 特值作弊法（Page 7–8）]
怎么最快求出待定常数 $A, B, C$？千万不要通分硬解三元线性方程组，按以下三步秒杀：

1. **求最高阶极点系数** $A$**（掩盖法）**：等式两侧同乘 $(1-x)^2$，然后直接令 $x = 1$，含 $B, C$ 的项全部乘 $0$ 消失，瞬间得到：

   $$

   A = \left.\frac{1 - 2x + 2x^2}{1 - 2x}\right\vert{}_{x=1} = \frac{1 - 2 + 2}{1 - 2} = -1

   $$

2. **求一阶极点系数** $C$**（掩盖法）**：等式两侧同乘 $(1-2x)$，然后令 $x = 1/2$，瞬间得到：

   $$

   C = \left.\frac{1 - 2x + 2x^2}{(1-x)^2}\right\vert{}_{x=1/2} = \frac{1 - 1 + 1/2}{(1/2)^2} = 2

   $$

3. **求次高阶系数** $B$**（特值作弊法）**：由于 $B$ 乘 $(1-x)$ 无法消去分母 $(1-x)^2$，我们直接选一个最简单的 $x$ 值——**令** $x = 0$ **代入原恒等式**！利用已知的 $A = -1, \ C = 2$：

   $$

   \frac{1}{1 \cdot 1} = A + B + C = -1 + B + 2 \implies B = 0

   $$

:::

代回得 $A(x) = \frac{-1}{(1-x)^2} + \frac{2}{1-2x}$。由于 $[x^n] \frac{1}{(1-x)^2} = n + 1$（由式 1.3 两端除以 $x$ 可知），且 $[x^n] \frac{2}{1-2x} = 2^{n+1}$，立即合并得出精确通项：

$$

a_n = 2^{n+1} - n - 1 \quad (n = 0, 1, 2, \dots)

$$

### 系数提取算子 $[x^n]$ 与“Wilf 六步法”总结（Section 1.2.1）

为了节省笔墨，定义**系数提取算子（Definition 1.1）**：记 $[x^n] f(x)$ 为级数 $f(x)$ 中 $x^n$ 的系数。例如：

$$

[x^n] e^x = \frac{1}{n!}, \qquad [t^r] \left\{\frac{1}{1-3t}\right\} = 3^r, \qquad [u^m] (1+u)^s = \binom{s}{m}

$$

它具有两条贯穿全书的核心运算法则（式 1.8 与 1.9）：

$$

[x^n] \left\{x^a f(x)\right\} = [x^{n-a}] f(x), \qquad [\beta x^n] f(x) = \frac{1}{\beta} [x^n] f(x)

$$

（注意第二条：例如 $[x^n / n!] e^x = n! [x^n] e^x = 1$，这在指数生成函数 EGF 中极其关键！）

:::note[The Method：生成函数求解递推关系的六步标准程序（Section 1.2.1）]
1. **明确自由变量范围**：确保递推式成立的下标集合（如 $n \ge 0$ 或 $n \ge 1$）已被清晰界定。

2. **命名并写出生成函数**：设未知序列的生成函数为 $A(x) = \sum_{n \ge 0} a_n x^n$。

3. **同乘** $x^n$ **并全范围求和**：在递推式两侧同乘 $x^n$，并对第 1 步确定的所有有效 $n$ 求和。

4. **化归为** $A(x)$ **的显式方程**：将等式两边的所有级数和都用 $A(x)$ 及其导数、位移表示出来。

5. **解出生成函数** $A(x)$：求解代数（或微分）方程得到 $A(x)$。

6. **展开提取通项系数**：若需要显式公式，将有理函数 $A(x)$ 展为部分分式，再逐项展开读取 $[x^n] A(x)$。

:::

## 三、1.3 三项递推与斐波那契渐近取整（A Three Term Recurrence）

考察斐波那契递推关系：

$$

F_{n+1} = F_n + F_{n-1} \quad (n \ge 1; \ F_0 = 0, \ F_1 = 1)

$$

设 $F(x) = \sum_{n \ge 0} F_n x^n$。两侧同乘 $x^n$ 并对 $n \ge 1$ 求和：

* **左侧**：$F_2 x + F_3 x^2 + F_4 x^3 + \dots = \frac{F(x) - F_0 - F_1 x}{x} = \frac{F(x) - x}{x}$。

* **右侧**：$(F_1 x + F_2 x^2 + \dots) + (F_0 x + F_1 x^2 + \dots) = (F(x) - F_0) + x F(x) = F(x) + x F(x)$。

联立得 $\frac{F(x) - x}{x} = F(x) + x F(x)$，解出：

$$

F(x) = \frac{x}{1 - x - x^2}

$$

要对二次分母 $1 - x - x^2$ 做部分分式分解，将其因式分解为一次因式之积：

$$

1 - x - x^2 = (1 - x r_+)(1 - x r_-), \qquad r_{\pm} = \frac{1 \pm \sqrt{5}}{2}

$$

（技巧：把分母写成 $(1 - x r_+)(1 - x r_-)$ 而不是 $(x - x_1)(x - x_2)$，此时 $r_+, r_-$ 正好是特征方程 $r^2 - r - 1 = 0$ 的特征根，展开成几何级数 $\sum (r_{\pm} x)^j$ 时无需再倒换系数！）

利用部分分式拆解：

$$

\frac{x}{(1 - x r_+)(1 - x r_-)} = \frac{1}{r_+ - r_-}\left(\frac{1}{1 - x r_+} - \frac{1}{1 - x r_-}\right) = \frac{1}{\sqrt{5}}\left\{\sum_{j \ge 0} r_+^j x^j - \sum_{j \ge 0} r_-^j x^j\right\}

$$

提取 $[x^n]$ 立得 Binet 公式：

$$

F_n = \frac{1}{\sqrt{5}}\left(r_+^n - r_-^n\right) \quad (n = 0, 1, 2, \dots)

$$

:::tip[渐近近似反哺精确计算：为什么有精确公式还要看渐近？]
当 $n$ 很大时，由于 $r_+ = \frac{1+\sqrt{5}}{2} \approx 1.618 > 1$，而 $\vert{}r_-\vert{} = \frac{\sqrt{5}-1}{2} \approx 0.618 < 1$，第二项以指数级衰减，故有渐近近似：

$$

F_n \sim \frac{1}{\sqrt{5}}\left(\frac{1+\sqrt{5}}{2}\right)^n

$$

不仅如此，注意到对一切 $n \ge 0$，被忽略的误差项满足 $\left\vert{}\frac{r_-^n}{\sqrt{5}}\right\vert{} \le \frac{1}{\sqrt{5}} \approx 0.4472 < 0.5$！这意味着 $F_n$ **精确等于离** $\frac{1}{\sqrt{5}}\left(\frac{1+\sqrt{5}}{2}\right)^n$ **最近的那个整数**。考察渐近公式反而帮我们消除了无理数减法，得到了更简洁的精确公式！

:::

## 四、1.4 三项边值问题与三次样条插值（A Three Term Boundary Value Problem）

前面的递推都是“初值问题”（给定 $a_0, a_1$ 可以一路顺推）。但如果给定的是**两端边界值**（例如已知 $F_0 = 1$ 和 $F_{735} = 1$），你无法直接递推算出 $F_2$，因为缺少启动递推的相邻第二项 $F_1$！

考察一般的三项边值问题（Boundary Value Problem）：

$$

a u_{n+1} + b u_n + c u_{n-1} = d_n \quad (n = 1, 2, \dots, N-1; \ u_0 = u_N = 0)

$$

其中正整数 $N$、常数 $a, b, c$ 以及序列 $\{d_n\}_{n=1}^{N-1}$ 均已知。

### 第一步：构造有限生成多项式并求和

定义未知多项式 $U(x) = \sum_{j=0}^N u_j x^j = \sum_{j=1}^{N-1} u_j x^j$（因为 $u_0 = u_N = 0$），以及已知多项式 $D(x) = \sum_{j=1}^{N-1} d_j x^j$（注意 $d_0, d_N$ 根本不出现在有效范围 $1 \le n \le N-1$ 的方程中，故无需定义）。

将递推式两侧同乘 $x^n$ 并对 $n = 1, 2, \dots, N-1$ 求和：

$$

a \sum_{n=1}^{N-1} u_{n+1} x^n + b \sum_{n=1}^{N-1} u_n x^n + c \sum_{n=1}^{N-1} u_{n-1} x^n = \sum_{n=1}^{N-1} d_n x^n

$$

仔细核对每一项与 $U(x) = u_1 x + u_2 x^2 + \dots + u_{N-1} x^{N-1}$ 的关系（利用 $u_0 = u_N = 0$）：

* $\sum_{n=1}^{N-1} u_{n+1} x^n = u_2 x + \dots + u_{N-1} x^{N-2} + u_N x^{N-1} = \frac{1}{x}\left\{U(x) - u_1 x\right\}$

* $\sum_{n=1}^{N-1} u_n x^n = U(x)$

* $\sum_{n=1}^{N-1} u_{n-1} x^n = u_0 x + u_1 x^2 + \dots + u_{N-2} x^{N-1} = x\left\{U(x) - u_{N-1} x^{N-1}\right\}$

代入后两侧同乘 $x$，整理得到核心方程（式 1.15）：

$$

\left\{a + bx + cx^2\right\} U(x) = x\left\{D(x) + a u_1 + c u_{N-1} x^N\right\}

$$

### 第二步：用核方法（多项式零点消去）反解未知边界项 $u_1, u_{N-1}$

:::important[精妙绝伦的零点代入法（Equation 1.16）]
在式 (1.15) 中，$U(x)$ 的表达式里还残留着两个未知数 $u_1$ 和 $u_{N-1}$。怎么求它们？

设左侧二次多项式 $a + bx + cx^2 = 0$ 的两个根为 $r_+$ 和 $r_-$（假设 $r_+^N \neq r_-^N$）。由于 $U(x)$ 是一个有限次多项式，它在 $x = r_{\pm}$ 处的值必然是有限实数/复数！因此当令 $x = r_+$ 和 $x = r_-$ 时，式 (1.15) 左侧恒为 $0$，从而右侧括号也必须为 $0$：

$$

\begin{cases} a u_1 + (c r_+^N) u_{N-1} = -D(r_+) \\ a u_1 + (c r_-^N) u_{N-1} = -D(r_-) \end{cases}

$$

这是一个关于 $u_1, u_{N-1}$ 的二元一次方程组！解出 $u_1, u_{N-1}$ 后代回式 (1.15)，整个生成多项式 $U(x)$ 就被彻底确定了！（若出现重根 $r_+ = r_-$，只需对式 1.15 先求导再代入 $x = r_+$ 即可得到第二个方程。）

:::

### 工程与计算机图形学应用：三次样条插值（Cubic Spline Interpolation）

给定等距节点 $t_i = t_0 + i h \ (0 \le i \le n)$ 上的函数值 $y_0, y_1, \dots, y_n$，我们要构造一条全局二阶连续可导（$S, S', S''$ 均连续）的分段三次多项式曲线 $S(x)$（在每个子区间 $[t_i, t_{i+1}]$ 上为三次多项式 $S_i(x)$），满足插值条件 $S(t_i) = y_i$ 以及自然边界条件（两端拐点 $S''(t_0) = S''(t_n) = 0$）。

记节点处的二阶导数值为 $z_i = S''(t_i) \ (z_0 = z_n = 0)$，则每段三次样条显式为（式 1.19）：

$$

S_i(x) = \frac{1}{6h}\left(z_i(t_{i+1}-x)^3 + z_{i+1}(x-t_i)^3 + (6y_{i+1} - h^2 z_{i+1})(x-t_i) + (6y_i - h^2 z_i)(t_{i+1}-x)\right)

$$

而一阶导数连续性条件 $S'_{i-1}(t_i) = S'_i(t_i)$ 恰好归结为关于 $\{z_i\}$ 的三项边值问题（式 1.20）：

$$

z_{i-1} + 4z_i + z_{i+1} = \frac{6}{h^2}(y_{i+1} - 2y_i + y_{i-1}) \quad (i = 1, 2, \dots, n-1; \ z_0 = z_n = 0)

$$

这里 $(a, b, c) = (1, 4, 1)$，二次方程 $1 + 4x + x^2 = 0$ 的两根为 $r_{\pm} = -2 \pm \sqrt{3}$。定义已知多项式 $D(x) = \frac{6}{h^2}\sum_{i=1}^{n-1}(y_{i+1} - 2y_i + y_{i-1})x^i$，由式 (1.15)–(1.16) 立得：

$$

U(x) = \sum_{i=1}^{n-1} z_i x^i = \frac{x(D(x) + z_1 + z_{n-1} x^n)}{1 + 4x + x^2}, \qquad \begin{cases} z_1 + (\sqrt{3}-2)^n z_{n-1} = -D(\sqrt{3}-2) \\ z_1 + (-\sqrt{3}-2)^n z_{n-1} = -D(-\sqrt{3}-2) \end{cases}

$$

* **具体数值算例（Example 1.2）**：在区间 $[0, 5]$（$h=1, \ n=5$）上用自然三次样条拟合 $y_i = 2^i \ (0 \le i \le 5)$。此时 $y_{i+1}-2y_i+y_{i-1} = 2^{i-1}$，故 $D(x) = 6x(1 + 2x + 4x^2 + 8x^3)$。解线性方程组得 $z_1 = \frac{204}{209}, \ z_4 = \frac{2370}{209}$，代回多项式除法即得：

  $$

  U(x) = \frac{204}{209}x + \frac{438}{209}x^2 + \frac{552}{209}x^3 + \frac{2370}{209}x^4

  $$

  从而在 $[0, 1]$ 上的首段样条为 $S_0(x) = 1 + \frac{175}{209}x + \frac{34}{209}x^3$。

* **样条数值积分公式（式 1.24 & 1.25）**：将 $S_i(x)$ 在 $[t_i, t_{i+1}]$ 上积分可得：

  $$

  \int_{t_i}^{t_{i+1}} S_i(x)dx = \frac{h}{2}(y_i + y_{i+1}) - \frac{h^3}{24}(z_i + z_{i+1})

  $$

  对 $i=0, \dots, n-1$ 求和，并利用 $z_{i-1}+4z_i+z_{i+1} = \frac{6}{h^2}(y_{i+1}-2y_i+y_{i-1})$ 消去中间的 $z_i$，得到带三阶端点修正的复合梯形求积公式：

  $$

  \int_0^{nh} S(x)dx = \text{trap} - \frac{h}{12}(y_0 - y_1 - y_{n-1} + y_n) - \frac{h^3}{72}(z_1 + z_{n-1})

  $$

## 五、1.5 两个独立变量与广义二项式系数（Two Independent Variables）

从集合 $\{1, 2, \dots, n\}$ 中选出 $k$ 元子集的方案数 $f(n, k)$，按子集是否包含最大元素 $n$ 分为两堆：包含 $n$ 的有 $f(n-1, k-1)$ 个，不包含 $n$ 的有 $f(n-1, k)$ 个，故满足帕斯卡递推：

$$

f(n, k) = f(n-1, k) + f(n-1, k-1) \quad (f(n, 0) = 1)

$$

对每个固定的 $n \ge 0$，定义行生成函数 $B_n(x) = \sum_{k \ge 0} f(n, k) x^k$。递推式两边乘 $x^k$ 对 $k \ge 1$ 求和得 $B_n(x) - 1 = (B_{n-1}(x) - 1) + x B_{n-1}(x)$，即 $B_n(x) = (1+x)B_{n-1}(x)$。结合 $B_0(x) = 1$ 立得 $B_n(x) = (1+x)^n$，由泰勒公式求导得：

$$

\binom{n}{k} = \frac{n!}{k!(n-k)!} = \frac{n(n-1)(n-2)\cdots(n-k+1)}{k!}

$$

### 广义二项式系数及其支撑集（Support）

注意上式最右端的下降阶乘形式 $\frac{n(n-1)\cdots(n-k+1)}{k!}$ 对**任意复数** $n \in \mathbb{C}$（只要 $k$ 是非负整数）都完全有意义！例如：

$$

\binom{-3}{3} = \frac{(-3)(-4)(-5)}{6} = -10, \qquad \binom{i}{2} = \frac{i(i-1)}{2} = \frac{-1-i}{2}

$$

当 $k < 0$ 为负整数时，规定 $\binom{n}{k} = 0$。

:::important[二项式系数的支撑集（Support）与两大求和约定（Convention 1.3 & 1.4）]
$\binom{n}{k} \neq 0$ 的充要条件是什么？

1. 首先必须有整数 $k \ge 0$。

2. 若 $n$ **不是**非负整数（例如负整数、分数或虚数），则对一切整数 $k \ge 0$ 都有 $\binom{n}{k} \neq 0$。

3. 若 $n$ **是**非负整数，则 $\binom{n}{k} \neq 0 \iff 0 \le k \le n$。

   这意味着二项式系数自己会“自动截断（cut off）”越界的求和项！因此全书确立两条极其省力的约定：

* **Convention 1.3**：当求和变量未标明上下界时（如 $\sum_k$），默认从 $-\infty$ 求和到 $+\infty$。

* **Convention 1.4**：当方程中的自由变量未标明范围时，默认对所有整数成立。

:::

### 二元生成函数与横纵双公式（Equation 1.31）

将 $B_n(x) = (1+x)^n$ 乘以 $y^n$ 并对 $n \ge 0$ 求和，得到二元生成函数：

$$

\sum_{n \ge 0} \sum_k \binom{n}{k} x^k y^n = \sum_{n \ge 0} (1+x)^n y^n = \frac{1}{1 - y(1+x)}

$$

从而 $\binom{n}{k} = [x^k y^n] (1 - y(1+x))^{-1}$。如果我们先提取 $[x^k]$ 来计算列生成函数 $\sum_n \binom{n}{k} y^n$：

$$

\sum_n \binom{n}{k} y^n = [x^k] \frac{1}{1 - y(1+x)} = \frac{1}{1-y} [x^k] \frac{1}{1 - \left(\frac{y}{1-y}\right)x} = \frac{1}{1-y}\left(\frac{y}{1-y}\right)^k = \frac{y^k}{(1-y)^{k+1}}

$$

将这两个二项式系数的核心生成函数并列铭记（式 1.31）：

$$

\sum_k \binom{n}{k} x^k = (1+x)^n, \qquad \sum_n \binom{n}{k} y^n = \frac{y^k}{(1-y)^{k+1}}

$$

## 六、1.6 第二类斯特林数、贝尔数与 $x D \log$ 法（Another 2-Variable Case）

将 $n$ 元集合 $[n] = \{1, 2, \dots, n\}$ 划分为 $k$ 个非空、两两不相交的等价类（集合划分 Set Partition，类内与类间均无序）的方案数记为**第二类斯特林数（Stirling Number of the Second Kind）** $\begin{Bmatrix} n \\ k \end{Bmatrix}$。例如 $[4]$ 划分为 $2$ 个类的全部 $7$ 种方案为：

$$

\{12\}\{34\};\ \{13\}\{24\};\ \{14\}\{23\};\ \{123\}\{4\};\ \{124\}\{3\};\ \{134\}\{2\};\ \{1\}\{234\} \implies \begin{Bmatrix} 4 \\ 2 \end{Bmatrix} = 7

$$

### 第一步：组合分类导出递推关系

将 $[n]$ 的所有 $\begin{Bmatrix} n \\ k \end{Bmatrix}$ 个 $k$-划分分成两堆：

* **第一堆（元素** $n$ **独自成一类** $\{n\}$**）**：抹去 $\{n\}$ 后，恰好剩下 $[n-1]$ 的全部 $(k-1)$-划分，共有 $\begin{Bmatrix} n-1 \\ k-1 \end{Bmatrix}$ 个。

* **第二堆（元素** $n$ **与其他元素在同一类）**：从每个划分中抹去元素 $n$，类的个数依然是 $k$，得到 $[n-1]$ 的 $k$-划分；但反过来，把 $n$ 放回 $[n-1]$ 的任意一个 $k$-划分中时，$n$ 可以选择加入 $k$ 个现有类中的任意一个，故每个 $[n-1]$ 的 $k$-划分恰好重复出现了 $k$ 次！因此第二堆共有 $k \begin{Bmatrix} n-1 \\ k \end{Bmatrix}$ 个。

规定边界条件：当 $k > n$ 或 $n < 0$ 或 $k < 0$ 时 $\begin{Bmatrix} n \\ k \end{Bmatrix} = 0$，当 $n \neq 0$ 时 $\begin{Bmatrix} n \\ 0 \end{Bmatrix} = 0$，且 $\begin{Bmatrix} 0 \\ 0 \end{Bmatrix} = 1$。则递推式为（式 1.34）：

$$

\begin{Bmatrix} n \\ k \end{Bmatrix} = \begin{Bmatrix} n-1 \\ k-1 \end{Bmatrix} + k \begin{Bmatrix} n-1 \\ k \end{Bmatrix} \quad \left((n, k) \neq (0, 0); \ \begin{Bmatrix} 0 \\ 0 \end{Bmatrix} = 1\right)

$$

### 第二步：三种生成函数候选方案的对比与抉择

面对二元序列 $\begin{Bmatrix} n \\ k \end{Bmatrix}$，我们有三个自然的生成函数方向（式 1.35）：

$$

A_n(y) = \sum_k \begin{Bmatrix} n \\ k \end{Bmatrix} y^k, \qquad B_k(x) = \sum_n \begin{Bmatrix} n \\ k \end{Bmatrix} x^n, \qquad C(x, y) = \sum_{n, k} \begin{Bmatrix} n \\ k \end{Bmatrix} x^n y^k

$$

:::warning[战略直觉：先算 $B_k(x)$ 还是先算 $A_n(y)$？]
观察递推式右侧的第二项 $k \begin{Bmatrix} n-1 \\ k \end{Bmatrix}$：系数里带有一个变量因子 $k$！

* 如果固定 $n$ 对 $k$ 乘 $y^k$ 求和（求 $A_n(y)$），因子 $k$ 与求和指标绑定，会迫使我们引入微分算子 $y \frac{d}{dy}$；

* 如果**固定** $k$ **对** $n$ **乘** $x^n$ **求和（求** $B_k(x)$**）**，因子 $k$ 与求和指标 $n$ 无关，可以直接提到求和号外面当常数！

  因此，求显式通项时，**选择** $B_k(x)$ **是压倒性的捷径**！

:::

#### 路线 A：用列生成函数 $B_k(x)$ 与部分分式求显式通项

将式 (1.34) 两侧乘 $x^n$ 并对 $n$ 求和（$k \ge 1$）：

$$

B_k(x) = x B_{k-1}(x) + k x B_k(x) \implies B_k(x) = \frac{x}{1 - kx} B_{k-1}(x) \quad (k \ge 1; \ B_0(x) = 1)

$$

连乘递推立刻得到（式 1.36）：

$$

B_k(x) = \sum_n \begin{Bmatrix} n \\ k \end{Bmatrix} x^n = \frac{x^k}{(1 - x)(1 - 2x)(1 - 3x)\cdots(1 - kx)} \quad (k \ge 0)

$$

为了提取 $[x^n] B_k(x) = [x^{n-k}] \frac{1}{(1-x)(1-2x)\cdots(1-kx)}$，将其展为部分分式 $\sum_{j=1}^k \frac{\alpha_j}{1 - jx}$。使用留数掩盖法（两侧同乘 $1 - rx$ 后令 $x = 1/r$）：

$$

\alpha_r = \frac{1}{\prod_{j \neq r} (1 - j/r)} = \frac{r^{k-1}}{\prod_{j=1}^{r-1}(r-j) \prod_{j=r+1}^k (r-j)} = (-1)^{k-r} \frac{r^{k-1}}{(r-1)!(k-r)!}

$$

因此提取 $[x^{n-k}]$ 立得第二类斯特林数的显式通项公式（式 1.38）：

$$

\begin{Bmatrix} n \\ k \end{Bmatrix} = \sum_{r=1}^k \alpha_r r^{n-k} = \sum_{r=1}^k (-1)^{k-r} \frac{r^n}{r!(k-r)!} = \frac{1}{k!} \sum_{r=1}^k (-1)^{k-r} \binom{k}{r} r^n \quad (n, k \ge 0)

$$

（特例检验：当 $k=2$ 时，公式给出 $\begin{Bmatrix} n \\ 2 \end{Bmatrix} = 2^{n-1} - 1$，组合意义是除全集外有 $2^n - 2$ 个非空真子集，无序配对除以 $2$ 即 $2^{n-1}-1$。）

#### 路线 B：行生成函数 $A_n(y)$ 与微分算子迭代

如果我们迎难而上，固定 $n > 0$ 对 $k$ 乘 $y^k$ 求和，会得到什么？

$$

A_n(y) = y A_{n-1}(y) + \left(y \frac{d}{dy}\right) A_{n-1}(y) = \left\{y(1 + D_y)\right\} A_{n-1}(y) \implies A_n(y) = \left\{y + y D_y\right\}^n 1

$$

虽然这个算子公式不便直接写出通项，但在第 4.5 节中，我们将利用 $e^y A_n(y) = y (e^y A_{n-1}(y))'$ 与罗尔定理，极其轻松地证明 $A_n(y)$ 的所有根都是负实数，从而证明 $\begin{Bmatrix} n \\ k \end{Bmatrix}$ 关于 $k$ 是对数凹且单峰的！

### 第三步：贝尔数（Bell Numbers）、Dobinski 公式与 EGF

将集合 $[n]$ 划分为任意个非空子集的总方案数称为**贝尔数** $b(n) = \sum_{k=1}^n \begin{Bmatrix} n \\ k \end{Bmatrix} \ (b(0) = 1)$，前几项为 $1, 1, 2, 5, 15, 52, \dots$。

:::important[神来之笔：公式 (1.38) 自己知道当 $k > n$ 时结果为 0！]
注意式 (1.38) 对**一切正整数** $n, k$ 都成立，哪怕 $k > n$（比如把 $n=13, k=19$ 代入那串庞大的交错和，它自己会精确抵消算得 $0$）！

因此，在计算 $b(n) = \sum_{k=1}^n \begin{Bmatrix} n \\ k \end{Bmatrix}$ 时，我们可以把求和上限 $n$ 替换为任意充分大的整数 $M \ge n$，然后令 $M \to \infty$：

$$

b(n) = \lim_{M \to \infty} \sum_{k=1}^M \sum_{r=1}^k (-1)^{k-r} \frac{r^{n-1}}{(r-1)!(k-r)!} = \sum_{r=1}^\infty \frac{r^{n-1}}{(r-1)!} \left\{\sum_{s=0}^\infty \frac{(-1)^s}{s!}\right\} = \frac{1}{e} \sum_{r \ge 0} \frac{r^n}{r!} \quad (n \ge 0)

$$

这就是著名的 **Dobinski 公式（Equation 1.41）**！

:::

接下来，定义贝尔数的**指数生成函数（Exponential Generating Function, EGF）** $B(x) = \sum_{n \ge 0} b(n) \frac{x^n}{n!}$。将 Dobinski 公式代入并对 $n \ge 1$ 求和：

$$

B(x) - 1 = \frac{1}{e} \sum_{n \ge 1} \frac{x^n}{n!} \sum_{r \ge 1} \frac{r^{n-1}}{(r-1)!} = \frac{1}{e} \sum_{r \ge 1} \frac{1}{r!} \sum_{n \ge 1} \frac{(rx)^n}{n!} = \frac{1}{e} \sum_{r \ge 1} \frac{e^{rx} - 1}{r!} = \frac{1}{e}\left(e^{e^x} - e\right) = e^{e^x - 1} - 1

$$

由此证得 **定理 1.5**：贝尔数的指数生成函数是极其优美的双层指数：

$$

B(x) = \sum_{n \ge 0} \frac{b(n)}{n!} x^n = e^{e^x - 1}

$$

### 第四步：$x(d/dx)\log$ 操作——从生成函数反推递推式（Section 1.6.1）

如果已知生成函数（特别是含指数 $\exp$ 或无穷乘积的生成函数），如何反向导出系数满足的递推关系？Wilf 总结了标准的 $x(d/dx)\log$ **四步程序**：

:::note[The $x(d/dx)\log$ Operation 标准四步法]
1. **两边取对数（Take log）**：把复杂的指数嵌套 $e^{e^x-1}$ 或无穷乘积瞬间拆解为简单函数。代价是左侧变成了 $\log\left(\sum \dots\right)$。

2. **求导并同乘** $x$**（Differentiate & multiply by** $x$**）**：将左侧“和的对数”变成“两个和的比值” $\frac{x B'(x)}{B(x)}$，乘 $x$ 是为了补偿求导损失的幂次。

3. **去分母（Clear fractions）**：把分母乘到右侧，变成两个幂级数的乘积。

4. **对比** $x^n$ **系数（Equate coefficients）**：利用级数乘法法则直接读出递推关系！

:::

对 $\sum_{n \ge 0} \frac{b(n)}{n!} x^n = e^{e^x - 1}$ 执行这四步：

$$

\log\left\{\sum_{n \ge 0} \frac{b(n)}{n!} x^n\right\} = e^x - 1 \xrightarrow{x\frac{d}{dx}} \frac{\sum_n \frac{n b(n) x^n}{n!}}{\sum_n \frac{b(n) x^n}{n!}} = x e^x \implies \sum_n \frac{n b(n) x^n}{n!} = (x e^x) \sum_k \frac{b(k) x^k}{k!}

$$

展开右侧乘积 $x \left(\sum_{j \ge 0} \frac{x^j}{j!}\right)\left(\sum_{k \ge 0} \frac{b(k) x^k}{k!}\right)$，对比两侧 $x^n/n!$（或先除 $x$ 再对比 $x^{n-1}/(n-1)!$）的系数，立得贝尔数递推公式（式 1.44）：

$$

b(n) = \sum_k \binom{n-1}{k} b(k) \quad (n \ge 1; \ b(0) = 1)

$$

*（思考：许多时候生成函数能直接算出递推式，之后我们才能反过来找到它的组合解释——见下方习题 1.7！）*

## 七、1.7 第 1 章课后习题解答（Exercises and Solutions）

本节收录《generatingfunctionology》第 1.7 节的全部课后习题（第 1 至 21 题，原书排版无第 20 题），每道小题均配有完整推导与隐藏答案。

### Exercise 1：求基本数列的普通生成函数（OGF）

**题目**：对下列所有定义在 $n \ge 0$ 上的序列，求其闭式普通生成函数（OGF）：

* **(a)** $a_n = n$

* **(b)** $a_n = \alpha n + \beta$

* **(c)** $a_n = n^2$

* **(d)** $a_n = \alpha n^2 + \beta n + \gamma$

* **(e)** $a_n = P(n)$，其中 $P$ 是给定的 $m$ 次多项式

* **(f)** $a_n = 3^n$

* **(g)** $a_n = 5 \cdot 7^n - 3 \cdot 4^n$

**解答**：

* **(a)** :spoiler[对几何级数 $\sum_{n \ge 0} x^n = \frac{1}{1-x}$ 作用一次算子 $x D = x \frac{d}{dx}$，得 $(xD)\left(\frac{1}{1-x}\right) = \frac{x}{(1-x)^2}$。]

* **(b)** :spoiler[由线性性，结合 (a) 与 $\sum_{n \ge 0} x^n = \frac{1}{1-x}$，得 $(\alpha x D + \beta)\left(\frac{1}{1-x}\right) = \frac{\alpha x}{(1-x)^2} + \frac{\beta}{1-x} = \frac{\beta + (\alpha - \beta)x}{(1-x)^2}$。]

* **(c)** :spoiler[对 $\frac{1}{1-x}$ 连续作用两次 $x D$ 算子：$(xD)^2\left(\frac{1}{1-x}\right) = x \frac{d}{dx}\left(\frac{x}{(1-x)^2}\right) = \frac{x(1+x)}{(1-x)^3}$。]

* **(d)** :spoiler[利用线性组合得 $(\alpha (xD)^2 + \beta x D + \gamma)\left(\frac{1}{1-x}\right) = \frac{\alpha x(1+x)}{(1-x)^3} + \frac{\beta x}{(1-x)^2} + \frac{\gamma}{1-x}$。]

* **(e)** :spoiler[因为 $(xD)^k\left(\frac{1}{1-x}\right) = \sum_{n \ge 0} n^k x^n$，由算子多项式线性性立得 $P(xD)\left(\frac{1}{1-x}\right)$（也可将 $P(n)$ 用下降阶乘或 $\binom{n+k}{k}$ 基底展开为 $\sum_{k=0}^m \frac{c_k}{(1-x)^{k+1}}$）。]

* **(f)** :spoiler[公比为 $3x$ 的几何级数：$\sum_{n \ge 0} (3x)^n = \frac{1}{1-3x}$。]

* **(g)** :spoiler[拆为两个几何级数之差：$5\sum_{n \ge 0} (7x)^n - 3\sum_{n \ge 0} (4x)^n = \frac{5}{1-7x} - \frac{3}{1-4x}$。]

### Exercise 2：求基本数列的指数生成函数（EGF）

**题目**：对 Exercise 1 中的每一个序列（(a) 至 (g)），求其闭式指数生成函数（EGF）。

**解答**：

* **(a)** :spoiler[由于 $\sum_{n \ge 0} \frac{x^n}{n!} = e^x$，乘以 $n$ 对应作用 $xD$ 算子，故 EGF 为 $(xD)e^x = x e^x$。]

* **(b)** :spoiler[$(\alpha x D + \beta)e^x = (\alpha x + \beta)e^x$。]

* **(c)** :spoiler[$(xD)^2 e^x = x \frac{d}{dx}(x e^x) = (x + x^2)e^x$。]

* **(d)** :spoiler[$(\alpha (xD)^2 + \beta x D + \gamma)e^x = (\alpha x^2 + (\alpha + \beta)x + \gamma)e^x$。]

* **(e)** :spoiler[$P(xD)e^x$（若将 $P(n)$ 表为下降阶乘之和 $\sum_{k=0}^m c_k n^{\underline{k}}$，则可显式写为 $\left(\sum_{k=0}^m c_k x^k\right)e^x$）。]

* **(f)** :spoiler[$\sum_{n \ge 0} \frac{(3x)^n}{n!} = e^{3x}$。]

* **(g)** :spoiler[$5 e^{7x} - 3 e^{4x}$。]

### Exercise 3：序列变换对普通生成函数（OGF）的影响

**题目**：设 $f(x) = \sum_{n \ge 0} a_n x^n$ 是序列 $\{a_n\}_{n \ge 0}$ 的 OGF，用 $f(x)$ 简洁表示下列序列（$n = 0, 1, 2, \dots$）的 OGF：

* **(a)** $\{a_n + c\}$

* **(b)** $\{\alpha a_n + c\}$

* **(c)** $\{n a_n\}$

* **(d)** $\{P(n) a_n\}$（$P$ 为给定多项式）

* **(e)** $0, a_1, a_2, a_3, \dots$

* **(f)** $0, 0, 1, a_3, a_4, a_5, \dots$

* **(g)** $a_0, 0, a_2, 0, a_4, 0, a_6, 0, \dots$

* **(h)** $a_1, a_2, a_3, \dots$

* **(i)** $\{a_{n+h}\}$（$h$ 为给定正整数常数）

* **(j)** $\{a_{n+2} + 3a_{n+1} + a_n\}$

* **(k)** $\{a_{n+2} - a_{n+1} - a_n\}$

**解答**：

* **(a)** :spoiler[$f(x) + \frac{c}{1-x}$。]

* **(b)** :spoiler[$\alpha f(x) + \frac{c}{1-x}$。]

* **(c)** :spoiler[$x D f(x) = x f'(x)$。]

* **(d)** :spoiler[$P(xD) f(x)$。]

* **(e)** :spoiler[将 $n=0$ 项置 $0$，即减去常数项 $a_0$：$f(x) - a_0$。]

* **(f)** :spoiler[将前 3 项替换为 $0, 0, 1$，需减去原有的前 3 项再加上 $x^2$：$f(x) - a_0 - a_1 x + (1 - a_2)x^2$。]

* **(g)** :spoiler[利用单位根偶次筛选消去奇次项：$\frac{f(x) + f(-x)}{2}$。]

* **(h)** :spoiler[下标左移 1 位：$\frac{f(x) - a_0}{x}$。]

* **(i)** :spoiler[下标左移 $h$ 位：$\frac{f(x) - \sum_{j=0}^{h-1} a_j x^j}{x^h}$。]

* **(j)** :spoiler[由 (h) 和 (i) 线性叠加：$\frac{f(x) - a_0 - a_1 x}{x^2} + 3\frac{f(x) - a_0}{x} + f(x)$。]

* **(k)** :spoiler[$\frac{f(x) - a_0 - a_1 x}{x^2} - \frac{f(x) - a_0}{x} - f(x)$。]

### Exercise 4：序列变换对指数生成函数（EGF）的影响

**题目**：设 $f(x) = \sum_{n \ge 0} a_n \frac{x^n}{n!}$ 是序列 $\{a_n\}$ 的 EGF，对 Exercise 3 中的每个序列（(a) 至 (k)），用 $f(x)$ 表示其 EGF。

**解答**：

* **(a)** :spoiler[$f(x) + c e^x$。]

* **(b)** :spoiler[$\alpha f(x) + c e^x$。]

* **(c)** :spoiler[$x f'(x)$。]

* **(d)** :spoiler[$P(xD) f(x)$。]

* **(e)** :spoiler[$f(x) - a_0$。]

* **(f)** :spoiler[注意 $x^2$ 项在 EGF 中带分母 $2!$，故为 $f(x) - a_0 - a_1 x + (1 - a_2)\frac{x^2}{2!}$。]

* **(g)** :spoiler[$\frac{f(x) + f(-x)}{2}$。]

* **(h)** :spoiler[EGF 下标左移 1 位即求一阶导数：$f'(x)$。]

* **(i)** :spoiler[EGF 下标左移 $h$ 位即求 $h$ 阶导数：$D^h f(x) = f^{(h)}(x)$。]

* **(j)** :spoiler[$f''(x) + 3f'(x) + f(x)$。]

* **(k)** :spoiler[$f''(x) - f'(x) - f(x)$。]

### Exercise 5：系数提取算子实战计算

**题目**：求下列各项的值：

* **(a)** $[x^n] e^{2x}$

* **(b)** $[x^n / n!] e^{\alpha x}$

* **(c)** $[x^n / n!] \sin x$

* **(d)** $[x^n] \left\{\frac{1}{(1-ax)(1-bx)}\right\} \ (a \neq b)$

* **(e)** $[x^n] (1 + x^2)^m$

**解答**：

* **(a)** :spoiler[由 $e^{2x} = \sum_{n \ge 0} \frac{(2x)^n}{n!}$，得 $[x^n] e^{2x} = \frac{2^n}{n!}$。]

* **(b)** :spoiler[$[x^n / n!] e^{\alpha x} = n! [x^n] e^{\alpha x} = \alpha^n$。]

* **(c)** :spoiler[因为 $\sin x = \sum_{m \ge 0} (-1)^m \frac{x^{2m+1}}{(2m+1)!}$，故当 $n = 2m+1$ 为奇数时等于 $(-1)^m = (-1)^{(n-1)/2}$，当 $n$ 为偶数时等于 $0$（也可统一写为 $\sin\left(\frac{n\pi}{2}\right)$）。]

* **(d)** :spoiler[部分分式拆解：$\frac{1}{(1-ax)(1-bx)} = \frac{1}{a-b}\left(\frac{a}{1-ax} - \frac{b}{1-bx}\right)$，提取 $[x^n]$ 得 $\frac{a^{n+1} - b^{n+1}}{a - b}$。]

* **(e)** :spoiler[二项式展开 $(1+x^2)^m = \sum_k \binom{m}{k} x^{2k}$，故当 $n$ 为偶数时为 $\binom{m}{n/2}$，当 $n$ 为奇数时为 $0$。]

### Exercise 6 & Exercise 8：求递推序列的 OGF 与 EGF

**题目**：在下列各小题中，求满足给定递推关系的序列 $\{a_n\}_{n \ge 0}$ 的普通生成函数（Exercise 6）与指数生成函数（Exercise 8）：

* **(a)** $a_{n+1} = 3a_n + 2 \ (n \ge 0; \ a_0 = 0)$

* **(b)** $a_{n+1} = \alpha a_n + \beta \ (n \ge 0; \ a_0 = 0)$

* **(c)** $a_{n+2} = 2a_{n+1} - a_n \ (n \ge 0; \ a_0 = 0, \ a_1 = 1)$

* **(d)** $a_{n+1} = a_n / 3 + 1 \ (n \ge 0; \ a_0 = 0)$

**解答（Exercise 6 - OGF）**：

* **(a)** :spoiler[设 OGF 为 $f(x)$，则 $\frac{f(x)}{x} = 3f(x) + \frac{2}{1-x} \implies f(x) = \frac{2x}{(1-x)(1-3x)}$。]

* **(b)** :spoiler[$\frac{f(x)}{x} = \alpha f(x) + \frac{\beta}{1-x} \implies f(x) = \frac{\beta x}{(1-x)(1-\alpha x)}$。]

* **(c)** :spoiler[$\frac{f(x) - x}{x^2} = 2\frac{f(x)}{x} - f(x) \implies (1 - 2x + x^2)f(x) = x \implies f(x) = \frac{x}{(1-x)^2}$。]

* **(d)** :spoiler[在 (b) 中取 $\alpha = 1/3, \ \beta = 1$，得 $f(x) = \frac{x}{(1-x)(1-x/3)} = \frac{3x}{(1-x)(3-x)}$。]

**解答（Exercise 8 - EGF）**：

* **(a)** :spoiler[设 EGF 为 $f(x)$，递推式转微分方程 $f'(x) = 3f(x) + 2e^x, \ f(0) = 0$。乘积分因子 $e^{-3x}$ 得 $(e^{-3x}f)' = 2e^{-2x} \implies e^{-3x}f = -e^{-2x} + C$，代入 $f(0)=0$ 得 $C=1$，故 $f(x) = e^{3x} - e^x$。]

* **(b)** :spoiler[微分方程 $f'(x) = \alpha f(x) + \beta e^x, \ f(0) = 0$。当 $\alpha \neq 1$ 时解得 $f(x) = \frac{\beta}{1-\alpha}(e^x - e^{\alpha x})$（当 $\alpha = 1$ 时为 $\beta x e^x$）。]

* **(c)** :spoiler[二阶常系数齐次微分方程 $f''(x) - 2f'(x) + f(x) = 0$，特征根 $r = 1$（二重），通解 $f(x) = (c_1 + c_2 x)e^x$。代入 $f(0) = 0, \ f'(0) = 1$ 得 $f(x) = x e^x$。]

* **(d)** :spoiler[在 (b) 中取 $\alpha = 1/3, \ \beta = 1$，得 $f(x) = \frac{3}{2}\left(e^x - e^{x/3}\right)$。]

### Exercise 7：贝尔数递推关系 (1.44) 的直接组合证明

**题目**：不借助生成函数，直接给出贝尔数递推公式 $b(n) = \sum_{k=0}^{n-1} \binom{n-1}{k} b(k) \ (n \ge 1; \ b(0) = 1)$ 的组合证明。

**解答**：:spoiler[考察集合 $[n] = \{1, 2, \dots, n\}$ 的所有 $b(n)$ 个集合划分。关注最大元素 $n$ 所在的那个等价类（块）：假设除去 $n$ 以外，该块中还包含 $j$ 个其他元素（$0 \le j \le n-1$）。从 $\{1, 2, \dots, n-1\}$ 中选出这 $j$ 个元素与 $n$ 同处一块，共有 $\binom{n-1}{j}$ 种选法；而剩下的 $(n-1) - j$ 个元素（记 $k = n - 1 - j$）可以在它们自身之间任意划分为若干个非空块，方案数恰好为 $b(k)$。对所有可能的剩余元素个数 $k = n - 1 - j \in \{0, 1, \dots, n-1\}$ 求和，利用 $\binom{n-1}{n-1-k} = \binom{n-1}{k}$，即得 $b(n) = \sum_{k=0}^{n-1} \binom{n-1}{k} b(k)$。]

### Exercise 9：Stern 双原子序列的生成函数与无穷乘积

**题目**：函数 $f(n) \ (n \ge 1)$ 定义为：$f(1) = 1, \ f(2n) = f(n), \ f(2n+1) = f(n) + f(n+1)$。设 $F(x) = \sum_{n \ge 1} f(n) x^{n-1}$，证明 $F(x) = (1 + x + x^2) F(x^2)$，并由此推出 $F(x) = \prod_{j \ge 0} \left\{1 + x^{2^j} + x^{2^{j+1}}\right\}$。

**解答**：:spoiler[将 $F(x)$ 按下标 $n$ 的奇偶性拆成两部分：对偶数下标 $2n \ (n \ge 1)$，有 $\sum_{n \ge 1} f(2n) x^{2n-1} = x \sum_{n \ge 1} f(n) (x^2)^{n-1} = x F(x^2)$；对奇数下标，单独拎出 $n=1$ 项 $f(1)x^0 = 1$，其余 $2n+1 \ (n \ge 1)$ 项之和为 $\sum_{n \ge 1} (f(n) + f(n+1)) x^{2n} = x^2 \sum_{n \ge 1} f(n)(x^2)^{n-1} + \sum_{n \ge 1} f(n+1)(x^2)^n = x^2 F(x^2) + (F(x^2) - f(1)) = (1 + x^2)F(x^2) - 1$。将奇偶两部分相加，$1$ 与 $-1$ 抵消，即得 $F(x) = (1 + x + x^2)F(x^2)$。不断将 $x$ 替换为 $x^2, x^4, x^8, \dots$ 迭代展开：$F(x) = (1+x+x^2)(1+x^2+x^4)F(x^4) = \dots$，由于 $F(0) = 1$，在形式幂级数环（以及 $|x| < 1$ 的解析圆盘）中即收敛于无穷乘积 $\prod_{j \ge 0}(1 + x^{2^j} + x^{2^{j+1}})$。]

### Exercise 10：概率生成函数（PGF）、独立同分布和与灌铅骰子计算

**题目**：设离散随机变量 $X$ 取值 $0, 1, 2, \dots$ 的概率分别为 $p_0, p_1, p_2, \dots \ (\sum p_n = 1)$，记 $\{p_n\}$ 的普通生成函数为 $P(x)$。

* **(a)** 直接用 $P(x)$ 及其导数表示 $X$ 的均值 $\mu$ 与标准差 $\sigma$。

* **(b)** 独立抽取两个 $X$ 的样本，其和为 $n$ 的概率记为 $p_n^{(2)}$，用 $P(x)$ 表示 $\{p_n^{(2)}\}$ 的生成函数 $P_2(x)$。

* **(c)** 独立抽取 $k$ 个 $X$ 的样本，其和为 $n$ 的概率记为 $p_n^{(k)}$，用 $P(x)$ 表示 $P_k(x)$。

* **(d)** 利用 (a) 和 (c) 证明 $k$ 个独立同分布样本之和的均值为 $k\mu$，方差为 $k\sigma^2$（标准差为 $\sqrt{k}\sigma$）。

* **(e)** 设幂级数 $A(x)$ 满足 $A(0) = 1$，且 $B(x) = A(x)^k$。利用 $x D \log$ 方法导出不直接做幂乘而递推计算 $B(x)$ 系数的递推公式。

* **(f)** 一枚灌铅骰子掷出 $1, 2, 3, 4, 5, 6$ 点的概率分别为 $0.1, 0.2, 0.1, 0.2, 0.2, 0.2$。连续独立投掷 100 次，设总点数 $\le 300$ 的概率为 $p^*$。指出 $p^*$ 是哪个具体函数展开式中 $x^{300}$ 的系数，并说明如何用 (e) 的方法计算它。

* **(g)** 设 $X$ 在 $\{1, 2, \dots, m\}$ 上均匀分布（每个值概率为 $1/m$），$S_n$ 为 $n$ 次独立抽样之和。证明：

  $$

  \text{Prob}\{S_n \le j\} = \frac{1}{m^n} \sum_r (-1)^r \binom{n}{r} \binom{j - mr}{n}

  $$

**解答**：

* **(a)** :spoiler[因为 $P(1) = \sum p_n = 1$，$\mu = \sum n p_n = P'(1)$；又 $\sum n^2 p_n = \left.(xD)^2 P(x)\right|_{x=1} = P''(1) + P'(1)$，故方差 $\sigma^2 = P''(1) + P'(1) - (P'(1))^2 = \left.\{(\log P)' + (\log P)''\}\right|_{x=1}$，标准差 $\sigma = \sqrt{P''(1) + P'(1) - P'(1)^2}$。]

* **(b)** :spoiler[由全概率公式 $p_n^{(2)} = \sum_{j=0}^n p_j p_{n-j}$，恰好是 Cauchy 卷积，故 $P_2(x) = P(x)^2$。]

* **(c)** :spoiler[同理归纳可得 $P_k(x) = P(x)^k$。]

* **(d)** :spoiler[对 $\log P_k(x) = k \log P(x)$ 求导：均值 $\mu_k = \left.(\log P_k(x))'\right|_{x=1} = k \left.(\log P(x))'\right|_{x=1} = k\mu$；方差 $\sigma_k^2 = \left.\{(\log P_k)' + (\log P_k)''\}\right|_{x=1} = k\left.\{(\log P)' + (\log P)''\}\right|_{x=1} = k\sigma^2$，故标准差为 $\sqrt{k}\sigma$。]

* **(e)** :spoiler[对 $B(x) = A(x)^k$ 两边取对数并求导乘 $x$，得 $\frac{x B'(x)}{B(x)} = k \frac{x A'(x)}{A(x)} \implies A(x) x B'(x) = k x A'(x) B(x)$。对比两侧 $[x^n]$ 的系数：$\sum_{j=0}^n a_j (n-j) b_{n-j} = k \sum_{j=0}^n j a_j b_{n-j}$，把 $j=0$ 项（即 $a_0 n b_n = n b_n$，因 $a_0=A(0)=1$）单独移到左边，得递推式：$n b_n = \sum_{j=1}^n (j(k+1) - n) a_j b_{n-j} \ (n \ge 1; \ b_0 = 1)$。]

* **(f)** :spoiler[单次投掷的 PGF 为 $P(x) = 0.1x + 0.2x^2 + 0.1x^3 + 0.2x^4 + 0.2x^5 + 0.2x^6$，100 次总点数的 PGF 为 $P(x)^{100}$。要求总点数 $\le 300$ 的累积概率（即前缀和），由 OGF 前缀和法则只需除以 $(1-x)$，故 $p^* = [x^{300}] \frac{(0.1x + 0.2x^2 + 0.1x^3 + 0.2x^4 + 0.2x^5 + 0.2x^6)^{100}}{1-x}$。计算方法：先提取 $x^{100}$ 令 $A(x) = (0.1 + 0.2x + 0.1x^2 + 0.2x^3 + 0.2x^4 + 0.2x^5)/0.1$，用 (e) 的递推式在 $O(200 \times 5)$ 步内算出 $B(x) = A(x)^{100}$ 的前 201 项系数，最后累加前 201 项即可（数值结果约为 $0.00000095$）。]

* **(g)** :spoiler[单次抽样的 PGF 为 $\frac{x + x^2 + \dots + x^m}{m} = \frac{x(1-x^m)}{m(1-x)}$，故 $\text{Prob}\{S_n \le j\} = [x^j] \frac{1}{1-x}\left(\frac{x(1-x^m)}{m(1-x)}\right)^n = \frac{1}{m^n} [x^{j-n}] \frac{(1-x^m)^n}{(1-x)^{n+1}}$。将分子展开为 $\sum_r (-1)^r \binom{n}{r} x^{mr}$，分母展开为 $\sum_s \binom{n+s}{n} x^s$，取 $s = j - n - mr$ 相乘即得 $\frac{1}{m^n} \sum_r (-1)^r \binom{n}{r} \binom{j - mr}{n}$。]

### Exercise 11, 12 & 13：不含相邻元素的子集与帕斯卡三角斜线求和

**题目**：

* **11.** 设 $f(n)$ 为 $[n]$ 中不含任何两个相邻整数的子集个数。求 $f(n)$ 满足的递推式及通项。

* **12.** 设 $f(n, k)$ 为 $[n]$ 中不含相邻整数的 $k$ 元子集个数。求其递推式、生成函数及显式通项。

* **13.** 比较 11 与 12 的结果，导出一个组合恒等式，并说明它在帕斯卡三角形中的几何意义。

**解答**：

* **11.** :spoiler[将合法子集按是否包含 $n$ 分类：若不含 $n$，有 $f(n-1)$ 个；若含 $n$，则必不含 $n-1$，其余元素从 $[n-2]$ 中合法选取，有 $f(n-2)$ 个。故 $f(n) = f(n-1) + f(n-2)$，结合 $f(1) = 2 \ (\varnothing, \{1\}), \ f(2) = 3 \ (\varnothing, \{1\}, \{2\})$，得 $f(n) = F_{n+2}$。]

* **12.** :spoiler[同理按是否选 $n$ 分类得 $f(n, k) = f(n-1, k) + f(n-2, k-1) \ (k \ge 1)$。设列生成函数 $F_k(x) = \sum_{n \ge 1} f(n, k) x^n$，乘 $x^n$ 求和得 $F_k(x) = x F_k(x) + x^2 F_{k-1}(x) \implies F_k(x) = \frac{x^2}{1-x} F_{k-1}(x)$。由 $F_1(x) = \sum_{n \ge 1} n x^n = \frac{x}{(1-x)^2}$ 归纳得 $F_k(x) = \frac{x^{2k-1}}{(1-x)^{k+1}}$。提取 $[x^n] F_k(x) = [x^{n-2k+1}] (1-x)^{-(k+1)} = \binom{(n-2k+1)+k}{k} = \binom{n-k+1}{k}$。]

* **13.** :spoiler[对所有可能的子集大小 $k$ 求和必等于总合法子集数，即 $\sum_k \binom{n-k+1}{k} = F_{n+2}$（或将 $n-1$ 代入得 $\sum_k \binom{n-k}{k} = F_{n+1}$）。在帕斯卡三角形中，这表示沿斜向上 $45^\circ$ 对角线方向求和恰好生成斐波那契数列！]

### Exercise 14 & 15：圆周上不含相邻元素的独立集（Lucas 数）

**题目**：将整数 $1, 2, \dots, n$ 顺时针排在圆周上（此时 $n$ 与 $1$ 视为相邻）：

* **14.** 求圆周上不含相邻元素的子集总数 $g(n)$。

* **15.** 求圆周上不含相邻元素的 $k$ 元子集个数 $g(n, k)$。

**解答**：

* **14.** :spoiler[按子集是否包含元素 $n$ 破环成链：若包含 $n$，则其左右邻居 $1$ 和 $n-1$ 均不能选，等价于在 $\{2, 3, \dots, n-2\}$（共 $n-3$ 个连续整数排成一条线）中选不相邻子集，有 $f(n-3) = F_{n-1}$ 种；若不包含 $n$，等价于在 $\{1, 2, \dots, n-1\}$（共 $n-1$ 个数排成一条线）中选不相邻子集，有 $f(n-1) = F_{n+1}$ 种。故 $g(n) = F_{n-1} + F_{n+1} = L_n$（第 $n$ 个卢卡斯数，$n \ge 2$）。]

* **15.** :spoiler[完全同理，包含 $n$ 时需在 $n-3$ 个线状元素中选 $k-1$ 个，有 $f(n-3, k-1) = \binom{n-k-1}{k-1}$ 种；不包含 $n$ 时需在 $n-1$ 个线状元素中选 $k$ 个，有 $f(n-1, k) = \binom{n-k}{k}$ 种。故 $g(n, k) = \binom{n-k-1}{k-1} + \binom{n-k}{k} = \frac{n}{n-k}\binom{n-k}{k}$。]

### Exercise 16：巧算偶次复合分式系数

**题目**：分别用（1）部分分式分解法，以及（2）更聪明的“偷懒法（being sneaky）”，求 $f(x) = \frac{1}{(1-x^2)^2}$ 中 $x^n$ 的系数。

**解答**：:spoiler[（1）部分分式法：$\frac{1}{(1-x)^2(1+x)^2} = \frac{1}{4(1-x)^2} + \frac{1}{4(1-x)} + \frac{1}{4(1+x)^2} + \frac{1}{4(1+x)}$，提取 $[x^n]$ 得 $\frac{n+1}{4} + \frac{1}{4} + \frac{(-1)^n(n+1)}{4} + \frac{(-1)^n}{4} = \frac{(n+2)(1 + (-1)^n)}{4}$。（2）偷懒法：我们早就知道 $\frac{1}{(1-u)^2} = \sum_{m \ge 0} (m+1) u^m$！直接把 $u$ 替换为 $x^2$，立得 $\frac{1}{(1-x^2)^2} = \sum_{m \ge 0} (m+1) x^{2m}$，因此当 $n$ 为奇数时系数为 $0$，当 $n = 2m$ 为偶数时系数为 $\frac{n}{2} + 1 = \frac{n+2}{2}$！]

### Exercise 17：排列逆序对数的生成多项式（Mahonian Numbers）

**题目**：设 $b(n, k)$ 为 $[n]$ 的全排列中恰好具有 $k$ 个逆序对（Inversions，即满足 $i < j$ 且 $\sigma(i) > \sigma(j)$ 的数对）的排列个数。求生成函数 $B_n(x) = \sum_k b(n, k) x^k$ 的简洁乘积公式，并列出 $n \le 5$ 的数值表。

**解答**：:spoiler[考虑 $[n]$ 的任意排列 $\sigma$ 中最大元素 $n$ 所在的位置 $j \ (1 \le j \le n, \ \sigma(j) = n)$：因为 $n$ 比所有其他元素都大，它与排在它后面的全部 $n-j$ 个元素都会构成逆序对，而与排在它前面的元素不构成逆序对。删去 $n$ 后得到 $[n-1]$ 的一个具有 $k - (n-j)$ 个逆序对的排列。故 $b(n, k) = \sum_{j=1}^n b(n-1, k - n + j)$，转化为生成函数即 $B_n(x) = (1 + x + x^2 + \dots + x^{n-1}) B_{n-1}(x)$。结合 $B_1(x) = 1$ 归纳立得 $B_n(x) = \prod_{j=1}^n (1 + x + \dots + x^{j-1}) = \prod_{j=1}^n \frac{1-x^j}{1-x}$。前几行系数为：$n=1: [1]$；$n=2: [1, 1]$；$n=3: [1, 2, 2, 1]$；$n=4: [1, 3, 5, 6, 5, 3, 1]$；$n=5: [1, 4, 9, 15, 20, 22, 20, 15, 9, 4, 1]$。]

### Exercise 18：排列首段递减长度与欧拉数（Eulerian Numbers）

**题目**：

* **(a)** 在 $n$ 个元素的全排列中，有多少个排列的前 $k$ 个元素是单调递减的？

* **(b)** 随机选取一个 $n$-排列，其开头的极长单调递减前缀的平均长度是多少？

* **(c)** 设 $f(n, k)$ 为恰好包含 $k$ 个“极长递增游程（ascending runs）”的 $n$-排列个数（称为欧拉数 Eulerian numbers）。求 $f(n, k)$ 满足的类帕斯卡三角递推关系。

**解答**：

* **(a)** :spoiler[从 $n$ 个元素中任选 $k$ 个元素放在前 $k$ 个位置，只有唯一一种排法使它们严格递减；也可从对称性看，前 $k$ 个元素任意重排的 $k!$ 种顺序中只有 $1$ 种递减，故共有 $\frac{n!}{k!}$ 个排列。]

* **(b)** :spoiler[极长递减前缀长度恰好为 $k \ (1 \le k < n)$ 当且仅当“前 $k$ 个递减，但前 $k+1$ 个不递减”，其概率为 $\frac{1}{k!} - \frac{1}{(k+1)!}$；而长度为 $n$ 的概率为 $\frac{1}{n!}$。因此平均长度为 $\sum_{k=1}^{n-1} k\left(\frac{1}{k!} - \frac{1}{(k+1)!}\right) + \frac{n}{n!} = \sum_{k=1}^n \frac{1}{k!} \to e - 1 \approx 1.71828$。]

* **(c)** :spoiler[将最大元素 $n$ 插入到 $[n-1]$ 的一个具有 $k$ 个递增游程的排列中（共有 $n$ 个空隙可插）：若将 $n$ 插在现有的 $k$ 个递增游程中某一个的**末尾**（共 $k$ 个位置），游程个数不变，仍为 $k$；若将 $n$ 插在某个递增游程的**内部**或整个排列的**最开头**（共 $n - k$ 个位置），则会把原游程劈成两段或新增一个单元素游程，使游程数变为 $k+1$！反过来，要形成 $n$ 元排列的 $k$ 个游程，要么由 $(n-1, k)$ 经 $k$ 种末尾插入得到，要么由 $(n-1, k-1)$ 经 $n - (k-1) = n - k + 1$ 种分裂插入得到，故 $f(n, k) = k f(n-1, k) + (n - k + 1) f(n-1, k-1)$。]

### Exercise 19：硬币砝码表出问题与生成多项式零点

**题目**：考察形如 $\epsilon_1 + \epsilon_2 + 2\epsilon_3 + 5\epsilon_4 + 10\epsilon_5 + 10\epsilon_6 + 20\epsilon_7 + 50\epsilon_8$ 的和式：

* **(a)** 若每个 $\epsilon_i \in \{0, 1\}$（共 256 种），记表出整数 $n$ 的方案数为 $C_n$，将生成多项式 $\sum_{n=0}^{99} C_n x^n$ 写为乘积形式。

* **(b)** 若每个 $\epsilon_i \in \{-1, 0, 1\}$，记表出 $n$ 的方案数为 $D_n$。用鸽巢原理证明必有某个整数 $n$ 至少有 33 种表出方式，并写出洛朗多项式 $\sum_{n=-99}^{99} D_n x^n$ 的乘积形式。

* **(c) & (d)** 将砝码集合推广为一般正整数集 $\{w_1, \dots, w_r\}$，因式分解其生成多项式，并指出所有零点及其重数。

**解答**：

* **(a)** :spoiler[每个砝码 $w_i$ 独立贡献因子 $(1 + x^{w_i})$，故乘积为 $(1+x)^2 (1+x^2)(1+x^5)(1+x^{10})^2 (1+x^{20})(1+x^{50})$。]

* **(b)** :spoiler[8 个变量各取 $\{-1, 0, 1\}$ 共有 $3^8 = 6561$ 种组合，而所有可能的和 $n$ 落在 $[-99, 99]$ 之间，共 $199$ 个整数。平均每个整数被表出 $6561 / 199 \approx 32.97$ 次，由平均值原理（鸽巢原理），至少存在一个整数 $n$ 被表出不少于 $\lceil 6561/199 \rceil = 33$ 次！生成函数乘积为 $(x^{-1}+1+x)^2 (x^{-2}+1+x^2)(x^{-5}+1+x^5)(x^{-10}+1+x^{10})^2 (x^{-20}+1+x^{20})(x^{-50}+1+x^{50})$。]

* **(c) & (d)** :spoiler[对一般权重集 $\{w_1, \dots, w_r\}$，若 $\epsilon_i \in \{0, 1\}$，生成多项式为 $P(x) = \prod_{i=1}^r (1 + x^{w_i})$。方程 $1 + x^{w_i} = 0 \iff x^{w_i} = -1$ 的根为 $-1$ 的全部 $w_i$ 次方根 $\exp\left(\frac{(2k+1)\pi i}{w_i}\right) \ (0 \le k < w_i)$（即 $2w_i$ 次单位根中不是 $w_i$ 次单位根的那些点）。某个复数 $\zeta$ 作为 $P(x)$ 零点的重数，等于满足 $\zeta^{w_i} = -1$ 的砝码下标 $i$ 的个数！]

### Exercise 21：$e^{e^x}$ 的高阶导数与多元复合指数偏导（Faà di Bruno 特例）

**题目**：

* **(a)** 求函数 $y = e^{e^x}$ 的 $n$ 阶导数。先求前几阶导数观察规律，猜想一般形式，导出其中待定系数满足的递推关系，并认出它们是哪类著名组合数。

* **(b)** 设 $f(x_1, \dots, x_n)$ 是 $n$ 元光滑函数，求混合偏导数 $\frac{\partial^n}{\partial x_1 \partial x_2 \cdots \partial x_n} e^{f(x_1, \dots, x_n)}$ 用 $f$ 的各阶混合偏导数表出的组合公式。

**解答**：

* **(a)** :spoiler[计算前几阶导数：$D(e^{e^x}) = e^x e^{e^x}$，$D^2(e^{e^x}) = (e^x + e^{2x})e^{e^x}$，$D^3(e^{e^x}) = (e^x + 3e^{2x} + e^{3x})e^{e^x}$。猜想 $D^n(e^{e^x}) = \left(\sum_{k=1}^n c(n, k) e^{kx}\right) e^{e^x}$。两边再对 $x$ 求导得 $\sum_k c(n+1, k) e^{kx} = \sum_k k c(n, k) e^{kx} + \sum_k c(n, k) e^{(k+1)x}$，对比 $e^{kx}$ 系数得 $c(n+1, k) = c(n, k-1) + k c(n, k)$！这与第二类斯特林数递推式 (1.34) 完全一致，故 $c(n, k) = \begin{Bmatrix} n \\ k \end{Bmatrix}$！]

* **(b)** :spoiler[对 $n$ 归纳可知，每次对新变量 $x_m$ 求偏导 $\frac{\partial}{\partial x_m}$，要么作用在指数因子 $e^f$ 上产生一个新因子 $\frac{\partial f}{\partial x_m}$（相当于元素 $m$ 独立新建一个块 $\{m\}$），要么作用在已有的某个偏导因子 $\frac{\partial^{|B|} f}{\prod_{i \in B} \partial x_i}$ 上将其变为 $\frac{\partial^{|B|+1} f}{\partial x_m \prod_{i \in B} \partial x_i}$（相当于元素 $m$ 并入已有块 $B$）。因此展开式恰好遍历集合 $[n]$ 的所有划分 $\pi$：$\frac{\partial^n}{\partial x_1 \cdots \partial x_n} e^f = e^f \sum_{\pi \in \Pi_n} \prod_{B \in \pi} \left(\frac{\partial^{|B|} f}{\prod_{i \in B} \partial x_i}\right)$。当 $x_1 = \dots = x_n = x$ 且 $f(x) = e^x$ 时，每个块偏导都是 $e^x$，恰有 $\begin{Bmatrix} n \\ k \end{Bmatrix}$ 个 $k$-划分贡献 $e^{kx}$，退化为 (a)！]

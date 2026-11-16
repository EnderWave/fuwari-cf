---
title: 题解-P12628 Polygon Partition
published: 2026-11-02
tags:
  - 算法
category: 题库
draft: false
---
题目链接[ICPC 2025 NAC Polygon Partition](https://www.luogu.com.cn/problem/P12628)
## 方法一：非正解

最直观的想法是先把多边形边界与网格线产生的所有整数全部求出来，再直接按题目要求将它们划分为总和相等的两个集合。
设多边形顶点数为 $N \le 500$，坐标绝对值上界为 $C = 500$。一条边与横纵网格线最多产生约 $4C$ 个交点，因此 $N$ 条边最多会产生约 $4NC \approx 10^6$ 个整数。直接跑背包显然会超时，但我们可以利用以下两个性质大幅缩减数据规模。
### 性质 1：不需要考虑正负号

设划分出的两个集合为 $A$ 和 $B$，要求满足：
$$\sum_{x \in A} x - \sum_{y \in B} y = 0$$
这等价于为每个数 $x_i$ 分配一个符号系数 $c_i \in \{-1, +1\}$（其中 $c_i = +1$ 表示放入 $A$，$c_i = -1$ 表示放入 $B$），使得：
$$\sum c_i x_i = 0$$注意到如果某个数 $x_i < 0$，将它的系数取反（令 $c'_i = -c_i$），就有 $c_i x_i = c'_i |x_i|$。因此原问题完全等价于对非负整数 $|x_i|$ 分配系数 $c'_i \in \{-1, +1\}$ 使得：
$$\sum c'_i |x_i| = 0$$也就是说，我们可以**先把所有数取绝对值当成正数来进行集合划分**；等划分完成后，把所有原本是负数（$x_i < 0$）的元素在集合 $A$、$B$ 之间的归属对调，两边总和会同时减去 $|x_i|$，依然保持相等。
### 性质 2：值域极小与前缀和消环
所有数的范围都在 $[-C, C]$（即 $[-500, 500]$）内，值域非常小。
假设我们已经找到了一组最小规模的未配对非零元素集合，并为它们分配了合法的系数 $c_i \in \{-1, +1\}$ 使得 $\sum c_i |x_i| = 0$。我们可以重排这些元素的累加顺序（当目前前缀和 $\le 0$ 时优先加正项 $+|x_i|$，当目前前缀和 $> 0$ 时优先加负项 $-|x_i|$），使得整个累加过程中的每一个前缀和都严格落在 $[-C, C]$ 之间。
在这个重排后的前缀和序列中：
- 如果出现两个相同的前缀和，说明它们中间那一段连续子集的元素代数和恰好为 $0$，这一段可以直接独立分配，从剩余集合中剥离；
- 因此，真正无法被同值成对抵消的“核心元素”构成的前缀和不会重复，总项数不超过 $2C = 1000$ 项，且每种数值 $|x| \in [1, C]$ 的剩余个数也不会超过 $C = 500$ 个，这些直接做背包就可以了。
 **时间复杂度**：前期生成交点与消去为 $O(NC)$，最后至多 $2C$ 个元素在至多 $C^2$ 容量下跑背包，总时间复杂度约为 $O(NC + C^3)$。

## 方法二：正解
实际上，本题根本不需要跑任何背包。因为多边形是**闭合**的，我们可以直接利用网格坐标的势能守恒将集合一分为二。
考虑网格点所在的单元格左下角整数坐标构成的**势能函数**：
$$\varphi(x, y) = \lfloor x \rfloor \cdot \lfloor y \rfloor$$想象一个动点 $(x, y)$ 沿着多边形的边界走一整圈。每当动点跨过一条整数网格线时，单元格坐标 $(\lfloor x \rfloor, \lfloor y \rfloor)$ 会发生单位跳变，势能函数 $\varphi(x, y)$ 的变化量 $\Delta \varphi$ 恰好有四种情况：
$$\begin{aligned}
\text{向上跨过水平网格线 } (\lfloor y \rfloor \to \lfloor y \rfloor + 1) &: \quad \varphi(x, y + 1) = \varphi(x, y) + \lfloor x \rfloor \quad (\Delta \varphi = +\lfloor x \rfloor) \\
\text{向下跨过水平网格线 } (\lfloor y \rfloor \to \lfloor y \rfloor - 1) &: \quad \varphi(x, y - 1) = \varphi(x, y) - \lfloor x \rfloor \quad (\Delta \varphi = -\lfloor x \rfloor) \\
\text{向右跨过竖直网格线 } (\lfloor x \rfloor \to \lfloor x \rfloor + 1) &: \quad \varphi(x + 1, y) = \varphi(x, y) + \lfloor y \rfloor \quad (\Delta \varphi = +\lfloor y \rfloor) \\
\text{向左跨过竖直网格线 } (\lfloor x \rfloor \to \lfloor x \rfloor - 1) &: \quad \varphi(x - 1, y) = \varphi(x, y) - \lfloor y \rfloor \quad (\Delta \varphi = -\lfloor y \rfloor)
\end{aligned}$$
观察右边的变化量可以发现：每一次跨过网格线时加减的 $\lfloor x \rfloor$ 和 $\lfloor y \rfloor$，**正好就是题目要求我们收集到多重集里的全部数字**！
由于多边形是闭合的，动点沿着边界走完一整圈回到起点后，起点与终点的势能相等，总势能变化量必然为 $0$：
$$\sum_{\text{向上、向右}} \Delta \varphi = \sum_{\text{向下、向左}} |\Delta \varphi|$$因此，**所有“向上走（$y_i < y_{i+1}$）”和“向右走（$x_i < x_{i+1}$）”时产生的数之和，天生就严格等于所有“向下走（$y_i > y_{i+1}$）”和“向左走（$x_i > x_{i+1}$）”时产生的数之和**。我们只需要在遍历多边形的边时，只收集向右走和向上走的交点并直接输出即可。
**时间复杂度**：$O(NC)$，仅需遍历每条边产生的网格交点。
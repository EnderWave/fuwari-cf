---
title: 题解-P14446 Zelda
published: 2026-11-09
tags:
  - 算法
category: 题库
draft: false
---
题目链接[ICPC 2025 Xi'an Practice Zelda](https://www.luogu.com.cn/problem/P14446)
## 解题思路
根据整数随机变量的期望尾概率公式，最终结果 $X \in [l, r]$ 的期望可以拆分为：
$$
E(X) = \sum_{v=1}^{r} i \cdot P(X = i) = \sum_{v=1}^{r} P(X \ge v) = l - 1 + \sum_{v=l}^{r} P(X \ge v)
$$
### 1. 计算单点尾概率 $P(X \ge v)$
固定阈值 $v \in [l, r]$，设区间长度为 $M = r - l + 1$，单次从 $[l, r]$ 中随机选数 $\ge v$ 的概率为 $p = \dfrac{r - v + 1}{M}$。
初始时 $x$ 从 $[l, r]$ 中等概率随机选取，故初始概率 $P := p = \dfrac{r - v + 1}{M}$。随后依次对 $i = 1, 2, \dots, n$ 进行递推：
- **对于 $x \gets \min(x, a_i)$**：
  - 若 $a_i > 0$（已知）：$P := [a_i \ge v] ? P : 0$
  - 若 $a_i = 0$（未知）：$P := P \times \dfrac{r - v + 1}{M}$
- **对于 $x \gets \max(x, b_i)$**：
  - 若 $b_i > 0$（已知）：$P := [b_i \ge v] ? 1 : P$
  - 若 $b_i = 0$（未知）：$P := P + (1 - P) \times \dfrac{r - v + 1}{M}$
### 2. 多项式次数分析与拉格朗日插值
设自由随机变量共有 $t \le 2n + 1$ 个（即初始的 $x$ 加上序列 $a, b$ 中 $0$ 的个数）。
为了消去分母 $M$，我们考虑计算：
$$
F(r) = E(X) \cdot M^t = (l - 1)M^t + \sum_{v=l}^{r} P(X \ge v) \cdot M^t
$$
注意到题目中所有已知的 $a_i, b_i \le 200$：
- 对于任意固定的 $v$，$P(X \ge v) \cdot M^t$ 是关于 $r$ 和 $v$ 的、次数不超过 $t$ 的多项式。
- 当 $r \ge 200$ 时，所有 $v \in [201, r]$ 在递推中的大小判断结果完全一致（恒有 $a_i < v$ 且 $b_i < v$），因此 $P(X \ge v) \cdot M^t$ 在 $v > 200$ 时对应同一个不超过 $t$ 次的多项式。
- 对 $v \in [201, r]$ 求和相当于做一次前缀和，多项式次数至多 $+1$。因此，**当 $r \ge 200$ 时，$F(r) = E(X) \cdot M^t$ 是关于 $r$ 的、次数不超过 $D = t + 1 \le 2n + 2$ 的多项式**。
于是我们只需暴力递推算出 $r = l \dots 200 + D$ 的答案，并取 $r = 200, 201, \dots, 200 + D$ 共 $D + 1$ 个连续点值，即可在每次查询时用 $O(n)$ 的拉格朗日插值求出 $F(r)$，最后乘上 $M^{-t} \pmod{10^9 + 7}$ 即可还原出 $E(X)$。





---
title: 题解-P14611 Lucky Number Theory
published: 2026-11-11
tags:
  - 算法
category: 题库
draft: false
---
题目链接[NWRRC 2025 Lucky Number Theory](https://www.luogu.com.cn/problem/P14611)
$$x=[x]+\{x\}$$
考虑每次取出的$x$的整数部分$z_i$和小数部分$d_i$，$z_i\in\{0,1,...,d-1\},d_i\in(0,1)$，这里我们认为整数的概率为$0$，不影响最终的期望？
整数部分不会影响增长量，整数部分的贡献是$nE(z_i)=n\frac{d-1}{2}$
考虑小数部分的贡献，本质上是求$f(n,k)$，
$$f(n,1)=\frac{n}{2}$$
$$f(n,k)=\frac{1}{2}(1+f(n-1,k-1))+\frac{1}{2}(\frac{1}{2}( )+\frac{1}{2}(2+f(n-2,k-2)))$$
$$0,1,...,n,\frac{n(n+1)}{2n}$$
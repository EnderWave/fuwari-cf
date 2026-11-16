---
title: 题解-P14674 Fair Problemset
published: 2026-11-13
tags:
  - 算法
category: 题库
draft: false
---

题目链接：[14674 ICPC 2025 Seoul R Fair Problemset](https://www.luogu.com.cn/problem/P14674)

## 1. 集合划分

计数题

$$
\{1,2,...,n\}=\{a_1,a_2,...,a_n\}=\{a_i|i\bmod3=k\}
$$

设第一种是 $A$，第二种是 $B$

计算 $A\cap B$

考虑这样的位置三元组 $(i,j,k)$，满足 $1\le i\le n<j\le 2n<k\le 3n$

是不是可以钦定 $a_i=i,1\le i\le n$，答案在乘以 $n!$ 即可

$$
M_{0,0}=\{3,...,3\lfloor\frac{n}{3}\rfloor\}
$$

$$
M_{0,1}=\{1,4,...,3\lfloor\frac{n-1}{3}\rfloor+1\}
$$

$$
M_{0,2}=\{2,5,...,3\lfloor\frac{n-2}{3}\rfloor+2\}
$$

## 2. 确定第二部分

我只要定好第二部分，第三部分就直接顺着推出来了

考虑 $M_{0,1}\cup M_{0,2}=M_{1,0}\cup M_{2,0}$

所以，我们只要确定 $M_{1,x}$ 就可以确定全部了

注意到 $M_{1,0}$ 的元素来自 $M_{0,1}$ 和 $M_{0,2}$

注意到 $M_{1,1}$ 的元素来自 $M_{0,0}$ 和 $M_{0,2}$

注意到 $M_{1,2}$ 的元素来自 $M_{0,0}$ 和 $M_{0,1}$

设 $m_1=\lfloor\frac{n}{3}\rfloor,m_2=\lfloor\frac{n-1}{3}\rfloor,m_3=\lfloor\frac{n-2}{3}\rfloor$

设 $|M_{1,x}|=s_x$

## 3. 按余数分类

$n=3k,m_1=m_2=m_3=k$

$$
n!(k!)^6\sum_{i=0}^{k}(\binom{k}{i})^3
$$

$n=3k+1,m_1=m_3=k,m_2=k+1,m_1=m_2=k,m_3=k+1$

$$
n!(k!)^4((k+1)!)^2\sum_{i=0}^{k}(\binom{k}{i})^2\binom{k+1}{i}
$$

$n=3k+2,m_1=k,m_2=m_3=k+1,m_1=m_2=k+1,m_3=k$

$$
n!(k!)^2((k+1)!)^4\sum_{i=0}^{k}\binom{k}{i}(\binom{k+1}{i})^2
$$

## 4. 转化为卷积

$$
\begin{aligned}
\sum_{i=0}^{k}(\binom{k}{i})^3&=\sum_{i=0}^{k}\frac{k!k!k!}{i!i!i!(k-i)!(k-i)!(k-i)!}\\
&=(k!)^3\sum_{i=0}^{k}\frac{1}{(i!)^3}\frac{1}{((k-i)!)^3}\\
\end{aligned}
$$

$$
\begin{aligned}
\sum_{i=0}^{k}(\binom{k}{i})^2\binom{k+1}{i}&=\sum_{i=0}^{k}\frac{k!k!(k+1)!}{i!i!i!(k-i)!(k-i)!(k+1-i)!}\\
&=(k!)^2(k+1)!\sum_{i=0}^{k}\frac{1}{(i!)^3}\frac{1}{((k-i)!)^2(k+1-i)!}\\
\end{aligned}
$$

$$
\begin{aligned}
\sum_{i=0}^{k}\binom{k}{i}(\binom{k+1}{i})^2&=\sum_{i=0}^{k}\frac{k!(k+1)!(k+1)!}{i!i!i!(k-i)!(k+1-i)!(k+1-i)!}\\
&=((k+1)!)^2k!\sum_{i=0}^{k}\frac{1}{(i!)^3}\frac{1}{((k+1-i)!)^2(k-i)!}\\
\end{aligned}
$$

然后就做完了吗？o，模数任意来个三模NTT就好了

upd:有人线性递推过了

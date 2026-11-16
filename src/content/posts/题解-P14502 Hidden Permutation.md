---
title: 题解-P14502 Hidden Permutation
published: 2026-11-10
tags:
  - 算法
category: 题库
draft: false
---
题目链接[NCPC 2025 Hidden Permutation](https://www.luogu.com.cn/problem/P14502)
考虑一个排列是由很多环构成的，我们假设有$M$个环，每个环的大小为$C_i$，那么我们会有$$\sum_{i=1}^{M}C_i=N$$
环内的周期$c_i$一定可以被$C_i$整除，构造为$00..01$，由$c_i-1$个0和$1$个$1$构成，然后$0,1$位置可以互换
那么
$$\{p_i\}=\{lcm(c_1,...,c_M)\}$$
考虑一些关键点，
$p_1$一定是$1$，在每个环中，要么是全$1$要么是全$0$，那么有$m_1=2^M$，通过$m_1$我们能求出环的个数
$p_{N}$一定是最大的，那么$p_N=lcm(C_1,C_2,...,C_M)$，包含所有的质因数
发现周期恰好为$t$的方法数比较难以计算，我们计算周期是$t$的方案数$S(t)$
对于每一个环来说，其周期是$t$，要求转$t,C_i$次都要回到原位置，那么最长$gcd(t,C_i)$的连续段一定要回到相同的位置，那这$gcd(t,C_i)$个数就可以随便填，那么方案数就是$2^{gcd(t,C_i)}$，然后每个环都是独立的，那么
$$S(t)=\prod_{i=1}^{m}2^{gcd(t,C_i)}$$
另一方面$$S(t)=\sum_{p_i\mid t}p_i$$
注意到$p_{max}\le 10^9$，那么不同的因子数大概是$10^3$级别，可以搜索出来
注意到合法的$S(t)$一定是$2$的幂次，我们取对数的$F(t)$,
$$F(t)=\sum_{i=1}^{m}gcd(t,C_i)=\sum_{i=1}^{N}cnt_i\times gcd(t,i)$$
$$
\begin{aligned}
F(t)&=\sum_{i=1}^{N}cnt_i\times gcd(t,i)\\
&=\sum_{i=1}^{N}cnt_i\sum_{d\mid gcd(t,i)}\varphi(d)\\
&=\sum_{i=1}^{N}cnt_i\sum_{d\mid t,d\mid i}\varphi(d)\\
&=\sum_{d\mid t}\varphi(d)(\sum_{i=1}^{\lfloor\frac{N}{d}\rfloor}cnt_{id})\\
&=\sum_{d\mid t}\varphi(d)G(d)\\
\end{aligned}
$$
$G(d)=\sum_{i=1}^{\lfloor\frac{N}{d}\rfloor}cnt_{id}$
那么
$$G(t)=\frac{F(t)-\sum_{d\mid t,d\ne t}\varphi(d)G(d)}{\varphi(t)}$$
倍数反演，
$$cnt_x=\sum_{i=1}^{\lfloor\frac{N}{x}\rfloor}\mu(i)G(ix)$$
然后我们就求出所有的环的长度，我们需要检查一下是否合法就行，然后构造不想交的环即可
现在检查$p_i$与$m_i$的对应，
鉴于我们已经验证总数，我们只需对每个$p_i$计算对应的$m_i$是否正确即可,
$$p_i=lcm(c_1,c_2,...,c_M)$$

其实我们只要验证$F(t)$就可以

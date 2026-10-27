---
title: test04
published: 2026-09-02
tags:
  - test
category: test
draft: false
---

## LGV引理

$w(P)$表示路径$P$的边权的乘积
$e(a,b)$表示每一条从a到b的边权乘积之和,$e(a,b)=\sum_{P:a\to b}w(P)$.
有行列式展开有

$$
\begin{aligned}
det(M)&=\sum_{\sigma}(-1)^{t(\sigma)}\prod_{i=1}^{n}e(a_i,b_{\sigma(i)})\\
&=\sum_{\sigma}(-1)^{t(\sigma)}\prod_{i=1}^{n}\sum_{P_i:a_i\to b_{\sigma(i)}}w(P_i)\\
&=\sum_{\sigma}(-1)^{t(\sigma)}\sum_{P=(P_1,P_2,...,P_n),P_i:a_i\to b_{\sigma(i)}}\prod_{i=1}^{n}w(P_i)\\
W(P)&=\prod_{i=1}^{n}w(P_i)\\
&=\sum_{\sigma}(-1)^{t(\sigma)}\sum_{P=\sigma}W(P)\\
&=\sum_{P=(P_1,P_2,...,P_n)}(-1)^{t(\sigma)}\prod_{i=1}^{n}w(P_i)\\
&=\sum_{P=(P_1,P_2,...,P_n)}(-1)^{t(\sigma)}W(P)\\

\end{aligned}
$$

N个点有根无标号的树，恰好有M个点有K个子节点
不考虑限制$F(x)=\sum f_ix^i$表示i个点的有根无标号树的个数

$$
F(x)=x\sum_{i=0}F^i(x)=\frac{x}{1-F(x)}
$$

就是看看有几个儿子，这个可以比较容易算出f_i
重难点在于设计函数，M，K都是变量
考虑到恰好，是一个强约束
考察至少有M个点有K个子节点
or有M个点有至少K个子节点
or至少有M个节点有至少K个子节点
我不太可能记录所有
可能需要按M排序，也可能按照K排序
感觉按照M排序更加合理 ？
好难

$$
F_k(x,y)=\sum f_k(i,j)x^iy^j
$$

节点数为i，恰好有j个节点有k个的方法数

$$
G_m(x,y)=\sum g_m(i,j)x^iy^j
$$

节点数为i，恰好有m个节点有j个的方法数
如果n是定值

$$
F_m(x)=\sum_{i=1}^{\lfloor\frac{n}{m}\rfloor}f_{m,i}x^i
$$

$$
1.F(x,y)=x(\sum_{i=1}F^i(x,y)+y)
$$

$$
2.F(x,y)=\sum_{i=0}(y\ln(\frac{1}{1-x}))^i=\frac{1}{1+y\ln(1-x)}
$$

$$
\begin{aligned}
3.G(x)=e^{C(x)}\\
G(x)=e^{yC(x)}\\
\end{aligned}
$$

$$
4.F(x,y)x^2y+3x^2+2x+1=F(x,y)
$$

$$
P[v\bmod a_i]+=P[v]\times \frac{1}{cnt[v]}\\
$$

$$
P[x]=\sum_{y>x} P[y]\times \frac{1}{cnt[y]}\times\sum_{a_i>x}[y\bmod a_i=x]
$$

考虑到根节点进出必须连续，且各个子树互不影响,对于一颗固定的树

$$
\begin{aligned}
f(u,n)&=(2n-1)\prod_{v\in subtree(u)}\binom{2n-2}{2size(v)}f(v,size(v))\\
&=\binom{2n-1}{1,2siz(v)}\prod_{v \in subtree(u)}f(v,sizz(v))\\
2n\frac{f(u,n)}{(2n)!}&=\prod_{v \in subtree(u)}\frac{f(v,size(v))}{(2size(v))!}\\
2\frac{\partial F(x,y)}{\partial x}&=y+\sum_{i=1}F^i(x,y)=\frac{1}{1-F(x,y)}+y-1
\end{aligned}
$$

$$
\begin{aligned}
2\frac{\partial F}{\partial x}&=e^{F}+y-1\\
\partial x&=\frac{2}{e^F+y-1}\partial F\\
x&=\int_{0}^{F}\frac{2}{e^t+y-1}dt\\
&=\int_{y}^{e^F+y-1} \frac{2}{u}\frac{1}{u-y+1}du,u=e^t+y-1\\
&=\frac{1}{1-y}\int_{y}^{e^F+y-1} \frac{2}{u}-\frac{2}{u-y+1}du\\
&=\frac{1}{1-y}2[\ln(\frac{u}{u-y+1})]_{y}^{e^F+y-1}\\
&=\frac{2}{1-y}(\ln(\frac{e^F+y-1}{ye^F}))\\
-\frac{x(y-1)}{2}&=\ln(\frac{e^F+y-1}{ye^F})\\
e^{-\frac{x(y-1)}{2}}&=\frac{e^F+y-1}{ye^F}\\
e^F&=\frac{y-1}{ye^{-\frac{x(y-1)}{2}}-1}\\
\end{aligned}
$$

树的拓扑序

$$
\begin{aligned}
f_u&=\prod_{v\in subtree(u)}f_v\binom{size(u)-1}{size(v)}\\
&=(size(u)-1)!\prod_{v\in subtree(u)}\frac{f_v}{size(v)!}\\
f_0&=n!\prod_{i=1}^{n}\frac{1}{size(i)}\\

\end{aligned}
$$

$dp_{i,j}$表示

$$
\begin{aligned}
dp_{i,j}
\end{aligned}
$$

$$
\begin{aligned}
\ln(1-x)&=-\sum_{i=1}^{n}\frac{x^i}{i}\\
f(n)&=\sum_{i=0}^{n}(nx)^i=\frac{1-(nx)^{n+1}}{1-nx}\\
F(x)&=\prod_{i=1}^{n}\frac{1-(ix)^{i+1}}{1-ix}\\
\ln(F(x))&=\sum_{i=1}^{n}\ln(\frac{1-(ix)^{i+1}}{1-ix})\\
&=\sum_{i=1}^{n}\ln(1-(ix)^{i+1})-\sum_{i=1}^{n}\ln(1-ix)\\
&=-\sum_{i=1}^{n}\sum_{j=1}^{n}\frac{(ix)^{ij+j}}{j}+\sum_{i=1}^{n}\sum_{j=1}^{n}\frac{(ix)^{j}}{j}\\
\end{aligned}
$$

$$
\begin{aligned}
\sum_{i=1}^{n}\sum_{j=1}^{n}\frac{(ix)^{j}}{j}&=

\end{aligned}
$$

F

A先，涂满一个必须
$max>=k+2\to Bob$

[CF2276G](https://codeforces.com/problemset/problem/2276/G)
简要的题意：
有一个长度为n的排列$P$，每一轮去掉一个最小值，给一个序列$a_1,a_2,...a_{n-1}$，表示第$i$轮下表为$a_{i}$的不能被去掉，求所有的$ans(i,j)$为$j$恰好在第$i$轮被去掉的方案数，对998244353取模。
首先我们观察到，第$i$轮去掉的数的值一定是$\{1,2,...,i\}$中剩下的和$i+1$。
然后，我们考虑一个小于$i$的数$x$是怎么到达第$i$轮的，这就要求存在$a_{l}=a_{l+1}=...=a_{i-1}$,并且$l\le x\le i-1$,也就是假设$x$在第$x$轮存活，那么他就能到第$i$轮。
我们设$F(x)$表示

$$
\begin{aligned}
&(\sum_{i=1}^{m}\frac{r_i-l_i+1}{k_i})(\sum_{i=1}^{m}k_i(s_{l_i}+...+s_{r_i}))\\
&\ge(\sum_{i=1}^{m}\sqrt{(r_i-l_i+1)(s_{l_i}+...+s_{r_i})})^2,l_1=1,r_m=n,r_i+1=l_{i+1}\\
ans=&\sum_{i=1}^{m}\sqrt{(r_i-l_i+1)(s_{l_i}+...+s_{r_i})},l_1=1,r_m=n,r_i+1=l_{i+1}\\
\end{aligned}
$$

---
title: test02
published: 2026-03-18
tags:
  - test
category: test
draft: false
---

$$f(x)=\sum_{i=0}^{n}a_{i}x^{i}$$

$$ f(x)=\sum_{i=0}^{n}f(i)\prod_{j=0,j\le n,j\neq i}\frac{x-j}{i-j}$$
$$
\begin{aligned}
f(x+m)&=\sum_{i=0}^{n}f(i)\prod_{j=0,j\le n,j\neq i}\frac{x+m-j}{i-j}\\
&=\sum_{i=0}^{n}\frac{f(i)(x+m)!}{(x+m-n-1)!(x+m-i)i!(-1)^{n-i}(n-i)!}\\
d_{i}&=\frac{f(i)}{i!(-1)^{n-i}(n-i)!}\\
e_{i}&=\frac{1}{m-n+i}\\
A(x)&=\sum_{i=0}^{n}d_{i}x^{i}\\
B(x)&=\sum_{i=0}^{n}e_{i}x^{i}\\
[x^{t}]A(x)B(x)&=\sum_{i=0}^{t}d_{i}e_{t-i}=\sum_{i=0}^{t}\frac{f(i)}{i!(-1)^{n-i}(n-i)!(m-n+t-i))}\\
[x^{t+n}]A(x)B(x)&=\sum_{i=0}^{t}d_{i}e_{t-i}=\sum_{i=0}^{t}\frac{f(i)}{i!(-1)^{n-i}(n-i)!(m+t-i))}=\frac{(x+t-n-1)!}{(x+t)!}f(t+m)\\
f(t+m)&=\frac{(t+m)!}{(t+m-n-1)!}[x^{t+n}]A(x)B(x)=[x^{t+n}]A(x)B(x)\prod_{i=t+m-n}^{t+m}i\\
\end{aligned}
$$

$$
\begin{align}
g(x)&=\frac{1}{1-x}\\
[x^{i}][g(x)]^{k}&=\binom{k+i-1}{i}\\
[x^{i}][g^{-1}(x)]^{k}&=\binom{k}{i}(-1)^{i}\\
\binom{k}{i}&=\frac{k!}{i!(k-i)!}=\binom{k}{i-1}\frac{k-i+1}{i}\\
\binom{k+i-1}{i}&=\frac{(k+i-1)!}{i!(k-1)!}=\binom{k+i-2}{i-1}\frac{k+i-1}{i}
\end{align}
$$

$$ \binom{k}{i}=\frac{k!}{i!(k-i)!}=\frac{k(k-1)...(k-i+1)}{i!}\equiv\frac{k'(k'-1)...(k'-i+1)}{i!}=\frac{k'!}{i!(k'-i)!}\equiv\binom{k'}{i}$$

$$
\begin{align}
\binom{n}{k}=\binom{n-1}{k-1}+\binom{n-1}{k}\\
g(x)&=-x+1\\
f(x)&=a_{0}+a_{1}x+a_{2}x^{2}\\
\end{align}
$$
$$
f(x)=\sum_{i=0}^{n}
$$
$$
\begin{align}
\ln\frac{1}{1-x^{V}}&=-\ln(1-x^{V})\\
&=-\sum_{i=1}\frac{x^{Vi}}{i}\\
&=\sum_{i=1}\frac{x^{Vi}}{i}\\


\end{align}
$$
$$Bell\_Number$$
$$
B_{n+1}=\sum_{i=0}^{n}\binom{n}{i}B_{i}
$$
$$
\begin{align}
F(x)&=\sum_{i=0}\frac{B_{i}}{i!}x^{i}\\
\frac{B_{n+1}}{n!}&=\sum_{i=0}^{n}\frac{1}{(n-i)!}\frac{B_{i}}{i!}\\
e^{x}\cdot F(x)&=F'(x)\\
e^{x}&=\frac{F'(x)}{F(x)}\\
e^{x}+c&=\ln(F(x))\\
F(x)&=e^{e^{x}+c}\\
F(x)&=e^{e^{x}-1}
\end{align}
$$
$$
\begin{align}
1011 1001 0111 1010
1000 0101 1000 0110
1011 1001 + 1000 0110
1011 1111
1 00111 110 
- 7 6
-1+6/8 \times 2^-8
-7/2^10

\end{align}
$$
$f_{i}$表示$i$个点联通的方案数,$g_{i}$表示任意一图
$$
\begin{align}
g_{n}&=2^{\binom{n}{2}}\\
g_{n}&=\sum_{i=1}^{n}\binom{n-1}{i-1}f_{i}g_{n-i}\\
g_{n}&=\sum_{i=1}^{n}\frac{(n-1)!}{(i-1)!(n-i)!}f_{i}g_{n-i}\\
\frac{g_{n}}{(n-1)!}&=\sum_{i=1}^{n}\frac{f_{i}}{(i-1)!}\frac{g_{n-i}}{(n-i)!}\\
G'(x)&=F'(x)G(x)\\
F'(x)&=\frac{G'(x)}{G(x)}\\
F(x)&=\ln G(x)+c\\
\end{align}
$$$$
\begin{align}
\sum_{S\subset T}\mu(\prod_{i\in S}i)\varphi(\prod_{i\in S}i)&=0&,k=0\\
\sum_{S\subset T}\mu(\prod_{i\in S}i)\varphi(\prod_{i\in S}i)&=\sum_{S\subset T}(-1)^{|S|}\prod_{i\in S}(i-1)&,k=1\\
&=\sum_{S\subset T}\prod_{i\in S}(-(i-1))\\
f_{p}(x)&=1-(p-1)x^{p}\\
ans&=\prod_{p}f_{p}(x)|_{x=1}-1\\
\sum_{S\subset T}\mu(\prod_{i\in S}i)\varphi(\prod_{i\in S}i)&=\sum_{S\subset T}g_{S}\prod_{i\in S}(-(i-1)) 
&,k=2\\

\end{align}
$$

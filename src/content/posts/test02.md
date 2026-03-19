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
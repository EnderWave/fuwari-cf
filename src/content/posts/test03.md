---
title: test03
published: 2026-03-24
tags:
  - test
category: test
draft: false
---
$f(i)$表示钦定其中$i$种颜色恰好$S$个
$g(i)$表示恰好$i$个颜色恰好$S$个
$h(n)=m^n$表示$n$个点的染色总方案数
$$
\begin{align}
f(i)&=\binom{m}{i}\frac{n!}{(S!)^{i}(n-si)!}(m-i)^{n-si}
\end{align}
$$
由二项式反演
$$
\begin{align}
g(k)&=\sum_{i=k}^{m}(-1)^{i-k}\binom{i}{k}f(i)\\
&=\sum_{i=k}^{m}(-1)^{i-k}\binom{i}{k}\binom{m}{i}(m-i)^{n-si}\\
&=\sum_{i=k}^{m}(-1)^{i-k}\frac{i!}{k!(i-k)!}\frac{m!}{i!(m-i)!}(m-i)^{n-si}\\
&=m!\sum_{i=k}^{m}(-1)^{i-k}\frac{(m-i)^{n-si}}{k!(i-k)!(m-i)!}\\
&=m!\sum_{i=k}^{m}\frac{1}{k!}\cdot\frac{(-1)^{i-k}}{(i-k)!}\cdot\frac{(m-i)^{n-si}}{(m-i)!}\\
\end{align}
$$
$$
\begin{align}
g(k)&=\sum_{i=k}^{m}(-1)^{i-k}\binom{i}{k}f(i)\\
&=\sum_{i=k}^{m}(-1)^{i-k}\frac{i!}{k!(i-k)!}f(i)\\
k!g(k)&=\sum_{i=k}^{m}\frac{(-1)^{i-k}}{(i-k)!}\cdot i!f(i)[PS:i-(i-k)=k]\\
F(x)&=\sum_{i=0}i!f(i)x^i\\
H(x)&=\sum_{j=0}\frac{(-1)^j}{j!}x^{-j}\\
F(x)H(x)&=\sum_{k=0}\sum_{i-j=k}\frac{(-1)^j}{j!}\cdot i!f(i)x^{i-j}\\
G(x)&=x^{-n}\sum_{j=0}\frac{(-1)^j}{j!}x^{n-j}=x^{-n}\sum_{j=0}\frac{(-1)^{n-j}}{(n-j)!}x^{j}\\
F(x)G(x)&=x^{-n}\sum_{k=0}\sum_{i-(n-j)=k}\frac{(-1)^{n-j}}{(n-j)!}\cdot i!f(i)x^{i-(n-j)}\\
F(x)G(x)&=x^{-n}\sum_{k=0}\sum_{i+j=n+k}\frac{(-1)^{n-j}}{(n-j)!}\cdot i!f(i)x^{i+j-n}\\
\end{align}
$$

$$
\begin{align}
g(k)&=\frac{1}{nm}\sum_{i=1}^{n}\sum_{j=1}^{m}(a_{i}+b_{j})^{k}\\
&=\frac{1}{nm}\sum_{i=1}^{n}\sum_{j=1}^{m}\sum_{l=0}^{k}\binom{k}{l}a_{i}^{l}b_{j}^{k-l}\\
&=\frac{1}{nm}\sum_{i=1}^{n}\sum_{j=1}^{m}\sum_{l=0}^{k}\frac{k!}{l!(k-l)!}a_{i}^{l}b_{j}^{k-l}\\
\frac{g(k)}{k!}&=\frac{1}{nm}\sum_{i=1}^{n}\sum_{j=1}^{m}\sum_{l=0}^{k}\frac{a_{i}^{l}b_{j}^{k-l}}{l!(k-l)!}\\
\frac{g(k)}{k!}&=\frac{1}{nm}\sum_{l=0}^{k}\sum_{i=1}^{n}\frac{a_{i}^{l}}{l!}\sum_{j=1}^{m}\frac{b_{j}^{k-l}}{(k-l)!}\\
F_{a,l}&=\sum_{i=1}^{n}a_{i}^{l}\\
F_{b,l}&=\sum_{i=1}^{m}b_{j}^{l}\\
F_{a,l+1}-F_{a,l}&=\sum_{i=1}^{n}a_{i}^{l}(a_{i}-1)\\
\end{align}
$$
$$
\begin{align}
F_{a,l}&=\sum_{i=1}^{n}(d_{i-1}+d_{i})^{l}\\
&=\sum_{i=1}^{n}\sum_{j=0}^{l}\binom{l}{j}d_{i-1}^{j}d_{i}^{l-j}\\
&=\sum_{i=1}^{n}\sum_{j=0}^{l}\frac{l!}{j!(l-j)!}d_{i-1}^{j}d_{i}^{l-j}\\
\frac{F_{a,l}}{l!}&=\sum_{j=0}^{l}
\end{align}
$$
$$
\begin{align}
F_{a}(x)&=\sum_{i=1}^{n}\frac{1}{1-a_{i}x}\\
&=\sum_{i=1}^{n}(1+\frac{a_ix}{1-a_ix})\\
&=\sum_{i-1}^{n}-x\sum_{i=1}^{n}\frac{-a_i}{1-a_ix}\\
&=n-x(\sum_{i=1}^{n}\ln(1-a_ix))'\\
&=n-x(\ln(\prod_{i=1}^{n}(1-a_ix)))'\\
\end{align}
$$










$f(i)$表示$i$个点无标号无根树的个数
$g(i)$表示$i$个点有标号无根树的个数
$$ g(i)=f(i)i! $$
$$
\begin{align}
g(n)&=\sum_{i=1}^{n}\binom{n-1}{i-1}(n-i)(i-1)g(n-i)\\
g(n)&=\sum_{i=1}^{n}\frac{(n-1)!}{(i-1)!(n-i)!}(n-i)(i-1)g(n-i)\\
\frac{g(n)}{(n-1)!}&=\sum_{i=1}^{n}\frac{1}{(i-2)!}\frac{g(n-i)}{(n-i-1)!}\\
\end{align}
$$

考虑第一天
A视角：
知道自己受到处分，知道其他人没有受到处分
其他人视角：
知道A受到处分，不知道自己有没有受到处分，知道受到处分的人至多两个人
第二天无人被开除，没有新的处分
A视角：
...
其他人视角：
A并没有泄露信息
1.A的视角里没有受处分的人
2.A知道A受处分，并且自己受到处分
考虑情况二
第三天无人被开除，没有新的处分
其他人视角：
考虑除去A和自己以外的第三人，
假设A和自己受到处分，自己知道第三人没有受到处分，那么第二天会有人泄露信息

$$
\begin{align}
F(x)&=\sum_{i=0}f_{i}x^{i}\\
g_n&=\sum_{m>0,a_1,a_2,...,a_m>0,a_1+a_2+...+a_m=n}\prod_{i=1}^{m}f_{a_i}\\
F^{n}(x)&=\sum_{i=0}g_{i}x^i\\
F(x)&=\frac{x}{1-x-x^2}\\
G(x)&=\frac{1}{1-F(x)}\\
&=\frac{1}{1-\frac{x}{1-x-x^2}}\\
&=\frac{1-x-x^{2}}{1-2x-x^{2}}\\
&=\frac{1-x-x^2}{(1-(1+\sqrt{2})x)(1-(1-\sqrt{2})x)}\\
&=1+\frac{1}{2\sqrt{2}}(\frac{1}{1-(1+\sqrt{2})x}-\frac{1}{1-(1-\sqrt{2})x})\\
&=1+\frac{1}{2\sqrt{2}}\sum_{i=0}((1+\sqrt{2})^i-(1-\sqrt{2})^i
)x^i\\
g_n&=\frac{1}{2\sqrt{2}}((1+\sqrt{2})^i-(1-\sqrt{2})^i
)+[n=0]
\end{align}
$$
$$
\begin{align}
D,m,n\\
min&=\frac{n-(D-1)}{2}\\
max&=\frac{n}{2}-m\\
ANS&=\sum_{i=1}^{MAX}[2\mid n-i]\binom{D}{i}\sum_{a_1+...a_D=\frac{n-i}{2}}\binom{\frac{n-i}{2}}{a_1,...,a_D}\\
&=\sum_{i=1}^{MAX}[2\mid n-i]\binom{D}{i}D^{\frac{n-i}{2}}\\
\end{align}
$$
$$
\begin{align}
f(i)&\equiv[x^i]\prod_{i=1}^{|S|}\frac{1}{1-x^{a_i}}\bmod p\\
\sum_{i}f(i)z^i&\equiv\prod_{i=1}^{|S|}\frac{1}{1-x^{a_i}}\bmod p\\
\end{align}
$$
我们换个思路，注意到集合中每个元素很小，令$a_{i}=0/1$表示集合里有没有这个数  
$$
\begin{align}
F(x)&=\prod_{i=1}^{n}(\frac{1}{1-x^i})^{a_{i}}\\
\ln(F(x))&=\sum_{i=1}^{n}a_{i}\ln(\frac{1}{1-x^i})\\
-\ln(F(x))&=\sum_{i=1}^{n}a_{i}\ln(1-x^i)\\
&=-\sum_{i=1}^{n}a_{i}\sum_{j=1}^{\infty}\frac{x^{ij}}{j}\\
\ln(F(x))&=\sum_{i=1}^{n}\sum_{d\mid i}\frac{da_{d}}{i}x^{i}\\
&=\sum_{i=1}^{n}(\sum_{d\mid i}da_d)\frac{x^i}{i}\\
\end{align}
$$
$$
\begin{align}
f(n)&=\sum_{d\mid n}g(d)\\
g(n)&=\sum_{d\mid n}\mu(\frac{n}{d})f(d)\\
&=\sum_{d\mid n}\mu(\frac{n}{d})\sum_{t\mid d}g(t)\\
&=\sum_{t=1}^{n}g(t)\sum_{d}[t\mid d\mid n]\mu(\frac{n}{d})\\
&=\sum_{t\mid n}g(t)\sum_{d\mid n}[\frac{d}{t}\mid \frac{n}{t}]\mu(\frac{n}{d})\\
&=\sum_{t\mid n}g(t)[\frac{n}{t}=1]\\
\\(1.2)(2.9)(3.2)
\end{align}
$$
$$f(i)=\sum_{d\mid i}da_{d}$$
$$da_{d}=\sum_{k\mid d}\mu(\frac{d}{k})f(k)$$
设每种颜色的的小球的个数为$a_{i}$个
$$
\begin{align}
tot&=\sum_{i=1}^{n}\lfloor\frac{a_{i}}{2}\rfloor\\
\end{align}
$$
设有$k$个奇数，$k\equiv n\bmod 2$
至多有$D$个奇数，那么至少有$\frac{n-D}{2}$对
当$m\le\frac{n-D}{2}$时，答案为$D^n$
当$m>\frac{n}{2}$时，答案为$0$
考虑到时排列问题
只选奇数的生成函数
$$\sum_{i=0}^{\infty}\frac{x^{2x+1}}{(2i+1)!}=\frac{e^{x}-e^{-x}}{2}$$
设$f(k)$表示恰好为$k$个奇数的方案数，令$g(k)$为钦定$k$个为奇数的方案数
$$
\begin{align}
g(k)&=[x^n]n!\binom{D}{k}(\frac{e^x-e^{-x}}{2})^{k}e^{(D-k)x}\\
&=[x^n]n!\frac{D!}{k!(D-k)!}\sum_{i=0}^{k}\frac{k!}{i!(k-i)!}(\frac{e^x}{2})^{i}(-\frac{e^{-x}}{2})^{k-i}e^{(D-k)x}\\
&=[x^n]n!\frac{D!}{(D-k)!2^k}\sum_{i=0}^{k}\frac{(-1)^{k-i}}{i!(k-i)!}e^{xi-x(k-i)+(D-k)x}\\
&=[x^n]n!\frac{D!}{(D-k)!2^k}\sum_{i=0}^{k}\frac{(-1)^{k-i}}{i!(k-i)!}e^{(D+2i-2k)x}\\
e^{ax}&=\sum_{i=0}\frac{(ax)^{i}}{i!}\\
&=[x^n]n!\frac{D!}{(D-k)!2^k}\sum_{i=0}^{k}\frac{(-1)^{k-i}}{i!(k-i)!}\sum_{j=0}\frac{((D+2i-2k)x)^j}{j!}\\
&=\frac{D!}{(D-k)!2^k}\sum_{i=0}^{k}\frac{(-1)^{k-i}(D+2i-2k)^n}{i!(k-i)!}\\
&=\frac{D!}{(D-k)!2^k}\sum_{i=0}^{k}\frac{(-1)^{k-i}(D-2(k-i))^n}{i!(k-i)!}\\
&=\frac{D!}{(D-k)!2^k}\sum_{i=0}^{k}\frac{(-1)^{i}(D-2i)^n}{i!(k-i)!}\\
\end{align}
$$
最后是通过二项式反演求出$f$
$$g(n)=\sum_{i=1}^{n}\binom{n}{i}f(i)$$
$$
\begin{align}
f(i)&=\sum_{j=i}^{n}(-1)^{j-i}\binom{j}{i}g(j)\\
&=\sum_{j=i}^{n}(-1)^{j-i}\frac{j!}{i!(j-i!)}g(j)\\
f(i)&=\frac{1}{i!}\sum_{j=i}^{n}\frac{(-1)^{j-i}}{(j-i)!}j!g(j)\\
f(i)&=\frac{(-1)^i}{i!}\sum_{j=i}^{n}\frac{(-1)^{j}}{(j-i)!}j!g(j)\\
G_{j}&=(-1)^jj!g(j)\\
&=\frac{(-1)^i}{i!}\sum_{j=i}^{n}\frac{1}{(j-i)!}G_j\\
f(i)&=\frac{(-1)^i}{i!}\sum_{j=0}^{n-i}\frac{1}{j!}G_{j+i}\\
f(n-i)&=\frac{(-1)^i}{i!}\sum_{j=0}^{n-i}\frac{1}{j!}G_{n-i-j}\\
\end{align}
$$
设目标串长度为$n$，记$f(n,i)$为长度为$n$的串，没有结束，后缀匹配到第$i$位的概率
$$f(n,i)=\frac{1}{n}f(n-1,i-1)$$
$$f(n,0)=\frac{n-1}{n}\sum_{i=0}^{m-1}f(n-1,i)$$
考虑下具体数学中的做法
假设只有$H,T$,出现$TT$就停止
$$S=H+T+HH+HT+TH+HHH+HHT+HTH+THH+THT+\dots$$
$$ST=A+N$$
$$SH=B$$
$$S=A+B+H+T$$





































































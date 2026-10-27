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

$$
g(i)=f(i)i!
$$

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

$$
f(i)=\sum_{d\mid i}da_{d}
$$

$$
da_{d}=\sum_{k\mid d}\mu(\frac{d}{k})f(k)
$$

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

$$
\sum_{i=0}^{\infty}\frac{x^{2x+1}}{(2i+1)!}=\frac{e^{x}-e^{-x}}{2}
$$

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

$$
g(n)=\sum_{i=1}^{n}\binom{n}{i}f(i)
$$

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

$$
f(n,i)=\frac{1}{n}f(n-1,i-1)
$$

$$
f(n,0)=\frac{n-1}{n}\sum_{i=0}^{m-1}f(n-1,i)
$$

考虑下具体数学中的做法
假设只有$H,T$,出现$TT$就停止

$$
S=H+T+HH+HT+TH+HHH+HHT+HTH+THH+THT+\dots
$$

$$
ST=A+N
$$

$$
SH=B
$$

$$
S=A+B+H+T
$$

$$
\begin{align}
k(a+b)&\equiv ab&(\bmod n)\\
k^2&\equiv k^2+ab-k(a+b)&(\bmod n)\\
k^2&\equiv (k-a)(k-b)&(\bmod n)\\
a'b'&\equiv k^2&(\bmod n)\\
\end{align}
$$

$$
\begin{align}
f(n,k)&=\sum_{d\mid n}[d\mid k^2]\varphi(\frac{n}{d})\\
f(n,0)&=\\
\sum_{k=1}^{m}


\end{align}
$$

$$
\sum_{k=0}^{m}\sum_{d\mid \gcd(n,k^2)}d\varphi(\frac{n}{d})
$$

互斥三角形$x$
互斥点对$y$
自由点$z$
$x>0--0$

$$
\begin{align}\\
[y,n-y]\\
y=0;\\
f(x)=\prod_{i=1}^{n}(1+w_ix)\times gx^{n'}\\
y\neq0;\\
g=\prod_{i=1}^{n'}(w_{i_1}+w_{i_2})\\
\end{align}
$$

$$
\begin{align}
dp_{i,k}=dp_{i-1,k}+(i-(k-1))dp_{i-1,k-1}\\
f_{i,i-k+1}=dp_{i,k}\\
dp_{i-1,k-1}=f_{i-1,i-1-(k-1)-1}=f_{i-1,i-k-1};\\
f_{i,i-k+1}=f_{i-1,i-k}+(i-k+1)f_{i-1,i-k-1};
\end{align}
$$

我们考虑PGF，F(x)表示花费一元，最终停下时喝了n瓶饮料的生成函数，$F(x)=\sum_{i=0}p_{i}x^i$,令$p=\frac{b}{a}$
我们考虑递推，有（1-p）的概率不中奖，有p的概率中奖，得c元，相当于c个一元，又因为是独立的，我们有$F(x)=(1-p)x+pxF^{c}(x)$
则有

$$
G(F(x))=\frac{F(x)}{1-p+pF^{c}(x)}=x,G(x)=\frac{x}{1-p+px^{c}}
$$

初始有n元，生成函数就是$F^{n}(x)$，求和m瓶的概率，就是$F^{n}(x)$的$x^m$的系数
由拉格朗日反演，

$$
[x^m]F^{n}(x)=\frac{n}{m}[x^{m-n}](\frac{x}{G(x)})^{m}=\frac{n}{m}[x^{m-n}](\frac{x}{\frac{x}{1-p+px^c}})^{m}=\frac{n}{m}[x^{m-n}](1-p+px^c)^{m}
$$

显然有$[x^{ck}](1-p+px^{c})^{m}=\binom{m}{k}(1-p)^{m-k}p^{k}$
所以当$m-n\equiv 0\bmod c$时
答案为

$$
\frac{n}{m}\binom{m}{\frac{m-n}{c}}(1-p)^{m-\frac{m-n}{c}}p^{\frac{m-n}{c}}
$$

st k pos kk
pos +kkt-st kt=0
pos-st=(kk-k)t
t=\frac{pos-st}{kk-k}

tree 1-n(2e5) root=1 (x,y) st gcd(x,y)=lca(x,y)

$$
\sum f[d]
$$

$$
f[d]=\sum_{lca(u,v)=d}[gcd(u,v)=d]
$$

$$
[gcd(i,j)=1]=\sum_{d\mid gcd(i,j)}\mu(d)
$$

$$
f(n)=\sum_{d\vert{}n}g(d) \iff g(n)=\sum_{d\vert{}n}\mu(\frac{n}{d})f(d)
$$

$$
g(n)=\sum_{lca(u,v)=n}[gcd(u,v)==n]
$$

$$
f(n)=\sum_{d\mid n}g(d)=\sum_{d\mid n}\sum_{lca(u,v)=d}[gcd(u,v)=d]
$$

$$
\begin{aligned}
ans&=\sum_{d=1}\sum_{lca(u,v)=d}[gcd(u,v)=d]\\
&=\sum_{d=1}\sum_{lca(u,v)=d}[gcd(\frac{u}{d},\frac{v}{d})=1]\\
&=\sum_{d=1}\sum_{lca(u,v)=d}[d\mid u][d\mid v]\sum_{k\mid gcd(\frac{u}{d},\frac{v}{d})}\mu(k)\\
&=\sum_{k=1}^{n}\mu(k)\sum_{d=1}^{n}\sum_{lca(u,v)=d}[d\mid u][d\mid v][k\mid gcd(\frac{u}{d},\frac{v}{d})]\\
&=\sum_{k=1}^{n}\mu(k)\sum_{d=1}^{n}\sum_{i=1}^{\frac{n}{d}}\sum_{j=1}^{\frac{n}{d}}[lca(id,jd)=d][k\mid gcd(i,j)]\\
&=\sum_{k=1}^{n}\mu(k)\sum_{d=1}^{n}\sum_{i=1}^{\frac{n}{kd}}\sum_{j=1}^{\frac{n}{kd}}[lca(idk,jdk)=d]\\
&=\sum_{T=1}^{n}\sum_{d\mid T}\mu(\frac{T}{d})\sum_{i=1}^{\frac{n}{T}}\sum_{j=1}^{\frac{n}{T}}[lca(iT,jT)=d]\\
\end{aligned}
$$

对于每个点对$gcd(u,v)$是一定的，总数是$\frac{n(n-1)}{2}$，
$g[d]=\frac{n}{d}$,表示d的倍数的数，

最开始n个位置全为0，n个数，随机取一个排列p，依次将$p_i$的0变成1，求变完第i个数后极大连续1的段数的期望$E_i$
1：1
2：1,1
3:
    (1,2,3) (1,3,2)(2,1,3)(2,3,1)(3,1,2)(3,2,1)
1:
2:     1           2        1        1        2      1        $\frac{8}{6}$
3:
n>3

$$
E_{2}=\frac{2\times \binom{n}{3}\times 2!+1\times \binom{n-1}{1}\times 2!}{\binom{n}{2}\times 2!}=\frac{\frac{n(n-1)(n-2)}{3}+(n-1)}{\frac{n(n-1)}{2}}=\frac{2n(n-2)+6}{3n}
$$

$$
E_{3}=\frac{3\times\binom{n}{5}\times 3!+2\times \binom{n-1}{3}\times\binom{2}{1}\times 3!+1\times \binom{n-2}{1}\times 3!}{\binom{n}{3}\times 3!}
$$

$$
\begin{aligned}
E_{i}&=\frac{1}{\binom{n}{i}}\sum_{j=1}^{i}j\binom{i-j+j-1}{j-1}\binom{n-i+1}{j}\\
&=\frac{n-i+1}{\binom{n}{i}}\sum_{j=1}^{i}\binom{i-1}{j-1}\binom{n-i}{j-1}\\
&=\frac{n-i+1}{\binom{n}{i}}\binom{n-1}{i-1}\\
&=\frac{i(n-i+1)}{n}
\end{aligned}
$$

$$
x_1 + x_2+...+x_j=i----\binom{i-1}{j-1}
$$

$$
\begin{aligned}
g(i)&=\sum_{i=1}^{n}f(S_i,S_k)\\
&=\sum_{i=1}^{n}[s[i]==a](pre[a][i+k-1]-pre[a][k-1])\\
&=\sum_{i=1}^{n}[s[i]==a]pre[a][i+k-1]-\sum_{i=1}^{n}[s[i]==a]pre[a][k-1]\\
&=\sum_{i=1}^{n}[s[i]==a]pre[a][i+k-1]-\sum_{a}cnt_a\times pre[a][k-1]\\
\end{aligned}
$$

设$F(x)$是二叉树权重为n时方法数的生成函数，
易知$[x^0]F(x)=1$

$$
F(x)=1+C(x)F(x)F(x)=1+C(x)F^2(x)
$$

$$
C(x)F^2(x)-F(x)+1=0
$$

$$
F(x)=\frac{1\pm\sqrt{1-4C(x)}}{2C(x)}=\frac{1-(1-4C(x))}{2C(x)(1\mp\sqrt{1-4C(x)}}=\frac{2}{1+\sqrt{1-4C(x)}}
$$

考虑$x\to 0$，F(0)=1,理论上$[x^0]C(0)\to \infty$，所以取正号

$$
F(x)=\frac{1+\sqrt{4C(x)}}{2C(x)}
$$

不对，开根要求$c[0]=1$，那么取负号

$$
F(x)=\frac{1-\sqrt{4C(x)}}{2C(x)}
$$

设有n种长度个数为1，m种长度个数为2

$$
F(x)=(1+2x)^{n}(1+x)^{2m}=(\sum_{i=0}^{n}2^i\binom{n}{i}x^i)(\sum_{i=0}^{2m}\binom{2m}{i}x^i)
$$

CF900D

$$
\begin{aligned}
ans&=\sum_{n=1}^{x}\sum_{a_1+...+a_n=y}[gcd(a_1,a_2,...,a_n)=x]=f(x)\\
g(x)&=\sum_{n=1}^{y}\sum_{a_1+...+a_n=y}[x\mid gcd(a_1,a_2,...a_n)]=\sum_{n=1}^{\frac{y}{x}}\sum_{a_1+...+a_n=\frac{y}{x}}=\sum_{n=1}^{\frac{y}{x}}\binom{\frac{y}{x}-1}{n-1}=2^{\frac{y}{x}-1}\\
f(x)&=\sum_{k\mid \frac{y}{x}}\mu(k)g(kx)=\sum_{k\mid \frac{y}{x}}\mu(k)2^{\frac{y}{kx}-1}\\
f(1)&=\sum_{k\mid y}\mu(k)2^{\frac{y}{k}-1}
\end{aligned}
$$

CF839D

$$
\begin{aligned}
ans&=\sum_{k=1}^{n}\sum_{i_1<i_2<...<i_k}[\gcd(a_{i_1},...,a_{i_k})>1]k\gcd(a_{i_1},...,a_{i_k})\\
&=\sum_{k=1}^{n}\sum_{i_1<i_2<...<i_k}k\gcd(a_{i_1},...,a_{i_k})-\sum_{k=1}^{n}k\sum_{i_1<i_2<...<i_k}[\gcd(a_{i_1},...,a_{i_k})=1]\\
&=\sum_{d=1}^{n}\sum_{k=1}^{n}\sum_{i_1<i_2<...<i_k}dk[\gcd(a_{i_1},...,a_{i_k})=d]-\sum_{k=1}^{n}k\sum_{i_1<i_2<...<i_k}[\gcd(a_{i_1},...,a_{i_k})=1]\\
\end{aligned}
$$

$$
\begin{aligned}
f(d)&=\sum_{k=1}^{n}\sum_{i_1<...<i_k}k[\gcd(a_{i_1},...,a_{i_k})=d]\\
g(d)&=\sum_{k=1}^{n}\sum_{i_1<...<i_k}k[d\mid\gcd(a_{i_1},...,a_{i_k})]\\
g(d)&=\sum_{k=1}f(kd)\\
f(d)&=\sum_{k=1}^{\frac{n}{d}}\mu(k)g(kd)\\
A&=\sum_{d=2}^{n}df(d)\\
f(d)&=g(d)-\sum_{k=2}^{\frac{n}{d}}f(kd)\\
\end{aligned}
$$

设有x个数满足$d\mid a_{i}$

$$
g(d)=\sum_{i=1}^{x}i\binom{x}{i}=\sum_{i=1}^{x}i\frac{x}{i}\binom{x-1}{i-1}=x2^{x-1}
$$

$$
\begin{aligned}
B&=\sum_{k=1}^{n}k\sum_{i_1<i_2<...<i_k}[\gcd(a_{i_1},...,a_{i_k})=1]\\
h(d)&=\sum_{k=1}^{n}k\sum_{i_1<i_2<...<i_k}[\gcd(a_{i_1},...,a_{i_k})=d]\\
i(d)&=\sum_{k=1}^{n}k\sum_{i_1<i_2<...<i_k}[d\mid\gcd(a_{i_1},...,a_{i_k})=g(d)\\
h(d)&=f(d)\\
B&=f(1)\\
ans&=\sum_{k=1}^{n}\mu(k)\sum_{d\mid k}g(d)-\sum_{k}\mu(k)g(k)
\end{aligned}
$$

$$
F(x)=\sum_{i=0}^{n}\frac{f(i)(x-1)...(x-(i-1))(x-(i+1))...(x-n)}{(i-1)...1(-1)...(1(n-i))}=\sum_{i=0}^{n}\frac{f(i)pre(i-1)sub(i+1)}{(-1)^{n-i}(i-1)!(n-i)!}
$$

$$
G(x)=x\times((\sum_{S\subseteq T,S\neq \emptyset,f(S)=x}(\sum_{y\in S}y)^2)\bmod 1000000007)
$$

我们先考虑计算$\sum_{S\subseteq T}(\sum_{y\in S}y)^2$
即给定集合$T,|T|=k$，求所有子集元素的的平方的和

$$
\begin{aligned}
\sum_{S\subseteq T}(\sum_{y\in S}y)^2&=\sum_{S\subseteq T}(\sum_{y\in S}y^2+2\sum_{x<y\in S}xy)\\
&=2^{k-1}\sum_{y\in T}y^2+2\times 2^{k-2}\sum_{x<y\in T}xy\\
&=2^{k-1}\sum_{x\in T}x^2+2^{k-2}((\sum_{x\in T}x)^2-\sum_{x\in T}x^2)\\
&=2^{k-2}(\sum_{x\in T}x^2+(\sum_{x\in T}x)^2)
\end{aligned}
$$

我们维护$cnt[x],sum1[x],sum2[x]$，为十进制下每一位都大于等于x的个数，和，平方和，因为这样作用到f的结果一定是大于等于x，结果记作$g(x)$
$h(x)$为f结果恰好为x，那么$g(x)=\sum_{y} h(y)$
通过高维差分从g求出h

$$
\sum_{i=1}^N \tau(i^3) \pmod{10^9+7}
$$

min25要求f（p）完全积性，f(p^c)可快速求值

$$
\tau(p)=2,\tau(p^3)=4,\tau(p^{3c})=3c+1
$$

$$
F_{prime}(n)=4\sum_{p\le n}
$$

$$
G_k(n)=G_{k-1}(n)-[p_k^2\le n]g(p_k)(G_{k-1}(\frac{n}{p_k})-G_{k-1}(p_{k-1}))
$$

$$
\begin{aligned}
f(1)&=1\\
f(p^c)&=p\oplus c\\
f(ab)&=f(a)f(b)\\
\end{aligned}
$$

$$
f(2)=3
$$

$$
f(p)=p-1(p>2,p\in Prime)
$$

我们取$g(x)=x-1$

$$
G_k(n)=G_{k-1}(n)-[p_k^2\le n](p_k-1)(G_{k-1}(\frac{n}{p_k})-G_{k-1}(p_{k-1}))
$$

$$
v_{x,y}\ge \sum_{1\le i\le n,i\ne x}v_{i,y}+\sum_{1\le j\le m,j\ne y}v_{x,j}
$$

$$
v_{x,y}-k\ge \sum_{1\le i\le n,i\ne x}v_{i,y}-(n-1)k+\sum_{1\le j\le m,j\ne y}v_{x,j}-(m-1)k
$$

$$
v_{x,y}-\sum_{1\le i\le n,i\ne x}v_{i,y}-\sum_{1\le j\le m,j\ne y}v_{x,j}\ge k(3-n-m)
$$

$$
mx=L=n\times m
$$

$$
x(L-2)+y(L-1)\ge b_1
$$

$$
x(L-2)+y(L-3)\ge b_{mid}
$$

$$
x(2L-4)+y(2L-4)\ge b_1+b_{mid}
$$

$$
x(L-2)+y(L-1)+z(L-3)\ge b_1
$$

$$
x(L-2)+y(L-3)+z(L-1)\ge b_L
$$

$$
x(L-2)+y(L-3)+z(L-3)\ge b_{mid}
$$

$$
x(2L-4)+y(2L-4)+z(2L-4)\ge b_1+b_L
$$

$$
x(2L-4)+y(2L-4)+z(2L-6)\ge b_1+b_{mid}
$$

$$
x(2L-4)+y(2L-6)+z(2L-4)\ge b_L+b_{mid}
$$

$dp[i][j]$表示考虑前i个余数的个数，其和mod m为j的总方案数

$$
dp[i][j],cnt[i+1],g[i+1][k]=\sum_{x=1}^{cnt[i+1]}[x(i+1)\bmod m=k],\varphi(x)
$$

$$
g[i+1][k]-g[i][k]=\sum_{x=1}^{cnt[i+1]}[x(i+1)\bmod m=k]-\sum_{x=1}^{cnt[i]}[xi\bmod m=k]
$$

$$
dp[i+1][j+k]+=dp[i][j]\times g[i+1][k]
$$

考虑到cnt[i]=K均相同

$$
ans=(\prod_{i=0}^{m-1}(1+x^i))^K \bmod (x^m-1)
$$

$$
[n|k]=1/n*\sum_{i=0}^{n-1}w_{n}^{ik}
$$

$$
\sum_{k=0}^{+\infty}[n|k][x^k]F=1/n \sum_{i=0}^{n-1}F(w_n^i)
$$

$$
x^{m}-1=\prod_{i=0}^{m-1}(x-w_m^{i})
$$

$$
F(x)=(\prod_{i=0}^{m-1}(1+x^i))^K
$$

$$
\begin{aligned}
F(w_m^j)&=(\prod_{i=0}^{m-1}(1+w_m^{ij}))^K,\gcd(j,m)=g\\
&=(\prod_{i=0}^{\frac{m}{g}-1}(1+w_{\frac{m}{g}}^{i}))^{gK}\\
&=(1-(-1)^{\frac{m}{g}})^{gK}
\end{aligned}
$$

$$
\begin{aligned}
m\times ans&=\sum_{j=0}^{m-1}(1-(-1)^{\frac{m}{g}})^{gK}[\gcd(j,m)=g]\\
&=2^{mK}+\sum_{g\mid m,g<m}(1-(-1)^{\frac{m}{g}})^{gK}\sum_{j=1}^{\frac{m}{g}-1}[\gcd(j,\frac{m}{g})=1]\\
&=2^{mK}+\sum_{g\mid m,g<m}(1-(-1)^{\frac{m}{g}})^{gK}\varphi(\frac{m}{g})\\
\end{aligned}
$$

$$
\begin{aligned}
ans&=\sum_{S\subseteq T,S\neq \emptyset}|S|^{k}\\
&=\sum_{x=0}^{n}\binom{n}{x}x^{k}\\
&=\sum_{x=0}^{n}\binom{n}{x}\sum_{i=0}^{k}{k\brace i}i!\binom{x}{i}\\
&=\sum_{i=0}^{k}\sum_{x=0}^{n}\binom{n}{x}\binom{x}{i}{k\brace i}i!\\
&=\sum_{i=0}^{k}{k\brace i}i!\sum_{x=0}^{n}\binom{n}{x}\binom{x}{i}\\
&=\sum_{i=0}^{k}{k\brace i}i!\sum_{x=0}^{n}\binom{n}{i}\binom{n-i}{x-i}\\
&=\sum_{i=0}^{k}{k\brace i}i!\binom{n}{i}\sum_{x=0}^{n}\binom{n-i}{x-i}\\
&=\sum_{i=0}^{k}{k\brace i}i!\binom{n}{i}2^{n-i}\\
&=\sum_{i=0}^{k}{k\brace i}i!\frac{n!}{i!(n-i)!}2^{n-i}\\
&=\sum_{i=0}^{k}{k\brace i}\frac{n!}{(n-i)!}2^{n-i}\\
\end{aligned}
$$

n=3,k=2

$$
1*3*4+1*6*2
$$

$$
\begin{aligned}
ans&=\sum_{i=0}^{n}\sum_{j=0}^{n}(-1)^{i+j}\binom{n}{i}\binom{n}{j}(k-1)^{i\times n+j\times n-i\times j}k^{n^2-(i+j)n+ij}\\
ans&=\sum_{i=0}^{n}\sum_{j=0}^{n}(-1)^{i+j}\binom{n}{i}\binom{n}{j}(k-1)^{(i+ j)n-ij}k^{n^2-(i+j)n+ij}\\
\end{aligned}
$$

这样$n^{2}\log{n}$可以过，尝试优化

$$
\begin{aligned}
ans&=\sum_{i=0}^{n}\sum_{j=0}^{n}(-1)^{i+j}\binom{n}{i}\binom{n}{j}(k-1)^{(i+ j)n-ij}k^{n^2-(i+j)n+ij}\\
&=k^{n^2}(n!)^{2}\sum_{i=0}^{n}\sum_{j=0}^{n}(-1)^{i+j}\frac{1}{(n-i)!i!}\frac{1}{(n-j)!j!}(k-1)^{in}(k-1)^{j(n-i)}k^{-in}k^{j(i-n)}\\
&=k^{n^2}(n!)^{2}\sum_{i=0}^{n}\sum_{j=0}^{n}(-1)^{i+j}\frac{1}{(n-i)!i!}\frac{1}{(n-j)!j!}(\frac{k-1}{k})^{in}(\frac{k-1}{k})^{(n-i)j}\\
&=k^{n^2}(n!)\sum_{i=0}^{n}\sum_{j=0}^{n}(-1)^{i+j}\frac{1}{(n-i)!i!}\binom{n}{j}(\frac{k-1}{k})^{in}(\frac{k-1}{k})^{(n-i)j}\\
&=k^{n^2}(n!)\sum_{i=0}^{n}(-1)^{i}\frac{1}{(n-i)!i!}(\frac{k-1}{k})^{in}\sum_{j=0}^{n}(-1)^{j}\binom{n}{j}(\frac{k-1}{k})^{(n-i)j}\\
&=k^{n^2}(n!)\sum_{i=0}^{n}(-1)^{i}\frac{1}{(n-i)!i!}(\frac{k-1}{k})^{in}(1-(\frac{k-1}{k})^{n-i})^{n}\\
&=\sum_{i=0}^{n}(-1)^{i}\frac{n!}{(n-i)!i!}((k-1)^{i}k^{n-i}-(k-1)^{n})^{n}\\
&:O(n\log n)
\end{aligned}
$$

$$
\begin{aligned}
ans&=\sum_{i=0}^{n}P(x=i)x^{k}\\
P(x=i)&=\binom{n}{i}p^{i}(1-p)^{n-i}\\
ans&=\sum_{i=0}^{n}\binom{n}{i}p^{i}(1-p)^{n-i}i^{k}\\
&=\sum_{i=0}^{n}\binom{n}{i}p^i(1-p)^{n-i}\sum_{j=0}^{k}{k\brace j}j!\binom{i}{j}\\
&=\sum_{j=0}^{k}{k\brace j}j!\sum_{i=0}^{n}p^i(1-p)^{n-i}\binom{n}{i}\binom{i}{j}\\
&=\sum_{j=0}^{k}{k\brace j}j!\binom{n}{j}\sum_{i=j}^{n}p^i(1-p)^{n-i}\binom{n-j}{i-j}\\
&=\sum_{j=0}^{k}{k\brace j}j!\binom{n}{j}\sum_{i=j}^{n}p^{i-j+j}(1-p)^{n-j-i+j}\binom{n-j}{i-j}\\
&=\sum_{j=0}^{k}{k\brace j}j!\binom{n}{j}(p)^{j}\sum_{i=j}^{n}p^{i-j}(1-p)^{n-j-i}\binom{n-j}{i-j}\\
&=\sum_{j=0}^{k}{k\brace j}j!\binom{n}{j}(p)^{j}\\
&=\sum_{j=0}^{k}{k\brace j}\frac{n!}{(n-j)!}(p)^{j}\\
&=\sum_{i=0}^{k}{k\brace i}\frac{n!}{(n-i)!}(p)^{i}\\

\end{aligned}
$$

$$
(n,m,k)=(2,2,2),p(1-p)=\frac{1}{4}
$$

$$
1*2*(1/4)^{1}+1*1*(1/4)^2=\frac{9}{16}
$$

$$
\begin{aligned}
ans&=\sum_{i=0}^{n}\binom{3i}{t}\\
&=\sum_{i=0}^{n}\frac{(3i)!}{t!(3i-t)!}\\
&=\frac{1}{t!}\sum_{i=0}^{n}\frac{(3i)!}{(3i-t)!}\\
A(x)&=\sum_{i=0}^{3n}\frac{1}{i!}x^{i}\\
A_1(x)&=\sum_{i=0}^{3n}\frac{1}{(3n-i)!}x^{i}\\
B(x)&=\sum_{i=0}^{3n}i!x^i\\
[x^{k}]A_1(x)B(x)&=\sum_{i+j=k}\frac{j!}{(3n-i)!}x^{i+j}\\
j-(3n-i)&=t=i+j-3n:k=3n+t\\
[x^{3n+t}]A_1(x)B(x)&=\sum_{i+j=3n+t}\frac{(3n+t-i)!}{(3n-i)!}x^{3n+t}\\
\end{aligned}
$$

模数是1e9+7不太可以

$$
\begin{aligned}
ans_{t}&=\sum_{i=0}^{n}\binom{3i}{t}\\
&=\sum_{i=0}^{n}[x^{t}](1+x)^{3i}\\
&=[x^t]\frac{(1+x)^{3(n+1)}-1}{(1+x)^{3}-1}\\
&=[x^t]\frac{(1+x)^{3(n+1)}-1}{x^3+3x^2+3x}\\
\sum_{i=0}ans_ix^i&=\frac{(1+x)^{3(n+1)}-1}{x(x^2+3x+3)}\\
(x^2+3x+3)\sum_{i=0}ans_ix^i&=\frac{(1+x)^{3(n+1)}-1}{x}\\
[x^{i+2}]&=ans_i+3ans_{i+1}+3ans_{i+2}=\binom{3n+3}{i+3}\\
ans_{i+2}&=\frac{\binom{3n+3}{i+3}-3ans_{i+1}-ans_i}{3}\\
ans_{i}&=\frac{\binom{3n+3}{i+1}-3ans_{i-1}-ans_{i-2}}{3}\\
\end{aligned}
$$

CF891E非常神仙的转化

$$
(a_x-1)\prod_{i\neq x}^{n}a_i=\prod_{i}^{n}a_i-\prod_{i\neq x}^na_i
$$

所以最终的

$$
res=\prod_{i}^{n}a_i-\prod_{i}^{n}a'_{i}
$$

那我只要求最后剩下序列的值乘积的期望就可以了，没有0截断

$$
E(\prod_{i}^{n}a'_i)=\prod_{i}^{n}E(a'_i)?
$$

设每个地方被减了b次

$$
\begin{aligned}
\sum_{i=1}^{n}&b_i=k\\
n^k\times ans&=\sum_{b_1+b_2+...+b_n=k}\binom{k}{b_1,b_2,...,b_n}\prod_{i=1}^{n}(a_i-b_i)\\
&=k!\sum_{b_1+b_2+...+b_n=k}\prod_{i=1}^{n}\frac{a_i-b_i}{b_i!}\\
F_i(x)&=\sum_{b=0}\frac{a_i-b}{b!}x^{b}=a_ie^{x}-xe^x=(a_i-x)e^x\\
n^k\times ans&=k!\prod_{i=1}^{n}F_i(x)\\
&=k![x^k]e^{nx}\prod_{i=1}^{n}(a_i-x)
\end{aligned}
$$

$$
\begin{aligned}
\prod_{i=1}^{n}(a_i-x)&=\sum_{i=0}^{n}b_ix^i\\
ans&=\frac{k!}{n^k}[x^k]\sum_{i=1}\frac{n^{i}}{i!}x^i\sum_{i=0}^{n}b_ix^{i}\\
&=\frac{k!}{n^k}\sum_{i=0}^{n}b_i\frac{n^{k-i}}{(k-i)!}\\
&=\sum_{i=0}^{n}b_i\frac{k!}{(k-i)!n^i}
\end{aligned}
$$

妈的，mod=1e9+7

$$
(a-x)\sum_{i=0}^{m}b_ix^i=\sum_{i=0}^{m+1}(ab_i-b_{i-1})x^i
$$

$$
\begin{aligned}
c_1,c_2,c_3,c_4,c_5\\
c_2-c_1,c_3-c_2,c_4-c_3,c_5-c_4\\
c_1,c_2,c_2+c_4-c_3,c_4,c_5\\
c_2-c_1,c_4-c_3,c_3-c_2,c_5-c_4\\
\end{aligned}
$$

本质上是交换差值

$$
a_1,a_2
$$

$$
\begin{aligned}
(a_1\& a_2)^2+(a_1 | a_2)^2&\ge a_1^2+a_2^2
\\but&\\ 
a_1\&a_2&\le \min(a_1,a_2)\\
0+(2^{i}+2^{j})^{2}&\ge (2^i)^2+(2^j)^2\\
(\sum 2^i)^2+(\sum 2^j)^2&\ge (\sum 2^x)^2+(\sum 2^y)^2?\\
\sum 2^i+\sum2^j&=\sum 2^x+\sum 2^y\\ 
\end{aligned}
$$

有种PGF的感觉，$F_{i}(x)$表示当前数字是i的分布

$$
\begin{aligned}
F_i(x)&=\sum_{j=0}^{i}\frac{1}{i+1}x^j\\
F_{n,1}(x)&=\sum_{i=0}^{n}\frac{1}{n+1}x^i\\
F_{n,j}(x)&=\sum_{i=0}^{n}\frac{1}{n+1}F_{i,j-1}(x)\\
F_{n,2}(x)&=\sum_{i=0}^n\frac{1}{n+1}\sum_{j=0}^i\frac{1}{i+1}x^j\\
&=\sum_{i=0}^nx^i\frac{1}{n+1}\times \sum_{j=i}^{n}\frac{1}{j+1}
\end{aligned}
$$

$$
n,n,n,n-1,n-1,n-3,n-3,1
$$

$$
\frac{1}{n}\frac{1}{n}\frac{1}{n}\frac{1}{n}\frac{1}{n-1}\frac{1}{n-1}\frac{1}{n-3}\frac{1}{n-3}
$$

$$
\begin{aligned}
{[x^i]}F_{n,j}(x)&=\frac{1}{n}\sum_{a_n+a_{n-1}+...+a_{i+1}+a'_i=j-1}\binom{j-1}{a_n,a_{n-1},...,a_{i+1},a_{i}}\prod_{k=i}^{n}(\frac{1}{k+1})^{a_k}WrongAns\\
&=\frac{1}{n}\sum_{a_n+a_{n-1}+...+a_{i+1}+a'_i=j-1}\frac{(j-1)!}{a_n!a_{n-1}!...a_{i+1}!a_{i}!}\prod_{k=i}^{n}(\frac{1}{k+1})^{a_k}\\
&=\frac{(j-1)!}{n}\sum_{a_n+a_{n-1}+...+a_{i+1}+a'_i=j-1}\prod_{k=i}^{n}\frac{1}{a_k!}(\frac{1}{k+1})^{a_k}\\
\end{aligned}
$$

$$
\begin{aligned}
e^{\frac{1}{k+1}x}&=\sum_{i=0}\frac{(\frac{1}{k+1})^i}{i!}x^i\\
[x^i]F_{n,j}(x)&=\frac{(j-1)!}{n}[x^{j-1}]\prod_{k=i}^{n}e^{\frac{x}{k+1}}\\
&=\frac{(j-1)!}{n}[x^{j-1}]e^{x\sum_{k=i}^{n}\frac{1}{k+1}}\\
&=\frac{(j-1)!}{n}[x^{j-1}]\sum_{t=0}\frac{1}{t!}(\sum_{k=i}^{n}\frac{1}{k+1})^tx^t\\
&=\frac{(j-1)!}{n}\frac{(\sum_{k=i}^{n}\frac{1}{k+1})^{j-1}}{(j-1)!}\\
&=\frac{(\sum_{k=i}^{n}\frac{1}{k+1})^{j-1}}{n}\\
\end{aligned}
$$

$$
\begin{aligned}
ans_i&=\sum_{k=i}^{n}p_k\frac{(s_{k}-s_{i-1})^{j-1}}{k}\\
e^{s_kx}&=\sum_{i=0}\frac{1}{i!}s_k^ix^i\\
e^{(s_k-s_{i-1})x}&=\sum_{i=0}\frac{1}{i!}(s_k-s_{i-1})^ix^i\\
ans_i&=\sum_{k=i}^{n}\frac{p_k}{k}[x^{j-1}](j-1)!\frac{e^{s_kx}}{e^{s_{i-1}x}}\\
&=[x^{j-1}]\frac{(j-1)!}{e^{s_{i-1}x}}\sum_{k=i}^{n}\frac{p_ke^{s_kx}}{k}\\
&=[x^{j-1}](j-1)!\sum_{k_1=0}\frac{(-s_{i-1})^{k_1}x^{k_1}}{k_1!}\sum_{k=i}^{n}\frac{p_k}{k}\sum_{k_2=0}\frac{s_k^{k_2}x^{k_2}}{k_2!}\\
&=[x^{j-1}](j-1)!\sum_{k_1=0}\frac{(-s_{i-1})^{k_1}x^{k_1}}{k_1!}\sum_{k_2=0}\frac{x^{k_2}\sum_{k=i}^{n}\frac{p_k}{k}s_k^{k_2}}{k_2!}\\
\end{aligned}
$$

$$
\begin{aligned}
p'_i&=\sum_{j=i}^{n}\frac{p_j}{j+1}\\
q_i&=\sum_{j=i}^{n}\binom{j}{i}p_j\\
q'_i&=\sum_{j=i}^{n}\binom{j}{i}\sum_{k=j}^{n}\frac{p_k}{k+1}\\
&=\sum_{k=i}^{n}\frac{p_k}{k+1}\sum_{j=i}^{k}\binom{j}{i}\\
&=\sum_{k=i}^{n}\frac{p_k}{k+1}\binom{k+1}{i+1}\\
&=\sum_{k=i}^{n}\frac{p_k}{i+1}\binom{k}{i}\\
&=\frac{1}{i+1}q_i
\end{aligned}
$$

$$
\begin{aligned}
q_i&=\sum_{j=i}^{n}\binom{j}{i}p_j\\
&=\sum_{j=i}^{n}\frac{j!p_j}{i!(j-i)!}\\
i!q_i&=\sum_{j=i}^{n}\frac{1}{(j-i)!}j!p_j\\
A(x)&=\sum j!p_jx^j\\
B(x)&=\sum \frac{1}{(n-i)!}x^i\\
[x^{n+t}]A(x)B(x)&=\sum_{i+j=n+t}i!p_i\frac{1}{(i-t)!}x^{n+t}\\
p_i&=\sum_{j=i}^{n}(-1)^{j-i}\binom{j}{i}q_j

\end{aligned}
$$

$$
f(k) = \sum_{i=k}^n \binom{i}{k} g(i) \iff g(k) = \sum_{i=k}^n (-1)^{i-k} \binom{i}{k} f(i)
$$

$$
x^k = \sum_{i=0}^k \begin{Bmatrix} k \\ i \end{Bmatrix} x^{\underline{i}}
$$

$$
\begin{Bmatrix} k \\ m \end{Bmatrix} = \frac{1}{m!} \sum_{i=0}^m (-1)^{m-i} \binom{m}{i} i^k
$$

$$
A'_i = \sum_{j} (-1)^{\text{popcount}(i \text{ AND } j)} A_j
$$

$$
F(n) = \sum_{d\vert{}n} f(d) \iff f(n) = \sum_{d\vert{}n} \mu\left(\frac{n}{d}\right) F(d)
$$

$$
\begin{aligned}
ans&=\sum_{i=1}^n(x_i-y_i+c)^2\\
&=\sum_{i=1}^{n}x_i^2+y_i^2+c^2+2cx_i-2cy_i-2x_iy_i\\
&=\sum x^2+\sum y^2+nc^2+(2\sum x-2\sum y)c-2\sum x_iy_i,c=-\frac{b}{2a}=\frac{\sum y-\sum x}{n}\\
\sum_{i=1}^{n}x_iy_i&=\max_{k} \sum_{i=1}^{n}x_iy_{i+k}\\
A(t)&=\sum_{i=1}^{n}x_{n-i+1}t^i\\
B(t)&=\sum_{i=1}^{n}y_{i}t^i\\
[x^{n+k}]A(t)B(t)&=\sum_{i+j=n+k}x_{n-i+1}y_jx^{i+j},j-n+i-1=n+k-n-1=k-1\\
\end{aligned}
$$

$$
\begin{aligned}
F(i)&=\sum_{j=i}^{n}(-1)^{n-j}\binom{n}{j}G(j)

\end{aligned}
$$

## 一、 形式一：后缀和形式（“钦定”转“恰好”）

这是在算法竞赛中**最常考、最实用**的形式。通常用于解决“恰好满足 $k$ 个条件”极难直接计算，而“钦定满足 $k$ 个条件，其余随意”很容易计算的场景。

- **推导公式**：

    $$
    f(k) = \sum_{i=k}^n \binom{i}{k} g(i) \iff g(k) = \sum_{i=k}^n (-1)^{i-k} \binom{i}{k} f(i)
    $$

- **物理映射**：

    - $g(i)$：**恰好**满足 $i$ 个条件的方案数。

    - $f(k)$：**钦定**（或选定）$k$ 个条件必须满足，剩下 $n-k$ 个条件随意的方案数。此时一个恰好满足 $i$ 个条件的方案，会在 $f(k)$ 中被计算 $\binom{i}{k}$ 次。

## 二、 形式二：前缀和形式（局部转全局）

这与形式一互为镜像，求和方向从后缀变成了前缀，通常用于从子集的方案数反推整体的精确方案数。

- **推导公式**：

    $$
    f(k) = \sum_{i=0}^k \binom{k}{i} g(i) \iff g(k) = \sum_{i=0}^k (-1)^{k-i} \binom{k}{i} f(i)
    $$

- **物理映射**：

    - 常用于多项式平移映射（例如泰勒展开中的 $P(x+1)$ 展开）或是处理“至多存在 $k$ 个”的容斥问题。

## 三、 形式三：交错对称形式（标准容斥等价）

这种形式极为优美，因为它具有**自反演**性质（即正向和逆向的公式形式完全一模一样，只交换了 $f$ 和 $g$）。

- **推导公式**：

    $$
    f(n) = \sum_{i=0}^n (-1)^i \binom{n}{i} g(i) \iff g(n) = \sum_{i=0}^n (-1)^i \binom{n}{i} f(i)
    $$

- **物理映射**：

    - 它本质上是标准容斥原理（Inclusion-Exclusion Principle）最直接的代数等价物。当题目中出现交错正负号的组合数求和时，通常就是在这个形式上进行变形。

## 四、 形式四：二维推广形式

当约束条件扩展到两个维度（例如在棋盘上同时限制行和列）时，一维的二项式反演可以直接扩展到二维。

- **推导公式**：

    $$
    f(x, y) = \sum_{i=x}^n \sum_{j=y}^m \binom{i}{x} \binom{j}{y} g(i, j)
    $$

    $$
    \iff g(x, y) = \sum_{i=x}^n \sum_{j=y}^m (-1)^{(i-x) + (j-y)} \binom{i}{x} \binom{j}{y} f(i, j)
    $$

## 附：底层证明的正交性核心

上述所有形式的二项式反演，无论正负号如何分配，其底层都只依赖于一个绝对的**组合正交性恒等式**（利用二项式定理展开 $(1-1)^{n-k}$ 可证）：

$$
\sum_{i=k}^n (-1)^{i-k} \binom{n}{i} \binom{i}{k} = [n = k]
$$

在将 $f(x)$ 代入逆向公式去求解 $g(x)$ 时，只要将求和符号交换，最终都会坍缩为这个只在 $n=k$ 时为 $1$、其余均为 $0$ 的正交条件，从而完成状态的精准剥离。

$$
f(k) = \sum_{i=k}^n \binom{i}{k} g(i) \iff g(k) = \sum_{i=k}^n (-1)^{i-k} \binom{i}{k} f(i)
$$

 $g(i)$：**恰好**满足 $i$ 个条件的方案数。
$f(k)$：**钦定**（或选定）$k$ 个条件必须满足，剩下 $n-k$ 个条件随意的方案数。此时一个恰好满足 $i$ 个条件的方案，会在 $f(k)$ 中被计算 $\binom{i}{k}$ 次。

$$
\begin{aligned}
f(k)&=\binom{n}{k}\binom{n}{k}k!(2!)^k(2n-2k)!\\
g(k)&=\sum_{i=k}^{n}(-1)^{i-k}\binom{i}{k}\binom{n}{i}\binom{n}{i}i!2^i(2n-2i)!\\
&=\sum_{i=k}^{n}(-1)^{i-k}\frac{i!}{k!(i-k)!}\frac{n!}{i!(n-i)!}\frac{n!}{i!(n-i)!}i!2^i(2n-2i)!\\
&=\sum_{i=k}^{n}(-1)^{i-k}\frac{1}{k!(i-k)!}\frac{n!}{(n-i)!}\frac{n!}{(n-i)!}2^i(2n-2i)!\\
\frac{k!g(k)}{2^k(n!)^2}&=\sum_{i=k}^{n}(-1)^{i-k}\frac{2^{i-k}}{(i-k)!}\frac{(2(n-i))!}{((n-i)!)^2}\\
A(x)&=\sum_{i=0}^{n}\frac{(-1)^i2^i}{i!}x^i\\
B(x)&=\sum_{i=0}^{n}\frac{(2i)!}{(i!)^2}x^i\\
[x^{n-k}]A(x)B(x)&=\sum_{i+j=n-k}\frac{(-1)^i2^i}{i!}\frac{(2j)!}{j!j!}x^{i+j}\\
(m!)^2[x^m]A(x)B(x)&=\sum_{i=0}^m\frac{(-1)^i2^i}{i!}\frac{m!m!(2m-2i)!}{(m-i)!(m-i)!}\\
&=\sum_{i=0}^{m}(-1)^i\binom{m}{i}\binom{m}{i}i!2!(2m-2i)!=D_m\\
\end{aligned}
$$

$$
D_m=4m(m-1)(D_{m-1}+2(m-1)D_{m-2})
$$

$$
ans_k=\frac{n!n!2^k}{k!}\frac{D_{n-k}}{(n-k)!(n-k)!}
$$

$$
\begin{aligned}
F(x)&=1+xF^m(x)\\
x&=\frac{F(x)-1}{F^{m}(x)}\\
\end{aligned}
$$

有标号无根树Prüfer 序列
- **树与序列的等价**：一棵 $N$ 个节点的有标号无根树，与一个长度为 $N-2$、值域在 $[1, N]$ 的整数序列构成一一映射。
- **度数与频次的等价**：节点 $i$ 在树中的度数如果为 $d_i$，那么数字 $i$ 在 Prüfer 序列中恰好出现了 $d_i - 1$ 次。

Nim先手必胜是异或和不为0

$$
a_1,a_2,...,a_n
$$

$$
\begin{aligned}
s_{i}\oplus s_{j},j<i\\
s_{i_1},s_{i_2}\oplus s_{i_1},s_{i_3}\oplus s_{i_2},...,s_{i_k}\oplus s_{i_{k-1}}\\
=s_{i_1},s_{i_2},s_{i_3},...,s_{i_k}\\

\end{aligned}
$$

我终于看到了FWT

$$
\begin{aligned}
pre:a_0,a_1,a_2,...,a_n\\
aft:a_0\oplus x,a_2\oplus x,a_3\oplus x,...，a_n\oplus x\\
ans_x&=\sum cnt_{a_i}val_{a_i\oplus x}\\
ans_x&=\sum_{i\oplus j=x}cnt_i val_j
\end{aligned}
$$

$$
\begin{aligned}
F(x)&=\prod_{\oplus}(1+x^{a_i})=\sum_{i=0}^{2^m-1}b_ix^i\\
ans&=\sum b_i[popcount(i)\bmod2=1]\\
\sum [popcount(i)\bmod 2=1]&=\sum[popcount(i)\bmod 2=0]\\
ans_x&=\sum_{}b_i[popcount(i)=x]\\


\end{aligned}
$$

## ⚙️ 拟阵的绝对定义：两大公理

想象你有一个巨大的“物品库”（在数学上叫基础集 $E$），比如一堆边，或者一堆数字。

在这个库里，有些物品的组合是“合法”的（数学上叫**独立集**）。

要让这个系统被称为“拟阵”，它必须且只须满足两条极其霸道的公理：

### 1. 遗传性公理 (Hereditary Property)

- **大白话**：如果你手里有一把合法的牌，你随便扔掉几张，剩下的牌**绝对依然合法**。
- **数学语言**：如果集合 $A$ 是独立的，且 $B \subset A$，那么 $B$ 必然也是独立的。
- **反例（非拟阵）**：如果你要凑一个“总和大于 100”的集合。集合 $\{50, 60\}$ 是合法的，但你扔掉 $60$，剩下的 $\{50\}$ 就不合法了。所以这**不是**拟阵。

### 2. 扩充性公理 (Exchange Property / 交换律)

- **大白话**：如果张三手里的合法牌比李四多，那么张三手里**绝对至少有一张牌**，可以直接送给李四，且李四拿到这张牌后，手里的牌**依然合法**。
- **数学语言**：如果 $A$ 和 $B$ 都是独立集，且 $\vert{}A\vert{} < \vert{}B\vert{}$，那么必定存在一个元素 $x \in B \setminus A$，使得 $A \cup \{x\}$ 也是独立集。
- **这是贪心不败的终极底牌**：它保证了你永远不会走进死胡同。如果你现在选的集合还不够大，只要最优解比你大，最优解里就必然有元素能被你继续吸收。

## 🗺️ 拟阵在代码里的真实分身

拟阵听起来很抽象，但在 ICPC 中，它主要有两个你极其熟悉的真实分身：

### 分身一：图拟阵 (Graphic Matroid) —— 对应 Kruskal 算法

- **物品库 $E$**：图里所有的边。
- **合法（独立）的定义**：选出的一堆边**没有环**（也就是森林）。
- **验证公理 1（遗传性）**：一个没有环的森林，随便删掉几条边，显然还是没有环。
- **验证公理 2（扩充性）**：假设森林 $A$ 有 3 条边，森林 $B$ 有 5 条边。因为 $B$ 的边数更多，它连接的连通块更少。你绝对能在 $B$ 中找到一条边，加到 $A$ 里面去，且不会让 $A$ 产生环。
- **贪心收割**：因为没有环构成了拟阵，所以求最小/大生成树时，我们直接按边权排序，只要不形成环就无脑往里塞（并查集维护），绝对能得到最优解。

### 分身二：向量拟阵 (Vector Matroid) —— 对应 线性基 (P4570)

- **物品库 $E$**：给定的一堆数字（向量）。
- **合法（独立）的定义**：选出的一堆数字**线性无关**（即互相之间无法异或出 0）。
- **验证公理 1（遗传性）**：一堆无法异或出 0 的数字，随便去掉几个，剩下的更不可能异或出 0 了。
- **验证公理 2（扩充性）**：这对应线性代数中的“斯坦尼茨替换定理”。如果集合 $A$ 有 3 个线性无关的向量，集合 $B$ 有 5 个。那 $B$ 跨越的维度绝对比 $A$ 大，$B$ 里面绝对有向量在 $A$ 的空间之外，把它加入 $A$ 依然线性无关。
- **贪心收割**：因为线性无关构成了拟阵，所以求最大权值独立集时，我们直接按权值排序，只要能塞进线性基就无脑塞，绝对能得到最大权值。

$$

1,2,3,4,5*-*

1,3,5,19,89

$$

$$
\begin{aligned}
1\le a<&b<c\le n\\
2b&=a+c\\
b&=a\oplus c\\
c:&11xxxz\\
b:&10xxxx\\
a:&01xxxz\\
2b:&10xxxx0\\
c:&11xxxx\\
a:&01xxxx\\
a+c:&10yyyyy\\
b:&10xxxx\\
c:&11\\
b:&10\\
a:&01\\
0110+0100+
\end{aligned}
$$

我们考察二进制位，最高位c为1，异或和为0，那么b为1，a为0，

$$
\begin{aligned}
a+c&=2(a\oplus c)\\
(a\oplus c)+2(a\land c)&=2(a\oplus c)\\
2(a\land c)&=(a\oplus c)\\
a\oplus c&=2x\\
a\land c&=x\\

\end{aligned}
$$

$$
\begin{aligned}
dp_i&=\frac{1}{m}\sum_{j\mid i}dp_j\sum_{}[\gcd(\frac{m}{j},\frac{i}{j})=1]\\
E(x)&=1+\frac{1}{m}\sum_{i=1}^{m}E(\gcd(i,x))\\
&=1+\frac{1}{m}\sum_{j\mid x}E(j)\sum_{i=1}^{m}[\gcd(i,x)=j]\\
&=1+\frac{1}{m}\sum_{j\mid x,j<x}E(j)\sum_{i=1}^{m}[\gcd(i,x)=j]+\frac{1}{m}\lfloor\frac{m}{x}\rfloor E(x)\\
(1-\frac{1}{m}\lfloor\frac{m}{x}\rfloor )E(x)&=1+\frac{1}{m}\sum_{d\mid x,d<x}E(d)\sum_{i=1}^{m}[\gcd(i,x)=d]\\
&=1+\frac{1}{m}\sum_{d\mid x,d<x}E(d)\sum_{i=1}^{\frac{m}{d}}[\gcd(i,\frac{x}{d})=1]\\
&=1+\frac{1}{m}\sum_{d\mid x,d<x}E(d)\sum_{k\mid \frac{x}{d}}\mu(k)\lfloor\frac{m}{dk}\rfloor
\end{aligned}
$$

$$
\begin{aligned}
\sum_{i=1}^{n}[\gcd(i,k)=1]&=\sum_{i=1}^{n}\sum_{t\mid i,t\mid k}\mu(t)\\
&=\sum_{t\mid k}\mu(t)\sum_{i=1}^{n}[t\mid i]\\
&=\sum_{t\mid k}\mu(t)\frac{n}{t}\\

\end{aligned}
$$

$$
\begin{aligned}
f_0(x)&=1\\
f_k(x)&=\sum_{i=0}^{x}(ai^2+bi+c)f_{k-1}(i)\\
f_{0}(m),f_1(m),&...,f_n(m)\\
f_0(m)&=1\\
f(0,x)&=1\\
f(k,x)&=\sum_{i=0}^{x}(ai^2+bi+c)f(k-1,i)\\
g_i&=f_{i-1}\\
f_x&=\sum_{i=0}^{x}(ai^2+bi+c)g_i\\
F_0(x)&=\sum_{i=0}x^i=\frac{1}{1-x}\\
F_k(x)&=\sum_{i=0}f(k,i)x^i\\
&=\sum_{i=0}\sum_{j=0}^{i}(aj^2+bj+c)f(k-1,j)x^i\\
&=\sum_{j=0}\sum_{i=j}(aj^2+bj+c)f(k-1,j)x^i\\
&=\sum_{j=0}(aj^2+bj+c)f(k-1,j)\sum_{i=j}x^i\\
&=\sum_{j=0}(aj^2+bj+c)f(k-1,j)x^{j}\sum_{i=j}x^{i-j}\\
&=\sum_{j=0}(aj^2+bj+c)f(k-1,j)x^{j}\frac{1}{1-x}\\
&=\frac{1}{1-x}\sum_{j=0}(aj^2+bj+c)f(k-1,j)x^{j}\\
\end{aligned}
$$

$$
\begin{aligned}
F_k(x)&=\sum_{i=0}f(k,i)x^i\\
\sum_{i=0}(ai^2+bi+c)f(k-1,i)x^{i}&=a\sum_{i=0}i^2f(k-1,i)x^i+b\sum_{i=0}if(k-1,i)x^i+c\sum_{i=0}f(k-1,i)x^i\\
F_k'(x)&=\sum_{i=1}if(k,i)x^{i-1}\\
xF'_k(x)&=\sum_{i=1}if(k,i)x^{i}=\sum_{i=0}if(k,i)x^i\\
x(xF'_k(x))'&=x(F'_k(x)+xF''_k(x))=\sum_{i=0}i^2f(k,i)x^i\\
F_k(x)&=\frac{1}{1-x}(a(xF'_{k-1}(x)+x^2F''_{k-1}(x))+bxF'_{k-1}(x)+cF_{k-1}(x))\\
&=\frac{1}{1-x}(cF_{k-1}(x)+(a+b)xF_{k-1}'(x)+ax^2F_{k-1}''(x))\\
F_0(x)&=\frac{1}{1-x},F'_{0}(x)=\frac{1}{(1-x)^2},F_0''(x)=\frac{2}{(1-x)^3}\\
F_1(x)&=\frac{c}{(1-x)^2}+\frac{(a+b)x}{(1-x)^3}+\frac{2ax^2}{(1-x)^4}\\
\end{aligned}
$$

$$
\begin{aligned}
f(x,k)&=\sum_{i=0}^{k}(ai^2+bi+c)f(x-1,i)\\
F_k(x)&=\sum_{i=0}f(i,k)x^i\\
&=1+\sum_{i=1}\sum_{j=0}^{k}(aj^2+bj+c)f(i-1,j)x^i\\
&=1+\sum_{j=0}^{k}(aj^2+bj+c)x\sum_{i=1}f(i-1,j)x^{i-1}\\
&=1+\sum_{j=0}^{k}(aj^2+bj+c)xF_j(x)\\
F_k(x)(1-(ak^2+bk+c)x)&=1+\sum_{j=0}^{k-1}(aj^2+bj+c)xF_j(x)=G_{k}(x)\\
G_{k}(x)-G_{k-1}(x)&=F_k(x)(1-(ak^2+bk+c)x)-F_{k-1}(x)(1-(a(k-1)^2+b(k-1)+c)x)\\
&=(a(k-1)^2+b(k-1)+c)xF_{k-1}(x)\\
F_k(x)(1-(ak^2+bk+c)x)&=F_{k-1}(x)\\
F_k(x)&=\frac{1}{1-(ak^2+bk+c)x}F_{k-1}(x)\\
&=\prod_{i=0}^{k}\frac{1}{1-(ai^2+bi+c)x}\\
F_k(x)&=\prod_{i=0}^{k}\frac{1}{1-(ai^2+bi+c)x}\\
\ln(F_k(x))&=-\sum_{i=0}^k\ln(1-P(i)x)\\
\end{aligned}
$$

$$
\begin{aligned}
\ln(F_k(x))&=-\sum_{i=0}^k\ln(1-P(i)x)\\
&=\sum_{i=0}^{k}\sum_{j=1}\frac{P(i)^jx^j}{j}\\
&=\sum_{j=1}\frac{x^j}{j}\sum_{i=0}^{k}P(i)^j\\
P(i)&=ai^2+bi+c\\
S_t&=\sum_{i=0}^k(ai^2+bi+c)^t\\
x^n&=\sum_{k=0}^{n}{n\brace k}k!\binom{x}{k}\\
S_t&=\sum_{i=0}^{k}\sum_{j=0}^{t}{t\brace j}j!\binom{ai^2+bi+c}{j}\\
&=\sum_{j=0}^{t}{t\brace j}j!\sum_{i=0}^{k}\binom{ai^2+bi+c}{j}\\
&=\sum_{j=0}^{t}{t\brace j}j![x^j]\sum_{i=0}^{k}(1+x)^{ai^2+bi+c}\\
C_j&=\sum_{i=0}^{k}\binom{ai^2+bi+c}{j}\\
S_t&=\sum_{j=0}^{t}{t \brace j}j!C_j\\
\end{aligned}
$$

$$
\begin{aligned}
f(n)&=\sum_{i=0}^{n}\sum_{j=0}^{i}{i \brace j}2^jj!\\
&=\sum_{j=0}^{n}2^jj!\sum_{i=j}^{n}{i \brace j}\\
&=\sum_{i=0}^{n}\sum_{j=0}^{i}\frac{1}{j!}\sum_{k=0}^{j}\frac{(-1)^k}{k!}\frac{(j-k)^i}{(j-k)!}2^jj!\\
&=\sum_{i=0}^{n}\sum_{j=0}^{i}\sum_{k=0}^{j}\frac{(-1)^k}{k!}\frac{(j-k)^i}{(j-k)!}2^j\\
&=\sum_{j=0}^{n}\sum_{k=0}^{j}\sum_{i=j}^{n}\frac{(-1)^k}{k!}\frac{(j-k)^i}{(j-k)!}2^j\\
&=\sum_{j=0}^{n}2^j\sum_{k=0}^{j}\frac{(-1)^k}{k!(j-k)!}\sum_{i=j}^{n}(j-k)^i\\
&=\sum_{j=0}^{n}2^j\sum_{k=0}^{j}\frac{(-1)^k}{k!(j-k)!}\frac{(j-k)^{n}-(j-k)^j}{j-k+1}\\
&=\sum_{j=0}^{n}2^j\sum_{k=0}^{j}\frac{(-1)^{j-k}}{k!(j-k)!}\frac{k^{n}-k^j}{k+1}\\
\end{aligned}
$$

$$
\begin{aligned}
f(n)&=\sum_{i=0}^{n}\sum_{j=0}^{i}{i \brace j}2^jj!\\
&=\sum_{j=0}^{n}2^jj!\sum_{i=j}^{n}{i \brace j}\\
&=\sum_{i=0}^{n}\sum_{j=0}^{i}\sum_{k=0}^{j}(-1)^k\binom{j}{k}(j-k)^i2^j\\
&=\sum_{i=0}^{n}\sum_{j=0}^{i}\sum_{k=0}^{j}(-1)^{j-k}\binom{j}{k}k^i2^j\\
&=\sum_{i=0}^{n}\sum_{j=0}^{i}\sum_{k=0}^{j}(-1)^{j-k}\binom{j}{k}k^i2^j\\
&=\sum_{j=0}^{n}\sum_{k=0}^{j}(-1)^{j-k}\binom{j}{k}2^j\sum_{i=j}^{n}k^i\\
&=\sum_{j=0}^{n}\sum_{k=0}^{j}(-1)^{j-k}\binom{j}{k}2^jk^{j}\frac{k^{n-j+1}-1}{k-1}\\

\end{aligned}
$$

“集合构造定理（Set Construction）”： **如果结构 A 是由若干个结构 B 无序组成的集合，那么 A 的 EGF 等于 B 的 EGF 的指数函数。**
 **有序**组合/拼接 $\to$ OGF。
 **无序**组合/带标号划分 $\to$ EGF。
 出现“连通”、“不可分割” $\to$ Poly_Ln。
 出现“集合”、“森林”、“任意划分” $\to$ Poly_Exp。
 出现树的左右子树、折线图的上下起伏 $\to$ 一元二次方程与 Poly_Sqrt。

二分图就是没有奇环，所以一个二分图等于许多偶环的并n个点，方法数为（n-1）！
圆排列是（n-1）!由于图不同是边判定，所以不用管点的所属

$$
A(x)=\sum_{i=1}\frac{(i-1)!}{i!}[i\%2=0]x^i=\frac{\ln(1-x)-\ln(1+x)}{2}
$$

$$
B(x)=\sqrt{\frac{1-x}{1+x}}
$$

$$
i(n-i) = \binom{n}{2} - \binom{i}{2} - \binom{n-i}{2}
$$

- **连通块容斥**：任意图的 EGF $=\exp($连通图的 EGF$)$。

- **二分图降维**：二分图计数 $\to$ 借助黑白染色转化为带权图计数。

- **指数配方求卷积**：遇到 $2^{i(n-i)}$ 或 $q^{ij}$，条件反射般地使用等式 $i(n-i) = \binom{n}{2} - \binom{i}{2} - \binom{n-i}{2}$ 去强行拆分变量。

`combinatorics` + `fft` (可选加 `trees` 或 `graphs`)
`probabilities` + `dp` + `math` (遇到字符串结合的，可以加 `string suffix structures`)
`math` + `matrices` + `divide and conquer`
一个树，n个点，有n-1条边，总度数是2n-2，现在知道每个点的度数是多少，这样的树是唯一的吗？不是，可以用**Prüfer 序列**计算总数

$$
cnt=\frac{(n-2)!}{\prod_{i=1}^{n}(d_i-1)!}
$$

好的现在尝试分配，每个顶点度数至少是1，还剩n-2个度数，计算$mask_i$的奇偶性是否可行，
如果有大于n-2个不行直接false，假设还要改变k个奇偶性，要满足$n-2-k\%2=0$,即n，k同奇偶
$lf=n-2-k$是偶数且可以随意分配，有点困难。
我们看cnt的组合意义

$$
cnt=\frac{(n-2)!}{\prod_{i=1}^{n}(d_i-1)!}=\binom{n-2}{d_1-1,...,d_n-1}
$$

所以我们要计算的式子其实是

$$
\begin{aligned}
ans&=\sum_{\{d_1,...,d_n\}\in S}\binom{n-2}{d_1,...,d_n}
\end{aligned}
$$

这里d是度数-1,考虑容斥原理看来只能
思考一下，看看能不能按照颜色分组，$c_i=d'_1+...d'_s$
注意到可以上下同时乘以c！
cnt是这个颜色有多少个点,保证cnt不等于0,c是这个颜色总度数，感觉像多项式定理，但是要处理不合法的，看看能不能考虑容斥原理，考虑个蛋

$$
\begin{aligned}
ans&=\sum_{\{c_1,...,c_m\}\in S}\binom{n-2}{c_1,...,c_n}\prod_{i=1}^{m}cnt_i^{c_i}\\
&=\sum_{\{c_1,...,c_m\}\in S}\frac{(n-2)!}{c_1!,...,c_n!}\prod_{i=1}^{m}cnt_i^{c_i}\\
\frac{ans}{(n-2)!}&=\sum_{\{c_1,...,c_m\}\in S}\prod_{i=1}^{m}\frac{cnt_i^{c_i}}{ci!}\\
F_k(x)&=\sum_{i=0}[i\equiv mask_k\bmod 2]\frac{cnt_k^i}{i!}x^i\\
&=\sum_{i=0,2\mid i}\frac{cnt_k^i}{i!}x^i=\frac{e^{cnt_kx}+e^{-cnt_kx}}{2}\\
&=\sum_{i=1,2\nmid i}\frac{cnt_k^i}{i!}x^i=\frac{e^{cnt_kx}-e^{-cnt_kx}}{2}\\
ans&=(n-2)![x^{n-2}]\prod_{i\in S_1}\frac{e^{cnt_ix}+ e^{-cnt_ix}}{2}\prod_{i\in S_2}\frac{e^{cnt_ix}- e^{-cnt_ix}}{2}\\
&=\frac{(n-2)!}{2^m}[x^{n-2}]\prod_{i\in S_1}(e^{cnt_ix}+ e^{-cnt_ix})\prod_{i\in S_2}(e^{cnt_ix}- e^{-cnt_ix})\\
\end{aligned}
$$

提出分母将基底从x变成e，分治NTT可以在log 的复杂度解决，but为什么模数是1e9+7，难度搞错了或者没化简完全
发现可以dp求e的系数，设T为所求系数

$$
\begin{aligned}
ans&=\frac{(n-2)!}{2^m}\sum_{i=-n}^{n}[x^{n-2}]T_ie^{ix}\\
&=\frac{(n-2)!}{2^m}\sum_{i=-n}^{n}T_i\frac{i^{n-2}}{(n-2)!}\\
&=\frac{1}{2^m}\sum_{i=-n}^{n}T_ii^{n-2}\\

\end{aligned}
$$

$$
\begin{aligned}
(e^{2x}+e^{-2x})^2&=e^{4x}+2+e^{-4x}\\
ans&=\frac{1}{2^2}\sum_{i=-4}^{4}T_ii^{2}\\
&=\frac{1}{4}(16\times1+2\times 0+16\times 1)=8\\
e^{5x}-e^{-5x}&=\\
ans&=\frac{1}{2}(1\times 5^3-1\times (-5)^3)
\end{aligned}
$$

2169F本质上是先将l_1,...,l_k拼接起来，然后插入数字，补成长度为n的序列，求不同序列的个数
本质是考察怎么去重，如果$\sum l=n$，答案就是$\prod l!$,设$lv=n-\sum l$
我需要找lv个位置填1-m
硬想想不出来，我们举个例子吧

$$
\begin{aligned}
0,[1,2],[3,3]\\
[1,2,3,3]\\
\end{aligned}
$$

考虑一个固定的序列

$$
a_1,a_2,a_3,...,a_n
$$

在其中间插数，如果$a_i\neq a_{i+1},a_i\neq a_{i-1}$,在$a_i$前后插入$a_i$是一样的，会多算一次
如果$a_l=a_{l+1}=...=a_r$,在这$r-l+2$个空插$a_l$也是一样的，
综上所述，长度为n的序列插入一个元素本质不同的数列的个数会多算n个
f(n)是长度为n的序列的个数

$$
\begin{aligned}
f_i&=imf_{i-1}-i+1\\
\end{aligned}
$$

这个思路是错的
考虑到这k个数组是有序的,那么可以考虑OGF，我们这么想
$F_k(x)=\sum_{i=0}f_ix^i$表示包含第k个序列所有数字，且长度为i的方法数
那么

$$
\begin{aligned}
ans&=[x^n]\prod_{i=1}^{k}F_i(x)\\
l_i&\le5\\
\end{aligned}
$$

是不是可以考虑在$2^{l_i}$的复杂度下预处理$F_i$
感觉也不对
提示：需要优化状态
考虑$f_i$是包含第k个序列的说有数字，且长度为i，且最后一个数字是这$l_i$的结尾的方法数，
注意到同一组的数各不相同，$g_i$是长度为i包含m-1个数里面指定k个数的方法数

$$
\begin{aligned}
g_{i,k}&=\sum_{j=0}^{k}(-1)^{j}\binom{k}{j}\binom{i}{j}j!(m-1-k)^{i-j}\\
f_i&=l_kg_{i-1,l_{k}-1}\\
g_{i,k}&=\sum_{j=0}^{k}(-1)^j\binom{k}{j}(m-1-j)^i,i\ge k\\
F_k(x)&=\sum_{i=0}f_ix^i=\sum_{i=0}len\times g_{i-1,len-1}x^i\\
&=len\sum_{i=len}g_{i-1,len-1}x^i\\
&=len\sum_{i=len}\sum_{j=0}^{len-1}(-1)^j\binom{len-1}{j}(m-1-j)^{i-1}x^i\\
&=len\sum_{j=0}^{len-1}(-1)^j\binom{len-1}{j}x\sum_{i=len}(m-1-j)^{i-1}x^{i-1}\\
&=len\sum_{j=0}^{len-1}(-1)^j\binom{len-1}{j}x((m-1-j)x)^{len-1}\frac{1}{1-(m-1-j)x}\\
&=len\sum_{j=0}^{len-1}(-1)^j\binom{len-1}{j}\frac{(m-1-j)^{len-1}x^{len}}{1-(m-1-j)x}\\
F_1(x)&=\frac{x}{1-(m-1)x}\\
F_2(x)&=2\sum_{j=0}^{1}(-1)^j\binom{1}{j}\frac{(m-1-j)^{1}x^{2}}{1-(m-1-j)x}\\
&=2(\frac{(m-1)x^2}{1-(m-1)x}-\frac{(m-2)x^2}{1-(m-2)x})
\end{aligned}
$$

$$
\sum_{j=0}^{l-1} (-1)^j \binom{l-1}{j} \frac{(m-1-j)^{l-1}}{1 - (m-1-j)x} = (l-1)! \prod_{j=1}^l \frac{1}{1 - (m-j)x}
$$

$$
\prod_{j=1}^l \frac{1}{1 - c_j x}
$$

$$
\prod_{j=1}^l \frac{1}{1 - c_j x} = \sum_{j=1}^l \frac{A_j}{1 - c_j x}
$$

1. 把等式两边同时乘以 $(1 - c_j x)$。
2. 然后令 $x = \frac{1}{c_j}$（即让这个因式等于 $0$ 的根）。

$$
A_j = \prod_{i \neq j} \frac{1}{1 - c_i \cdot (\frac{1}{c_j})}
$$

$$
A_j = \prod_{i \neq j} \frac{c_j}{c_j - c_i}
$$

$$
A_j = (c_j)^{l-1} \prod_{i \neq j} \frac{1}{c_j - c_i}
$$

现在，我们把 $c_j = m-j$ 和 $c_i = m-i$ 真正代进去，

分母是：$\prod_{i \neq j} ((m-j) - (m-i)) = \prod_{i \neq j} (i - j)$：

$$
(-1)^{j-1} \cdot (j-1)! \cdot (l-j)!
$$

$$
A_j = \frac{(m-j)^{l-1}}{(-1)^{j-1} \cdot (j-1)! \cdot (l-j)!}
$$

$$
A_j = (-1)^{j-1} \frac{\binom{l-1}{j-1}}{(l-1)!} (m-j)^{l-1}
$$

$$
\prod_{j=1}^l \frac{1}{1 - (m-j) x} = \sum_{j=1}^l \left( (-1)^{j-1} \frac{\binom{l-1}{j-1}}{(l-1)!} (m-j)^{l-1} \right) \frac{1}{1 - (m-j)x}
$$

我们把分母上的 $(l-1)!$ 乘到等式左边去：

$$
(l-1)! \prod_{j=1}^l \frac{1}{1 - (m-j) x} = \sum_{j=1}^l (-1)^{j-1} \binom{l-1}{j-1} \frac{(m-j)^{l-1}}{1 - (m-j)x}
$$

**最后一次变形：** 右边的求和符号是从 $j=1$ 到 $l$。为了跟你的式子完全对应，我们做一个平移，令 $k = j-1$。

$$
(l-1)! \prod_{j=1}^l \frac{1}{1 - (m-j) x} = \sum_{k=0}^{l-1} (-1)^k \binom{l-1}{k} \frac{(m-1-k)^{l-1}}{1 - (m-1-k)x}
$$

为了书写清晰，我们令 $c_j = m-1-j$。

$$
\sum_{j=0}^{l-1} (-1)^j \binom{l-1}{j} \frac{c_j^{l-1}}{1 - c_j x}
$$

$$
D(x) = \prod_{j=0}^{l-1} (1 - c_j x)
$$

**证明通分后的分子 $N(x)$ 恰好等于一个常数 $(l-1)!$**。

通分后，第 $j$ 项的分子需要乘上除了自己以外的所有分母。所以总分子 $N(x)$ 是：

$$
N(x) = \sum_{j=0}^{l-1} (-1)^j \binom{l-1}{j} c_j^{l-1} \prod_{i \neq j} (1 - c_i x)
$$

观察这个 $N(x)$，每一个 $\prod_{i \neq j} (1 - c_i x)$ 里包含了 $l-1$ 个 $x$ 相乘。所以 **$N(x)$ 必定是一个关于 $x$ 的多项式，且它的最高次幂不超过 $l-1$**。

$$
Q(y) = y^{l-1} N\left(\frac{1}{y}\right)
$$

$$
Q(y) = \sum_{j=0}^{l-1} (-1)^j \binom{l-1}{j} c_j^{l-1} \prod_{i \neq j} (y - c_i)
$$

因为 $N(x)$ 次数不超过 $l-1$，所以 **$Q(y)$ 也是一个关于 $y$ 的多项式，且最高次幂不超过 $l-1$**。

$$
Q(c_k) = (-1)^k \binom{l-1}{k} c_k^{l-1} \prod_{i \neq k} (c_k - c_i)
$$

$\prod_{i \neq k} (c_k - c_i) = (-1)^k \cdot k! \cdot (l-1-k)!$

$$
Q(c_k) = (-1)^k \frac{(l-1)!}{k! (l-1-k)!} c_k^{l-1} \cdot (-1)^k \cdot k! \cdot (l-1-k)!
$$

$$
Q(c_k) = (l-1)! \cdot c_k^{l-1}
$$

我们发现，多项式 $Q(y)$ 在 $y = c_0, c_1, \dots, c_{l-1}$ 这 $l$ 个不同的点上，它的值刚好等于 $(l-1)! \cdot y^{l-1}$。

$$
Q(y) \equiv (l-1)! \cdot y^{l-1}
$$

既然 $Q(y) = (l-1)! \cdot y^{l-1}$，我们把 $y = \frac{1}{x}$ 换回去：

$$
y^{l-1} N(x) = (l-1)! \cdot y^{l-1}
$$

$$
N(x) = (l-1)!
$$

**分子竟然只是一个常数！所有带有 $x$ 的高次项，在那个复杂的组合数交错求和中，奇迹般地全部抵消成了 0！**
最后，把你推导出的分子和分母拼回去：

$$
左边 = \frac{N(x)}{D(x)} = \frac{(l-1)!}{\prod_{j=0}^{l-1} (1 - c_j x)}
$$

$$
\sum_{j=0}^n (-1)^j \binom{n}{j} \frac{(m-j)^n}{1 - (m-j)x} \equiv n! \prod_{j=0}^n \frac{1}{1 - (m-j)x}
$$

cf2145g
突然发现了之前的一点盲点，感觉可能可做了
每个位置的最终颜色是此位置颜色标记的最大值,染色序列类似

$$
1,2,2,2,3,4,4,5
$$

我们考虑到行和列必然有一个是填满的，由于是对称的，考虑填满n行多出j列，
我们发现，只要确定了每一行涂的颜色，整体的颜色就是确定的
n行j列的方法数是$\binom{m}{k}$
然后，颜色序列数是

$$
\begin{aligned}
cnt_{n,j}&=\sum_{d_1+d_2+...+d_{k}=n+j}\binom{n+j}{d_1,d_2,...,d_{k}},d_i\ge1\\
&=\binom{n+j}{k}\sum_{d_1+d_2+...+d_{k}=n+j-k}\binom{n+j-k}{d_1,d_2,...,d_{k}},d_i\ge0\\
\end{aligned}
$$

等一下思路好像不对
提示：后覆盖前->逆序处理
递增和递减其实是等价的，都是k个数，全染色必然是选了全部的行或者选了全部的列
以选了全部n行为例，和另外的j列，发现，选完一行就少一行，选完一列就少一列，
$f(x,y,k)$表示还剩下x行y列，要用1-k的颜色的方法数，

$$
f(x,y,k)=xf(x-1,y,k)+xf(x-1,y,k-1)+yf(x,y-1,k)+yf(x,y-1,k-1)
$$

x+y<k,f(x,y,k)=0
f(x,0,k)=0,f(0,y,k)=0
f(x,1,x)=x!,f(1,y,y)=y!

设$PR(N)$是$1$到$N$里面素数的乘积，对于一个$n\times n$的方格，每个方格等概率生成一个正整数，计算设$R_1,R_2,...,R_n$为每列的最大公因数，$C_1,C_2,...,C_n$为每行的最大公因数，求$\forall 1\le i\le n\gcd(PR(N),R_i)=1$且$\forall 1\le i\le n\gcd(PR(N),C_i)=1$的概率,答案对998244353取模$n\le 1e5,N\le 5e2$

$$
\begin{aligned}
f_n&=f_{n-1}+f_{n-2}\\
g_n&=3g_{n-2}\\
ans2&=\frac{1}{r-l+1}\sum_{n=l}^{r}F(n,k)\\
&=\frac{1}{r-l+1}\sum_{n=l}^{r}\binom{f_n}{k}\\
T(r)&=\sum_{n=0}^{r}\binom{f_n}{k}\\
\binom{f_n}{k}&=\frac{1}{k!}\sum_{i=0}^{k}(-1)^{k-i}{k\brack i}f_n^i\\
ans2&=\frac{1}{r-l+1}\sum_{n=l}^{r}\frac{1}{k!}\sum_{i=0}^{k}(-1)^{k-i}{k\brack i}f_n^i\\
&=\frac{1}{r-l+1}\frac{1}{k!}\sum_{i=0}^{k}(-1)^{k-i}{k\brack i}\sum_{n=l}^{r}f_n^i\\

\end{aligned} 
$$

$$
\begin{aligned}
f_n&=M(a^n-b^n)\\
\sum_{n=l}^{r}f_n^i&=\sum_{n=l}^{r}M^i(a^n-b^n)^i,ab=-1\\
&=\sum_{n=l}^{r}M^i\sum_{k=0}^{i}(-1)^{k}\binom{i}{k}b^{kn}a^{(i-k)n}\\
&=\sum_{n=l}^{r}M^i\sum_{k=0}^{i}(-1)^{k}\binom{i}{k}b^{kn}(\frac{-1}{b})^{(i-k)n}\\
&=\sum_{n=l}^{r}M^i\sum_{k=0}^{i}(-1)^{k+(i-k)n}\binom{i}{k}b^{kn-in+kn}\\
&=M^i\sum_{k=0}^{i}(-1)^k\binom{i}{k}\sum_{n=l}^{r}(-1)^{(i-k)n}b^{(2k-i)n}\\
&=M^i\sum_{k=0}^{i}(-1)^k\binom{i}{k}\sum_{n=l}^{r}((-1)^{i-k}b^{2k-i})^n\\
\end{aligned}
$$

$$
\begin{aligned}
f_i&=\max\{a_1,a_2,...,a_i\}\\
g_i&=\max\{a_i,a_{i+1},...,a_n\}\\
ans&=\sum_{i=1}^{n}\min\{f_i,g_i\}-a_i\\
&=\sum_{i=1}^{n}\min\{f_i,g_i\}-\sum_{i=1}^{n}a_i\\
a_x&\to a_x+v\\
f_x-f_n&\to \max\{f_i,a_x+v\}\\
g_1-g_x&\to \max\{g_i,a_x+v\}
\end{aligned}
$$

$$
\begin{aligned}
f_0&=1\\
f_1&=x\\
f_n&=\sum_{i=0}^{n-1}f_if_{n-1-i}\\
G(z)&=\sum_{i=0}f_iz^i\\
G^2(z)&=\sum_{i=0}\sum_{j=0}^{i}f_jf_{i-j}z^i\\
&=\sum_{i=1}f_{i+1}z^i+1\\
z(G^2-1)&=G-1-xz\\
z(G^2(x,z)-1)&=G(x,z)-1-xz\\
z(G^2(1,z)-1)&=G(1,z)-1-z\\
zG^2(1,z)-G(1,z)+1&=0\\
G(1,z)&=\frac{1\pm\sqrt{1-4z}}{2z}=\frac{1-\sqrt{1-4z}}{2z}\\
2zG(x,z)G'(x,z)&=G'(x,z)-z\\
G'(1,z)&=\frac{z}{1-2zG(1,z)}=\frac{z}{\sqrt{1-4z}}\\
\end{aligned}
$$

$$
\begin{aligned}
G(1,z)&=\frac{1-\sqrt{1-4z}}{2z}\\
&=\frac{1-\sum_{i=0}\binom{\frac{1}{2}}{i}(4z)^i}{2z}\\
[z^n]G(1,z)&=(-1)^{n}\binom{\frac{1}{2}}{n+1}2^{2n+1}\\
&=2^{2n+1}\frac{1}{(n)!}\prod_{i=0}^{n}(i-\frac{1}{2})\\
&=-2^{n}\frac{1}{(n+1)!}\prod_{i=0}^{n}(2i-1)\\
&=\frac{(2n)!}{n!(n+1)!}\\
G'(1,z)&=\frac{z}{1-2zG(1,z)}=\frac{z}{\sqrt{1-4z}}\\
&=z\sum_{i=0}\binom{-\frac{1}{2}}{i}(4z)^i\\
[z^n]G'(1,z)&=(-1)^{n-1}\binom{-\frac{1}{2}}{n-1}2^{2n-2}\\
&=2^{n-1}\frac{1}{(n-1)!}\prod_{i=0}^{n-2}(2i+1)\\
&=\frac{(2n-2)!}{(n-1)!(n-1)!}\\
E&=\frac{n(n+1)}{2(2n-1)}\\
\end{aligned}
$$

$$
0.3\times score_{training}+0.7\times score_{contest}>0.9\times scroe_{contest}
$$

$$
N,G,I,E
$$

$$
\begin{aligned}
2N&\le G,ans=2N\\
empty&=2N-G\\
x+2y&=empty\\
e&=E-x\\
e\bmod 2&=0\\
t&=2y-e(>0)\\
ans&=2N[2N\le G+E]\\
x+2y&=empty\\
I\le y+x&:ans+=I\\
I>y+x&:ans+=y-(I-y-x)=2y+x-I=empty-I\\
empty&=2N-G-E\\
P(x+y\le I|x+2y=n)&=\\
x&=n-2y,n-2y+y\le I\\
y&\ge n-I\\
y&\in[n-I,m=\min\{N,n\}]\\

\end{aligned}
$$

$$
\begin{aligned}
dp[i][j]&=dp[i-1][j]+[j<m-i+1]\sum_{k}dp[i-1][j+k(m-i+1)]\\
dp[0][a]&=1\\
dp[m][b]&=?\\
f(x)=[x=b]+\sum_{L=1}^{\min(x,m)}
\end{aligned}
$$

$$
\begin{aligned}
f(x)&=[x=b]+\sum_{L=1}^{x}f(x\bmod L)\\
&=[x=b]+\sum_{r=1}^{x/2}f(r)d(x-r)\\
ans&=
\end{aligned}
$$

$$
100^{100^{x+1}}=100^{100^x\times100}=(100^{100^{x}})^{100}
$$

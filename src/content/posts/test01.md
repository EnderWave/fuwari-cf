---
title: test01
published: 2025-11-25
description: ""
image: ""
tags:
  - test
category: test
draft: true
lang: ""
---
# This is a test 
## 用于检测
我可以用于写点步骤
$$
\begin{align}
\sum_{i=1}^{n}\gcd(i,n)
&=\sum_{i=1}^{n}\sum_{d\mid\gcd(i,n)}\varphi(d)\\
&=\sum_{i=1}^{n}\sum_{d}[d\mid i][d\mid n]\varphi(d)\\
&=\sum_{d=1}^{n}[d\mid n]\varphi(d)\sum_{i=1}^{n}[d\mid i]\\
&=\sum_{d=1}^{n}[d\mid n]\varphi(d)\lfloor\frac{n}{d}\rfloor\\
&=\sum_{d\mid n}\varphi(d)\frac{n}{d}\\
\end{align}
$$
$$
\begin{align}
\sum_{i=1}^{n}lcm(i,n)
&=\sum_{i=1}^{n}\frac{in}{\gcd(i,n)}\\
&=\sum_{i=1}^{n}\sum_{d}[\gcd(i,n)=d]\frac{in}{d}\\
&=\sum_{i=1}^{n}\sum_{d}[\gcd(\frac{i}{d},\frac{n}{d})=1]d\cdot\frac{i}{d}\frac{n}{d}\\
&=\sum_{d=1}^{n}\sum_{i=1}^{n}[\gcd(\frac{i}{d},\frac{n}{d})=1]d\cdot\frac{i}{d}\frac{n}{d}\\
&=\sum_{d=1}^{n}n\sum_{i=1}^{\lfloor\frac{n}{d}\rfloor}[\gcd(i,\frac{n}{d})=1]i\\
&=\sum_{d=1}^{n}n\sum_{i=1}^{\lfloor\frac{n}{d}\rfloor}\sum_{j\mid gcd(i,\frac{n}{d})}\mu(j)i\\
&=\sum_{d=1}^{n}n\sum_{i=1}^{\lfloor\frac{n}{d}\rfloor}\sum_{j}[j\mid i][j\mid \frac{n}{d}]\mu(j)i\\
&=\sum_{d\mid n}n\sum_{i=1}^{d}\sum_{j}[j\mid i][j\mid d]\mu(j)i\\
&=n\sum_{j=1}^{n}\mu(j)\sum_{d\mid n}[j\mid d]\sum_{i=1}^{d}[j\mid i]i\\
&=n\sum_{j=1}^{n}\mu(j)\sum_{d\mid n}[j\mid d]\sum_{k=1}^{\lfloor\frac{d}{j}\rfloor}kj\\
&=n\sum_{j=1}^{n}j\mu(j)\sum_{d\mid n}[j\mid d]\sum_{k=1}^{\lfloor\frac{d}{j}\rfloor}k\\
&=n\sum_{j=1}^{n}\sum_{d\mid n}\mu(j)[j\mid d]\frac{d(\frac{d}{j}+1)}{2}\\
&=n\sum_{d\mid n}\sum_{j\mid d}\mu(j)\frac{d(\frac{d}{j}+1)}{2}\\
&=\frac{n}{2}\sum_{d\mid n}d\sum_{j\mid d}\mu(j)(\frac{d}{j}+1)\\
&=\frac{n}{2}\sum_{d\mid n}d(\sum_{j\mid d}\mu(j)\frac{d}{j}+[d=1])\\
\end{align}
$$
$$
\begin{align}
\sum_{i=1}^{n}lcm(i,n)
&=\sum_{i=1}^{n}\frac{in}{\gcd(i,n)}\\
&=\sum_{i=1}^{n}\sum_{d}[\gcd(i,n)=d]\frac{in}{d}\\
&=\sum_{i=1}^{n}\sum_{d}[\gcd(\frac{i}{d},\frac{n}{d})=1]d\cdot\frac{i}{d}\frac{n}{d}\\
&=\sum_{d=1}^{n}\sum_{i=1}^{n}[\gcd(\frac{i}{d},\frac{n}{d})=1]d\cdot\frac{i}{d}\frac{n}{d}\\
&=\sum_{d=1}^{n}n\sum_{i=1}^{\lfloor\frac{n}{d}\rfloor}[\gcd(i,\frac{n}{d})=1]i\\
&=n\sum_{d\mid n}\sum_{i=1}^{d}[\gcd(i,d)=1]i\\
&=n\sum_{d\mid n}(\frac{\varphi(d)d}{2}+[d=1])\\

\end{align}
$$
$$
\begin{align}
\sum_{i=1}^{n}lcm(i,n)
&=\sum_{i=1}^{n}\frac{in}{\gcd(i,n)}\\
&=\sum_{i=1}^{n}\sum_{d}[\gcd(i,n)=d]\frac{in}{d}\\
&=\sum_{i=1}^{n}\sum_{d}[\gcd(\frac{i}{d},\frac{n}{d})=1]d\cdot\frac{i}{d}\frac{n}{d}\\
&=\sum_{d=1}^{n}\sum_{i=1}^{n}[\gcd(\frac{i}{d},\frac{n}{d})=1]d\cdot\frac{i}{d}\frac{n}{d}\\
&=\sum_{d=1}^{n}n\sum_{i=1}^{\lfloor\frac{n}{d}\rfloor}[\gcd(i,\frac{n}{d})=1]i\\
&=\sum_{d=1}^{n}n\sum_{i=1}^{\lfloor\frac{n}{d}\rfloor}\sum_{j\mid gcd(i,\frac{n}{d})}\mu(j)i\\
&=n\sum_{d\mid n}\sum_{j\mid\frac{n}{d}}\mu(j)\sum_{i=1}^{\lfloor\frac{n}{dj}\rfloor}ij\\
\end{align}
$$

$$
\begin{align}
\sum_{i=1}^{n}f(i)
&=\sum_{i=1}^{n}i\sum_{i\mid k}\\
&=\sum_{i=1}^{n}i\lfloor\frac{n}{i}\rfloor\\

\end{align}
$$
$$
\begin{align}
\sum_{i=1}^{n}f(i)
&=\sum_{i=1}^{n}\sum_{i\mid d}1\\
&=\sum_{i=1}^{n}\lfloor\frac{n}{i}\rfloor\\


\end{align}
$$
$$
\begin{align}
\sum_{i=1}^{n}\sum_{j=1}^{n}[\gcd(i,j)=1]
&=2\sum_{i=1}^{n}\sum_{j=1}^{i}[\gcd(i,j)=1]-1\\
&=2\sum_{i=1}^{n}\varphi(i)-1
\end{align}
$$
$$
\begin{align}
\sum_{i=1}^{n}\sum_{j=1}^{m}(2\gcd(i,j)-1)
&=2\sum_{i=1}^{n}\sum_{j=1}^{m}\gcd(i,j)-mn\\
&=2\sum_{d=1}^{\min(n,m)}\sum_{i=1}^{\lfloor\frac{n}{d}\rfloor}\sum_{j=1}^{\lfloor\frac{m}{d}\rfloor}d[\gcd(i,j)=1]-mn\\
&=2\sum_{d=1}^{\min(n,m)}d\sum_{i=1}^{\lfloor\frac{n}{d}\rfloor}(\sum_{j=1}^{\lfloor\frac{n}{d}\rfloor}[\gcd(i,j)=1]+\sum_{j=\lfloor\frac{n}{d}\rfloor+1}^{\lfloor\frac{m}{d}\rfloor}[\gcd(i,j)=1])-mn\\
&=2\sum_{d=1}^{n}d\sum_{i=1}^{\lfloor\frac{n}{d}\rfloor}\sum_{j=\lfloor\frac{n}{d}\rfloor+1}^{\lfloor\frac{m}{d}\rfloor}[\gcd(i,j)=1]+2\sum_{d=1}^{n}d(2\sum_{k=1}^{\lfloor\frac{n}{d}\rfloor}\varphi(k)-1)-mn\\

\end{align}
$$
$$
\begin{align}
\sum_{i=1}^{n}\sum_{j=1}^{m}(2\gcd(i,j)-1)
&=2\sum_{i=1}^{n}\sum_{j=1}^{m}\gcd(i,j)-mn\\
&=2\sum_{d=1}^{\min(n,m)}\sum_{i=1}^{\lfloor\frac{n}{d}\rfloor}\sum_{j=1}^{\lfloor\frac{m}{d}\rfloor}d[\gcd(i,j)=1]-mn\\
&=2\sum_{d=1}^{n}d\sum_{i=1}^{\lfloor\frac{n}{d}\rfloor}\sum_{j=1}^{\lfloor\frac{m}{d}\rfloor}\sum_{k\mid\gcd(i,j)}\mu(k)-mn\\
&=2\sum_{d=1}^{n}d\sum_{k=1}^{\lfloor\frac{n}{d}\rfloor}\mu(k)\sum_{i=1}^{\lfloor\frac{n}{d}\rfloor}[k\mid i]\sum_{j=1}^{\lfloor\frac{m}{d}\rfloor}[k\mid j]-mn\\
&=2\sum_{d=1}^{n}d\sum_{k=1}^{\lfloor\frac{n}{d}\rfloor}\mu(k)\lfloor\frac{\lfloor\frac{n}{d}\rfloor}{k}\rfloor\lfloor\frac{\lfloor\frac{m}{d}\rfloor}{k}\rfloor-mn\\
\end{align}
$$
$$
\begin{align}
\sum_{i=1}^{n}\sum_{j=1}^{m}[\gcd(i,j)=k]
&=\sum_{i=1}^{\lfloor\frac{n}{k}\rfloor}\sum_{j=1}^{\lfloor\frac{m}{k}\rfloor}[\gcd(i,j)=1]\\
&=\sum_{i=1}^{\lfloor\frac{n}{k}\rfloor}\sum_{j=1}^{\lfloor\frac{m}{k}\rfloor}\sum_{d\mid\gcd(i,j)}\mu(d)\\
&=\sum_{d=1}^{\lfloor\frac{n}{k}\rfloor}\mu(d)\sum_{i=1}^{\lfloor\frac{n}{k}\rfloor}[d\mid i]\sum_{j=1}^{\lfloor\frac{m}{k}\rfloor}[d\mid j]\\
&=\sum_{d=1}^{\lfloor\frac{n}{k}\rfloor}\mu(d)\lfloor\frac{\lfloor\frac{n}{k}\rfloor}{d}\rfloor\lfloor\frac{\lfloor\frac{m}{k}\rfloor}{d}\rfloor\\
\end{align}
$$
$$
\begin{align}
\sum_{i=1}^{n}\sum_{j=1}^{n}d(i)d(j)d(\gcd(i,j))
&=\sum_{k=1}^{n}\sum_{i=1}^{\lfloor\frac{n}{k}\rfloor}\sum_{j=1}^{\lfloor\frac{m}{k}\rfloor}d(ik)d(jk)d(k)[\gcd(i,j)=1]\\
&=\sum_{k=1}^{n}\sum_{i=1}^{\lfloor\frac{n}{k}\rfloor}\sum_{j=1}^{\lfloor\frac{m}{k}\rfloor}d(ik)d(jk)d(k)\sum_{t\mid\gcd(i,j)}\mu(t)\\
&=\sum_{k=1}^{n}d(k)\sum_{i=1}^{\lfloor\frac{n}{k}\rfloor}d(ik)\sum_{j=1}^{\lfloor\frac{m}{k}\rfloor}d(jk)\sum_{t=1}^{\lfloor\frac{n}{k}\rfloor}[t\mid i][t\mid j]\mu(t)\\
&=\sum_{k=1}^{n}d(k)\sum_{t=1}^{\lfloor\frac{n}{k}\rfloor}\sum_{i=1}^{\lfloor\frac{n}{k}\rfloor}[t\mid i]d(ik)\sum_{j=1}^{\lfloor\frac{m}{k}\rfloor}d(jk)[t\mid j]\mu(t)\\
&=\sum_{k=1}^{n}d(k)\sum_{t=1}^{\lfloor\frac{n}{k}\rfloor}\mu(t)\sum_{i=1}^{\lfloor\frac{\lfloor\frac{n}{k}\rfloor}{t}\rfloor}d(itk)\sum_{j=1}^{\lfloor\frac{\lfloor\frac{m}{k}\rfloor}{t}\rfloor}d(jtk)\\
\end{align}
$$
上面的式子做不了，内存会爆，继续化简
令$x=kt$
$$
\begin{align}
&=\sum_{k=1}^{n}d(k)\sum_{x=1,k\mid x}^{n}\mu(\frac{x}{k})\sum_{i=1}^{\lfloor\frac{n}{x}\rfloor}d(ix)\sum_{j=1}^{\lfloor\frac{n}{x}\rfloor}d(jx)\\
&=\sum_{x=1}^{n}\sum_{k\mid x}d(k)\mu(\frac{x}{k})\sum_{i=1}^{\lfloor\frac{n}{x}\rfloor}d(ix)\sum_{j=1}^{\lfloor\frac{n}{x}\rfloor}d(jx)\\
&=\sum_{x=1}^{n}\sum_{i=1}^{\lfloor\frac{n}{x}\rfloor}d(ix)\sum_{j=1}^{\lfloor\frac{n}{x}\rfloor}d(jx)\\
\end{align}
$$
$$p=mq+n$$
$$
\begin{align}
\sum_{k=1}^{\frac{p-1}{2}}\lfloor\frac{kq}{p}\rfloor+\sum_{k=1}^{\frac{q-1}{2}}\lfloor\frac{kp}{q}\rfloor
&=\sum_{k=1}^{\frac{p-1}{2}}\lfloor\frac{kq}{p}\rfloor+\sum_{k=1}^{\frac{q-1}{2}}\lfloor\frac{kp}{q}\rfloor
\end{align}
$$
$$ i\le\frac{kq}{p}<i+1 $$
$$ ip\le kq<ip+p $$
$$ \frac{ip}{q}\le k<\frac{ip+p}{q} $$
$$
\begin{align}
\sum_{i=1}^{n}\sum_{j=1}^{m}(n\bmod i)\times(m\bmod j)
&=\sum_{i=1}^{n}\sum_{j=1}^{m}(n-i\lfloor\frac{n}{i}\rfloor)(m-j\lfloor\frac{m}{j}\rfloor)\\
&=\sum_{i=1}^{n}\sum_{j=1}^{m}(nm-nj\lfloor\frac{m}{j}\rfloor-mi\lfloor\frac{n}{i}\rfloor+ij\lfloor\frac{n}{i}\rfloor\lfloor\frac{m}{j}\rfloor)\\
&=\sum_{i=1}^{n}\sum_{j=1}^{m}mn-\sum_{i=1}^{n}n\sum_{j=1}^{m}j\lfloor\frac{m}{j}\rfloor-\sum_{i=1}^{n}\sum_{j=1}^{m}mi\lfloor\frac{n}{i}\rfloor+\sum_{i=1}^{n}\sum_{j=1}^{m}ij\lfloor\frac{n}{i}\rfloor\lfloor\frac{m}{j}\rfloor\\
&=m^{2}n^{2}-n^{2}\sum_{j=1}^{m}j\lfloor\frac{m}{j}\rfloor-m^{2}\sum_{i=1}^{n}i\lfloor\frac{n}{i}\rfloor+\sum_{i=1}^{n}i\lfloor\frac{n}{i}\rfloor\sum_{j=1}^{m}j\lfloor\frac{m}{j}\rfloor\\

\end{align}
$$
$$
\begin{align}
\sum_{i=1}^{n}(n\bmod i)(m\bmod i)
&=\sum_{i=1}^{n}(n-i\lfloor\frac{n}{i}\rfloor)(m-i\lfloor\frac{m}{i}\rfloor)\\
&=\sum_{i=1}^{n}(nm-i(m\lfloor\frac{n}{i}\rfloor+n\lfloor\frac{m}{i}\rfloor)+i^{2}\lfloor\frac{n}{i}\rfloor\lfloor\frac{m}{i}\rfloor)

\end{align}
$$
$$
\begin{align}
\sum_{k\in P}\sum_{i=1}^{n}\sum_{j=1}^{m}[\gcd(i,j)=k]
&=\sum_{k\in P}\sum_{d=1}^{\lfloor\frac{n}{k}\rfloor}\mu(d)\lfloor\frac{\lfloor\frac{n}{k}\rfloor}{d}\rfloor\lfloor\frac{\lfloor\frac{m}{k}\rfloor}{d}\rfloor\\
&=\sum_{k\in P}\sum_{T=1,k\mid T}^{n}\mu(\frac{T}{k})\lfloor\frac{n}{T}\rfloor\lfloor\frac{m}{T}\rfloor\\
&=\sum_{T=1}^{n}\lfloor\frac{n}{T}\rfloor\lfloor\frac{m}{T}\rfloor\sum_{k\in P,k\mid T}\mu(\frac{T}{k})\\
\end{align}
$$
$$
\begin{align}
\sum_{i=1}^{n}\sum_{j=1}^{m}d(ij)
&=\sum_{i=1}^{n}\sum_{j=1}^{m}d(i'j'\gcd(i,j)^{2})\\
&=\sum_{i=1}^{n}\sum_{j=1}^{m}d(i')d(j')d(gcd(i,j)^{2})\\
&=\sum_{k=1}^{n}\sum_{i=1}^{\lfloor\frac{n}{k}\rfloor}\sum_{j=1}^{\lfloor\frac{m}{k}\rfloor}d(i)d(j)d(k^{2})[\gcd(i,j)=1]\\
&=\sum_{k=1}^{n}d(k^{2})\sum_{i=1}^{\lfloor\frac{n}{k}\rfloor}\sum_{j=1}^{\lfloor\frac{m}{k}\rfloor}d(i)d(j)\sum_{t\mid \gcd(i,j)}\mu(t)\\
&=\sum_{k=1}^{n}d(k^{2})\sum_{t=1}^{\lfloor\frac{n}{k}\rfloor}\mu(t)\sum_{i=1}^{\lfloor\frac{n}{kt}\rfloor}d(it)\sum_{j=1}^{\lfloor\frac{m}{kt}\rfloor}d(jt)\\
&=\sum_{k=1}^{n}d(k^{2})f(\lfloor\frac{n}{k}\rfloor,\lfloor\frac{m}{k}\rfloor)\\
\end{align}
$$
令$x=kt$
$$
\begin{align}
&=\sum_{k=1}^{n}d(k)\sum_{x=1,k\mid x}^{n}\mu(\frac{x}{k})\sum_{i=1}^{\lfloor\frac{n}{x}\rfloor}d(ix)\sum_{j=1}^{\lfloor\frac{n}{x}\rfloor}d(jx)\\
&=\sum_{x=1}^{n}\sum_{k\mid x}d(k)\mu(\frac{x}{k})\sum_{i=1}^{\lfloor\frac{n}{x}\rfloor}d(ix)\sum_{j=1}^{\lfloor\frac{n}{x}\rfloor}d(jx)\\
&=\sum_{x=1}^{n}\sum_{i=1}^{\lfloor\frac{n}{x}\rfloor}d(ix)\sum_{j=1}^{\lfloor\frac{n}{x}\rfloor}d(jx)\\
\end{align}
$$
$$p=mq+n$$
$$
\begin{align}
\sum_{k=1}^{\frac{p-1}{2}}\lfloor\frac{kq}{p}\rfloor+\sum_{k=1}^{\frac{q-1}{2}}\lfloor\frac{kp}{q}\rfloor
&=\sum_{k=1}^{\frac{p-1}{2}}\lfloor\frac{kq}{p}\rfloor+\sum_{k=1}^{\frac{q-1}{2}}\lfloor\frac{kp}{q}\rfloor
\end{align}
$$
$$ i\le\frac{kq}{p}<i+1 $$
$$ ip\le kq<ip+p $$
$$ \frac{ip}{q}\le k<\frac{ip+p}{q} $$
$$
\begin{align}
\sum_{i=1}^{n}\sum_{j=1}^{m}(n\bmod i)\times(m\bmod j)
&=\sum_{i=1}^{n}\sum_{j=1}^{m}(n-i\lfloor\frac{n}{i}\rfloor)(m-j\lfloor\frac{m}{j}\rfloor)\\
&=\sum_{i=1}^{n}\sum_{j=1}^{m}(nm-nj\lfloor\frac{m}{j}\rfloor-mi\lfloor\frac{n}{i}\rfloor+ij\lfloor\frac{n}{i}\rfloor\lfloor\frac{m}{j}\rfloor)\\
&=\sum_{i=1}^{n}\sum_{j=1}^{m}mn-\sum_{i=1}^{n}n\sum_{j=1}^{m}j\lfloor\frac{m}{j}\rfloor-\sum_{i=1}^{n}\sum_{j=1}^{m}mi\lfloor\frac{n}{i}\rfloor+\sum_{i=1}^{n}\sum_{j=1}^{m}ij\lfloor\frac{n}{i}\rfloor\lfloor\frac{m}{j}\rfloor\\
&=m^{2}n^{2}-n^{2}\sum_{j=1}^{m}j\lfloor\frac{m}{j}\rfloor-m^{2}\sum_{i=1}^{n}i\lfloor\frac{n}{i}\rfloor+\sum_{i=1}^{n}i\lfloor\frac{n}{i}\rfloor\sum_{j=1}^{m}j\lfloor\frac{m}{j}\rfloor\\

\end{align}
$$
$$
\begin{align}
\sum_{i=1}^{n}(n\bmod i)(m\bmod i)
&=\sum_{i=1}^{n}(n-i\lfloor\frac{n}{i}\rfloor)(m-i\lfloor\frac{m}{i}\rfloor)\\
&=\sum_{i=1}^{n}(nm-i(m\lfloor\frac{n}{i}\rfloor+n\lfloor\frac{m}{i}\rfloor)+i^{2}\lfloor\frac{n}{i}\rfloor\lfloor\frac{m}{i}\rfloor)

\end{align}
$$
$$
\begin{align}
\sum_{k\in P}\sum_{i=1}^{n}\sum_{j=1}^{m}[\gcd(i,j)=k]
&=\sum_{k\in P}\sum_{d=1}^{\lfloor\frac{n}{k}\rfloor}\mu(d)\lfloor\frac{\lfloor\frac{n}{k}\rfloor}{d}\rfloor\lfloor\frac{\lfloor\frac{m}{k}\rfloor}{d}\rfloor\\
&=\sum_{k\in P}\sum_{T=1,k\mid T}^{n}\mu(\frac{T}{k})\lfloor\frac{n}{T}\rfloor\lfloor\frac{m}{T}\rfloor\\
&=\sum_{T=1}^{n}\lfloor\frac{n}{T}\rfloor\lfloor\frac{m}{T}\rfloor\sum_{k\in P,k\mid T}\mu(\frac{T}{k})\\
\end{align}
$$
$$
\begin{align}
\sum_{i=1}^{n}\sum_{j=1}^{m}d(ij)
&=\sum_{i=1}^{n}\sum_{j=1}^{m}\sum_{x\mid i}\sum_{y\mid j}[gcd(x,y)=1]\\
&=\sum_{x=1}^{n}\sum_{y=1}^{m}\lfloor\frac{n}{x}\rfloor\lfloor\frac{m}{y}\rfloor[\gcd(x,y)=1]\\
&=\sum_{x=1}^{n}\sum_{y=1}^{m}\lfloor\frac{n}{x}\rfloor\lfloor\frac{m}{y}\rfloor\sum_{d\mid gcd(x,y)}\mu(d)\\
&=\sum_{d=1}^{n}\mu(d)\sum_{x=1}^{n}[d\mid x]\lfloor\frac{n}{x}\rfloor\sum_{y=1}^{m}[d\mid y]\lfloor\frac{m}{y}\rfloor\\
&=\sum_{d=1}^{n}\mu(d)\sum_{x=1}^{\lfloor\frac{n}{d}\rfloor}\lfloor\frac{n}{xd}\rfloor\sum_{y=1}^{\lfloor\frac{m}{d}\rfloor}\lfloor\frac{m}{yd}\rfloor\\

\end{align}
$$
$$
\begin{align}
\sum_{i=1}^{n}\sum_{j=1}^{n}lcm(A_{i},A_{j})
&=2\sum_{i=1}^{n}\sum_{j=1}^{i-1}lcm(A_{i},A_{j})-\sum_{i=1}^{n}A_{i}\\
&=2\sum_{i=1}^{n}\sum_{j=1}^{i-1}\frac{A_{i}A_{j}}{\gcd(A_{i},A_{j})}-\sum_{i=1}^{n}A_{i}\\
&=2\sum_{i=1}^{n}A_{i}\sum_{j=1}^{i-1}\frac{A_{j}}{\gcd(A_{i},A_{j})}-\sum_{i=1}^{n}A_{i}\\
\end{align}
$$
好神秘的做法，加一个出现次数就好做了
$$
\begin{align}
\sum_{i=1}^{N}\sum_{j=1}^{N}lcm(A_{i},A_{j})
&=\sum_{i=1}^{n}\sum_{j=1}^{n}lcm(i,j)s_{i}s_{j}\\
&=\sum_{i=1}^{n}\sum_{j=1}^{n}\frac{ij}{\gcd(i,j)}s_{i}s_{j}\\
&=\sum_{d=1}^{n}\sum_{i=1}^{n}\sum_{j=1}^{n}\frac{ij}{d}s_{i}s_{j}[\gcd(i,j)=d]\\
&=\sum_{d=1}^{n}d\sum_{i=1}^{\lfloor\frac{n}{d}\rfloor}is_{id}\sum_{j=1}^{\lfloor\frac{n}{d}\rfloor}js_{jd}\sum_{k\mid\gcd(i,j)}\mu(k)\\
&=\sum_{d=1}^{n}d\sum_{k=1}^{\lfloor\frac{n}{d}\rfloor}\mu(k)k^{2}(\sum_{i=1}^{\lfloor\frac{n}{dk}\rfloor}is_{idk})^{2}\\
&=\sum_{d=1}^{n}d\sum_{d\mid Q}\mu(\frac{Q}{d})(\frac{Q}{d})^{2}(\sum_{i=1}^{\lfloor\frac{n}{Q}\rfloor}is_{iQ})^{2}\\
&=\sum_{Q=1}^{n}Q\sum_{d\mid Q}d\mu(d)(\sum_{i=1}^{\lfloor\frac{n}{Q}\rfloor}is_{iQ})^{2}\\
\end{align}
$$
$$
\begin{align}
\prod_{i=1}^{n}\prod_{j=1}^{n}\frac{lcm(i,j)}{\gcd(i,j)}
&=\prod_{i=1}^{n}\prod_{j=1}^{n}\frac{ij}{\gcd(i,j)^{2}}\\
&=(n!)^{2n}\prod_{i=1}^{n}\prod_{j=1}^{n}\frac{1}{\gcd(i,j)^{2}}\\
&=(n!)^{2n-2}\prod_{i=1}^{n}\prod_{j=1}^{i-1}\frac{1}{\gcd(i,j)^{4}}\\
&=(n!)^{2n-2}(\prod_{i=1}^{n}\prod_{j=1}^{i-1}\frac{1}{\gcd(i,j)})^{4}\\
\end{align}
$$
$$
\begin{align}
\prod_{i=1}^{n}\prod_{j=1}^{i-1}\frac{1}{\gcd(i,j)}
&=\prod_{d=1}^{n}\frac{1}{d^{f(d)}}
\end{align}
$$
$$
\begin{align}
f(d)
&=\sum_{i=1}^{n}\sum_{j=1}^{n}[\gcd(i,j)=d]\\
&=\sum_{i=1}^{\lfloor\frac{n}{d}\rfloor}\sum_{j=1}^{\lfloor\frac{n}{d}\rfloor}[\gcd(i,j)=1]\\
&=2\sum_{i=1}^{\lfloor\frac{n}{d}\rfloor}\sum_{j=1}^{i-1}[\gcd(i,j)=1]-1\\
&=2\sum_{i=1}^{\lfloor\frac{n}{d}\rfloor}\varphi(i)-1\\
\end{align}
$$
杜教筛
$$
id=1*\varphi
$$
$$
\begin{align}
\sum_{i=1}^{n}(1*\varphi)(i)
&=\sum_{i=1}^{n}\sum_{d\mid i}1(\frac{n}{d})\varphi(d)\\
&=\sum_{d=1}^{n}\varphi(d)\sum_{i=1}^{\lfloor\frac{n}{d}\rfloor}\\
&=\sum_{d=1}^{n}\sum_{i=1}^{\lfloor\frac{n}{d}\rfloor}\varphi(i)\\
\end{align}
$$

$$
\begin{align}
\sum_{d=1}^{n}\sum_{i=1}^{\lfloor\frac{n}{d}\rfloor}\varphi(i)
&=\sum_{i=1}^{n}(1*\varphi)(i)\\
&=\sum_{i=1}^{n}i\\
&=\frac{n(n+1)}{2}\\
\end{align}
$$
$$
\begin{align}
S(n)=\frac{n(n+1)}{2}-\sum_{d=2}^{n}S(\lfloor\frac{n}{d}\rfloor)
\end{align}
$$
$$
\varepsilon=1*\mu
$$
$$
\begin{align}
\sum_{i=1}^{n}(1*\mu)(i)
&=\sum_{i=1}^{n}\sum_{d\mid i}\mu(d)\\
&=\sum_{d=1}^{n}\sum_{i=1}^{\lfloor\frac{n}{d}\rfloor}\mu(i)\\
\end{align}
$$
$$
\begin{align}
S(n)=1-\sum_{d=2}^{n}S(\lfloor\frac{n}{d}\rfloor)
\end{align}
$$
$$
\begin{align}
\sum_{i=1}^{n}\sum_{j=1}^{n}ij\gcd(i,j)
&=\sum_{d=1}^{n}\sum_{i=1}^{\lfloor\frac{n}{d}\rfloor}\sum_{j=1}^{\lfloor\frac{n}{d}\rfloor}ijd^{3}[\gcd(i,j)=1]\\
&=\sum_{d=1}^{n}d^{3}\sum_{i=1}^{\lfloor\frac{n}{d}\rfloor}\sum_{j=1}^{\lfloor\frac{n}{d}\rfloor}ij\sum_{k\mid\gcd(i,j)}\mu(k)\\
&=\sum_{d=1}^{n}d^{3}\sum_{k=1}^{\lfloor\frac{n}{d}\rfloor}\mu(k)\sum_{i=1}^{\lfloor\frac{n}{dk}\rfloor}ik\sum_{j=1}^{\lfloor\frac{n}{dk}\rfloor}jk\\
&=\sum_{d=1}^{n}d^{3}\sum_{k=1}^{\lfloor\frac{n}{d}\rfloor}k^{2}\mu(k)(\sum_{i=1}^{\lfloor\frac{n}{dk}\rfloor}i)^{2}\\
&=\sum_{d=1}^{n}d^{3}\sum_{k=1}^{\lfloor\frac{n}{d}\rfloor}k^{2}\mu(k)s(\lfloor\frac{n}{dk}\rfloor)\\
&=\sum_{Q=1}^{n}\sum_{d\mid Q}d^{3}(\frac{Q}{d})^{2}\mu(\frac{Q}{d})s(\lfloor\frac{n}{Q}\rfloor)\\
&=\sum_{Q=1}^{n}Q^{2}s(\lfloor\frac{n}{Q}\rfloor)\sum_{d\mid Q}d\mu(\frac{Q}{d})\\
&=\sum_{Q=1}^{n}Q^{2}s(\lfloor\frac{n}{Q}\rfloor)\varphi(Q)\\
&=\sum_{Q=1}^{n}s(\lfloor\frac{n}{Q}\rfloor)f(Q)
\end{align}
$$
$$ 
S(n)=\sum_{i=1}^{n}f(i)=\sum_{i=1}^{n}i^{2}\varphi(i)
$$
$$
\begin{align}
\sum_{i=1}^{n}(g*f)(i)
&=\sum_{i=1}^{n}\sum_{d\mid i}d^{2}\varphi(d)g(\frac{i}{d})\\
&=\sum_{i=1}^{n}\sum_{d\mid i}i^{2}\varphi(d)\\
&=\sum_{i=1}^{n}i^{2}\sum_{d\mid i}\varphi(d)\\
&=\sum_{i=1}^{n}i^{3}
\end{align}
$$
$$
\begin{align}
\sum_{i=1}^{n}(g*f)(i)
&=\sum_{i=1}^{n}\sum_{d\mid i}f(d)g(\frac{i}{d})\\
&=\sum_{d=1}^{n}g(d)\sum_{i=1}^{\lfloor\frac{n}{d}\rfloor}f(i)\\
&=\sum_{d=1}^{n}g(d)S(\lfloor\frac{n}{d}\rfloor)\\
\end{align}
$$
$$
\begin{align}
g(1)S(n)=\sum_{i=1}^{n}i^{3}-\sum_{d=2}^{n}g(d)S(\lfloor\frac{n}{d}\rfloor)
\end{align}
$$
$$
\frac{a}{b}<\frac{p}{q}<\frac{c}{d}
$$
$$
\frac{aq}{b}<p<\frac{cq}{d}
$$
$$
\lfloor\frac{aq}{b}\rfloor+1\le p\le \lceil\frac{cq}{d}\rceil
$$
$$
\lfloor\frac{aq}{b}\rfloor\le p-1\le \lfloor\frac{cq-1}{d}\rfloor
$$
$$
ax+by\le c
$$
$$
ax\le c-by
$$
$$
x\le\lfloor\frac{-by+c}{a}\rfloor
$$
$$
\begin{align}
\sum_{i=0}^{\lfloor\frac{c}{b}\rfloor}\lfloor\frac{-bi+c}{a}\rfloor
&=\sum_{i=0}^{n}\lfloor\frac{-(a\lfloor\frac{b}{a}\rfloor+b\bmod a)i+c}{a}\rfloor
\end{align}
$$
$$
\begin{align}
\sum_{i=0}^{\lfloor\frac{c}{b}\rfloor}\lfloor\frac{-bi+c}{a}\rfloor
&=\sum_{i=0}^{n}\sum_{j=0}^{n}[j\le\lfloor\frac{-bi+c}{a}\rfloor]\\
&=\sum_{i=0}^{n}\sum_{j=0}^{n}[j\le\lceil\frac{-bi+c+1}{a}\rceil-1]\\
&=\sum_{i=0}^{n}\sum_{j=0}^{n}[j+1\le\frac{-bi+c+1}{a}]\\
&=\sum_{i=0}^{n}\sum_{j=0}^{n}[aj+a\le-bi+c+1]\\
&=\sum_{i=0}^{n}\sum_{j=0}^{n}[bi\le c-aj-a+1]\\
&=\sum_{i=0}^{n}\sum_{j=0}^{n}[i\le \lfloor\frac{-aj+c-a+1}{b}\rfloor]\\
&=n+f'(-a,c-a+1,b,m)
\end{align}
$$
$$
\begin{align}
&\sum_{i=1}^{n}\sum_{j=1}^{m}\sum_{k=1}^{p}\gcd(ij,ik,jk)\gcd(i,j,k)(\frac{\gcd(i,j)}{\gcd(i,k)\gcd(j,k)}+\frac{\gcd(i,k)}{\gcd(i,j)\gcd(j,k)}+\frac{gcd(j,k)}{\gcd(i,j)\gcd(i,k)})\\
&=\sum_{d=1}^{n}\sum_{i=1}^{\lfloor\frac{n}{d}\rfloor}\sum_{j=1}^{\lfloor\frac{m}{d}\rfloor}\sum_{k=1}^{\lfloor\frac{p}{d}\rfloor}\gcd(idjd,idkd,jdkd)\gcd(id,jd,kd)(\frac{\gcd(id,jd)}{\gcd(id,kd)\gcd(jd,kd)}+\frac{\gcd(id,kd)}{\gcd(id,jd)\gcd(jd,kd)}+\frac{gcd(jd,kd)}{\gcd(id,jd)\gcd(id,kd)})[\gcd(i,j,k)=1]\\
&=\sum_{d=1}^{n}d^{2}\sum_{i=1}^{\lfloor\frac{n}{d}\rfloor}\sum_{j=1}^{\lfloor\frac{m}{d}\rfloor}\sum_{k=1}^{\lfloor\frac{p}{d}\rfloor}\gcd(ij,ik,jk)(\frac{\gcd(i,j)}{\gcd(i,k)\gcd(j,k)}+\frac{\gcd(i,k)}{\gcd(i,j)\gcd(j,k)}+\frac{gcd(j,k)}{\gcd(i,j)\gcd(i,k)})[\gcd(i,j,k)=1]\\
&=\sum_{d=1}^{n}d^{2}\sum_{t=1}^{\lfloor\frac{n}{d}\rfloor}\sum_{i=1}^{\lfloor\frac{n}{dt}\rfloor}\sum_{j=1}^{\lfloor\frac{m}{dt}\rfloor}[\gcd(i,j)=1]\sum_{k=1}^{\lfloor\frac{p}{d}\rfloor}[\gcd(k,t)=1]\gcd(i,k)\gcd(j,k)t(\frac{t}{\gcd(i,k)\gcd(j,k)}+\frac{\gcd(i,k)}{t\gcd(j,k)}+\frac{gcd(j,k)}{i\gcd(i,k)})\\
&=\sum_{d=1}^{n}d^{2}\sum_{t=1}^{\lfloor\frac{n}{d}\rfloor}\sum_{i=1}^{\lfloor\frac{n}{dt}\rfloor}\sum_{j=1}^{\lfloor\frac{m}{dt}\rfloor}\sum_{x}[x\mid i][x\mid j]\mu(x)\sum_{k=1}^{\lfloor\frac{p}{d}\rfloor}\sum_{y}[y\mid k][y\mid t]\mu(y)(\gcd(i,k)^{2}+\gcd(j,k)^{2}+t^{2})\\
&=\sum_{d=1}^{n}d^{2}\sum_{y=1}^{\lfloor\frac{n}{d}\rfloor}\mu(y)\sum_{t=1}^{\lfloor\frac{n}{dy}\rfloor}\sum_{x=1}^{\lfloor\frac{n}{dty}\rfloor}\mu(x)\sum_{i=1}^{\lfloor\frac{n}{dtxy}\rfloor}\sum_{j=1}^{\lfloor\frac{m}{dtxy}\rfloor}\sum_{k=1}^{\lfloor\frac{p}{dy}\rfloor}(\gcd(ix,k)^{2}+\gcd(jx,k)^{2}+t^{2})\\
\end{align}
$$
$$
min\{i+j,i+k,i+j\}+min\{i,j,k\}=min\{i,j\}+min\{i,k\}+min\{j,k\}
$$
$$
i+j +i=i + i + j
$$

$$
\begin{align}
&\sum_{i=1}^{n}\sum_{j=1}^{m}\sum_{k=1}^{p}\gcd(ij,ik,jk)\gcd(i,j,k)(\frac{\gcd(i,j)}{\gcd(i,k)\gcd(j,k)}+\frac{\gcd(i,k)}{\gcd(i,j)\gcd(j,k)}+\frac{gcd(j,k)}{\gcd(i,j)\gcd(i,k)})\\
&=\sum_{i=1}^{n}\sum_{j=1}^{m}\sum_{k=1}^{p}\gcd(i,j)\gcd(j,k)\gcd(i,k)(\frac{\gcd(i,j)}{\gcd(i,k)\gcd(j,k)}+\frac{\gcd(i,k)}{\gcd(i,j)\gcd(j,k)}+\frac{gcd(j,k)}{\gcd(i,j)\gcd(i,k)})\\
&=\sum_{i=1}^{n}\sum_{j=1}^{m}\sum_{k=1}^{p}(\gcd(i,j)^{2}+\gcd(j,k)^{2}+\gcd(i,k)^{2})\\
\end{align}
$$
$$
\begin{align}
f(n,m,p)
&=\sum_{i=1}^{n}\sum_{j=1}^{m}\sum_{k=1}^{p}\gcd(i,j)^{2}\\
&=p\sum_{d=1}^{n}d^{2}\sum_{i=1}^{\lfloor\frac{n}{d}\rfloor}\sum_{j=1}^{\lfloor\frac{m}{d}\rfloor}[\gcd(i,j)=1]\\
&=p\sum_{d=1}^{n}d^{2}\sum_{k=1}^{\lfloor\frac{n}{d}\rfloor}\mu(k)\sum_{i=1}^{\lfloor\frac{n}{dk}\rfloor}\sum_{j=1}^{\lfloor\frac{m}{dk}\rfloor}\\
&=p\sum_{Q=1}^{n}\sum_{d\mid Q}d^{2}\mu(\frac{Q}{d})\lfloor\frac{n}{Q}\rfloor\lfloor\frac{m}{Q}\rfloor\\
&=p\sum_{Q=1}^{n}\lfloor\frac{n}{Q}\rfloor\lfloor\frac{m}{Q}\rfloor\sum_{d\mid Q}d^{2}\mu(\frac{Q}{d})\\
\end{align}

$$
$$
\begin{align}
\prod_{i=1}^{A}\prod_{j=1}^{B}\prod_{k=1}^{C}(\frac{lcm(i,j)}{\gcd(i,k)})
\end{align}
$$
$$
\begin{align}
\prod_{i=1}^{A}\prod_{j=1}^{B}\prod_{k=1}^{C}lcm(i,j)
&=(\prod_{i=1}^{A}\prod_{j=1}^{B}lcm(i,j))^{C}\\
\end{align}
$$
$$
\begin{align}
\prod_{i=1}^{A}\prod_{j=1}^{B}lcm(i,j)
&=\prod_{i=1}^{A}\prod_{j=1}^{B}\frac{ij}{\gcd(i,j)}\\
&=(\prod_{i=1}^{A}\prod_{j=1}^{B}ij)(\prod_{i=1}^{A}\prod_{j=1}^{B}\frac{1}{\gcd(i,j)})\\
&=(B!)^{A}(A!)^{B}(\prod_{i=1}^{A}\prod_{j=1}^{B}\frac{1}{\gcd(i,j)})\\
&=(B!)^{A}(A!)^{B}(\prod_{d=1}^{A}\frac{1}{d^{f(d)}})\\
\end{align}
$$
$$
\begin{align}
f(d)
&=\sum_{i=1}^{A}\sum_{j=1}^{B}[\gcd(i,j)=d]\\
&=\sum_{i=1}^{\lfloor\frac{A}{d}\rfloor}\sum_{j=1}^{\lfloor\frac{B}{d}\rfloor}[\gcd(i,j)=1]\\
&=\sum_{i=1}^{\lfloor\frac{A}{d}\rfloor}\sum_{j=1}^{\lfloor\frac{B}{d}\rfloor}[\gcd(i,j)=1]\\
&=\sum_{k=1}^{\lfloor\frac{A}{d}\rfloor}\mu(k)\lfloor\frac{A}{dk}\rfloor\lfloor\frac{B}{dk}\rfloor\\
\end{align}
$$

$$
\begin{align}
\prod_{i=1}^{A}\prod_{j=1}^{B}\prod_{k=1}^{C}\gcd(i,k)
&=(\prod_{i=1}^{A}\prod_{k=1}^{C}\gcd(i,k))^{B}\\
\end{align}
$$
$$
\begin{align}
\prod_{i=1}^{A}\prod_{k=1}^{C}\gcd(i,k)
&=\prod_{i=1}^{A}d^{f(d)}
\end{align}
$$
$$
\begin{align}
\prod_{i=1}^{A}\prod_{j=1}^{B}\prod_{k=1}^{C}(\frac{lcm(i,j)}{\gcd(i,k)})^{ijk}
\end{align}
$$
$$
\begin{align}
\prod_{i=1}^{A}\prod_{j=1}^{B}\prod_{k=1}^{C}lcm(i,j)^{ijk}
&=(\prod_{i=1}^{A}\prod_{j=1}^{B}lcm(i,j)^{ij})^{\frac{C(C+1)}{2}}
\end{align}
$$
$$
h(n)=\prod_{i=1}^{n}i^{i}
$$
$$
\begin{align}
\prod_{i=1}^{A}\prod_{j=1}^{B}lcm(i,j)^{ij}
&=\prod_{i=1}^{A}\prod_{j=1}^{B}(\frac{ij}{\gcd(i,j)})^{ij}\\
&=\prod_{i=1}^{A}\prod_{j=1}^{B}(ij)^{ij}\prod_{i=1}^{A}\prod_{j=1}^{B}(\frac{1}{\gcd(i,j)})^{ij}\\
&=\prod_{i=1}^{A}i^{i\frac{B(B+1)}{2}}\prod_{j=1}^{B}j^{ij}\prod_{i=1}^{A}\prod_{j=1}^{B}(\frac{1}{\gcd(i,j)})^{ij}\\
&=h(A)^{\frac{B(B+1)}{2}}h(B)^{\frac{A(A+1)}{2}}\prod_{i=1}^{A}\prod_{j=1}^{B}(\frac{1}{\gcd(i,j)})^{ij}\\
\end{align}
$$
$$
\begin{align}
g(d)=\sum_{i=1}^{n}\sum_{j=1}^{m}ij[\gcd(i,j)=d]
&=\sum_{i=1}^{\lfloor\frac{n}{d}\rfloor}\sum_{j=1}^{\lfloor\frac{m}{d}\rfloor}idjd[\gcd(i,j)=1]\\
&=d^{2}\sum_{k=1}^{\lfloor\frac{n}{d}\rfloor}\mu(k)k^{2}\sum_{i=1}^{\lfloor\frac{n}{dk}\rfloor}i\sum_{j=1}^{\lfloor\frac{m}{dk}\rfloor}j\\
\end{align}
$$
$$
\begin{align}
\prod_{i=1}^{A}\prod_{j=1}^{B}\prod_{k=1}^{C}(\frac{lcm(i,j)}{\gcd(i,k)})^{\gcd(i,j,k)}
\end{align}
$$
$$
\begin{align}
\prod_{i=1}^{A}\prod_{j=1}^{B}\prod_{k=1}^{C}(\frac{ij}{\gcd(i,j)})^{\gcd(i,j,k)}
&=\prod_{i=1}^{A}\prod_{j=1}^{B}\prod_{k=1}^{C}(ij)^{\gcd(i,j,k)}\prod_{i=1}^{A}\prod_{j=1}^{B}\prod_{k=1}^{C}(\frac{1}{\gcd(i,j)})^{\gcd(i,j,k)}
\end{align}
$$
$$
\begin{align}
\prod_{i=1}^{A}\prod_{j=1}^{B}\prod_{k=1}^{C}i^{\gcd(i,j,k)}
&=\prod_{i=1}^{A}\prod_{j=1}^{B}\prod_{k=1}^{C}i^{\gcd(i,j,k)}\\
\end{align}
$$
$$
\begin{align}
F(i)=\sum_{j=1}^{B}\sum_{k=1}^{C}\gcd(i,j,k)
&=\sum_{d\mid i}d\sum_{j=1}^{\lfloor\frac{B}{d}\rfloor}\sum_{k=1}^{\lfloor\frac{C}{d}\rfloor}[\gcd(i/d,j,k)=1]\\
&=\sum_{d\mid i}d\sum_{t=1}^{\lfloor\frac{B}{d}\rfloor}\sum_{j=1}^{\lfloor\frac{B}{dt}\rfloor}\sum_{k=1}^{\lfloor\frac{C}{dt}\rfloor}[\gcd(i/d,t)=1][\gcd(j,k)=1]\\
\end{align}
$$
$$
G(d)=\sum_{i=1}^{\lfloor\frac{n}{d}\rfloor}\sum_{j=1}^{\lfloor\frac{m}{d}\rfloor}[\gcd(i,j)=1]\sum_{k=1}^{p}\gcd(d,k)
$$
$$
\begin{align}
\prod_{i=1}^{A}\prod_{j=1}^{B}\prod_{k=1}^{C}(\frac{lcm(i,j)}{\gcd(i,k)})^{f(type)}
&=\prod_{i=1}^{A}\prod_{j=1}^{B}\prod_{k=1}^{C}(\frac{ij}{\gcd(i,j)\gcd(i,k)})^{f(type)}
\end{align}
$$
$$
F(A,type)=\prod_{i=1}^{A}\prod_{j=1}^{B}\prod_{k=1}^{C}i^{f(type)}
$$
$$
G(A,B,type)=\prod_{i=1}^{A}\prod_{j=1}^{B}\prod_{k=1}^{C}\gcd(i,j)^{f(type)}
$$
$$
\begin{align}
F(A,0)=\prod_{i=1}^{A}\prod_{j=1}^{B}\prod_{k=1}^{C}i
&=\prod_{i=1}^{A}i^{BC}\\
&=(A!)^{BC}
\end{align}
$$
$$
\begin{align}
G(A,B,0)=\prod_{i=1}^{A}\prod_{j=1}^{B}\prod_{k=1}^{C}\gcd(i,j)
&=\prod_{d=1}^{A}d^{\sum_{i=1}^{A}\sum_{j=1}^{B}\sum_{k=1}^{C}[\gcd(i,j)=d]}\\
&=\prod_{d=1}^{A}d^{C\sum_{i=1}^{A}\sum_{j=1}^{B}[\gcd(i,j)=d]}\\
&=\prod_{d=1}^{A}d^{C\sum_{i=1}^{A/d}\sum_{j=1}^{B/d}[\gcd(i,j)=1]}\\
&=\prod_{d=1}^{A}d^{C\sum_{t=1}^{A/d}\mu(t)\sum_{i=1}^{\frac{A}{td}}\sum_{j=1}^{\frac{B}{td}}}\\
&=(\prod_{d=1}^{A}d^{\sum_{t=1}^{A/d}\mu(t)\lfloor\frac{A}{td}\rfloor\lfloor\frac{B}{td}\rfloor})^{C}\\
&=(\prod_{T=1}^{A}\prod_{d\mid T
}d^{\mu(\frac{T}{d})\lfloor\frac{A}{T}\rfloor\lfloor\frac{B}{T}\rfloor})^{C}\\
&=(\prod_{T=1}^{A}(\prod_{d\mid T
}d^{\mu(\frac{T}{d})})^{\lfloor\frac{A}{T}\rfloor\lfloor\frac{B}{T}\rfloor})^{C}\\
\end{align}
$$
$$
\begin{align}
F(A,1)=\prod_{i=1}^{A}\prod_{j=1}^{B}\prod_{k=1}^{C}i^{ijk}
&=\prod_{i=1}^{A}\prod_{j=1}^{B}i^{ij\frac{C(C+1)}{2}}\\
&=\prod_{i=1}^{A}i^{i\frac{B(B+1)}{2}\frac{C(C+1)}{2}}\\
&=(\prod_{i=1}^{A}i^i)^{\frac{B(B+1)}{2}\frac{C(C+1)}{2}}\\
&=(\prod_{i=1}^{A}i^i)^{S_{1}(B)S_{2}(C)}\\
\end{align}
$$
$$
\begin{align}
G(A,B,1)=\prod_{i=1}^{A}\prod_{j=1}^{B}\prod_{k=1}^{C}\gcd(i,j)^{ijk}
&=(\prod_{i=1}^{A}\prod_{j=1}^{B}\gcd(i,j)^{ij})^{S_{1}(C)}\\
&=(\prod_{d=1}^{A}d^{\sum_{i=1}^{A}\sum_{j=1}^{B}ij[\gcd(i,j)=d]})^{S_{1}(C)}\\
&=(\prod_{d=1}^{A}d^{d^{2}\sum_{i=1}^{A/t}\sum_{j=1}^{B/t}ij[\gcd(i,j)=1]})^{S_{1}(C)}\\
&=(\prod_{d=1}^{A}d^{d^{2}\sum_{t=1}^{A/d}\mu(t)\sum_{i=1}^{A/dt}\sum_{j=1}^{B/dt}itjt})^{S_{1}(C)}\\
&=(\prod_{d=1}^{A}d^{d^{2}\sum_{t=1}^{A/d}\mu(t)t^{2}S_{1}(\lfloor\frac{A}{dt}\rfloor)S_{1}(\lfloor\frac{B}{dt}\rfloor)})^{S_{1}(C)}\\
&=(\prod_{T=1}^{A}\prod_{d\mid T}d^{\mu(\frac{T}{d})T^{2}S_{1}(\lfloor\frac{A}{T}\rfloor)S_{1}(\lfloor\frac{B}{T}\rfloor)})^{S_{1}(C)}\\
&=(\prod_{T=1}^{A}(\prod_{d\mid T}d^{\mu(\frac{T}{d})T^{2}})^{S_{1}(\lfloor\frac{A}{T}\rfloor)S_{1}(\lfloor\frac{B}{T}\rfloor})^{S_{1}(C)}\\
\end{align}
$$
$$
\begin{align}
F(A,2)=\prod_{i=1}^{A}\prod_{j=1}^{B}\prod_{k=1}^{C}i^{\gcd(i,j,k)}
&=\prod_{d=1}^{A}\prod_{i=1}^{A/d}(id)^{d\sum_{j=1}^{B/d}\sum_{k=1}^{C/d}[\gcd(j,k)=1]}\\
&=\prod_{d=1}^{A}\prod_{t=1}^{A/d}\prod_{i=1}^{A/td}(itd)^{d\mu(t)\sum_{j=1}^{B/dt}\sum_{k=1}^{C/dt}}\\
&=\prod_{d=1}^{A}\prod_{t=1}^{A/d}\prod_{i=1}^{A/td}(itd)^{d\mu(t)\lfloor\frac{B}{dt}\rfloor\lfloor\frac{C}{dt}\rfloor}\\
&=\prod_{T=1}^{A}(\prod_{d\mid T}(\lfloor\frac{A}{T}\rfloor!T^{\lfloor\frac{A}{T}\rfloor})^{d\mu(\frac{T}{d})})^{\lfloor\frac{B}{T}\rfloor\lfloor\frac{C}{T}\rfloor}\\
&=\prod_{T=1}^{A}((\lfloor\frac{A}{T}\rfloor!T^{\lfloor\frac{A}{T}\rfloor})^{\varphi(T)})^{\lfloor\frac{B}{T}\rfloor\lfloor\frac{C}{T}\rfloor}\\
&=\prod_{T=1}^{A}(T^{\varphi(T)})^{\lfloor\frac{A}{T}\rfloor\lfloor\frac{B}{T}\rfloor\lfloor\frac{C}{T}\rfloor}
\prod_{T=1}^{A}((\lfloor\frac{A}{T}\rfloor!)^{\varphi(T)})^{\lfloor\frac{B}{T}\rfloor\lfloor\frac{C}{T}\rfloor}\\
\end{align}
$$

$$
\begin{align}
G(A,B,2)=\prod_{i=1}^{A}\prod_{j=1}^{B}\prod_{k=1}^{C}\gcd(i,j)^{\gcd(i,j,k)}
&=\prod_{d=1}^{A}\prod_{i=1}^{A/d}\prod_{j=1}^{B/d}(d\gcd(i,j))^{d\sum_{k=1}^{C/d}[\gcd(i,j,k)=1]}\\
&=\prod_{d=1}^{A}\prod_{i=1}^{A/d}\prod_{j=1}^{B/d}(d\gcd(i,j))^{d\sum_{k=1}^{C/d}\sum_{t\mid\gcd(i,j,k)}\mu(t)}\\
&=\prod_{t=1}^{A}\prod_{d=1}^{A/t}\prod_{i=1}^{A/dt}\prod_{j=1}^{B/dt}(dt\gcd(i,j))^{\mu(t)d\sum_{k=1}^{C/dt}}\\
&=\prod_{t=1}^{A}\prod_{d=1}^{A/t}\prod_{i=1}^{A/dt}\prod_{j=1}^{B/dt}(dt\gcd(i,j))^{\mu(t)d\lfloor\frac{C}{dt}\rfloor}\\
&=\prod_{t=1}^{A}\prod_{d=1}^{A/t}\prod_{i=1}^{A/dt}\prod_{j=1}^{B/dt}(dt)^{\mu(t)d\lfloor\frac{C}{dt}\rfloor}\prod_{t=1}^{A}\prod_{d=1}^{A/t}\prod_{i=1}^{A/dt}\prod_{j=1}^{B/dt}(\gcd(i,j))^{\mu(t)d\lfloor\frac{C}{dt}\rfloor}\\
&=\prod_{T=1}^{A}\prod_{d\mid T}(T)^{\mu(t)d\lfloor\frac{A}{T}\rfloor\lfloor\frac{B}{T}\rfloor\lfloor\frac{C}{T}\rfloor}
\prod_{g=1}^{A}\prod_{t=1}^{A/g}\prod_{d=1}^{A/tg}\prod_{i=1}^{A/dtg}\prod_{j=1}^{B/dtg}(g)^{[\gcd(i,j)=1]\mu(t)d\lfloor\frac{C}{dt}\rfloor}\\
&=\prod_{T=1}^{A}(T)^{\varphi(T)\lfloor\frac{A}{T}\rfloor\lfloor\frac{B}{T}\rfloor\lfloor\frac{C}{T}\rfloor}
\prod_{h=1}^{A}\prod_{g=1}^{A}\prod_{t=1}^{A/g}\prod_{d=1}^{A/tg}(g)^{\mu(h)\mu(t)d\lfloor\frac{C}{dt}\rfloor\lfloor\frac{A}{dtgh}\rfloor\lfloor\frac{B}{dtgh}\rfloor}\\
\end{align}
$$
把后面那一坨拿出来
$$
\begin{align}
\prod_{h=1}^{A}\prod_{g=1}^{A/h}\prod_{t=1}^{A/gh}\prod_{d=1}^{A/tgh}(g)^{\mu(h)\mu(t)d\lfloor\frac{C}{dt}\rfloor\lfloor\frac{A}{dtgh}\rfloor\lfloor\frac{B}{dtgh}\rfloor}
&=\prod_{Q=1}^{A}\prod_{g\mid Q}\prod_{t=1}^{A/Q}\prod_{d=1}^{A/tQ}(g)^{\mu(\frac{Q}{g})\mu(t)d\lfloor\frac{C}{dt}\rfloor\lfloor\frac{A}{dtQ}\rfloor\lfloor\frac{B}{dtQ}\rfloor}\\
&=\prod_{Q=1}^{A}\prod_{g\mid Q}\prod_{T=1}^{A/Q}\prod_{d\mid T}(g)^{\mu(\frac{Q}{g})\mu(t)d\lfloor\frac{C}{T}\rfloor\lfloor\frac{A}{TQ}\rfloor\lfloor\frac{B}{TQ}\rfloor}\\
&=\prod_{Q=1}^{A}\prod_{g\mid Q}(\prod_{T=1}^{A/Q}\prod_{d\mid T}(g)^{\mu(\frac{T}{d})d\lfloor\frac{C}{T}\rfloor\lfloor\frac{A}{TQ}\rfloor\lfloor\frac{B}{TQ}\rfloor})^{\mu(\frac{Q}{g})}\\
&=\prod_{Q=1}^{A}\prod_{g\mid Q}((g)^{\sum_{T=1}^{A/Q}\sum_{d\mid T}\mu(\frac{T}{d})d\lfloor\frac{C}{T}\rfloor\lfloor\frac{A}{TQ}\rfloor\lfloor\frac{B}{TQ}\rfloor})^{\mu(\frac{Q}{g})}\\
&=\prod_{T=1}^{C}(\prod_{Q=1}^{A/T}\prod_{g\mid Q}g^{\mu(\frac{Q}{g})\lfloor\frac{A}{TQ}\rfloor\lfloor\frac{B}{TQ}\rfloor})^{\varphi(T)\lfloor\frac{C}{T}\rfloor}\\
&=\prod_{T=1}^{C}(\prod_{Q=1}^{A/T}(\prod_{g\mid Q}g^{\mu(\frac{Q}{g})})^{\lfloor\frac{A/T}{Q}\rfloor\lfloor\frac{B/T}{Q}\rfloor})^{\varphi(T)\lfloor\frac{C}{T}\rfloor}\\
\end{align}
$$
$$
\lfloor d\sqrt r\rfloor=\lfloor d\frac{p}{q}\rfloor
$$
$$
(-1)^{k}=1-2(k\bmod2)=1-2(k-2\lfloor\frac{k}{2}\rfloor)=1-2k+4\lfloor\frac{k}{2}\rfloor
$$
$$
f(a,b,c,n)=\sum_{i=1}^{n}\lfloor\frac{a\sqrt r+b}{c}i\rfloor
$$
$$ t=\frac{a\sqrt r+b}{c} $$
$$
\begin{align}
f(a,b,c,n)
&=\sum_{i=1}^{n}\lfloor ti\rfloor\\
&=\sum_{i=1}^{n}\lfloor ti-\lfloor t\rfloor i+\lfloor t\rfloor i\rfloor\\
&=\sum_{i=1}^{n}\lfloor t\rfloor i+\sum_{i=1}^{n}\lfloor (t-\lfloor t\rfloor) i\rfloor\\
&=\lfloor t\rfloor\frac{n(n+1)}{2} +\sum_{i=1}^{n}\lfloor (\frac{a\sqrt r+b}{c}-\lfloor t\rfloor) i\rfloor\\
&=\lfloor t\rfloor\frac{n(n+1)}{2}+f(a,b-c\lfloor t\rfloor,c,n)
\end{align}
$$
小于1
$$
\begin{align}
f(a,b,c,n)
&=\sum_{i=1}^{n}\lfloor ti\rfloor\\
&=\sum_{i=1}^{n}\sum_{j=1}^{\lfloor tn\rfloor}[j<\lfloor ti\rfloor]\\
&=\sum_{i=1}^{n}\sum_{j=1}^{\lfloor tn\rfloor}[j<ti]\\
&=\sum_{i=1}^{n}\sum_{j=1}^{\lfloor tn\rfloor}[i>\frac{j}{t}]\\
&=\sum_{i=1}^{n}\sum_{j=1}^{\lfloor tn\rfloor}[i>\lfloor\frac{j}{t}\rfloor]\\
&=\sum_{j=1}^{\lfloor tn\rfloor}(n-\lfloor\frac{j}{t}\rfloor)\\
&=n\lfloor tn\rfloor-\sum_{i=1}^{\lfloor tn\rfloor}\lfloor\frac{i}{t}\rfloor\\
&=n\lfloor tn\rfloor-\sum_{i=1}^{\lfloor tn\rfloor}\lfloor\frac{c}{a\sqrt r+b}i\rfloor\\
&=n\lfloor tn\rfloor-\sum_{i=1}^{\lfloor tn\rfloor}\lfloor\frac{ac\sqrt r-bc}{a^{2}r-b^{2}}i\rfloor\\
&=n\lfloor tn\rfloor-f(ac,-bc,a^{2}r-b^{2},\lfloor tn\rfloor)
\end{align}
$$

$$
n=\prod_{i=1}^{s}p_{i}^{e_{i}}
$$
$$
n=p=1\times p--->0
$$  
令$f(n)$表示$n$被拆成互不相同的数之和的方案数  
$f(1)=0,f(2)=0,f(3)=1,f(4)=1,f(5)=2,f(6)=3,f(7)=4$  
$7=1+6=2+5=3+4=1+2+4$  
$$
C_{i}+xP_{i}=C_{j}+xP_{j}+yM
$$
$$ 
(P_{i}-P_{j})x-My=C_{j}-C{i}
$$
检查是否有非负整数解  
$$
ax+by=c,x=x_{0}+b,y=y_{0}-a
$$
$$
ax\equiv c(\bmod b)
$$  这里有问题  
$$
n=2^{e_{2}}5^{e_{5}}t,f(n,N)=\lfloor\frac{N}{t}\rfloor
$$
$$
\begin{align}
\sum_{i=1}^{n}f(n)
&=\sum_{e_{2}=0}\sum_{e_{5}=0}\sum_{i=1}^{\lfloor\frac{n}{2^{e_{2}}\times5^{e_{5}}}\rfloor}[\gcd(i,10)=1]\lfloor\frac{n}{i}\rfloor\\
&=\sum_{e_{2}=0}\sum_{e_{5}=0}(F(m)-F(m/2)-F(m/5)+F(m/10))\\
\end{align}
$$
$$ 
F(n)=\sum_{i=1}^{n}\lfloor\frac{n}{i}\rfloor
$$
换一种更直接的枚举方式  
$$
\begin{align}
\sum_{i=1}^{n}f(n)
&=\sum_{t=1}^{n}\lfloor\frac{n}{t}\rfloor\times G(\lfloor\frac{n}{t}\rfloor)
\end{align}
$$
连续一段求和时，注意$t$既不是2的倍数，也不是5的倍数  

$$
\binom{n}{k}\bmod 2=\nu_{2}(n!)-\nu_{2}(k!)-\nu_{2}((n-k)!)=0?1:0
$$
$$
\begin{align}
\prod_{i=l}^{r}lcm(a_{i},x)
&=(\prod_{i=l}^{r}a_{i}x)\times(\prod_{i=l}^{r}\gcd(a_{i},x))^{-1}
\end{align}
$$
$$
x=\prod_{i=1}^{s}p_{i}^{e_{i}}
$$
$$
i->2i(\bmod n+1)
$$
$$
i\times 2^{M}\equiv L(\bmod n+1)
$$
$$
i\equiv L\times (2^{-1})^{M}\equiv L\times(\frac{n+2}{2})^{M}(\bmod n+1)
$$
$$
g^{\sum_{i\mid s}\binom{s}{i}}
$$
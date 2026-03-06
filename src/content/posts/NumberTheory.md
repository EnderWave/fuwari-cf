---
title: 数论
published: 2025-11-28
description: ''
image: ''
tags: [数学,数论]
category: 'Math'
draft: false 
lang: ''
---
# 数轮部分
## 数论
*这一部分只考虑整数*
### 一些定义
**完全积性函数**  
$f$为完全积性函数，则$f(ab)=f(a)f(b)$  
**积性函数**  
$f$为积性函数，则在$(a,b)=1$时，有$f(ab)=f(a)f(b)$  
**常见的积性函数**  
$I(n)=1$  
$\varepsilon (n)=[n=1]$  
$id(n)=n$  
$\varphi (n)=\sum_{i=1}^{n} [(i,n)=1]= n\prod (1-\frac{1}{p_{i}})$,$p_{i}$为$n$的唯一分解中互不相同的质数  
$\mu (n)$莫比乌斯函数，$n=1$时，$\mu(n)=1$,当$n$的唯一分解的质数的次数都为1，$\mu(n)$为$-1$的质数种类次方，否则$\mu(n)=0$  
$d(n)$表示$n$的约数个数  
$\sigma(n)$表示$n$的约数和  
$\sigma_{k}(n)$表示n的约数的$k$次方的和（除数函数）  
### 筛法
#### 埃拉托斯特尼筛法
埃拉托斯特尼筛法筛素数  
主体思想是逐个去掉所有质数的倍数，枚举到的下一个就是质数  
```cpp
int vis[N],pri[N],cnt;
void Eratosthenes(int n){
    vis[0]=vis[1]=0;cnt=0;
    for(int i=2;i<=n;i++)vis[i]=1;
    for (int i=2;i<=n;i++){
        if (vis[i]){
            pri[cnt++]=i;
            if (1ll*i*i>n)continue;
            for (int j=i*i;j<=n;j+=i){
                vis[j]=0;
            }
        }
    }
}
```
#### 线性筛（欧拉筛）
线性筛的主体思想是让每个数都被自己最小的质因数筛掉  
```cpp
void Euler(int n){
    cnt=0;
    for (int i=2;i<=n;i++)vis[i]=0;
    for (int i=2;i<=n;i++){
        if (!vis[i])pri[cnt++]=i;
        for (int j=1;j<=cnt;j++){
            if (1ll*i*pri[j]>n)break;
            vis[i*pri[j]]=1;
            if (i%pri[j]==0)break;
        }
    }
}
```
注意代码中$i \mod pri[j] = 0$说明已经到了$i$的最小质数，如果继续，那么接下来的数就不是被最小的质数筛掉了，以为$i$的最小质数是$pri[j]$  
##### 用线性筛求一些函数  
求$\varphi(n)$，设$p_{1}$为$n$的最小质因子,且$n=m  p_{1}$  
如果$(m,p_{1})=1$,$\varphi(n)=\varphi(p_{1}) \times \varphi(m)=(p_{1}-1)\varphi(m)$  
如果$(m,p_{1})\neq1$,$\varphi(n)=n \prod(1-\frac{1}{p_{i}})=mp_{1}\prod(1-\frac{1}{p_{i}})=p_{1}\varphi(m)$  
```cpp
int phi[N];  
void get_phi(int n){  
    cnt=0;phi[1]=1;  
    for (int i=2;i<=n;i++)vis[i]=0;  
    for (int i=2;i<=n;i++){  
        if (!vis[i])pri[++cnt]=i,phi[i]=i-1;  
        for (int j=1;j<=cnt;j++){  
            if (1ll*i*pri[j]>n)break;  
            if (i%pri[j]==0){  
                vis[i*pri[j]]=1;phi[i*pri[j]]=pri[j]*phi[i];  
                break;  
            }  
            vis[i*pri[j]]=1;phi[i*pri[j]]=(pri[j]-1)*phi[i];  
        }  
    }  
}
```
求$\mu(n)$,设$p_{1}$为$n$的最小质因子，$n=mp_{1}$  
$\mu(p^{k})=-1\times[k=1]$  
如果$(m,p_{1})=1$,$\mu(n)=\mu(p_{1})\times\mu(m)=-1\times\mu(m)$  
如果$(m,p_{1})\neq1$,$\mu(n)=0$  
```cpp
int mu[N];  
void get_mu(int n){  
    cnt=0;mu[1]=1;  
    for (int i=2;i<=n;i++)vis[i]=0;  
    for (int i=2;i<=n;i++){  
        if (!vis[i])pri[++cnt]=i,mu[i]=-1;  
        for (int j=1;j<=cnt;j++){  
            if (1ll*i*pri[j]>n)break;  
            if (i%pri[j]==0){  
                vis[i*pri[j]]=1;mu[i*pri[j]]=0;  
                break;  
            }  
            vis[i*pri[j]]=1;mu[i*pri[j]]=-mu[i];  
        }  
    }  
}
```
求$d(n)$,设$n=\prod p_{i}^{a_{i}}$,$d(n)=\prod (a_{i}+1)$,$n=p_{1}m$,$p_{1}$为$n$的最小质因子  
如果$(m,p_{1})=1$,$d(n)=d(p_{1})d(m)=2d(m)$  
如果$(m,p_{1})\neq1$,$d(n)=d(p_{1}^{k})d(\frac{n}{p_{1}^{k}})$,$p_{1}^{k}||n$  
我们需要维护$k$，即最小质因子的个数，令$num_{i}$为$i$的最小质因子的个数，则有  
如果$(m,p_{1})=1$,$d(n)=d(p_{1})d(m)=2d(m)$，$num_{n}=1$  
如果$(m,p_{1})\neq1$,$d(n)=d(p_{1}^{k})d(\frac{n}{p_{1}^{k}})=\frac{(num_{m}+2)d(m)}{num_{m}+1}=\frac{(num_{n}+1)d(m)}{num_{n}}$,$num_{n}=num_{m}+1$  
```cpp
int d[N],num[N];  
void get_d(int n){  
    cnt=0;d[1]=1;  
    for (int i=2;i<=n;i++)vis[i]=0;  
    for (int i=2;i<=n;i++){  
        if (!vis[i])pri[++cnt]=i,d[i]=2,num[i]=1;  
        for (int j=1;j<=cnt;j++){  
            if (1ll*i*pri[j]>n)break;  
            if (i%pri[j]==0){  
                vis[i*pri[j]]=1;num[i*pri[j]]=num[i]+1;d[i*pri[j]]=d[i]*(num[i*pri[j]]+1)/num[i*pri[j]];  
                break;  
            }  
            vis[i*pri[j]]=1;num[i*pri[j]]=1;d[i*pri[j]]=2*d[i];  
        }  
    }  
}
```
求$\sigma(n)$,$\sigma(n)=\prod (1+p_{i}+...+p_{i}^{a_{i}})=\prod \frac{p_{i}^{a_{i}+1}-1}{p_{i}-1}$,$n=mp_{1}$,$p_{1}$为$n$的最小质因子  
令$g_{i}=\sum_{t=0}^{num_{i}}p_{1}^{t}$  
如果$(m,p_{1})=1$,$\sigma(n)=(1+p_{1})\sigma(m)$,$num_{n}=1$,$g_{n}=1+p_{1}$  
如果$(m,p_{1})\neq1$,$\sigma(n)=\sigma(p_{1}^{num_{m}+1})\sigma(\frac{m}{p_{1}^{num_{m}}})=\frac{(p_{1}^{num_{m}+2}-1)\sigma(m)}{p_{1}^{num_{m}+1}-1}=\frac{g_{n}\sigma(m)}{g_{m}}$,$g_{n}=1+p_{1}g_{m}$  
```cpp
int dsum[N],gsum[N];  
void get_dsum(int n){  
    cnt=0;dsum[1]=1;  
    for (int i=2;i<=n;i++)vis[i]=0;  
    for (int i=2;i<=n;i++){  
        if (!vis[i])pri[++cnt]=i,dsum[i]=1+i,gsum[i]=1+i;  
        for (int j=1;j<=cnt;j++){  
            if (1ll*i*pri[j]>n)break;  
            if (i%pri[j]==0){  
                vis[i*pri[j]]=1;  
                gsum[i*pri[j]]=pri[j]*gsum[i]+1;  
                dsum[i*pri[j]]=dsum[i]*(gsum[i*pri[j]])/gsum[i];  
                break;  
            }  
            vis[i*pri[j]]=1;  
            gsum[i*pri[j]]=1+pri[j];  
            dsum[i*pri[j]]=(1+pri[j])*dsum[i];  
        }  
    }  
}
```

### 狄利克雷卷积  
$(f*g)(n)=\sum_{d|n} f(d)g(\frac{n}{d})$  
$waiting$
### 数论分块  
用于计算形如$\sum_{i=1}^{n}f(i)g(\lfloor \frac{n}{i} \rfloor)$的式子  
若能$O(1)$预处理$f$的前缀和,则可在$O(\sqrt n)$的时间计算上式  
#### 一维  
先看简单情况考虑计算$\sum_{i=1}^{n} \lfloor \frac{n}{i} \rfloor$,即为$f(i)=1,g(i)=i$  
我们按照$\lfloor \frac{n}{i} \rfloor=d$的值分块,设这块区间为$[l,r]$  
则有$d \leq \frac{n}{i} < d+1$ ,取倒数有$\frac{1}{d+1} < \frac{i}{n} \leq \frac{1}{d}$,  
则$\lfloor\frac{n}{d+1} \rfloor+1 \leq {i} \leq \lfloor\frac{n}{d}\rfloor$  
右端点为$r=\lfloor\frac{n}{\lfloor\frac{n}{l}\rfloor}\rfloor$  
#### 向上取整  
计算$\sum_{i=1}^{n}f(i)g(\lceil \frac{n}{i} \rceil)$  
注意到 $\lceil \frac{n}{i} \rceil=\lfloor \frac{n-1}{i} \rfloor+1$  
$\sum_{i=1}^{n}f(i)g(\lceil \frac{n}{i} \rceil)=f(n)g(1)+\sum_{i=1}^{n-1}f(i)g(\lfloor \frac{n-1}{i} \rfloor+1)$  
#### 多维  
计算$\sum_{i=1}^{n}f(i)g(\lfloor \frac{n_{1}}{i} \rfloor,\lfloor \frac{n_{2}}{i} \rfloor,...,\lfloor \frac{n_{m}}{i} \rfloor)$  
只需要对一个$l$取交集即可，$r=min_{i=1}^{m} {\lfloor\frac{n_{i}}{\lfloor\frac{n_{i}}{l}\rfloor}\rfloor}$  
#### 任意指数  
计算$\sum_{i=1}^{\lfloor n^{\frac{a}{b}} \rfloor}f(i)g(\lfloor \frac{n^{a}}{i^{b}}\rfloor)$  
同上可知$\lfloor\frac{n^{\frac{a}{b}}}{(d+1)^{\frac{1}{b}}} \rfloor+1 \leq {i} \leq \lfloor\frac{n^{\frac{a}{b}}}{d^{\frac{1}{b}}}\rfloor$  
复杂度为$O(n^{\frac{a}{b+1}})$  

### 莫比乌斯反演  
#### 普通形式  
首先有恒等式$\sum_{d|n}\mu(d)=[n=1]$  
设$n=\prod p_{i}^{e_{i}}$,$n'=\prod p_{i}$,则$\sum_{d|n}=\sum_{i=0}^{k}(-1)^{i}\binom{k}{i}=(1+(-1))^{k}=[n=1]$  
即$\varepsilon=1*\mu$  
简单应用$[gcd(i,j)=1\sum_{d|gcd(i,j)}\mu(d)=\sum_{d}[d|i][d|j]\mu(d)$  
主要形式$f(n)=\sum_{d|n}g(d)<=>g(n)=\sum_{d|n}\mu(\frac{n}{d})f(d)$,可直接带入验证  
上述形式等价与$f=1*g<=>g=\mu*f$  
故$\mu*f=\mu*1*g=\epsilon*g=g$  
对$\varphi(n)$有,$n=\sum_{d|n}\varphi(d)$,即$id=1*\varphi$,则$\varphi=\mu*id$,$\varphi(n)=\sum_{d|n}d\mu(\frac{n}{d})$  
对$\sigma_{k}(n)=\sum_{d|n}d^{k}$,有$\sigma_{k}=1*id_{k}$,则$id_{k}=\mu*\sigma_{k}$  
对互异素因子数目函数$\omega(n)=\sum_{d|n}[d\in P]$,即$\omega=1*1_{P}$,则$1_{P}=\mu*\omega$,$[n\in P]=\sum_{d}\mu(\frac{n}{d})\omega(d)$  
#### 拓展形式  
$f(n)=\sum_{n|d}g(d)<=>g(n)=\sum_{n|d}\mu(\frac{d}{n})f(d)$  
$f(n)=\prod_{d|n}g(d)<=>g(n)=\prod_{d|n}f(d)^{\mu(\frac{n}{d})}$  
$f(n)=\sum_{d|n}\alpha(\frac{n}{d})g(n)<=>g(n)=\sum_{d|n}\alpha^{-1}(\frac{n}{d})f(d)$,即$f=\alpha*g<=>g=\alpha^{-1}*f$,$\alpha^{-1}$为$\alpha$的$Dirichlet$逆  
$f(n)=\sum_{i=1}^{n}g(\lfloor\frac{n}{i}\rfloor)<=>g(n)=\sum_{i=1}^{n}\mu(i)f(\lfloor\frac{n}{i}\rfloor)$  

#### $Dirichlet$前缀和  
如果将每一个素数都看作一个维度，这就是一种高维前缀和．从小到大遍历所有素数 𝑝，并将 𝑛处的函数值累加到 𝑛𝑝处．这和$Eratosthenes$筛法 的遍历顺序是一致的．因此，这一算法可以在 $𝑂(𝑛log⁡log⁡𝑛)$时间内计算出长度为 $𝑛$ 的数列的 $Dirichlet$ 前缀和．类似地，利用逐维差分就可以在相同时间复杂度内求出数列的 $Dirichlet$ 差分．  
```cpp
int f[N],g[N];  
void di_presum(int n){  
    for (int i=0;i<=n;i++)vis[i]=0,f[i]=g[i];  
    for (int i=2;i<=n;i++){  
        if (vis[i])continue;  
        for (int j=1,ij=i;i*j<=n;j++,ij+=j){  
            vis[ij]=1;  
            f[ij]+=g[j];  
        }  
    }  
}  
void di_diff(int n){  
    for (int i=0;i<=n;i++)vis[i]=0,g[i]=f[i];  
    for (int i=2;i<=n;i++){  
        if (vis[i])continue;  
        for (int j=n/i,ij=i*j;j>=1;j--,ij-=j){  
            vis[ij]=1;  
            g[ij]-=f[j];  
        }  
    }  
}
```

### 杜教筛  
用低于线性的时间求$S(n)=\sum_{i=1}^{n}f(i)$  
构造一个$g$,$g$满足$g,f*g$的前缀和可以很快的求出  
$\sum_{i=1}^{n}(f*g)(i)=\sum_{i=1}^{n}\sum_{d|i}f(\frac{i}{d})g(d)=\sum_{i=1}^{n}g(i)S(\lfloor\frac{n}{i}\rfloor)$,最后一步可以这么理解$f,g$括号内的乘积都是小于等于$n$的  
则$g(1)S(n)=\sum_{i=1}^{n}(f*g)(i)-\sum_{i=2}^{n}g(i)S(\lfloor\frac{n}{i}\rfloor)$  
时间复杂度$O(n^{\frac{3}{4}})$  
### Min_25筛
低于线性时间求积性函数前缀和  
要求：$f(p)$是关于$p$的可以快速求值的完全积性函数之和；$f(p^{c})$可以快速求值  
$p_{k}$为第$k$小的质数，$p_{0}=1$  
$lpf(n)$为$n$的最小质因数，$lpf(1)=1$  
$F_{prime}(n)=\sum_{p\leq n}f(p)$  
$F_{k}(n)=\sum_{i=2}^{n}[p_{k}\leq lpf(i)]f(i)$  
发现答案即为$F_{1}(n)+f(1)$  
$$
\begin{align}
F_{k}(n)
&= \sum_{i=2}^{n} [p_{k} \le lpf(i)] f(i) \\
&= \sum_{k \le i,\, p_{i}^{2} \le n} \sum_{c \ge 1,\, p_{i}^{c} \le n} f(p_{i}^{c}) \bigl([c > 1] + F_{i+1}(\lfloor n / p_{i}^{c} \rfloor)\bigr) + F_{\text{prime}}(n) - F_{\text{prime}}(p_{k-1}) \\
&= \sum_{k \le i,\, p_{i}^{2} \le n} \sum_{c \ge 1,\, p_{i}^{c+1} \le n} \bigl(f(p_{i}^{c+1}) + f(p_{i}^{c}) F_{i+1}(\lfloor n / p_{i}^{c} \rfloor)\bigr) + F_{\text{prime}}(n) - F_{\text{prime}}(p_{k-1})
\end{align}
$$


考虑计算$F_{k}(n)$  
$1.$直接递推  
$2.$从大到小枚举$p$，当$p^{2}<n$时转移增加值不为零，可*后缀和优化*  
考虑计算$F_{prime}(n)$，*发现*只有$1,2,...,\lfloor\sqrt n\rfloor,\lfloor\frac{n}{\lfloor\sqrt n\rfloor}\rfloor,...,\lfloor\frac{n}{2}\rfloor,n$这几个点有用  
一般$f(p)=\sum a_{i}p^{c_{i}}$，我们计算$\sum_{p\leq m}g(p),g(p)=p^{s}$  
$G_{k}(n)$表示埃筛第$k$轮筛后剩下的$g$的和  
有递推公式$G_{k}(n)=G_{k-1}(n)-[p_{k}^{2}\leq n]g(p_{k})(G_{k-1}(\lfloor\frac{n}{p_{k}}\rfloor)-G_{k-1}({p_{k-1}}))$  
$G_{k-1}(\lfloor\frac{n}{p_{k}}\rfloor)-G_{k-1}({p_{k-1}})$的结果是最小质因子大于$p_{k-1}$的数的次方和  
然后就可以用$G$合并得到$F$了  
### 类欧几里得算法  
$f(a,b,c,n)=\sum_{i=0}^{n} \lfloor \frac{ai+b}{c} \rfloor$  
$g(a,b,c,n)=\sum_{i=0}^{n} \lfloor \frac{ai+b}{c} \rfloor ^{2}$  
$h(a,b,c,n)=\sum_{i=0}^{n} i\lfloor \frac{ai+b}{c} \rfloor$  
计算$f$
$$
\begin{align}
f(a,b,c,n)
&= \sum_{i=0}^{n} \left\lfloor \frac{ai+b}{c} \right\rfloor \\
&= \sum_{i=0}^{n} \left\lfloor \frac{(\lfloor a/c \rfloor \cdot c + (a \bmod c)) i + \lfloor b/c \rfloor \cdot c + (b \bmod c)}{c} \right\rfloor \\
&= \sum_{i=0}^{n} \left\lfloor \frac{(a \bmod c)i + (b \bmod c)}{c} \right\rfloor + \lfloor a/c \rfloor \, i + \lfloor b/c \rfloor \\
&= \frac{n(n+1)}{2} \lfloor a/c \rfloor + (n+1)\lfloor b/c \rfloor + f(a \bmod c,\, b \bmod c,\, c,\, n)
\end{align}
$$


如果$a<c,b<c$,$m=\lfloor \frac{an+b}{c} \rfloor$,$\lfloor \frac{ai+b}{c} \rfloor=\lceil \frac{ai+b+1}{c} \rceil-1$  
$$
\begin{align}
f(a,b,c,n)
&= \sum_{i=0}^{n} \left\lfloor \frac{ai+b}{c} \right\rfloor \\
&= \sum_{i=0}^{n} \sum_{j=0}^{m-1} [\, j < \left\lfloor \frac{ai+b}{c} \right\rfloor \,] \\
&= \sum_{i=0}^{n} \sum_{j=0}^{m-1} [\, j < \left\lceil \frac{ai+b+1}{c} \right\rceil - 1 \,] \\
&= \sum_{i=0}^{n} \sum_{j=0}^{m-1} [\, j+1 < \left\lceil \frac{ai+b+1}{c} \right\rceil \,] \\
&= \sum_{i=0}^{n} \sum_{j=0}^{m-1} [\, j+1 < \frac{ai+b+1}{c} \,] \\
&= \sum_{i=0}^{n} \sum_{j=0}^{m-1} [\, jc + c < ai + b + 1 \,] \\
&= \sum_{j=0}^{m-1} \sum_{i=0}^{n} [\, i > \frac{cj + c - b - 1}{a} \,] \\
&= \sum_{j=0}^{m-1} \sum_{i=0}^{n} [\, i > \left\lfloor \frac{cj + c - b - 1}{a} \right\rfloor \,] \\
&= \sum_{j=0}^{m-1} \left( n - \left\lfloor \frac{cj + c - b - 1}{a} \right\rfloor \right) \\
&= mn - f(c,\, c-b-1,\, a,\, m-1)
\end{align}
$$


计算$g,h$  
$$
\begin{align}
g(a,b,c,n)
&= \sum_{i=0}^{n} \left\lfloor \frac{ai+b}{c} \right\rfloor^{2} \\
&= \sum_{i=0}^{n} \left\lfloor \frac{(\lfloor a/c \rfloor \cdot c + (a \bmod c)) i + \lfloor b/c \rfloor \cdot c + (b \bmod c)}{c} \right\rfloor^{2} \\
&= \sum_{i=0}^{n} \left( \left\lfloor \frac{(a \bmod c)i + (b \bmod c)}{c} \right\rfloor + \lfloor a/c \rfloor \, i + \lfloor b/c \rfloor \right)^{2} \\
&= \sum_{i=0}^{n} \left\lfloor \frac{(a \bmod c)i + (b \bmod c)}{c} \right\rfloor^{2}
  + \sum_{i=0}^{n} (\lfloor a/c \rfloor \, i)^{2}
  + \sum_{i=0}^{n} \lfloor b/c \rfloor^{2} \\
&\quad + 2 \lfloor a/c \rfloor \sum_{i=0}^{n} i \left\lfloor \frac{(a \bmod c)i + (b \bmod c)}{c} \right\rfloor
  + 2 \lfloor b/c \rfloor \sum_{i=0}^{n} \left\lfloor \frac{(a \bmod c)i + (b \bmod c)}{c} \right\rfloor \\
&\quad + 2 \lfloor a/c \rfloor \lfloor b/c \rfloor \sum_{i=0}^{n} i \\
&= g(a \bmod c,\, b \bmod c,\, c,\, n)
  + \frac{n(n+1)(2n+1)}{6} \lfloor a/c \rfloor^{2}
  + (n+1)\lfloor b/c \rfloor^{2} \\
&\quad + 2 \lfloor a/c \rfloor \, h(a \bmod c,\, b \bmod c,\, c,\, n)
  + 2 \lfloor b/c \rfloor \, f(a \bmod c,\, b \bmod c,\, c,\, n)
  + n(n+1)\lfloor a/c \rfloor \lfloor b/c \rfloor
\end{align}
$$



如果$a<c,b<c,m=\lfloor \frac{an+b}{c} \rfloor$  
$$
\begin{align}
g(a,b,c,n)
&= \sum_{i=0}^{n} \left\lfloor \frac{ai+b}{c} \right\rfloor^{2} \\
&= \sum_{i=0}^{n} \sum_{j=0}^{m-1} (2j+1)\,[\, j < \left\lfloor \frac{ai+b}{c} \right\rfloor \,] \\
&= \sum_{j=0}^{m-1} (2j+1) \sum_{i=0}^{n} \left[\, i > \left\lfloor \frac{cj + c - b - 1}{a} \right\rfloor \,\right] \\
&= \sum_{j=0}^{m-1} (2j+1)\left( n - \left\lfloor \frac{cj + c - b - 1}{a} \right\rfloor \right) \\
&= m^{2} n - 2\, h(c,\, c-b-1,\, a,\, m-1) - f(c,\, c-b-1,\, a,\, m-1)
\end{align}
$$


$$
\begin{align}
h(a,b,c,n)
&= \sum_{i=0}^{n} \left\lfloor \frac{ai+b}{c} \right\rfloor\, i \\
&= \sum_{i=0}^{n} \left\lfloor 
    \frac{(\lfloor a/c \rfloor \cdot c + (a \bmod c))\, i 
          + \lfloor b/c \rfloor \cdot c + (b \bmod c)}
         {c}
    \right\rfloor i \\
&= \sum_{i=0}^{n} 
    \left\lfloor \frac{(a \bmod c)i + (b \bmod c)}{c} \right\rfloor i
    + \lfloor a/c \rfloor\, i^{2}
    + \lfloor b/c \rfloor\, i \\
&= h(a \bmod c,\, b \bmod c,\, c,\, n)
   + \frac{n(n+1)(2n+1)}{6}\lfloor a/c \rfloor
   + \frac{n(n+1)}{2}\lfloor b/c \rfloor
\end{align}
$$


如果$a<c$,$b<c$,$m=\lfloor \frac{an+b}{c} \rfloor$  
$$
\begin{align}
h(a,b,c,n)
&= \sum_{i=0}^{n} \left\lfloor \frac{ai+b}{c} \right\rfloor\, i \\
&= \sum_{i=0}^{n} i \sum_{j=0}^{m-1} \left[\, j < \left\lfloor \frac{ai+b}{c} \right\rfloor \,\right] \\
&= \sum_{j=0}^{m-1} \sum_{i=0}^{n} i \left[\, i > \left\lfloor \frac{cj + c - b - 1}{a} \right\rfloor \,\right] \\
&= \sum_{j=0}^{m-1} \sum_{i=\left\lfloor \frac{cj + c - b - 1}{a} \right\rfloor + 1}^{n} i \\
&= \sum_{j=0}^{m-1} 
   \frac{\left(n + \left\lfloor \frac{cj + c - b - 1}{a} \right\rfloor + 1\right)
         \left(n - \left\lfloor \frac{cj + c - b - 1}{a} \right\rfloor\right)}{2} \\
&= \frac{1}{2} \sum_{j=0}^{m-1} 
   \left( (n+1)n 
        - \left\lfloor \frac{cj + c - b - 1}{a} \right\rfloor
        - \left\lfloor \frac{cj + c - b - 1}{a} \right\rfloor^{2}
   \right) \\
&= \frac{1}{2}(n+1)nm
   - \frac{1}{2} f(c,\, c-b-1,\, a,\, m-1)
   - \frac{1}{2} g(c,\, c-b-1,\, a,\, m-1)
\end{align}
$$


### 最大公因数  
#### 欧几里得算法  
$gcd(a,b)=gcd(b,a\bmod b)$  
#### 扩展欧几里得算法  
$ax_{1}+by_{1}=gcd(a,b)$  
$bx_{2}+(a\bmod b)y_{2}=gcd(b,a\bmod b)$,又$(a\bmod b)=a-b\lfloor \frac{a}{b}\rfloor$，带入得  
$bx_{2}+(a-b\lfloor \frac{a}{b}\rfloor)y_{2}=ay_{2}+b(x_{2}-\lfloor \frac{a}{b}\rfloor y_{2})=ax_{1}+by_{1}$  
有$x_{1}=y_{2}$,$y_{1}=x_{2}-\lfloor \frac{a}{b}\rfloor y_{2}$  
最终会有$b=0$,$a=gcd=>x=1$,$y=0$  
```cpp
int exgcd(int a,int b,int& x,int& y){  
    if (!b)return x=1,y=0,a;  
    int d=exgcd(b,a%b,x,y);  
    int t=x;  
    x=y;  
    y=t-(a/b)*y;  
    return d;  
}
```
### 欧拉函数  
#### 一些性质  
积性函数$gcd(a,b)=1=>\varphi(ab)=\varphi(a)\varphi(b)$  
$n=\sum_{d|n}\varphi(d)$  
$\varphi(p^{k})=p^{k}-p^{k-1}$  
$\varphi(n)=\prod_{i=1}^{s}\varphi(p_{i}^{k_{i}})=\prod_{i=1}^{s}p_{i}^{k_{i}-1}(p_{i}-1)=n\prod_{i=1}^{s}(1-\frac{1}{p_{i}})$  
$\varphi(mn)\varphi(gcd(m,n))=\varphi(m)\varphi(n)gcd(m,n)$  
#### 欧拉反演  
$\gcd(a,b)=\sum_{d|gcd(a,b)}\varphi(d)=\sum_{d}[d|a][d|b]\varphi(d)$  
$\sum_{i=1}^{n}gcd(i,n)=\sum_{d}\sum_{i=1}^{n}[d|i][d|n]\varphi(d)=\sum_{d}\lfloor \frac{n}{d}\rfloor [d|n]\varphi(d)=\sum_{d|n}\lfloor \frac{n}{d}\rfloor \varphi(d)$  
#### 欧拉定理  
$gcd(a,m)=1$,则$a^{\varphi(m)} \equiv 1(\bmod m)$  
#### 费马小定理  
$a^{p-1}\equiv 1(\bmod p)$  
#### 扩展欧拉定理  
$$
\begin{align}
a^{b} \equiv
\begin{cases}
a^{\, b \bmod \varphi(m)}, & \gcd(a,m)=1, \\[6pt]
a^{\, b}, & \gcd(a,m)\neq 1,\ b < \varphi(m), \\[6pt]
a^{\, (b \bmod \varphi(m)) + \varphi(m)}, & \gcd(a,m)\neq 1,\ b \ge \varphi(m).
\end{cases}
\end{align}
$$


### 裴蜀定理  
存在$x,y$使得$ax+by=gcd(x,y)$  
#### 二元一次不定方程  
$a_{1}x+a_{2}y=b$  
$(x,y)=(x_{1}+t\frac{a_{2}}{gcd(a_{1},a_{2})},x_{2}-t\frac{a_{1}}{gcd(a_{1},a_{2})})$  
#### $Frobenius$ 硬币问题  
有$a_{1},a_{2},...,a_{n}$的面值的硬币若干种，且$gcd(a_{1},a_{2},...,a_{n})=1$，那么最大的不能被表示的面值为多少  
$n=2$时，答案为$a_{1}a_{2}-a_{1}-a_{2}$  
### $Stern-Brocot$树与$Farey$序列
$waiting$
### 逆元  
#### 线性求逆元  
$p= \lfloor \frac{p}{i}\rfloor i +(p\bmod i)$  
$0\equiv\lfloor \frac{p}{i}\rfloor i +(p\bmod i) i +(p\bmod i)\bmod p$  
$i^{-1}\equiv -\lfloor \frac{p}{i}\rfloor(p\bmod i)^{-1} \mod p$  
### 中国剩余定理$(CRT)$  
#### 基本形式  
$gcd(n_{1},n_{2},...,n_{k})=1$  
$$
\begin{cases}
x \equiv a_{1} \pmod{n_{1}}, \\
x \equiv a_{2} \pmod{n_{2}}, \\
\vdots \\
x \equiv a_{k} \pmod{n_{k}}.
\end{cases}
$$


求$x$  
$1.$计算$n=\prod_{i=1}^{k}n_{i}$  
$2.m_{i}=\frac{n}{n_{i}},m_{i}^{-1}$为$m_{i}\bmod n_{i}$的逆元  
3.$x=\sum_{i=1}^{k}a_{i}m_{i}m_{i}^{-1}$  
```cpp
int a[N],r[N];  
int crt(int k){  
    int n=1,ans=0;  
    for (int i=1;i<=k;i++)n*=r[i];  
    for (int i=1;i<=k;i++){  
        int m=n/r[i];  
        ans=(ans+a[i]*m*pow(m,r[i])%n)%n;  
    }  
    return (ans%n+n)%n;  
}
```
#### $Garner$  
$a<\prod_{i=1}^{k}p_{i}$且  
$$
\begin{cases}
a \equiv a_{1} \pmod{p_{1}}, \\
a \equiv a_{2} \pmod{p_{2}}, \\
\vdots \\
a \equiv a_{k} \pmod{p_{k}}.
\end{cases}
$$


构造$a=x_{1}+x_{2}p_{1}+...x_{k}p_{1}...p_{k-1}$,设$p_{i}r_{i,j}\equiv1(\bmod p_{j})$  
带入有  
$x_{1}\equiv a_{1}(\bmod p_{1})$  
$x_{1}+x_{2}p_{1}\equiv a_{2}(\bmod p_{2})=>$,$x_{2}\equiv (a_{2}-x_{1})r_{1,2}(\bmod p_{2})$  
以此类推  
$x_{k}\equiv (...((a_{k}-x_{1})r_{1,k}-x_{2})r_{2,k}...)r_{k-1,k}(\bmod p_{k})$  
```cpp
for (int i = 0; i < k; ++i) {
  x[i] = a[i];
  for (int j = 0; j < i; ++j) {
    x[i] = r[j][i] * (x[i] - x[j]);
    x[i] = x[i] % p[i];
    if (x[i] < 0) x[i] += p[i];
  }
}
```
(粘的代码)  
#### 扩展  
$x\equiv a_{1}(\bmod m_{1})$,$x\equiv a_{2}(\bmod m_{2})$,$m_{1},m_{2}$不一定互质  
$x=m_{1}p+a_{1}=m_{2}q+a_{2}=>m_{1}p+m_{2}q=(a_{2}-a_{1})$  
当$gcd(m_{1},m_{2})\nmid (a_{2}-a_{1})$时，无解  
否则可以求出一组$(p,q)$,使得$x\equiv b(\bmod lcm(m_{1},m_{}))$  
多个方程两两合并  
### 升幂引理  
$\nu_{p}(n)$,表示$n$的标准分解中$p$的次数,即$p^{\nu_{p}(n)}||n$  
#### 第一部分  
对所有素数$p$和满足$gcd(n,p)=1$的整数$n$,  
$1.$若$p | x-y$,则：$\nu_{p}(x^{n}-y^{n})=\nu_{p}(x-y)$  
$2.$若$p|x+y$,则对奇数$n$有：$\nu_{p}(x^{n}+y^{n})=\nu_{p}(x+y)$  
$Proof$:  
$p|x-y<=>x\equiv y(\bmod p)$  
$\sum_{i=0}^{n-1}x^{i}y^{n-1-i}\equiv nx^{n-1}\not\equiv 0(\bmod p)$  
$x^{n}-y^{n}=(x-y)\sum_{i=0}^{n-1}x^{i}y^{n-1-i}$  
则有$\nu_{p}(x^{n}-y^{n})=\nu_{p}(x-y)$  
  
$p|x+y<=>x\equiv -y(\bmod{p})$  
$\sum_{i=0}^{n-1}x^{i}(-y)^{n-1-i}\equiv nx^{n-1}\not\equiv 0(\bmod p)$  
$x^{n}+y^{n}=(x+y)\sum_{i=0}^{n-1}x^{i}(-y)^{n-1-i}$  
则有$\nu_{p}(x^{n}+y^{n})=\nu_{p}(x+y)$  
#### 第二部分  
对所有奇素数$p$,  
$1.$若$p | x-y$,则：$\nu_{p}(x^{n}-y^{n})=\nu_{p}(x-y)+\nu_{p}(n)$  
$2.$若$p|x+y$,则对奇数$n$有：$\nu_{p}(x^{n}+y^{n})=\nu_{p}(x+y)+\nu_{p}(n)$  
$Proof$  
我们只需要证明$p\mid n$的情况  
$n=p$时,我们只要证$p^{2}\nmid \sum_{i=0}^{n-1}x^{i}y^{n-1-i}$  
设$y=x+kp$,（下面有点啰嗦）
$$
\begin{align}
\sum_{i=0}^{p-1} x^{p-1-i} y^{i}
&= \sum_{i=0}^{p-1} x^{p-1-i} (x + kp)^{i} \\
&= \sum_{i=0}^{p-1} x^{p-1-i} \sum_{j=0}^{i} \binom{i}{j} x^{i-j} (kp)^{j} \\
&= \sum_{i=0}^{p-1} x^{p-1} \sum_{j=0}^{i} \binom{i}{j} \left(\frac{kp}{x}\right)^{j} \\
&= x^{p-1} \sum_{j=0}^{p-1} \sum_{i=j}^{p-1} \binom{i}{j} \left(\frac{kp}{x}\right)^{j} \\
&= x^{p-1} \sum_{j=0}^{p-1} \left(\frac{kp}{x}\right)^{j} \sum_{i=j}^{p-1} \binom{i}{j} \\
&\equiv x^{p-1} \left( p + \frac{kp}{x} \sum_{i=1}^{p-1} \binom{i}{1} \right) \\
&\equiv x^{p-1} \left( p + \frac{kp}{x} \cdot \frac{(p-1)p}{2} \right) \\
&\equiv x^{p-1} p \\
&\not\equiv 0 \pmod{p^{2}}
\end{align}
$$


则有$\nu_{p}(x^{p}-y^{p})=\nu_{p}(x-y)+\nu_{p}(p)$  
下面用数学归纳法证明第一个式子  
设$n=p^{a}b$,$gcd(p,b)=1$  
$\nu_{p}((x^{p^{a}})^{b}-(y^{p^{a}})^{b})=\nu_{p}(x^{p^{a}}-y^{p^{a}})$  
$\nu_{p}((x^{p^{a-1}})^{p}-(y^{p^{a-1}})^{p})=\nu_{p}(x^{p^{a-1}}-y^{p^{a-1}})+\nu_{p}(p)$  
以此类推得  
$\nu_{p}(x^{n}-y^{n})=\nu_{p}(x-y)+\nu_{p}(n)$  
  
与上面相似，我们只要证明$p|n$的情况  
$n=p$时,我们只要证$p^{2}\nmid \sum_{i=0}^{n-1}x^{i}(-y)^{n-1-i}$  
设$y=-x-kp$,与上面完全相同  
$$
\begin{align}
\sum_{i=0}^{p-1} x^{p-1-i} (-y)^{i}
&= \sum_{i=0}^{p-1} x^{p-1-i} (x + kp)^{i} \\
&\equiv x^{p-1} p \\
&\not\equiv 0 \pmod{p^{2}}
\end{align}
$$

则有$\nu_{p}(x^{p}+y^{p})=\nu_{p}(x+y)+\nu_{p}(p)$  
下面用数学归纳法证明第二个式子  
设$n=p^{a}b$,$gcd(p,b)=1$  
$\nu_{p}((x^{p^{a}})^{b}+(y^{p^{a}})^{b})=\nu_{p}(x^{p^{a}}+y^{p^{a}})$  
$\nu_{p}((x^{p^{a-1}})^{p}+(y^{p^{a-1}})^{p})=\nu_{p}(x^{p^{a-1}}+y^{p^{a-1}})+\nu_{p}(p)$  
以此类推得  
$\nu_{p}(x^{n}+y^{n})=\nu_{p}(x+y)+\nu_{p}(n)$  
#### 第三部分  
若$p=2$且$p\mid x-y$  
$1.$对奇数$n$，$\nu_{p}(x^{n}-y^{n})=\nu_{p}(x-y)$  
$2.$对偶数$n$，$\nu_{p}(x^{n}-y^{n})=\nu_{p}(x-y)+\nu_{p}(x+y)+\nu_{p}(n)-1$  
对上述$x,y,n$，  
若$4\mid x-y$,则：  
$\nu_{2}(x+y)=1$  
$\nu_{2}(x^{n}-y^{n})=\nu_{2}(x-y)+\nu_{2}(n)$  
$Proof$  
$p=2$时，会把第二部分推导部分倒数第三行分母中的$2$约掉，不能用上面的方法  
$n=2^{a}b,a=\nu_{2}(n),a\nmid b$  
$\nu_{2}(x^{n}-y^{n})=\nu_{2}(x^{2^{a}}-y^{2^{a}})=\nu_{2}((x-y)(x+y)\prod_{i=1}^{a-1}(x^{2^{i}}+y^{2^{i}}))$  
易知奇数的偶数次方模$4$余$1$，则$x^{2^{i}}+y^{2^{i}}\equiv 2(\bmod 4)$  
则$\nu_{p}(x^{n}-y^{n})=\nu_{p}(x-y)+\nu_{p}(x+y)+\nu_{p}(n)-1$  
### 阶乘取模  
$n!=p^{\nu_{p}(n!)}(n!)_{p}$  
#### $Wilson$定理  
对自然数$n>1$，当且仅当$n$时素数时，$(n-1)!\equiv -1(\bmod n)$  
##### 定理  
对自然数$m>1$,有$\prod_{1\leq k<m,gcd(k,m)=1}k\equiv \pm 1(\bmod m)$  
取$-1$，当且仅当模$m$的原根存在  
##### 推论  
对素数$p$和正整数$\alpha$，有  
$$
\begin{align}
\prod_{1 \le k < p^{\alpha}} k \equiv
\begin{cases}
1, & p = 2,\ \alpha \ge 3, \\
-1, & \text{otherwise}
\end{cases}
\pmod{p^{\alpha}}
\end{align}
$$


#### 阶乘余数  
计算$(n!)_{p}\bmod p$  
$(n!)_{p}\equiv (-1)^{\lfloor \frac{n}{p}\rfloor}\cdot(n\bmod p)!\cdot(\lfloor \frac{n}{p}\rfloor!)_{p}(\bmod p)$  
$(n!)_{p}\equiv (\pm1)^{\lfloor \frac{n}{p}\rfloor}\cdot(\prod_{1\leq j\leq(n\bmod p^{\alpha}),gcd(j,p)=1}j)\cdot(\lfloor \frac{n}{p}\rfloor!)_{p}(\bmod p^{\alpha})$,当$p=2 , \alpha\geq3$时取$1$，其余情况取$-1$  
$(n!)_{p}\equiv (\pm1)^{\sum_{j\geq\alpha}\lfloor \frac{n}{p^{j}}\rfloor}\prod_{j\geq0}F(\lfloor \frac{n}{p^{j}}\rfloor\bmod p^{a})$,$F(m)=\prod_{1\leq k\leq m,gcd(k,m)=1}k\bmod p^{\alpha}$,当$p=2 , \alpha\geq3$时取$1$，其余情况取$-1$  
#### $Legendre$公式  
$\nu_{p}(n!)=\sum_{i=1}^{\infty}\lfloor \frac{n}{p^{i}}\rfloor =\frac{n-S_{p}(n)}{p-1}$，$S_{p}(n)$为$p$进制下$n$的各个位数之和  
#### $Kummer$定理  
$\nu_{p}(\binom{m}{n})=\frac{S_{p}(n)+S_{p}(m-n)-S_{p}(m)}{p-1}$  
### $Lucas$定理  
对素数$p$,有  
$\binom{n}{k}\equiv\binom{\lfloor\frac{n}{p}\rfloor}{\lfloor\frac{k}{p}\rfloor}\binom{n\bmod p}{k\bmod p}(\bmod p)$  
$Proof$  
$\binom{p}{n}\equiv[n=0\lor n=p](\bmod p)$  
$f(x)=ax^{n}+bx^{m}$  
$$
\begin{align}
(f(x))^{p}
&= (a x^{n} + b x^{m})^{p} \\
&= \sum_{k=0}^{p} \binom{p}{k} (a x^{n})^{k} (b x^{m})^{p-k} \\
&= a^{p} x^{pn} + b^{p} x^{pm} \\
&= a (x^{p})^{n} + b (x^{p})^{m} \\
&= f(x^{p}) \pmod{p}
\end{align}
$$


$(1+x)^{n}=(1+x)^{p\lfloor\frac{n}{p}\rfloor}(1+x)^{n\bmod p}\equiv (1+x^{p})^{\lfloor\frac{n}{p}\rfloor}(1+x)^{n\bmod p}(\bmod p)$  
对比系数有，$\binom{n}{k}\equiv\binom{\lfloor\frac{n}{p}\rfloor}{\lfloor\frac{k}{p}\rfloor}\binom{n\bmod p}{k\bmod p}(\bmod p)$  
#### $exLucas$算法  
##### 素数幂模情况  
$\binom{n}{k}=p^{\nu_{p}(n!)-\nu_{p}(k!)-\nu_{p}((n-k)!)}\frac{(n!)_{p}}{(k!)_{p}((n-k)!)_{p}}$  
##### 一般模数情况  
用中国剩余定理直接计算即可  
$m=p_{1}^{\alpha_{1}}p_{2}^{\alpha_{2}}...p_{s}^{\alpha_{s}}$  
$$
\begin{cases}
\binom{n}{k} \equiv r_{1} \pmod{p_{1}^{\alpha_{1}}}, \\
\binom{n}{k} \equiv r_{2} \pmod{p_{2}^{\alpha_{2}}}, \\
\vdots \\
\binom{n}{k} \equiv r_{s} \pmod{p_{s}^{\alpha_{s}}}.
\end{cases}
$$


### 同余方程  
#### 定义  
对整数$m$和一元整系数多项式$f(x)=\sum_{i=0}^{n}a_{i}x^{i}$,其中未知数$x\in Z_{m}$，称形如$f(x)\equiv 0(\bmod m)$的方程为关于未知数$x$的模$m$的一元**同余方程**，若$a_{n}\not\equiv0(\bmod m)$,则上式称为$n$次同余方程  
#### 素数幂模同余方程  
$m=p^{e},p\in P,e\in Z_{>1}$  
我们有$f(x_{0})\equiv 0(\bmod p^{e})$,则$f(x_{0})\equiv 0(\bmod p^{e-1})$  
##### $Hensel$引理  
$p\in P,e\in Z_{>1}$,$f(x)=\sum_{i=0}^{n}a_{i}x^{i},(p^{e}\nmid a),f'(x)=\sum_{i=1}^{n}ia_{i}x^{i-1}$,且$f(x_{0})\equiv 0(\bmod p^{e-1})$  
$1.$若$f'(x_{0})\equiv0(\bmod p)$，则存在整数$t$使得$x=x_{0}+p^{e-1}t$，是方程$f(x)\equiv 0(\bmod p^{e})$的解  
$2.$若$f'(x_{0})\equiv0(\bmod p)$且$f'(x_{0})\equiv0(\bmod p^{e})$，则$t=0,1,...,p-1$都可  
$3.$若$f'(x_{0})\equiv0(\bmod p)$且$f'(x_{0})\not\equiv0(\bmod p^{e})$，则不能由上式构造  
$Proof$  
假设$x$是解，带入后有  
$$
\begin{align}
f(x_{0} + p^{e-1} t)
&\equiv \sum_{i=0}^{n} a_{i} (x_{0} + p^{e-1} t)^{i} \\
&\equiv \sum_{i=0}^{n} a_{i} \sum_{j=0}^{i} \binom{i}{j} x_{0}^{\, i-j} (p^{e-1} t)^{j} \\
&\equiv \sum_{j=0}^{n} (p^{e-1} t)^{j} \sum_{i=j}^{n} a_{i} \binom{i}{j} x_{0}^{\, i-j} \\
&\equiv \sum_{i=0}^{n} a_{i} \binom{i}{0} x_{0}^{\, i}
   + p^{e-1} t \sum_{i=1}^{n} a_{i} \binom{i}{1} x_{0}^{\, i-1} \\
&\equiv f(x_{0}) + p^{e-1} t\, f'(x_{0}) \\
&\equiv 0 \pmod{p^{e}}
\end{align}
$$


则$tf'(x_{0})\equiv -\frac{f(x_{0})}{p^{e-1}}(\bmod p)$  
三种情况对应即可  
  
注意到我们推理中只有最后一步用到$f(x_{0})\equiv 0(\bmod p^{e-1})$，那么我们可以对着最后的式子构造解  
##### 推论$1$  
$1.f(s)\equiv 0(\bmod p),f'(s)\not\equiv0(\bmod p)$，则存在$x_{s}\in Z_{p^{e}},x_{s}\equiv s(\bmod p),st.f(x_{s})\equiv 0(\bmod p^{e})$  
$2.f(x)\equiv 0(\bmod p),f'(x)\equiv 0(\bmod p)$无公共解，则原方程的解数与$f(x)\equiv 0(\bmod p)$相同  
$proof?$  

#### 素数模同余方程  
$e=1$，其余的同上  
##### 定理$1$  
若$f(x)\equiv 0(\bmod p)$有$k$个不同的解$x_{1},x_{2},...,x_{k}(k\leq n)$，则  
$f(x)\equiv g(x)\prod_{i=1}^{k}(x-x_{i})(\bmod p)$,  
$deg g=n-k,[x^{n-k}]g(x)=a_{n}$  
##### 推论$2$  
$(\forall x\in Z),x_{p-1}-1\equiv \prod_{i=1}^{p-1}(x-i)(\bmod p)$  
$(p-1)!\equiv -1(\bmod p)$  
##### $Lagrange$定理  
$f(x)\equiv 0(\bmod p)$至多有$n$个根  
##### 推论$3$  
若$\sum_{i=0}^{n}b_{i}x^{i}\equiv 0(\bmod p)$的解数大于$n$，则$(\forall i=0,1,...,n),p\mid b_{i}$  
##### 定理$2$  
若$f(x)\equiv 0(\bmod p)$的解数不为$p$，则必定存在$deg r<p$的整系数多项式$r(x),st.r(x)\equiv 0(\bmod p)$与$f(x)\equiv 0(\bmod p)$同解集  
$Proof$  
不妨设$n\geq p$  
$f(x)=g(x)(x^{p}-x)+r(x),deg r<p$  
运用费马小定理即可  
##### 定理$3$  
设$n\leq p$,则方程$x_{n}+\sum_{i=0}^{n-1}a_{i}x_{i}\equiv 0(\bmod p)$有$n$个解当且仅当存在整系数多项式$q(x),r(x),(deg r<n),st.$  
$x^{p}-x=f(x)q(x)+pr(x)$  
$Proof$  
必要性：  
$x^{p}-x=f(x)q(x)+r_{1}(x)$  
则$r_{1}$与$f$同解，则知$r_{1}(x)=pr(x)$  
充分性：  
$f(x)q(x)\equiv 0(\bmod p)$  
设$f$的解数为$s,s\leq n$  
$deg f+deg q\geq p=>,s+p-n\geq q,s\geq n$  
则$s=n$  
##### 定理$4$  
设$n\mid p-1,p\nmid a,$则方程$x^{n}\equiv a(\bmod p)$有解当且仅当$a^{\frac{p-1}{n}}\equiv 1(\bmod p)$，若有解，解数为$n$  
$Proof$  
必要性：  
方程有解$x_{0}$,则$a^{\frac{p-1}{n}}\equiv (x_{0}^{n})^{\frac{p-1}{n}} \equiv 1(\bmod p)$  
充分性：  
$a^{\frac{p-1}{n}}\equiv 1(\bmod p)$，  
$x^{p}-x=x(x^{p-1}-1)=x((x^{n})^{\frac{p-1}{n}}-a^{\frac{p-1}{n}}+a^{\frac{p-1}{n}}-1)=(x^{n}-a)P(x)+x(a^{\frac{p-1}{n}}-1)$  
由定理3知有$n$个解  
#### 高次同余方程（组）的求解  
我们可以进行下面转化  
**同余方程组-同余方程**  
**模合数-模素数幂-模素数**（$Hensel$引理）  
我们最后只需考虑  
$x^{n}+\sum_{i=0}^{n-1}a_{i}x^{i}\equiv 0(\bmod p),n<p$  
将$x$代换为$x-\frac{a_{n-1}}{n}$可消去$x^{n-1}$项  
只需考虑$x^{n}+\sum_{i=0}^{n-2}a_{i}x^{i}\equiv 0(\bmod p),n<p$  
$n=1$线性同余方程  
$n=2$二次剩余  
可化为$x^{n}\equiv a(\bmod p)k$次剩余  
### 二次剩余  
### 定义  
$gcd(a,p)=1$，若存在整数$x$使得$x^{2}\equiv a(\bmod p)$，则称$a$为模$p$的二次剩余，否则称$a$为模$p$的二次非剩余  
### $Euler$判别法  
对奇素数$p$，和满足$gcd(a,p)=1$的$a$，有  
$$
\begin{align}
a^{\frac{p-1}{2}} \equiv
\begin{cases}
1 \pmod{p}, & \exists\, x \in \mathbb{Z},\ a \equiv x^{2} \pmod{p}, \\[6pt]
-1 \pmod{p}, & \text{otherwise}.
\end{cases}
\end{align}
$$


$Proof$  
由费马小定理,$a^{p-1}\equiv 1(\bmod p)$  
则$(a^{\frac{p-1}{2}}-1)(a^{\frac{p-1}{2}}+1)\equiv 0(\bmod p)$  
则若$gcd(a,p)=1$，则$a^{\frac{p-1}{2}}\equiv \pm1(\bmod p)$  
又知$x^{p}-x=(x^{n}-a)P(x)+x(a^{\frac{p-1}{n}}-1)$  
可证上述结论  
  
对于奇素数$p$，模$p$意义下的二次剩余和二次非剩余都有$\frac{p-1}{2}$个  
  
#### $Legendre$符号  
对奇素数$p$和整数$a$，定义$Legendre$符号如下：  
$$
\begin{align}
\left( \frac{a}{p} \right) =
\begin{cases}
0, & p \mid a, \\[6pt]
1, & p \nmid a \ \land\ \exists\, x \in \mathbb{Z},\ a \equiv x^{2} \pmod{p}, \\[6pt]
-1, & \text{otherwise}.
\end{cases}
\end{align}
$$


$1.$对任意整数$a$，$a^{\frac{p-1}{2}}\equiv (\frac{a}{p})(\bmod p)$  
则$(\frac{1}{p})=1,(\frac{-1}{p})=(-1)^{\frac{p-1}{2}}$  
$2.a_{1}\equiv a_{2}(\bmod p)=>(\frac{a_{1}}{p})=(\frac{a_{2}}{p})$  
$3.$（完全积性）对任意整数$a_{1},a_{2},(\frac{a_{1}a_{2}}{p})=(\frac{a_{1}}{p})(\frac{a_{2}}{p})$  
则对整数$a,b,p\nmid b,(\frac{ab^{2}}{p})=(\frac{a}{p})$  
$4.(\frac{2}{p})=(-1)^{\frac{p^{2}-1}{8}}$  
#### 二次互反律  
设$p,q$是两个不同的奇素数，则$(\frac{p}{q})(\frac{q}{p})=(-1)^{\frac{p-1}{2}\frac{q-1}{2}}$  
$Proof?$  
### 模意义下的开平方  
$p\bmod 4=3$时，$a^{\frac{p+1}{4}}\bmod p$为一个解  
#### $Cipolla$算法  
求解$x^{2}\equiv a(\bmod p)$  
$1.$找到一个$r$使得$r^{2}-a$为模$p$非二次剩余（$a\bmod p=0$需要特判），期望两步找到，定义$w^{2}\equiv r^{2}-a(\bmod p),w^{p-1}\equiv-1(\bmod p)$  
$2.$解为$\pm(r+w)^{\frac{p+1}{2}}$，（疑似需要复数类）  
  
### 阶&原根  
#### 阶  
对于$a\in Z,m\in N_{+}$且$gcd(a,m)=1$，满足同余式$a^{n}\equiv 1(\bmod m)$的最小正整数$n$称为$a$模$m$的阶，记作$\delta_{m}(a)$或$ord_{m}(a)$  
##### 幂的循环结构  
$1.$对于$a\in Z,m\in N_{+}$且$gcd(a,m)=1$，幂次$a^{0},a^{1},...,a^{\delta_{m}(a)-1}$模$m$两两不同余  
$2.$对于$a,n\in Z,m\in N_{+}$且$gcd(a,m)=1$，同余式$a^{n}\equiv 1(\bmod m)$成立当且仅当$\delta_{m}(a)\mid n$  
$3.$对于$a,k\in Z,m\in N_{+}$且$gcd(a,m)=1$，有$\delta_{m}(a^{k})=\frac{\delta_{m}(a)}{gcd(\delta_{m}(a),k)}$  
$4.$对于$a,b\in Z,m\in N_{+}$且$gcd(a,m)=1,gcd(b,m)=1$,有
$\frac{lcm(\delta_{m}(a),\delta_{m}(b))}{gcd(\delta_{m}(a),\delta_{m}(b))}\mid \delta_{m}(ab)\mid lcm(\delta_{m}(a),\delta_{m}(b))$  
$gcd(\delta_{m}(a),\delta_{m}(b))=1<=>\delta_{m}(ab)=\delta_{m}(a)\delta_{m}(b)$
$5.$对于$a,b\in Z,m\in N_{+}$且$gcd(a,m)=1,gcd(b,m)=1$,$\exists c\in Z,gcd(c,m)=1$使得$\delta_{m}(c)=lcm(\delta_{m}(a),\delta_{m}(b))$  
#### 原根  
对于$m\in N_{+},$如果存在$g\in Z$且$gcd(g,m)=1$使得$\delta_{m}(g)=\varphi(m)$，则称$g$为模$m$的原根  
##### 原根判定定理  
对整数$m\geq3$和$gcd(g,m)$，$g$为模$m$的原根，当且仅当对于$\varphi(m)$的每个素因子$p$有$g^{\frac{\varphi(m)}{p}}\not\equiv1(\bmod m)$  
##### 原根个数  
模$m$的原根个数为$\varphi(\varphi(m))$  
##### 原根存在定理  
模$m$的原根存在，当且仅当$m=1,2,4,p^{e},2p^{e}$，其中$p$为奇素数且$e \in N_{+}$  
$Proof?$  

##### 求原根的算法  
从小到大逐一枚举可能的数即可  
#### $Carmichael$函数  
对于$m\in N_{+}$,定义$\lambda(m)$为能使$a^{n}\equiv 1(\bmod m)$对所有$gcd(a,m)=1$都成立的最小正整数  
$\lambda(m)=lcm\{\delta_{m}(a):gcd(a,m)=1\}$  
由**幂的循环结构**性质5知：$\lambda(m)=max\{\delta_{m}(a):gcd(a,m)=1\}$  
##### 递推公式  
###### 引理  
$gcd(m_{1},m_{2})=1,\lambda(m_{1}m_{2})=lcm(\lambda(m_1)\lambda(m_{2}))$  
###### 引理  
对于$m=2^{e}$且$e\in N_{+}$，有$\lambda(2)=1,\lambda(4)=2,$且对于$e\geq3$有$\lambda(m)=2^{e-2}$  
###### 引理  
对于$m=p^{e}$，$p$为奇素数且$e\in N_{+}$，$\lambda(m)=p^{e-1}(p-1)$  
###### 定理  
$$
\begin{align}
\lambda(m) =
\begin{cases}
\varphi(m), 
& m = 1,\, 2,\, 4,\, p^{e},\ p \text{ odd},\ e \in \mathbb{N}_{+}, \\[6pt]
\dfrac{1}{2}\varphi(m), 
& m = 2^{e},\ e \ge 3, \\[6pt]
\operatorname{lcm}\!\bigl(\lambda(p_{1}^{e_{1}}),\, \lambda(p_{2}^{e_{2}}),\, \dots,\, \lambda(p_{s}^{e_{s}})\bigr),
& m = p_{1}^{e_{1}} p_{2}^{e_{2}} \cdots p_{s}^{e_{s}}.
\end{cases}
\end{align}
$$

#### $Carmichael$数  
对于合数$n$，对所有满足$gcd(a,n)=1$的整数有$a^{n-1}\equiv1(\bmod n)$,则$n$为 $Carmichael$数  
$Korselt$判别法  
合数$n$为 $Carmichael$数当且仅当$n$无平方因子且对于$n$的任意质因子$p$均有$(p-1)\mid(n-1)$  

$Carmichael$数为奇数，没有平方因子，且至少有$3$个不同的素因子  
### 离散对数  
#### 定义   
取有原根的正整数$m$,和其一原根$g$，对满足$gcd(a,m)=1$，存在唯一整数$0\leq k <\varphi(m)$，使得$g^{k}\equiv a(\bmod m)$  
我们称这个$k$为以$g$为底，模$m$的离散对数，记作$k=ind_{g}a$,  
$ind_{g}1=0,ind_{g}g=1$  
#### 性质  
设$g$是模$m$的原根，$gcd(a,m)=gcd(b,m)=1$  
$1.ind_{g}(ab)\equiv ind_{g}a+ind_{g}b(\bmod \varphi(m))$  
$2.g_{1}$也是模$m$的原根，$ind_{g}a\equiv ind_{g_{1}}\cdot ind_{g}g_{1}(\bmod \varphi(m))$  
$3.a\equiv b(\bmod m)<=>ind_{g}a= ind_{g}b$  
#### $BSGS$大步小步算法  
在$O(\sqrt m)$的时间内求解$a^{x}\equiv b(\bmod m),gcd(a,m)=1$  
$x=A\lceil \sqrt m\rceil -B$,其中$0\leq A,B\leq\sqrt m$，则$a^{A\lceil \sqrt m\rceil -B}\equiv b(\bmod m)$，也就是$a^{A\lceil \sqrt m\rceil }\equiv ba^{B}(\bmod m)$
然后预处理所有$ba^{B}$，在枚举$a^{A\lceil \sqrt m\rceil }$即可  
可用$hash/map$存储，$map$会多一个$log$  
#### 扩展$BSGS$算法  
求解$a^{x}\equiv b(\bmod m)$  
就是想办法把底数和模数变得互质  
$d_{1}=gcd(a,m),d_{1}\nmid b$无解，否则得到$\frac{a}{d_{1}}a^{x-1}\equiv \frac{b}{d_{1}}(\bmod \frac{m}{d_1})$  
$d_{2}=gcd(a,\frac{m}{d_{1}}),d_{2}\nmid \frac{b}{d_{1}}$无解，否则得到$\frac{a^{2}}{d_{1}d_{2}}a^{x-2}\equiv \frac{b}{d_{1}d_{2}}(\bmod \frac{m}{d_{1}d_{2}})$  
$...$  
$D=\prod_{i=1}^{k}d_{i},\frac{a^{k}}{D}a^{x-k}\equiv \frac{b}{D}(\bmod \frac{m}{D})$  
转化成普通的$BSGS$问题  
### 高次剩余&单位根  
#### 高次剩余  
整数$k\geq2$，整数$a$和正整数$m$互素，若存在整数$x$使得$x^{k}\equiv a(\bmod m)$，则称$a$为模$m$的$k$次剩余，$x$为$a$模$m$的$k$次方根；否则称$a$为模$m$的$k$次非剩余  
##### 定理  
设整数$k\geq2$，整数$a$和正整数$m$互素，设模$m$的原根存在，且$g$是模$m$的一个原根，记$d=gcd(k,\varphi(m)),d'=\frac{\varphi(m)}{d}$  
$1.a$为模$m$的$k$次剩余，当且仅当$a^{d'}\equiv 1(\bmod m)$  
$2.$当$a$为模$m$的$k$次剩余时，在同余意义下，$a$模$m$恰好有$d$个互不相同的$k$次方根，且它们具有形式$x\equiv g^{y_{0+id'}}(\bmod \varphi(m)),0\leq y_{0}<d',i=0,1,...,d-1$  
$3.$模$m$的$k$次剩余类的个数为$d'$，且它们全体就是$\{g^{di}\bmod m:0\leq i<d'\}$  
  
$Proof$  
$gcd(a,m)=1,$则$gcd(x,m)=1$,又$g$为模$m$的原根，所以$a$和$x$与$g$的某次幂同余，设$x\equiv g^{y}(\bmod m)$,原方程等价于$g^{ky}\equiv g^{ind_{g}a}(\bmod m)$，等价于$ky\equiv ind_{g}a(\bmod \varphi(m))$，该方程有解当且仅当$d\mid ind_{g}a,$且通解的形式为$y=y_{0}+id'$  
对于$a^{d'}\equiv 1(\bmod m)$，又由阶的性质$3$知$\delta_{m}(a)=\delta_{m}(g^{ind_{g}a})=\frac{\varphi(m)}{gcd(\varphi(m),ind_{g}a)}=\frac{\varphi(m)}{ind_{g}a}$，又方程有解当且仅当$d\mid ind_{g}a,$即$\frac{\varphi(m)}{d'}\mid\frac{\varphi(m)}{\delta_{m}(a)}$,也即$\delta_{m}(a)\mid d'$由阶的性质$2$其等价于$a^{d'}\equiv 1(\bmod m)$  
##### 定理  
设整数$k\geq2$，奇数$a$和正整数$m=2^{e},e\geq2$  
当$2\nmid k$时  
$1.a$恒为模$m$的$k$次剩余  
$2.a$模$m$的$k$次方根有且仅有一个  
$3.$模$m$的$k$次剩余类个数为$2^{e-1}$，且它们就是全体既约剩余类  
当$2\mid k$时，$d=gcd(k,2^{e-2}),d'=\frac{2^{e-2}}{d}$  
$1.a$为模$m$的$k$次剩余当且仅当$a\equiv 1(\bmod 4),a^{d'}\equiv 1(\bmod m)$  
$2.$当$a$为模$m$的$k$次剩余时，同余意义下，$a$模$m$恰好有$2d$个互不相同的$k$次方根，且他们具有相同的形式$x\equiv\pm5^{y_{0}+id'}(\bmod 2^{e-1}),0\leq y_{0}<d',i=0,1,...,d-1$  
$3.$模$m$的$k$次剩余类的个数为$d'$，且他们的全体就是$\{5^{di}\bmod m:0\leq i<d'\}$  

$Proof$  
$gcd(a,m)=1,$则$gcd(x,m)=1$，因为$a,x$为奇数，设$a\equiv (-1)^{s}5^{r}(\bmod 2^{e}),x\equiv (-1)^{y}5^{z}(\bmod 2^{e})$，则原方程等价于$kz\equiv s(\bmod 2),ky\equiv r (\bmod 2^{e-2})$  
当$2\nmid k$时总是有解  
当$2\mid k$时，第一个方程有解当且仅当$2\mid s$，即$a\equiv 1(\bmod 4)$，第二个条件有解当且仅当$d=gcd(k,2)\mid r$同上知等价于$a^{d'}\equiv 1(\bmod m)$，根据两个方程，知解的形式为$z\equiv0,1(\bmod 2),y=y_{0}+id'(\bmod 2^{e-2}),0\leq y_{0}<2^{e-2}$  
#### 单位根  
##### 定义  
对于模数 𝑚，元素 $1$ 的 𝑘次方根称为模 𝑚的 𝑘次单位根．特别地，如果 𝑥是模 𝑚的一个 𝑘 次单位根，且它不是模 𝑚 的任何 𝑘′ <𝑘 次单位根，那么，也称 𝑥为 模 𝑚 的 𝑘 次本原单位根
原根$g$是模$m$的$\varphi(m)$次本原单位根  
##### 性质  
模数$m$，$\lambda(m)$为它的$Carmichael$函数  
$1.$所有与$m$互素的整数$a$都是模$m$的$\delta_{m}(a)$次本原单位根  
$2.$元素$a$是模$m$的$k$次单位根，且$k'$为$k$的任意倍数，那么$a$也是模$m$的$k'$次单位根  
$3.$元素$a$是模$m$的$k$次（本原）单位根，那么元素$a^{l}$是模$m$的$\frac{k}{gcd(k,l)}$次（本原）单位根  
$4.$当$k'$遍历$k$的因数，所有模$m$的$k'$次本原单位根恰好构成模$m$的$k$次单位根的一个划分。对于$gcd(l,k)=1,x|->x^{l}$给出$k$次单位根之间的双射，且保持上述划分不变  
$5.$模$m$的$k$次本原单位根存在，当且仅当$k\mid\lambda(m)$,，特别的，模$m$的$\lambda(m)$次本原单位根存在，称为模$m$的$\lambda-$原根  
$6.$元素$a$是模$m$的$k$次单位根，当且仅当$a^{k}\equiv 1(\bmod m)$，且对任意素因子$p\mid k,a^{\frac{k}{p}}\not\equiv1(\bmod m)$  
  
$Proof$  
只证明$5$  
由$Carmichael$函数性质知，模$m$的$\lambda(m)$次本原单位根总是存在，设为$a$，且$\delta_{m}(a)=\lambda(m)$，对于$k\mid \lambda(m)$，设$k'=\frac{\lambda(m)}{k}$，总有$\delta_{m}(a^{k'})=\frac{\lambda(m)}{gcd(\lambda(m),k')}=\frac{\lambda(m)}{k'}=k$，因此$a^{k'}$是$k$次本原单位根，又所有$x,gcd(a,m)=1,$的阶都是$\lambda(m)$的因子，故由性质$5$  
##### 定理  
设$x$是$a$模$m$的一个$k$次方根，当$r$遍历模$m$的全体$k$次单位根时，$xr$遍历$a$模$m$的全体$k$次方根  
##### 定理  
对于模数$m$，设模$m$的原根存在，且$a$是模$m$的$k$次本原单位根，那么$b$是$k$次单位根，当且仅当它可以表示为$a$的幂次  
#### 模意义下的开方  
##### 改良$Tonelli-Shanks$算法  
求解$x^{k}\equiv a(\bmod m),m$为素数幂  
特别的对于$m=2^{e}$的情形,还要保证$a\equiv 1(\bmod 4)$，将$\varphi(m)$换成$\delta_{m}(5)=2^{e-2}$  
设$d=gcd(k,\varphi(m))$，当$a$是模$m$的$k$次剩余时，$a$总是模$m$的$\frac{\varphi(m)}{d}$次单位根，对任意$gcd(l,\frac{\varphi(m)}{d})=1,x->x^{l}$为单位根之间的双射，取$$l=(\frac{k}{d})^{-1}(\bmod \frac{\varphi(m)}{d})$$
原方程两边同时取$l$次幂$$x^{d}\equiv x^{kl}\equiv a^{l}\equiv b(\bmod m)$$
左边是因为$ld^{-1}\equiv k^{-1}(\bmod \varphi(m))$，则$d\equiv kl(\bmod \varphi(m))$  
考虑$d=\prod_{p\in P}p^{e}$，从$b$开始以次开$p^{e}$即可  
即求解$x^{p^{e}}\equiv b(\bmod m)$  
设$\varphi(m)=p^{s}r,gcd(p,r)=1$，设$q\in N_{+},qr\equiv-1(\bmod p^{e})$，由于$b$是$rp^{s-e}$次单位根，那么$b^{qr}$是$p^{s-e}$次单位根，设$\zeta$是模$m$的$p^{s}$次本原单位根，那么$\zeta^{p^{e}}$是$p^{s-e}$次本原单位根，存在$h,b^{qr}\equiv\zeta^{hp^{e}}(\bmod m)$可知$$x\equiv b^{\frac{qr+1}{p^{e}}}\zeta^{-h}(\bmod m)$$
为计算上式，需要找到摸 $m$的一个$p$次非剩余$\eta$，则有$\eta^{rp^{s-1}}\not\equiv1(\bmod m),\eta^{rp^{s}}\equiv1(\bmod m)$，$\zeta=\eta^{r}(\bmod m),\xi=\eta^{rp^{s-1}}(\bmod m)$分别为$p^{s}$，$p$次本原单位根  
计算$h$，取$h<p^{s-e}$，考虑$p$进制$h=\sum_{j=0}^{s-e-1}h_{j}p^{j}$当前$j$为计算完时$$(b^{qr}\zeta^{-p^{e}(h_{0}+...+h_{j-1}p^{j-1})})^{p^{s-e-j-1}}\equiv\zeta^{h_{j}p^{}e-1}\equiv\xi^{h_{j}}(\bmod m)$$
可用$BSGS$计算  
##### 一般情形  
$m=p^{e},gcd(a,m)>1$  
若$a\equiv0(\bmod m),x=p^{\lceil\frac{e}{k}\rceil}l(\bmod p^{e}),l=0,1,...,p^{e-\lfloor\frac{e}{k}\rfloor-1}$  
若$a\not\equiv0(\bmod m),a=p^{s}a',gcd(a',p)=1,x=p^{z}x',gcd(x',p)=1$则$x^{k}=p^{kz}(x')^{k}\equiv p^{s}a'(\bmod p^e)$，该方程有解当且仅当$kz=s,(x')^{k}\equiv a'(\bmod p^{e-s})$,最终解为$$x\equiv p^{\frac{s}{k}}(x'+lp^{e-s})(\bmod p^{e}),l=0,1,...,p^{s-\frac{s}{k}}-1$$
## 多项式  

## 组合数学  






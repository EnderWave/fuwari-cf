---
title: 子浪的小题库
published: 2026-11-02
tags:
  - 算法
category: 题库
draft: true
---
## 题目描述

给定正整数 $N(N\le10^6)$ 和非负整数 $K(K\le10^9)$。棋盘由 $2$ 行 $N$ 列共 $2N$ 个 $1 \times 1$ 的单位正方形格子组成。小L需要使用若干块 $1 \times 2$ 的多米诺骨牌（可横向 $1 \times 2$ 或纵向 $2 \times 1$ 对齐网格线放置在棋盘内部）将整个 $2 \times N$ 的棋盘完全铺满。

一个铺设方案被称为合法的，当且仅当同时满足以下三条规则：

1. **禁止完全重合**：任意两块多米诺骨牌的相交面积至多为 $1$（即不允许两块骨牌完全重叠在同一个 $1 \times 2$ 或 $2 \times 1$ 的网格位置上）。
2. **覆盖层数上限**：棋盘上的任意一个 $1 \times 1$ 单位正方形格子，都必须至少被 $1$ 块、至多被 $2$ 块多米诺骨牌覆盖。
3. **总重叠面积上限**：所有骨牌的总重叠面积不超过 $K$。由规则 1 和规则 2 可知，总重叠面积恰好等于被 $2$ 块骨牌同时覆盖的 $1 \times 1$ 单位格子的总数量（若共使用了 $m$ 块骨牌，则总重叠面积为 $2m - 2N$）。

这里，所有多米诺骨牌互不区分，且不考虑骨牌叠放的先后或上下次序。也就是说，两种合法铺设方案被视为不同，当且仅当存在某个 $1 \times 2$ 或 $2 \times 1$ 的网格位置，在其中一种方案中放置了骨牌，而在另一种方案中未放置骨牌。

现在，小L从所有合法铺设方案中等概率随机选取一种方案。请你帮小L求出：所选方案消耗的多米诺骨牌数量的数学期望值对 $1000000009$（即 `1e9 + 9`）取模后的结果。

## 解法一

### 状压 dp

设骨牌个数为 $m$。发现重叠面积为 $i$ 时，有 $m=n+\dfrac{i}{2}$。因此有 $n\le m\le n+\lfloor\dfrac k 2\rfloor$。

骨牌覆盖是一个经典的状压问题。假设现在填满了前 $i$ 列，第 $i$ 列伸出去到第 $i+1$ 列的部分只有三种情况：上下两行都没有伸出去（情况 $A$），上下只有一行伸出去（情况 $B$），上下两行都伸出去了（情况 $C$）。

进一步，因为我们有骨牌数的限制，我们不妨在 dp 数组中存生成函数。

设 $[x^t]A_i(x)$ 表示前 $i$ 列填满了、骨牌个数为 $t$、第 $i+1$ 列为情况 $A$。类似设 $B_i(x),C_i(x)$。

考虑转移。设放一个竖着的骨牌为 $V$，在上方一行放骨牌为 $U$，在下方一行放骨牌为 $D$，什么都不放记为 $\varnothing$。则转移如下表（“或”指的是取决于 $B$ 的两种情况）：

|$i$ \ $i+1$ |$A$|$B$|$C$|
|:-:|:-:|:-:|:-:|
|$A$|$V$|$VU,VD$|$UD,VUD$|
|$B$|$V$|$D,VD$ 或 $U,VU$|$UD$|
|$C$|$\varnothing,V$|$U,D$|$UD$|

因此写出生成函数的递推：

- $A_{i+1}(x)=xA_i(x)+xB_i(x)+(1+x)C_i(x)$；

- $B_{i+1}(x)=2x^2A_i(x)+(x+x^2)B_i(x)+2xC_i(x)$；

- $C_{i+1}(x)=(x^2+x^3)A_i(x)+x^2B_i(x)+x^2C_i(x)$。

初值显然为 $A_0(x)=1,B_0(x)=C_0(x)=0$。最后答案用 $A_n(x)$ 的系数计算。

### 消元

我们要把上面的三元一阶递推消元成一元的三阶递推。这里有很多种方法，纯代入化简的也可以，基于特征多项式的也可以，选择你喜欢的即可。

在这里分享一种很帅的做法。

设位移算子 $E$ 表示 $E^k A_i(x)=A_{i+k}(x)$，$EB_i(x),EC_i(x)$ 同理。

上面的递推式可以写成线性方程组 $\left\{\begin{matrix}(x-E)A_i(x)+xB_i(x)+(1+x)C_i(x)=0 \\2x^2 A_i(x)+(x+x^2-E)B_i(x)+2xC_i(x)=0 \\(x^2+x^3)A_i(x)+x^2 B_i(x)+(x^2-E)C_i(x)=0\end{matrix}\right.$。

一个显然的解是 $A_i(x)=B_i(x)=C_i(x)=0$，但这显然不是我们想要的解。所以上述线性方程一定不是唯一解，也即系数矩阵的行列式是 $0$。

也就是 $\det \begin{pmatrix} x-E & x & 1+x\\ 2x^2 & x+x^2-E & 2x\\ x^2+x^3 & x^2 & x^2-E\end{pmatrix}=-E^3+2x(1+x)E^2+3x^3E-x^3(x^3+1)=0$。

两边同时作用在 $A_i(x)$ 上得到 $-A_{i+3}(x)+2x(1+x)A_{i+2}(x)+3x^3A_{i+1}(x)-x^3(x^3+1)A_i(x)=0$。

也即 $A_{i}(x)=2x(1+x)A_{i-1}(x)+3x^3A_{i-2}(x)-x^3(x^3+1)A_{i-3}(x)$。

初值为 $A_0(x)=1,A_1(x)=x,A_2(x)=2x^2+4x^3+x^4$。

### 线性递推

使用生成函数的第二维来刻画 $A_i(x)$ 的线性递推。设 $F(x,y)=\sum\limits_{i\ge 0} A_i(x)y^i$。

经典地展开有 $F(x,y)=1+xy+(2x^2+4x^3+x^4)y^2+\sum\limits_{i\ge 3}(2x(1+x)A_{i-1}(x)+3x^3A_{i-2}(x)-x^3(x^3+1)A_{i-3}(x))y^i$。

整理一下得 $F(x,y)=1+xy+(2x^2+4x^3+x^4)y^2+2x(1+x)y\sum\limits_{i\ge 3}A_{i-1}(x)y^{i-1}+3x^3y^2\sum\limits_{i\ge 3}A_{i-2}(x)y^{i-2}-x^3(x^3+1)y^3\sum\limits_{i\ge 3}A_{i-3}(x)y^{i-3}$。

再把 $F$ 的定义代入有 $F(x,y)=1+xy+(2x^2+4x^3+x^4)y^2+2x(1+x)y(F(x,y)-1-xy)+3x^3y^2(F(x,y)-1)-x^3(x^3+1)y^3F(x,y)$。

解得 $F(x,y)=\dfrac{(x^{4}-x^{3}) y^{2}-(2 x^{2}+x) y+1}{(x^{6}+x^{3}) y^{3}-3 x^{3} y^{2}-(2 x^{2}+2 x) y+1}$。

注意到填满前 $n$ 列至少需要 $n$ 个骨牌、至多需要 $2n$ 个骨牌，因此 $A_n(x)$ 的非零项次数均在 $[n,2n]$ 之间。为了将关于 $x$ 的多项式次数从 $2n$ 降为 $n$，我们不妨将 $A_n(x)$ 整体除以 $x^n$（即令 $y\gets \dfrac{y}{x}$，改为统计超出 $n$ 的额外骨牌个数），得到优化后的生成函数：

$F(x,y)=\dfrac{(x^{2}-x) y^{2}-(2 x+1) y+1}{(x^{3}+1) y^{3}-3 x y^{2}-(2 x+2) y+1}$。

我们需要对于所有 $0\le m\le \min(n,\lfloor\dfrac k 2\rfloor)$ 求 $[x^m y^n]F(x,y)$。

### 有理函数提取远处项系数

我们考虑二维 Bostan-Mori 算法。

具体地，设 $F(x,y)=\dfrac{P(x,y)}{Q(x,y)}$，那么有 $[x^m y^n]F(x,y)=[x^m y^n]\dfrac{P(x,y)Q(x,-y)}{Q(x,y)Q(x,-y)}$。

设 $P(x,y)Q(x,-y)=R_0(x,y^2)+yR_1(x,y^2),Q(x,y)Q(x,-y)=Q'(x,y^2)$，那么 $[x^m y^n]F(x,y)=[x^m y^n]\dfrac{R_0(x,y^2)+yR_1(x,y^2)}{Q'(x,y^2)}=[x^m y^{\lfloor\frac n 2\rfloor}]\dfrac{R_{n\bmod 2}(x,y)}{Q'(x,y)}$。

递归下去即可。

直接做是递归 $O(\log n)$ 层，每层把关于 $x$ 的多项式看作是 $y$ 的系数，需要做常数次多项式加法与乘法。由于 $m=O(k)$，总的时间复杂度是 $O(k\log k\log n)$。你还需要考虑 $10^9+9$ 不是 NTT 模数，需要上点手法，这也太累了。

### 维护点值序列

瓶颈在于每次要做多项式乘法。一个经典的技巧是，维护点值序列，这样多项式乘法是对位相乘，不做 NTT 的话也没有模数困扰。

思考一下是否真的可行。发现优化后 $[y^n]F(x,y)$ 是一个关于 $x$ 的至多 $n$ 次多项式，我们的确可以维护长度为 $n+1$ 的点值序列。

具体选什么点值呢？由于最后仍然需要系数，如果只是选取连续点值再拉格朗日插值或牛顿插值，还原系数非常麻烦。最好的方法是选取单位根，然后用 IDFT 还原系数。

注意，这里的 IDFT 并不是 INTT，我们可以手动推导出点值序列算答案的公式，并不需要蝴蝶变换之类的去计算，因此没有模数减一有较多因子 $2$ 这个要求。唯一的要求是这个单位根要能覆盖至少 $n+1$ 个点值。

对于 $10^9+9$，满足这个条件的数多了去了，std 使用的是 $M=1146789$ 次单位根。下面设 $\omega=\cos\dfrac{2\pi}{M}+i\sin\dfrac{2\pi}{M}$。

有人可能会怀疑，Bostan-Mori 过程中的中间变量，最高次数可能到 $3\times 2^{\lfloor\log_2 n\rfloor+1}=6n$，这不会导致还原系数出问题吗？

并不会。我们维护的是点值，这些点值肯定是正确的。或者换一种思路，我们做的 Bostan-Mori 其实求的是 $[y^n]F(\omega^t,y)$，你完全可以把它当成做传统的系数是数的 Bostan-Mori。

### 求答案

发现分母的常数项始终为 $1$，所以递归终点的只需要分子的常数项。设这些常数项为 $v_i=[y^n]F(\omega^i,y)$，其中 $i=0,1,\cdots,M-1$。

再设 $[y^n]F(x,y)=\sum\limits_{i=0}^{M-1}c_i x^i$。以及 $m=\min(n,\lfloor\dfrac k 2\rfloor)$。

总的方案数 $C=\sum\limits_{i=0}^{m} c_i$，额外骨牌数之和 $S=\sum\limits_{i=0}^{m} ic_i$，答案为 $n+\dfrac{S}{C}$。

然后手动代入 IDFT 的公式 $c_i=\dfrac{1}{M}\sum\limits_{j=0}^{M-1}v_j\omega^{-ij}$，有 $C=\sum\limits_{i=0}^{m} \dfrac{1}{M}\sum\limits_{j=0}^{M-1}v_j\omega^{-ij}=\dfrac{1}{M}\sum\limits_{j=0}^{M-1}v_j\sum\limits_{i=0}^{m}(\omega^{-j})^i$ 和 $S=\sum\limits_{i=0}^{m} \dfrac{i}{M}\sum\limits_{j=0}^{M-1}v_j\omega^{-ij}=\dfrac{1}{M}\sum\limits_{j=0}^{M-1}v_j\sum\limits_{i=0}^{m}i(\omega^{-j})^i$。

设 $p(j)=\sum\limits_{i=0}^{m}(\omega^{-j})^i,q(j)=\sum\limits_{i=0}^{m}i(\omega^{-j})^i$。下面计算这两个式子。

$p(j)$ 是等比数列求和，直接有 $p(j)=\left\{\begin{matrix}m+1, &j=0\\ \dfrac{\omega^{-j(m+1)}-1}{\omega^{-j}-1},&j\neq 0\end{matrix}\right.$。

$q(j)$ 也是高中常见的使用错位相减处理的数列。当 $j\neq 0$ 时，$\omega^{-j}q(j)=\sum\limits_{i=0}^m i(\omega^{-j})^{i+1}$，故 $(\omega^{-j}-1)q(j)=m(\omega^{-j})^{m+1}-\sum\limits_{i=1}^m(\omega^{-j})^i=m(\omega^{-j})^{m+1}+1-p(j)$。因此有 $q(j)=\left\{\begin{matrix}\dfrac{m(m+1)}{2}, &j=0\\ \dfrac{m\omega^{-j(m+1)}+1-p(j)}{\omega^{-j}-1},&j\neq 0\end{matrix}\right.$。

利用离线 $O(1)$ 逆元即可做到 $O(n)$ 计算（因为 $M=O(n)$）。

总的时间复杂度瓶颈在于做 $M$ 次 Bostan-Mori，是 $O(n\log n)$。

至于单位根，取 $10^9+9$ 的原根 $g=13$，然后模意义下认为 $\omega\equiv g^{\frac{10^9+8}{M}}\pmod {(10^9+9)}$ 即可。

```cpp
#include<bits/stdc++.h>
#define F(i,a,b) for(int i(a),i##i##end(b);i<=i##i##end;++i)
#define R(i,a,b) for(int i(a),i##i##end(b);i>=i##i##end;--i)
#define ll long long
#define File(a) freopen(#a".in","r",stdin);freopen(#a".out","w",stdout)
using namespace std;
const int M=1048576,G=13,MOD=998244353;
// const int M=1146789,G=13,MOD=1000000009;
ll qpow(ll b,int e){if(b==1) return 1;ll res=1;while(e){(e&1)&&(res=res*b%MOD);b=b*b%MOD;e>>=1;}return res;}
const int Omega=qpow(G,(MOD-1)/M);
struct Poly{
	int deg,c[15];
	Poly(const int&x=0){
		memset(c,0,sizeof(c));
		deg=x;
	}
	const Poly operator*(const Poly&x)const{
		Poly res(deg+x.deg);
		F(i,0,deg) F(j,0,x.deg) res.c[i+j]=(res.c[i+j]+c[i]*1ll*x.c[j])%MOD;
		return res;
	}
	Poly Neg()const{
		Poly res(deg);
		F(i,0,deg) res.c[i]=(i&1)?MOD-c[i]:c[i];
		return res;
	}
}; 
Poly P,Q;
ll Bostan_Mori(ll n){
	Poly qwq;
	while(n){
		qwq=Q.Neg();
		P=P*qwq;
		Q=Q*qwq;
		F(i,0,Q.deg>>1) Q.c[i]=Q.c[i*2];
		Q.deg>>=1;
		int j=0;
		if(n&1) for(int i=1;i<=P.deg;i+=2,++j) P.c[j]=P.c[i];
		else for(int i=0;i<=P.deg;i+=2,++j) P.c[j]=P.c[i];
		if(j==0) P.c[P.deg=0]=0;
		else P.deg=j-1;
		n>>=1;
	}
	return P.c[0]*qpow(Q.c[0],MOD-2)%MOD;
}
int n,m,v[M];
int main(){
	ios::sync_with_stdio(0);cin.tie(0),cout.tie(0);
	cin>>n>>m;m=min(n,m/2);
	ll pw=1;
	F(i,0,M-1){
		ll pw2=pw*pw%MOD,pw3=pw2*pw%MOD;
		P.deg=2;
		P.c[0]=1;P.c[1]=MOD-(2*pw+1)%MOD;P.c[2]=(pw2-pw+MOD)%MOD;
		Q.deg=3;
		Q.c[0]=1;Q.c[1]=MOD-2*(pw+1)%MOD;Q.c[2]=MOD-3*pw%MOD;Q.c[3]=(pw3+1)%MOD;
		v[i]=Bostan_Mori(n);
		pw=pw*Omega%MOD;
	}
	ll C=0,S=0;
	F(i,0,M-1){
		ll p,q;
		if(i==0) p=m+1,q=(m*(m+1ll)/2)%MOD;
		else{
			ll mpw=qpow(Omega,MOD-1-1ll*i*(m+1)%(MOD-1)),inv=qpow(qpow(Omega,MOD-1-i)-1,MOD-2);
			p=(mpw-1)*inv%MOD;
			q=(mpw*m%MOD+1-p)*inv%MOD;
		}
		C=(C+v[i]*p)%MOD;
		S=(S+v[i]*q)%MOD;
	}
	cout<<(n+S*qpow(C,MOD-2)%MOD+MOD)%MOD;
	return 0;
}
```

## 解法二

### Part1-状压dp

设我们某个合法方案使用骨牌总数为 $m$，重叠面积为 $c$，那么会有 $2m = 2N + c$，那么：

$$
m = N + \frac{c}{2}
$$

注意到 $m \ge N$，考虑 $b = m - N \in \left[0, \min\left(N, \left\lfloor\frac{K}{2}\right\rfloor\right)\right]$，$b$ 为整数，那么 $b$ 的取值不会超过 $N$。

设竖放骨牌为 $V$，上面横放为 $U$，下面横放为 $D$：

- 状态 $A$：上下均无伸出
- 状态 $B$：上下共计伸出一个
- 状态 $C$：上下均伸出

我们计算额外贡献：

| 状态 | $A$ | $B$ | $C$ |
| :---: | :---: | :---: | :---: |
| $A$ | $V(x^0)$ | $(VU + VD)(x^1)$ | $UD(x^1) + VUD(x^2)$ |
| $B$ | $V(x^0)$ | $D(x^0) + VD(x^1) \text{ or } U(x^0) + VU(x^1)$ | $UD(x^1)$ |
| $C$ | $V(x^{-1}) + 1$ | $U(x^0) + D(x^0)$ | $UD(x^1)$ |

由此可得状态转移方程：

$$
\begin{aligned}
A_{i+1}(x) &= A_{i}(x) + B_{i}(x) + (x^{-1} + 1)C_{i}(x) \\
B_{i+1}(x) &= 2x A_{i}(x) + (x + 1)B_{i}(x) + 2C_{i}(x) \\
C_{i+1}(x) &= (x + x^2)A_{i}(x) + x B_{i}(x) + x C_{i}(x)
\end{aligned}
$$

我们设位移算子 $E$ 满足 $EA_{i}(x) = A_{i+1}(x)$，那么：

$$
\begin{aligned}
(1 - E)A_{i}(x) + B_{i}(x) + (x^{-1} + 1)C_{i}(x) &= 0 \\
2x A_{i}(x) + (x + 1 - E)B_{i}(x) + 2C_{i}(x) &= 0 \\
(x + x^2)A_{i}(x) + x B_{i}(x) + (x - E)C_{i}(x) &= 0
\end{aligned}
$$

显然我们有非零解：

$$
\det\begin{pmatrix}
1 - E & 1 & x^{-1} + 1 \\
2x & x + 1 - E & 2 \\
x + x^2 & x & x - E
\end{pmatrix}
= -E^3 + 2(x + 1)E^2 + 3xE - (x^3 + 1)
$$

那么我们会得到 $A(x)$ 的线性递推公式：

$$
A_{i}(x) = 2(x + 1)A_{i-1}(x) + 3x A_{i-2}(x) - (1 + x^3)A_{i-3}(x), \quad i \ge 3
$$

初值为 $A_{0}(x) = 1,\ A_{1}(x) = 1,\ A_{2}(x) = 2 + 4x + x^2$。

### Part2-生成函数

定义关于 $A(x)$ 的生成函数 $F(x, y) = \sum_{i \ge 0} A_{i}(x)y^i$：

$$
\begin{aligned}
F(x, y) &= \sum_{i \ge 0} A_{i}(x)y^i \\
&= \sum_{i=0}^{2} A_{i}(x)y^i + \sum_{i \ge 3} A_{i}(x)y^i \\
&= \sum_{i=0}^{2} A_{i}(x)y^i + \sum_{i \ge 3} \big(2(x + 1)A_{i-1}(x) + 3x A_{i-2}(x) - (1 + x^3)A_{i-3}(x)\big)y^i \\
&= \sum_{i=0}^{2} A_{i}(x)y^i + 2(x + 1)y \sum_{i \ge 2} A_{i}(x)y^i + 3xy^2 \sum_{i \ge 1} A_{i}(x)y^i - (1 + x^3)y^3 \sum_{i \ge 0} A_{i}(x)y^i \\
&= \sum_{i=0}^{2} A_{i}(x)y^i + 2(x + 1)y F(x, y) + 3xy^2 F(x, y) - (1 + x^3)y^3 F(x, y) - 2(x + 1)y\big(A_0(x) + A_{1}(x)\big) - 3xy^2 A_0(x) \\
&= \big(2(x + 1)y + 3xy^2 - (1 + x^3)y^3\big)F(x, y) + 1 + y + (2 + 4x + x^2)y^2 - 2(x + 1)(1 + y)y - 3xy^2 \\
&= \big(2(x + 1)y + 3xy^2 - (1 + x^3)y^3\big)F(x, y) + 1 - (1 + 2x)y + (x^2 - x)y^2
\end{aligned}
$$

解得：

$$
F(x, y) = \frac{1 - (1 + 2x)y + (x^2 - x)y^2}{1 - 2(x + 1)y - 3xy^2 + (x^3 + 1)y^3}
$$

给定 $N, K$，我们要求 $A_{N}(x) = [y^N]F(x, y) = \sum_{i=0}^{N} f_i x^i$。

设：

$$
S = \sum_{i=0}^{\min(N, \lfloor\frac{K}{2}\rfloor)} f_i, \quad W = \sum_{i=0}^{\min(N, \lfloor\frac{K}{2}\rfloor)} i f_i
$$

### Part3-拆系数

现在我们来思考怎么处理这个生成函数。注意到其实分子对我们处理来说没什么压力，我们直接处理分母：

$$
G(x, y) = \frac{1}{1 - 2(x + 1)y - 3xy^2 + (x^3 + 1)y^3}
$$

设：

$$
P_N(x) = [y^N]G(x, y)
$$

那么，我们有：

$$
A_{N}(x) = P_N(x) - (1 + 2x)P_{N-1}(x) + (x^2 - x)P_{N-2}(x)
$$

发现 $G(x, y)$ 非常难直接展开，因为有很多高次项，但是我们注意到含 $x$ 的项只有 $x + 1,\ x,\ x^3 + 1$。我们有 $x^3 + 1 = (x + 1)^3 - 3x(x + 1)$，那么：

$$
\frac{1}{G(x, y)} = 1 - 2(x + 1)y - 3xy^2 + (x + 1)^3 y^3 - 3x(x + 1)y^3
$$

令 $z = (x + 1)y$，那么有：

$$
G(x, y, z) = \frac{1}{1 - 2z + z^3 - 3xy^2(z + 1)}
$$

我们惊奇地发现这是关于 $3xy^2$ 这个整体的类似一次函数，那么我们可以很容易地展开：

$$
G(x, y, z) = \frac{1}{1 - 2z + z^3 - 3xy^2(z + 1)} = \sum_{i \ge 0} (3xy^2)^{i} \frac{(z + 1)^i}{(1 - 2z + z^3)^{i+1}}
$$

现在其实好看很多，但是也不太好处理，我们设：

$$
\frac{(z + 1)^i}{(1 - 2z + z^3)^{i+1}} = \sum_{j \ge 0} h(i, j)z^j
$$

假设我们计算出了 $h(i, j)$，那么有：

$$
\begin{aligned}
P_N(x) &= [y^N]G(x, y) \\
&= [y^N] \sum_{i \ge 0} (3xy^2)^i \sum_{j \ge 0} h(i, j)\big(y(x + 1)\big)^j \\
&= \sum_{i \ge 0} (3x)^i [y^{N-2i}] \sum_{j \ge 0} h(i, j)y^j(x + 1)^j \\
&= \sum_{i \ge 0} (3x)^i h(i, N - 2i)(x + 1)^{N-2i}
\end{aligned}
$$

那么：

$$
\begin{aligned}
[x^k]P_N(x) &= [x^k] \sum_{i \ge 0} (3x)^i h(i, N - 2i)(x + 1)^{N-2i} \\
&= \sum_{i \ge 0} 3^i h(i, N - 2i) [x^{k-i}](x + 1)^{N-2i} \\
&= \sum_{i=0}^{\lfloor\frac{N}{2}\rfloor} 3^i h(i, N - 2i) \binom{N - 2i}{k - i}
\end{aligned}
$$

进而我们有：

$$
\begin{aligned}
[x^k]A_N(x) &= [x^k]P_N(x) - [x^k]P_{N-1}(x) - 2[x^{k-1}]P_{N-1}(x) + [x^{k-2}]P_{N-2}(x) - [x^{k-1}]P_{N-2}(x) \\
&= \sum_{i=0}^{\lfloor\frac{N}{2}\rfloor} \Bigg[ 3^i h(i, N - 2i)\binom{N - 2i}{k - i} - 3^i h(i, N - 1 - 2i)\binom{N - 1 - 2i}{k - i} - 2 \times 3^i h(i, N - 1 - 2i)\binom{N - 1 - 2i}{k - 1 - i} \\
&\qquad\quad + 3^i h(i, N - 2 - 2i)\binom{N - 2 - 2i}{k - 2 - i} - 3^i h(i, N - 2 - 2i)\binom{N - 2 - 2i}{k - 1 - i} \Bigg] \\
&= \sum_{i=0}^{\lfloor\frac{N}{2}\rfloor} 3^i \Bigg[ \big(h(i, N - 2i) - h(i, N - 1 - 2i)\big)\binom{N - 2i}{k - i} + \big(h(i, N - 2 - 2i) - h(i, N - 1 - 2i)\big)\binom{N - 1 - 2i}{k - 1 - i} \\
&\qquad\qquad - 2h(i, N - 2 - 2i)\binom{N - 2 - 2i}{k - 1 - i} \Bigg] \\
&= \sum_{i=0}^{\lfloor\frac{N}{2}\rfloor} 3^i \Bigg[ c_{i,1}\binom{N - 2i}{k - i} + c_{i,2}\binom{N - 1 - 2i}{k - 1 - i} - c_{i,3}\binom{N - 2 - 2i}{k - 1 - i} \Bigg]
\end{aligned}
$$

我们设 $M = \min\left(N, \left\lfloor\frac{K}{2}\right\rfloor\right)$：

$$
\begin{aligned}
S &= \sum_{k=0}^{M} \sum_{i=0}^{\lfloor\frac{N}{2}\rfloor} 3^i \Bigg[ c_{i,1}\binom{N - 2i}{k - i} + c_{i,2}\binom{N - 1 - 2i}{k - 1 - i} - c_{i,3}\binom{N - 2 - 2i}{k - 1 - i} \Bigg] \\
&= \sum_{i=0}^{\lfloor\frac{N}{2}\rfloor} 3^i \Bigg[ c_{i,1}\left(\sum_{k=0}^{M}\binom{N - 2i}{k - i}\right) + c_{i,2}\left(\sum_{k=0}^{M}\binom{N - 1 - 2i}{k - 1 - i}\right) - c_{i,3}\left(\sum_{k=0}^{M}\binom{N - 2 - 2i}{k - 1 - i}\right) \Bigg] \\
&= \sum_{i=0}^{\lfloor\frac{N}{2}\rfloor} 3^i \Bigg[ c_{i,1} B(N - 2i, M - i) + c_{i,2} B(N - 1 - 2i, M - 1 - i) - c_{i,3} B(N - 2 - 2i, M - 1 - i) \Bigg]
\end{aligned}
$$

$$
\begin{aligned}
W &= \sum_{k=0}^{M} \sum_{i=0}^{\lfloor\frac{N}{2}\rfloor} 3^i \Bigg[ c_{i,1} k\binom{N - 2i}{k - i} + c_{i,2} k\binom{N - 1 - 2i}{k - 1 - i} - c_{i,3} k\binom{N - 2 - 2i}{k - 1 - i} \Bigg] \\
&= \sum_{i=0}^{\lfloor\frac{N}{2}\rfloor} 3^i \Bigg[ c_{i,1}\left(\sum_{k=0}^{M} k\binom{N - 2i}{k - i}\right) + c_{i,2}\left(\sum_{k=0}^{M} k\binom{N - 1 - 2i}{k - 1 - i}\right) - c_{i,3}\left(\sum_{k=0}^{M} k\binom{N - 2 - 2i}{k - 1 - i}\right) \Bigg] \\
&= \sum_{i=0}^{\lfloor\frac{N}{2}\rfloor} 3^i \Bigg[ c_{i,1} B(N - 2i, M - i, i) + c_{i,2} B(N - 1 - 2i, M - 1 - i, i + 1) - c_{i,3} B(N - 2 - 2i, M - 1 - i, i + 1) \Bigg]
\end{aligned}
$$

### Part4-组合数前缀和递推

其中 $B(N, M) = \sum_{i=0}^{M} \binom{N}{i},\ B(N, M, K) = \sum_{i=0}^{M} (i + K)\binom{N}{i}$，所以我们要预处理 $O(N)$ 个二项式系数的前缀和。

观察式子发现，每当 $i$ 自增 $1$，那么会有 $N \gets N - 2,\ M \gets M - 1$，也就是说我们找到这个跨步的递推就可以。那么：

$$
B(N, M + 1) = B(N, M) + \binom{N}{M + 1}
$$

$$
B(N + 1, M) = \sum_{i=0}^{M} \left(\binom{N}{i} + \binom{N}{i - 1}\right) = 2B(N, M) - \binom{N}{M}
$$

后面递推发现逆序计算容易一点，我们考虑反过来计算：

$$
\begin{aligned}
B(N + 2, M + 1) &= B(N + 2, M) + \binom{N + 2}{M + 1} \\
&= 2B(N + 1, M) - \binom{N + 1}{M} + \binom{N + 2}{M + 1} \\
&= 2\left(2B(N, M) - \binom{N}{M}\right) - \binom{N + 1}{M} + \binom{N + 2}{M + 1} \\
&= 4B(N, M) - 2\binom{N}{M} - \binom{N + 1}{M} + \binom{N + 2}{M + 1}
\end{aligned}
$$

所以我们可以在计算的时候顺便 $O(N)$ 计算二项式前缀和。期望的计算直接借用就可以了：

$$
B(N, M, K) = \sum_{i=0}^{M} (K + i)\binom{N}{i} = K B(N, M) + N B(N - 1, M - 1)
$$

### Part5-线性递推

那么现在就只剩下如何计算 $h(i, j)$ 了，我们回忆一下：

$$
\frac{(z + 1)^i}{(1 - 2z + z^3)^{i+1}} = \sum_{j \ge 0} h(i, j)z^j = H_i(z)
$$

我们希望用 $O(N)$ 的时间计算我们需要的 $O(N)$ 项：

$$
\begin{aligned}
c_{i,1} &= h(i, N - 2i) - h(i, N - 1 - 2i) \\
c_{i,2} &= h(i, N - 2 - 2i) - h(i, N - 1 - 2i) \\
c_{i,3} &= 2h(i, N - 2 - 2i)
\end{aligned}
$$

思考一下，我们需要获得初值 $h(0, N),\ h(0, N - 1),\ h(0, N - 2)$，然后要有 $h(i, j) \to h(i + 1, j - 2)$ 的递推；或者，我们有初值 $h\left(\left\lfloor\frac{N}{2}\right\rfloor, 0\right)$（及奇数时的 $h\left(\left\lfloor\frac{N}{2}\right\rfloor, 1\right)$），然后有 $h(i, j) \to h(i - 1, j + 2)$ 的递推。发现倒着推更方便。

注意到 $H_i(z) = \frac{1 + z}{1 - 2z + z^3}H_{i-1}(z)$，即：

$$
(1 - 2z + z^3)H_i(z) = (1 + z)H_{i-1}(z)
$$

比较 $[z^j]$ 的系数：

$$
h(i - 1, j) + h(i - 1, j - 1) = h(i, j) - 2h(i, j - 1) + h(i, j - 3)
$$

直接对 $H_{i-1}(z) = (1 + z)^{i-1}(1 - 2z + z^3)^{-i}$ 关于 $z$ 求导并乘以 $(1 + z)$，得：

$$
H_{i-1}'(z) = \frac{(i - 1)(1 + z)^{i-2}(1 - 2z + z^3)^{i} + (1 + z)^{i-1}i(2 - 3z^2)(1 - 2z + z^3)^{i-1}}{(1 - 2z + z^3)^{2i}} = \frac{(i - 1)(1 + z)^{i-2}}{(1 - 2z + z^3)^i} + \frac{i(2 - 3z^2)(1 + z)^{i-1}}{(1 - 2z + z^3)^{i+1}}
$$

那么：

$$
(1 + z)H_{i-1}'(z) = (i - 1)H_{i-1}(z) + i(2 - 3z^2)H_i(z)
$$

比较 $[z^{j-1}]$ 的系数：

$$
j h(i - 1, j) + (j - 1)h(i - 1, j - 1) = (i - 1)h(i - 1, j - 1) + 2i h(i, j - 1) - 3i h(i, j - 3)
$$

我们会得到：

$$
j\,h(i - 1, j) + (j - i)h(i - 1, j - 1) = 2i\,h(i, j - 1) - 3i\,h(i, j - 3)
$$

观察两个式子：

$$
\begin{aligned}
h(i - 1, j) + h(i - 1, j - 1) &= h(i, j) - 2h(i, j - 1) + h(i, j - 3) \\
j\,h(i - 1, j) + (j - i)h(i - 1, j - 1) &= 2i\,h(i, j - 1) - 3i\,h(i, j - 3)
\end{aligned}
$$

发现我们可以把它看做关于 $h(i - 1, j),\ h(i - 1, j - 1)$ 的二元一次方程。

假设我们已经算出 $h(i, m),\ h(i, m + 1),\ h(i, m + 2),\ h(i, m + 3)$，我们期望计算出 $h(i - 1, m + 2),\ h(i - 1, m + 3),\ h(i - 1, m + 4),\ h(i - 1, m + 5)$：

- 令 $j = m + 3$，那么我们可以用 $h(i, m),\ h(i, m + 2),\ h(i, m + 3)$ 通过解方程计算出 $h(i - 1, m + 2),\ h(i - 1, m + 3)$；
- 令 $j = m + 4$，那么我们可以用 $h(i - 1, m + 3),\ h(i, m + 3),\ h(i, m + 1)$ 通过第二个式子计算出 $h(i - 1, m + 4)$；
- 发现我们求 $h(i - 1, m + 5)$ 需要用到 $h(i, m + 4)$，这只要把刚刚用的数代入第一个式子就可以；
- 然后我们就可以用 $h(i - 1, m + 4),\ h(i, m + 4),\ h(i, m + 2)$ 通过第二个式子计算出 $h(i - 1, m + 5)$。

这样我们就完成了 $O(1)$ 每层 $h(i, j) \to h(i - 1, j + 2)$ 的递推。

### Part6-写代码

我们需要理清楚我们要求什么。我们要在逆序枚举的同时维护组合数前缀和，以及四个 $h(i, j)$，就是这两个式子：

$$
S = \sum_{i=0}^{\lfloor\frac{N}{2}\rfloor} 3^i \Bigg[ c_{i,1} B(N - 2i, M - i) + c_{i,2} B(N - 1 - 2i, M - 1 - i) - c_{i,3} B(N - 2 - 2i, M - 1 - i) \Bigg]
$$

$$
W = \sum_{i=0}^{\lfloor\frac{N}{2}\rfloor} 3^i \Bigg[ c_{i,1} B(N - 2i, M - i, i) + c_{i,2} B(N - 1 - 2i, M - 1 - i, i + 1) - c_{i,3} B(N - 2 - 2i, M - 1 - i, i + 1) \Bigg]
$$

首先 $M = \min\left(\left\lfloor\frac{K}{2}\right\rfloor, N\right)$，$i_{m} = \left\lfloor\frac{N}{2}\right\rfloor$。

初始位置对应的三项分别为 $B(1, M - i_m),\ B(0, M - 1 - i_m),\ B(-1, M - 1 - i_m)$（当 $N$ 为奇数）或者 $B(0, M - i_m),\ B(-1, M - 1 - i_m),\ B(-2, M - 1 - i_m)$（当 $N$ 为偶数）。如果指标不合法显然为零，这个只需要每个位置维护一个二元组和一个值就可以了。

然后是期望的系数：

$$
B(N, M, K) = \sum_{i=0}^{M} (K + i)\binom{N}{i} = K B(N, M) + N B(N - 1, M - 1)
$$

对应初始项为 $B(1, M - i_m, i_m),\ B(0, M - 1 - i_m, i_m + 1),\ B(-1, M - 1 - i_m, i_m + 1)$ 或者 $B(0, M - i_m, i_m),\ B(-1, M - 1 - i_m, i_m + 1),\ B(-2, M - 1 - i_m, i_m + 1)$。

我们发现 $K$ 相关无需维护，只是上面的 $B(N, M)$ 和 $i$ 的乘积，我们需要考虑 $B(N - 1, M - 1)$ 如何计算。我们之前有 $B(N, M) \to B(N + 2, M + 1)$ 的 $O(1)$ 转移，那么其实就是 $B(N, M) \to B(N + 1, M)$ 上面的公式直接用即可。

好的，现在为止，我们解决了 $B$ 相关的数据怎么计算。接下来考虑 $c$ 怎么通过 $h$ 计算：

$$
\begin{aligned}
c_{i,1} &= h(i, N - 2i) - h(i, N - 1 - 2i) \\
c_{i,2} &= h(i, N - 2 - 2i) - h(i, N - 1 - 2i) \\
c_{i,3} &= 2h(i, N - 2 - 2i)
\end{aligned}
$$

由：

$$
\begin{aligned}
h(i - 1, j) + h(i - 1, j - 1) &= h(i, j) - 2h(i, j - 1) + h(i, j - 3) \\
j\,h(i - 1, j) + (j - i)h(i - 1, j - 1) &= 2i\,h(i, j - 1) - 3i\,h(i, j - 3)
\end{aligned}
$$

最开始我们需要 $h(i_m, 0),\ h(i_m, -1),\ h(i_m, -2)$ 或者 $h(i_m, 1),\ h(i_m, 0),\ h(i_m, -1)$（其中 $h(i, 0) = 1,\ h(i, 1) = 3i + 2$，负指标为 $0$）。之前讨论过我们只要维护四个值就可以，那么我们开始时维护 $h(i_m, 0),\ h(i_m, -1),\ h(i_m, -2),\ h(i_m, -3)$ 或者 $h(i_m, 1),\ h(i_m, 0),\ h(i_m, -1),\ h(i_m, -2)$。

我们重新推导一遍，假设我们有 $h(i, m),\ h(i, m - 1),\ h(i, m - 2),\ h(i, m - 3)$：

- 令 $j = m$：
  $$
  \begin{aligned}
  S &= h(i - 1, m) + h(i - 1, m - 1) = h(i, m) - 2h(i, m - 1) + h(i, m - 3) \\
  T &= m h(i - 1, m) + (m - i)h(i - 1, m - 1) = 2i h(i, m - 1) - 3i h(i, m - 3)
  \end{aligned}
  $$
  那么，我们会有：
  $$
  h(i - 1, m) = \frac{T - (m - i)S}{i}, \quad h(i - 1, m - 1) = \frac{mS - T}{i}
  $$

- 令 $j = m + 1$：
  $$
  \begin{aligned}
  h(i - 1, m + 1) + h(i - 1, m) &= h(i, m + 1) - 2h(i, m) + h(i, m - 2) \\
  (m + 1)h(i - 1, m + 1) + (m + 1 - i)h(i - 1, m) &= 2i h(i, m) - 3i h(i, m - 2)
  \end{aligned}
  $$
  那么，我们会有：
  $$
  h(i - 1, m + 1) = \frac{2i h(i, m) - 3i h(i, m - 2) - (m + 1 - i)h(i - 1, m)}{m + 1}
  $$
  $$
  h(i, m + 1) = h(i - 1, m + 1) + h(i - 1, m) + 2h(i, m) - h(i, m - 2)
  $$

- 令 $j = m + 2$：
  $$
  (m + 2)h(i - 1, m + 2) + (m + 2 - i)h(i - 1, m + 1) = 2i h(i, m + 1) - 3i h(i, m - 1)
  $$
  $$
  h(i - 1, m + 2) = \frac{2i h(i, m + 1) - 3i h(i, m - 1) - (m + 2 - i)h(i - 1, m + 1)}{m + 2}
  $$

这样我们就完成了每层 $O(1)$ 的递推，这道题就做完了。
时间和空间复杂度均为$O(n)$。
```cpp
#include<bits/stdc++.h>
using namespace std;
const int N =1e7+10;
// const int mod =1e9+9;
const int mod =998244353;
using ll =long long;

ll fac[N],ifac[N],inv[N],pw3[N];
int n;
ll K;

ll qpow(ll a,ll b){
    ll res=1;
    while (b){
        if (b&1)res=res*a%mod;
        a=a*a%mod;
        b>>=1;
    }
    return res;
}

void init(int m){
    fac[0]=ifac[0]=pw3[0]=1;
    for (int i=1;i<=m;i++){
        fac[i]=fac[i-1]*i%mod;
        pw3[i]=pw3[i-1]*3%mod;
    }
    ifac[m]=qpow(fac[m],mod-2);
    for (int i=m-1;i>=1;i--)ifac[i]=ifac[i+1]*(i+1)%mod;
    for (int i=1;i<=m;i++)inv[i]=ifac[i]*fac[i-1]%mod;
}

ll C(int n,int m){
    if (n<0||m<0||m>n)return 0;
    return fac[n]*ifac[m]%mod*ifac[n-m]%mod;
}

struct Node{
    int n,m;
    ll v;
    Node(int n=0,int m=0):n(n),m(m){
        v=0;
        if (n>=0&&m>=0){
            for (int i=0;i<=min(n,m);i++)v=(v+C(n,i))%mod;
        }
    }
    void inc_n(){//B(N,M)->B(N+1,M)
        if (n+1<0)v=0;
        else if (n+1==0)v=(m>=0?1:0);
        else v=(2*v-C(n,m)+mod)%mod;
        n++;
    }
    void inc_m(){//B(N,M)->B(N,M+1)
        v=(v+C(n,m+1))%mod;
        m++;
    }
    void nxt(){//B(N,M)->B(N+2,M+1)
        if (n>=0){
            v=(4*v-2*C(n,m)-C(n+1,m)+C(n+2,m+1)+3ll*mod)%mod;
            n+=2;m+=1;
        }
        else{
            inc_n();inc_n();inc_m();
        }
    }
    ll calc(ll k)const{//B(N,M,K)=K*B(N,M)+N*B(N-1,M-1)
        if (n<0||m<0)return 0;
        if (n==0)return k%mod*v%mod;
        ll pre=(v-C(n,m)+C(n-1,m-1)+mod)%mod*inv[2]%mod;
        return (k%mod*v+1ll*n*pre)%mod;
    }
};

ll get_h(int i,int j){
    if (j<0)return 0;
    if (j==0)return 1;
    if (j==1)return (3ll*i+2)%mod;
    return 0;
}

void solve(){
    cin>>n>>K;
    init(n+5);
    int M=min((ll)n,K/2);
    int im=n/2;
    int m=n-2*im;
    ll h0=get_h(im,m),h1=get_h(im,m-1),h2=get_h(im,m-2),h3=get_h(im,m-3);
    Node b1(m,M-im),b2(m-1,M-1-im),b3(m-2,M-1-im);
    ll S=0,W=0;
    for (int i=im;i>=0;i--){
        m=n-2*i;
        ll c1=(h0-h1+mod)%mod;
        ll c2=(h2-h1+mod)%mod;
        ll c3=2*h2%mod;
        ll s_cur=(c1*b1.v%mod+c2*b2.v%mod-c3*b3.v%mod+mod)%mod;
        ll w_cur=(c1*b1.calc(i)%mod+c2*b2.calc(i+1)%mod-c3*b3.calc(i+1)%mod+mod)%mod;
        S=(S+pw3[i]*s_cur)%mod;
        W=(W+pw3[i]*w_cur)%mod;
        if (i>0){
            ll Sh=(h0-2*h1%mod+h3+mod)%mod;
            ll Th=(2ll*i%mod*h1%mod-3ll*i%mod*h3%mod+mod)%mod;
            ll nh_m=(Th-(m-i+mod)%mod*Sh%mod+mod)%mod*inv[i]%mod;//h(i-1,m)
            ll nh_m1=(1ll*m*Sh%mod-Th+mod)%mod*inv[i]%mod;//h(i-1,m-1)
            ll nh_mp1=(2ll*i%mod*h0%mod-3ll*i%mod*h2%mod-(m+1-i+mod)%mod*nh_m%mod+2ll*mod)%mod*inv[m+1]%mod;//h(i-1,m+1)
            ll hi_mp1=(nh_mp1+nh_m+2*h0-h2+mod)%mod;//h(i,m+1)
            ll nh_mp2=(2ll*i%mod*hi_mp1%mod-3ll*i%mod*h1%mod-(m+2-i+mod)%mod*nh_mp1%mod+2ll*mod)%mod*inv[m+2]%mod;//h(i-1,m+2)
            h0=nh_mp2;h1=nh_mp1;h2=nh_m;h3=nh_m1;
            b1.nxt();b2.nxt();b3.nxt();
        }
    }
    ll ans=(n+W*qpow(S,mod-2))%mod;
    cout<<ans<<'\n';
}

int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t=1;
    // cin>>t;
    while (t--)solve();
    return 0;
}
```
## 题目描述

Jack 来到了赌场，面前有一台拥有 $n$ 个档位（编号 $1 \sim n$）的神秘老虎机。赌场老板在游戏开始前，秘密选定了一个固定档位 $X$（$1 \le X \le n$）。
游戏开始时，Jack 手里共有 **$n$ 枚筹码**，且最多可以拉下 $k$ 次拉杆（保证 $2^k \ge n$）。
每一轮操作中，Jack 可以选择一个测试档位 $m$（$1 \le m \le n$），并押上 $x$ 枚筹码（$x$ 必须是满足 $0 \le x \le B$ 的**整数**，其中 $B$ 为当前手中筹码数），然后拉下拉杆：
1. 若 $X \ge m$（中奖，交互器返回 `WIN`）：老虎机额外奖励 $x$ 枚筹码，Jack 手中的筹码变为 $B + x$。
2. 若 $X \lt m$（未中奖，交互器返回 `LOSE`）：老虎机没收下注的筹码，Jack 手中的筹码变为 $B - x$。
注意：**即使下注 $x = 0$，老虎机也会正常返回 `WIN` 或 `LOSE`。**
在不超过 $k$ 次拉杆后，Jack 必须向老板宣布秘密档位 $X$ 的值，并且此时手中必须拥有**至少 $2^k$ 枚筹码**才能带走大奖。
赌场老板非常狡猾（**交互器是自适应的**）：他不会提前固定 $X$，而是在每轮根据你的操作动态调整 $X$ 的范围，试图让你最终筹码少于 $2^k$，或者让你在最后无法唯一确定 $X$（如果在你提交答案时，仍有两个或以上符合所有历史记录的 $X$，老板会直接判定你猜错）。
请你编写程序替 Jack 完成这场博弈。
**【交互格式】**
本题有多组测试数据。第一行输入一个整数 $T$（$1 \le T \le 100$）表示数据组数。
对于每组测试数据，首先从标准输入读取一行两个整数 $n, k$（$1 \le n \le 10^{18}, 1 \le k \le 60$，保证 $2^k \ge n$）。
接下来你可以进行不超过 $k$ 轮询问：
- 输出 `? m x`（满足 $1 \le m \le n$ 且 $0 \le x \le B$），表示测试档位 $m$ 并下注 $x$ 枚筹码。
- 随后从标准输入读取一个字符串：若为 `WIN` 表示 $X \ge m$；若为 `LOSE` 表示 $X \lt m$；若为 `INVALID` 表示你的输入不合法，此时你的程序应立即退出。
当你完成操作（不超过 $k$ 轮）且当前手中筹码 $B \ge 2^k$、同时已**唯一确定** $X$ 时：
- 输出 `! ans`（$1 \le ans \le n$）表示你确定的秘密档位。
- 随后读取一个字符串：若为 `OK` 表示通过本组测试数据，请继续处理下一组数据；若为 `WA` 表示未达到 $2^k$ 筹码或 $X$ 尚未唯一确定，程序应立即退出。
_提示：每次输出后请使用 `std::endl` 或 `fflush(stdout)` 刷新输出缓冲区。_

这是一道交互题。

给定 n,k（1 <= n <= 10^18，1 <= k <= 60，2^k >= n），初始分数为 n，最多有 k 次操作机会。交互库会维护一个秘密整数 t（1 <= t <= n），它是自适应的：不会提前固定 t，只会保留所有符合历史记录的候选 t。

每次操作输入两个整数 m,x，其中 1 <= m <= n，0 <= x <= B（B 为当前分数）。
若 t >= m，返回 WIN，分数变为 B + x；
若 t < m，返回 LOSE，分数变为 B - x。
即使 x = 0，也会正常返回 WIN 或 LOSE。

在不超过 k 次操作内，你需要唯一确定 t，并且使当前分数至少为 2^k，然后提交答案。提交时若仍有两个或以上符合历史记录的 t，判定错误。













这道题经过拆解后，数学结构极其精妙：它表面上是一道位运算构造题，剥开第一层后变成**完全背包问题**，再剥开第二层会发现其中暗含了一个令人拍案叫绝的“奇偶锁死效应”，最终坍缩为仅需 $O(1)$ 时间、模 $20$ 分类讨论的纯数论好题。

---

**一、 严密的数学推导（可直接用作官方题解）**

**第一步：按二进制位拆解 $\text{Sum} - \text{XorSum}$**
设我们在序列中使用了 $c_2, c_5, c_8, c_{10}$ 张面额为 $2, 5, 8, 10$ 的餐券。
观察这四个数在二进制下的位分布（对应位权 $1, 2, 4, 8$）：

* $2 = (0010)_2$：仅含位权 $2$
* $5 = (0101)_2$：含位权 $1$ 和 $4$
* $8 = (1000)_2$：仅含位权 $8$
* $10 = (1010)_2$：含位权 $2$ 和 $8$

对于任意一个二进制位（位权为 $w$），假设所有选出的餐券在该位上共有 $k$ 个 $1$：

* 它们对总和 $\text{Sum}$ 的贡献是 $k \cdot w$；
* 它们对异或和 $\text{XorSum}$ 的贡献是 $(k \bmod 2) \cdot w$；
* 因此，该位对 $\text{Sum} - \text{XorSum}$ 的净贡献为：

$$
(k - (k \bmod 2)) \cdot w = 2 \left\lfloor \frac{k}{2} \right\rfloor \cdot w
$$



也就是说，**某个二进制位上每凑齐一对 $1$（即 $2$ 个 $1$），就会对差值 $N$ 产生 $2w$ 的贡献；落单的那个 $1$ 对差值 $N$ 没有任何贡献！**

---

**第二步：发现隐藏陷阱——“$10$ 元券不能拆着用”**
分别统计四个二进制位上 $1$ 的个数：

* **位权 $1$ 和 $4$**：只有餐券 `5` 在这两个位上有 $1$（共有 $c_5$ 个）。因此每两张 `5` 配成一对，固定贡献 $2 \times (1 + 4) = 10$。落单的一张 `5` 贡献为 $0$，为了张数最少，显然 $c_5$ 必须取偶数。设选了 $p_5 = \frac{c_5}{2}$ 对 `5`，张数为 $2p_5$，贡献为 $10p_5$。
* **位权 $2$（由 `2` 和 `10` 提供）**：共有 $c_2 + c_{10}$ 个 $1$，每凑一对贡献 $2 \times 2 = 4$。
* **位权 $8$（由 `8` 和 `10` 提供）**：共有 $c_8 + c_{10}$ 个 $1$，每凑一对贡献 $2 \times 8 = 16$。

很多选手在这里会以为：一张 `2`、一张 `8`、一张 `10` 可以让位权 $2$ 凑一对（贡献 $4$）、位权 $8$ 凑一对（贡献 $16$），用 $3$ 张牌凑出 $20$。
**但是，两张 `10` 本身就能凑出 $20$，而且只需要 $2$ 张牌！**
如果我们选了奇数张 `10`（设 $c_{10} = 2p_{10} + 1$），为了不浪费多出来的那张 `10` 的两个二进制位，我们必须额外补一张 `2` 和一张 `8`，这总共花了 $1 + 1 + 1 = 3$ 张牌，贡献却是 $20$——**完全劣于直接用两张 `10`（花 $2$ 张牌贡献 $20$）！** 如果只补一张 `2` 不补 `8`，那花 $2$ 张牌只贡献 $4$，又等价于直接用两张 `2`。

**核心结论**：在最优解中，每种餐券都**必定成对出现**！問題瞬间等价于以下四种“成对套餐”（每选一个套餐固定消耗 **$2$ 张餐券**）的完全背包问题：

* **套餐 A（两张 `2`）**：消耗 $2$ 张券，提供价值 **$4$**
* **套餐 B（两张 `5`）**：消耗 $2$ 张券，提供价值 **$10$**
* **套餐 C（两张 `8`）**：消耗 $2$ 张券，提供价值 **$16$**
* **套餐 D（两张 `10`）**：消耗 $2$ 张券，提供价值 **$20$**

---

**第三步：$O(1)$ 贪心与模 $20$ 分类讨论**
现在问题转化为：用 $\{4, 10, 16, 20\}$ 凑出 $N$，求最少需要选多少个数字（最终答案即为该数字个数 $\times 2$）。

1. **奇偶性与模 $4$ 拆解**：
因为 $4, 16, 20$ 都是 $4$ 的倍数，只有 $10 \equiv 2 \pmod 4$：
* 若 $N$ 是奇数（$N \bmod 2 \neq 0$）：**必定无解**，输出 `-1`。
* 若 $N \equiv 2 \pmod 4$：必须至少用一个 $10$ 来对齐余数（而两个 $10$ 等于一个 $20$，不如直接用 $20$ 划算），因此**必定恰好使用 $1$ 个 $10$**！此时令 $N' = N - 10$（若 $N \lt 10$ 则无解），问题转化为用 $\{4, 16, 20\}$ 凑出 $N'$。
* 若 $N \equiv 0 \pmod 4$：不需要使用 $10$（因为两个 $10$ 可以被一个 $20$ 替代），直接令 $N' = N$，用 $\{4, 16, 20\}$ 凑出 $N'$。


2. **用 $\{4, 16, 20\}$ 凑 $4$ 的倍数 $N'$**：
将 $\{4, 16, 20\}$ 和 $N'$ 同时除以 $4$，等价于：**用 $\{1, 4, 5\}$ 凑出非负整数 $M = \frac{N'}{4}$**，求最少元素个数！
按 $M \bmod 5$ 的余数分类讨论（优先用 $5$，余数用 $4$ 和 $1$ 调整）：
* $M \bmod 5 = 0$：全用 $5$，个数为 $\frac{M}{5}$。
* $M \bmod 5 = 1$：把一个 $5$ 拆成 $1$（或者直接加一个 $1$），个数为 $\lfloor \frac{M}{5} \rfloor + 1$。
* $M \bmod 5 = 2$：若 $M = 2$，只能拆成 $1 + 1$（个数为 $2$）；若 $M \ge 7$，可以把一个 $5$ 加余数 $2$ 变成 $4 + 1 + 1$ 吗？不对，$7$ 拆成 $5 + 1 + 1$ 也是 $3$ 个，拆成 $4 + 1 + 1 + 1$ 是 $4$ 个；但如果 $M = 12$ 呢？**注意：$4 + 4 + 4 = 12$ 只需要 $3$ 个数，而 $5 + 5 + 1 + 1$ 需要 $4$ 个数！**
这里就是整道题最精妙的卡人点（可以卡掉直接写 `M / 5 + ...` 假贪心的选手）：
* 余数为 $1, 4$ 时：需要 $\lfloor \frac{M}{5} \rfloor + 1$ 个数（余 $1$ 加一个 $1$；余 $4$ 加一个 $4$）。
* 余数为 $2, 3$ 时：
* 如果多出来的余数靠把一个 $5$ 换成 $4$ 来消化（每将一个 $5$ 换成 $4$，总和减 $1$，即余数加 $4 \equiv -1 \pmod 5$）：
* 当 $M \bmod 5 = 3$ 且 $M \ge 8$ 时（如 $M = 8 = 4 + 4$），把一个 $5$ 和余数 $3$ 凑成 $4 + 4$，只需要 **$\lfloor \frac{M}{5} \rfloor + 1$** 个数！（唯独 $M = 3 = 1+1+1$ 需要 $3$ 个数）。
* 当 $M \bmod 5 = 2$ 时，即使把两个 $5$ 换成三个 $4$（$M \ge 12$，如 $12 = 4+4+4$），个数也是 $\lfloor \frac{M}{5} \rfloor - 2 + 3 = \lfloor \frac{M}{5} \rfloor + 1$！唯独 $M = 2$（$1+1$，需 $2$ 个）和 $M = 7$（$5+1+1$ 或 $4+1+1+1$，需 $3$ 个）无法凑出三个 $4$，需要 **$\lfloor \frac{M}{5} \rfloor + 2$** 个数！








整理得到用 $\{1, 4, 5\}$ 凑 $M$ 的极简闭式解 $f(M)$：

$$
f(M) = \begin{cases} \frac{M}{5} & M \equiv 0 \pmod 5 \\ 2 & M = 2 \\ 3 & M = 3 \text{ 或 } M = 7 \\ \lfloor \frac{M}{5} \rfloor + 1 & \text{其他所有情况} \end{cases}
$$



看到这个特判 $M \in \{2, 3, 7\}$ 了吗？这就是典型的麦乐鸡定理边界！代码只需 10 行，却能把不仔细推样例的选手卡得死死的！

---

**二、 ICPC 标准题面（Markdown 格式）**

**题目名称：2026 食堂的二进制霸王餐**

**【题目描述】**
为了庆祝 $2026$ 级新生的到来，学校食堂推出了面额分别为 **$2$ 元、$5$ 元、$8$ 元、$10$ 元** 的四种纪念餐券，每种餐券的数量都是无限的。

食堂的结账机器采用了一套奇特的“二进制对冲”计费系统。当你拿出一叠共 $k$ 张餐券 $a_1, a_2, \dots, a_k$（其中 $a_i \in \{2, 5, 8, 10\}$）时，机器会计算这叠餐券的**面额总和**与**按位异或和**之差，并将其作为你的实际抵扣金额 $V$：


$$
V = \left(\sum_{i=1}^k a_i\right) - \left(a_1 \oplus a_2 \oplus \dots \oplus a_k\right)
$$


其中 $\oplus$ 表示二进制按位异或（XOR）运算。例如，若你拿出三张面额分别为 $2, 8, 10$ 的餐券，它们的总和为 $2 + 8 + 10 = 20$，按位异或和为 $2 \oplus 8 \oplus 10 = 0$，因此实际抵扣金额为 $20 - 0 = 20$ 元。

现在，Jack 想要购买一份价值恰好为 $N$ 元的套餐（要求实际抵扣金额 $V$ **恰好等于** $N$）。请你帮他计算，**最少**需要拿出多少张餐券才能恰好抵扣 $N$ 元？如果无论如何都无法恰好抵扣 $N$ 元，请输出 `-1`。

**【输入格式】**
第一行包含一个整数 $T$（$1 \le T \le 10^5$），表示测试数据的组数。
接下来 $T$ 行，每行包含一个正整数 $N$（$1 \le N \le 10^{18}$），表示目标抵扣金额。

**【输出格式】**
对于每组测试数据，输出一行一个整数，表示最少需要的餐券张数；若无法凑出，输出 `-1`。

**【输入输出样例】**
**输入 #1**

```text
6
2026
20
8
28
22
7

```

**输出 #1**

```text
204
2
4
6
6
-1

```

**【样例解释】**

* **第 1 组（$N = 2026$）**：使用 $2$ 张 $5$ 元券、$2$ 张 $8$ 元券和 $200$ 张 $10$ 元券（共 $204$ 张），总和为 $10 + 16 + 2000 = 2026$，由于每种餐券都是偶数张，异或和为 $0$，差值恰好为 $2026$。可以证明不存在少于 $204$ 张的方案。
* **第 2 组（$N = 20$）**：虽然 `{2, 8, 10}`（3 张）也能凑出 $20$，但直接使用两张 $10$ 元券 `{10, 10}` 只需 $2$ 张（$20 - (10 \oplus 10) = 20$）。
* **第 3 组（$N = 8$）**：使用 $4$ 张 $2$ 元券 `{2, 2, 2, 2}`，差值为 $8 - 0 = 8$。
* **第 4 组（$N = 28$）**：对应的 $M = 28 / 4 = 7$，最优方案是使用 $2$ 张 $10$ 元券和 $4$ 张 $2$ 元券（共 $6$ 张），凑出 $20 + 8 = 28$。
* **第 5 组（$N = 22$）**：使用 $2$ 张 $5$ 元券（提供 $10$）和 $4$ 张 $2$ 元券？不对，还差 $12$，需用 $2$ 张 $5$ 元券（提供 $10$）加上 $6$ 张 $2$ 元券？不，$22 = 10 + 8 + 4$，实际上 $22 - 10 = 12$，对应 $M = 3$，需要 $3$ 对 $2$ 元券（6 张）加 $1$ 对 $5$ 元券（2 张）共 $8$ 张？
*（注：这里修正一下样例 #1 第 5 组的输出！对于 $N=22$，减去一个 $10$ 后剩 $N'=12$，即 $M=3$，因为 $M=3$ 只能拆成 $1+1+1$，所以需要 $1$ 对 `5` 和 $3$ 对 `2`，共 $(1 + 3) \times 2 = \mathbf{8}$ 张！但如果用 $48$ 呢？$48 / 4 = 12 = 4+4+4$，即 $3$ 对 `8` 共 $6$ 张！我把样例第 5 组设为 $N=48$，更能体现 $16 \times 3 = 48$ 的反直觉贪心！）*

*(修正后的样例第 5 组：输入 `48`，输出 `6`，因为 $6$ 张 $8$ 元券的差值为 $48 - 0 = 48$，比用 $4$ 张 $10$ 元券加 $4$ 张 $2$ 元券的 $8$ 张更优！)*

---

**三、 标准程序 `std.cpp**`

```cpp
#include <iostream>

using namespace std;
using ll = long long;

// 计算用 {1, 4, 5} 凑出非负整数 M 所需的最少元素个数
ll min_pairs(ll M) {
    if (M % 5 == 0) return M / 5;
    if (M == 2) return 2;
    if (M == 3 || M == 7) return 3;
    return M / 5 + 1;
}

void solve() {
    ll n;
    cin >> n;

    // 奇数必定无解
    if (n % 2 != 0) {
        cout << -1 << "\n";
        return;
    }

    ll pairs = 0;
    // 若 n mod 4 == 2，必须恰好使用一对 5（贡献 10）
    if (n % 4 == 2) {
        if (n < 10) {
            cout << -1 << "\n";
            return;
        }
        n -= 10;
        pairs += 1;
    }

    // 此时 n 必定是 4 的倍数，转化为用 {1, 4, 5} 凑 n / 4
    pairs += min_pairs(n / 4);

    // 每一对包含 2 张餐券
    cout << pairs * 2 << "\n";
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T;
    if (cin >> T) {
        while (T--) solve();
    }
    return 0;
}

```

---

**四、 命题人备忘：这道题在赛场上的区分度表现**

1. **第一层筛子（签到分水岭）**：看出 $\text{Sum} - \text{XorSum}$ 等价于“按位成对抵消”，并发现 $\{2, 8, 10\}$ 的三角组合（$3$ 张凑 $20$）被 $\{10, 10\}$（$2$ 张凑 $20$）严格偏序，从而把问题转化为 $\{4, 10, 16, 20\}$ 的凑数问题。
2. **第二层筛子（防假贪心，制造罚时）**：转化成 $\{1, 4, 5\}$ 凑 $M$ 后，莽撞的选手会直接写“先对 $5$ 取模，余数再对 $4$ 取模”，这会在 $M = 8$（正解 $4+4$ 共 $2$ 对，假贪心 $5+1+1+1$ 共 $4$ 对）和 $M = 12$（正解 $4+4+4$ 共 $3$ 对，假贪心 $5+5+1+1$ 共 $4$ 对）上疯狂吃 WA！



多测T<=1e5
餐券有2,5,8,10的面额，选若干个组成多重集合{a_i},给定N<=1e18，求最少选出多少餐券使得(a_i的和)-(a_i的异或和)=N








给一颗有$N$个节点的树，根为$1$，每个节点有一个权值$val_i$。
定义一次更新为：
从根节点开始，设此时根节点为$u$，其子节点为$v_1,v_2,...,v_m$，且按照$val$从大到小排序。
先更新其子节点
$$
val_{v_1}=\lfloor\frac{val_u+(val_{v_1}\bmod (val_u+(u\bmod 2)))}{2}\rfloor
$$
$$
val_{v_i}=\lfloor\frac{val_{v_{i-1}}+(val_{v_i}\bmod (val_{v_{i-1}}+(v_{i-1}\bmod 2)))}{2}\rfloor
$$
注意，是用更新后的值更新排在后面的值
输出更新$K$次后的所有权值的异或和
$N\le 10^5,val\le 10^{18},K\le 10^7$







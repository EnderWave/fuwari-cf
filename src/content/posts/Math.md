---
title: Math
published: 2025-11-28
description: ''
image: ''
tags: [Math]
category: 'Math'
draft: false 
lang: ''
---
# 数学部分
## 调和级数
**调和级数常常与枚举一起出现，随着枚举次数的增加，枚举规模会减小，一般需要 $\sum_{i=1}^{V}\frac{1}{i}=\ln{V}$ 来保证复杂度**
### 例题
#### [CF2144D](https://codeforces.com/contest/2144/problem/D)
手玩一下（其实是打表），发现答案没有单调性，不能二分，考虑**枚举**。记$V=\max{c_{i}}$枚举发现，当$x>V$时，贡献是一定的，在$x<=V$时，发现价被限制在$[0,\frac{V}{x}]$里，枚举$x$,复杂度为$O(V\log{V})$。
由于每次我们需要计算打折后价格为$i$的贡献，我们还需要维护一个**前缀和**来计算原价位于$[i*x,(i+1)*x-1]$的数的个数。
**注意不要乘爆了**
核心代码
```cpp
ll ans=-1e18;
for (int i=1;i<=V+1;i++)pr[i]=0;
for (int i=1;i<=V+1;i++)pr[i]=pr[i-1]+ct[i];
for (int i=2;i<=V+1;i++){
    ans=std::max(ans,so(i));
}
```
```cpp
ll so(int x){
    ll res=0,mius=0;
    for (int i=1;i*x-(x-1)<=V;i++){
        int l=i*x-x+1,r=std::min(V,i*x);
        int cnt=pr[r]-pr[l-1];
        if (cnt>0)res+=1ll*cnt*i,mius+=std::min(ct[i],cnt);
    }
    return res-1ll*y*(n-mius);
}
```
---
title: Normal_Algorithms
published: 2025-12-09
description: '平平无奇的算法'
image: ''
tags: [algorithm]
category: ''
draft: false 
lang: ''
---
# 二分
## 一些奇奇怪怪的二分
[CF2120](https://codeforces.com/contest/2120/problem/E)
有个显然的贪心是将最大的末尾移到最小末尾去
不难（挺难）发现，最后的的序列类似$x,x,...,x,a_{i},...,a_{j},x+k+1,x+k+1...$，发现这样可能最后与总数不相符，我们需要微调一下。
发现上面总数单增，记总数为$S(x)$，发现$S(x)$单增，我们可以二分求出满足$S(x)<=\sum a_{i}<S(x+1)$
然后，多出来的分配给$x$(因为我们优先放到小的后面)，还不够就分配给$x+k+1$
因为懒，直接沾自己代码了(有的时候，看代码更易懂)
```cpp
ll S(int l){
    ll r=1ll*(l+k);
    ll sum=0;
    for (int i=1;i<=n;i++){
        if (l<=a[i]&&a[i]<=r)b[i]=a[i],sum+=b[i];
        else if (a[i]<l)b[i]=l,sum+=b[i];
        else b[i]=r,sum+=b[i];
    }
    return sum;
}
void init(){
    scanf("%d%d",&n,&k);s=0;
    for (int i=1;i<=n;i++)scanf("%d",a+i),s+=1ll*a[i];
    std::sort(a+1,a+n+1);
}
void solve(){
    int l=a[1],r=a[n]-k;
    while (r-l>1){
        int mid=(l+r)>>1;
        if (S(mid)<=s)l=mid;
        else r=mid-1;
    }
    while (S(l)<=s)l++;l--;
    r=l+k;
    ll sum=S(l);
    for (int i=1;sum<s&&i<=n;i++)
        if (a[i]<=l)b[i]++,sum++;
    for (int i=1;sum<s&&i<=n;i++)
        if (a[i]>r)b[i]++,sum++;
    ll ans=0;
    for (int i=1;i<=n;i++){
        if (a[i]<b[i])ans+=1ll*(b[i]-a[i])*k;
        ans+=1ll*b[i]*(b[i]+1)/2;
    }
    printf("%lld\n",ans);
}
```

# 贪心
## 两些奇奇怪怪的贪心

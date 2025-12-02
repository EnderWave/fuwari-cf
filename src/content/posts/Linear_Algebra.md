---
title: Linear_Algebra
published: 2025-11-28
description: ''
image: ''
tags: [Math，Xor]
category: 'Math'
draft: false 
lang: ''
---
# 线性代数部分
:spoiler[别问为什么不在数学部分]
## 线性基
其中$cnt$表示基的大小
### 插入操作
从高位到最低位贪心即可
```
bool insert(int x){
    for (int i=30;i>=0;i--){
        if (x>>i&1){
            if (!val[i]){
                val[i]=x;cnt++;
                return 1;
            }
            x^=val[i];
        }
    }
    return 0;
}
```
### 求第k小
将$k$二进制拆分，按位取就可以（$0$的情况需要特判，这里只是计算目前基的第$k$小）

```
int qry_kth(int k){
    int ans=0,ct=1<<cnt;
    for (int i=30;i>=0;i--){
        if (val[i]){
            if (k>(ct>>=1)){
                k-=ct;
                if (~ans>>i&1)ans^=val[i];
            }
            else if (ans>>i&1)ans^=val[i];
        }
    }
    return ans;
}
```
### 求x的排名
这里我们计算小于等于$x$的数的个数，首先需要记录一个异或和$pre$，就是所选的$val_{i}$的异或和。
从大到小枚举每一位，我们知道，$val_{i}$有值的地方的$1$一定能取到，我们可以维护$pre$使得取到这些位置上的$1$，对于$val_{i}=0$的位置，如果$x$与$pre$不同时，说明我们知道所求位置了，判断一下是谁有$1$就可以了。
```
int qry_rk(int x){
    int ans=0,ct=(1<<cnt),pre=0;x++;
    for (int i=30;i>=0;i--){
        if (val[i]){
            ans+=(x>>i&1)*(ct>>=1);
            if ((x^pre)>>i&1)pre^=val[i];
        }
        else if ((x^pre)>>i&1){
            if (x>>i&1)ans+=ct;
            break;
        }
    }
    return ans;
}
```
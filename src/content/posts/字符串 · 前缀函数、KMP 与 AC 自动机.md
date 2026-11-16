---
title: "字符串 · 前缀函数、KMP 与 AC 自动机"
published: 2025-11-28
description: "从前缀函数到单模式与多模式匹配，整理算法思路与实现。"
image: ''
tags: [String]
category: "算法笔记"
draft: false 
lang: ''
---

从前缀函数到单模式与多模式匹配，整理算法思路与实现。

[返回算法笔记导航](/posts/算法笔记导航/)

## 字符串

*子串可以看成**前缀**的一个**后缀***

### 前缀函数

$\pi[i]$是$s[0...i]$最长的相等的**真前缀**与**真后缀**的长度。
$\pi[i]=\max_{k=0...i}k,s[0...k-1]=s[i-k+1...i]$
特别的规定$\pi[0]=0$
假设我们已经知道前$i$个$\pi$函数值，考虑计算$\pi[i+1]$,如果$s[i+1]=s[\pi[i]+1]$,那么，$\pi[i+1]=\pi[i]+1$,如果不相等，我们考虑找到一个**第二长**的相等的真前缀与真后缀的长度，发现$s[0...\pi[i]]和s[i-\pi[i]+1...i]$**完全相等**，那么我们要找的**第二长**是不是就是$s[0...\pi[i]]$的**最长**，所以，我们这样一步一步跳即可。

```cpp
void pre(string s){
    int len=s.length();
    pi[0]=0;
    for (int i=1;i<len;i++){
        int j=pi[i-1];
        while(j&&s[i]!=s[j])j=pi[j-1];
        pi[i]=j+(s[i]==s[j]);
    }
}
```

### KMP

给定一个文本 𝑡和一个字符串 𝑠，我们尝试找到并展示 𝑠 在 𝑡 中的所有出现
我们发现，只要处理$s+$ # $+t$就可以 #代指不在$s,t$的任意一个字符
代码同上

### AC自动机

Trie 上的自动机
建立需要两个步骤
**1.基础的 Trie 结构：将所有的模式串构成一棵 Trie；**
**2.KMP 的思想：对 Trie 树上所有的结点构造失配指针。**
字典树正常建树就可以，我们来看一下**失配指针**
**fail指针**指向**所有**模式串的前缀中匹配**当前**状态的最长后缀，上文的$\pi$指向**本**模式串，接下来我们考虑怎么计算**fail函数**
仔细想一下，发现其实和$\pi$函数求法是一样的。
考虑字典树中当前的结点 𝑢，𝑢的父结点是 𝑝，𝑝通过字符 𝑐的边指向 𝑢，即 $trie(𝑝,𝑐) =𝑢$。假设深度**小于 𝑢** 的所有结点的$fail$指针都已求得。
1.如果 $trie(fail(𝑝),𝑐) $**存在**：则让 𝑢的 fail 指针指向 $trie(fail(𝑝),𝑐)$。相当于在 $𝑝$和 $fail(𝑝)$后面加一个字符 𝑐，分别对应 𝑢 和 $fail(𝑢)$；
2.如果 $trie(fail(𝑝),𝑐) $**不存在**：那么我们继续找到 $trie(fail(fail(𝑝)),𝑐)$。重复判断过程，一直跳$fail$指针直到根结点；
3.如果依然**不存在**，就让 $fail$ 指针指向根结点。

#### 建树过程

比较抽象，什么时候我想到一个说法我再详细说
我们考虑优化一下第二步的跳跃，发现这是在跳$fail$指针，如果我们将$fail$指针的结构加到树上会怎么样呢？

```cpp
void build(){
    //建立ac自动机
    while (!Q.empty()) Q.pop();
    for (int i=0;i<26;i++)
        if (T[0].son[i])Q.push(T[0].son[i]);
    while (!Q.empty()){
        int u=Q.front();Q.pop();
        for (int i=0;i<26;i++){
            if (T[u].son[i]){
                T[T[u].son[i]].fail=T[T[u].fail].son[i];
                Q.push(T[u].son[i]);
            }
            else T[u].son[i]=T[T[u].fail].son[i];//改变树的结构
        }
    }
}
```

简单画个图，我们发现改变树的结构帮我们一次跳到了所需位置（后期再补）

#### 查询操作及其优化

首先，我们先考虑ACAM上每个节点是什么意思。每个节点可以看做是一个字符串的**前缀**（从根节点到当前节点所经过的边形成的前缀）。我们称其为该点的状态。
那我们的$fail$指针又是干什么的的呢？我们发现，$fail$指针指向当前穿的最长的**后缀**。
那么，我们每次查寻到一个点，首先，能达到该点的状态，然后其$fail$所指的状态也能达到，每次到一个点，我们就跳$fail$来统计答案。
发现每次都要跳，很浪费，我们又只需要在$fail$上跳（显然$fail$所形成的是DAG），所以我们考虑用拓扑排序优化。

```cpp
void qry(string t){
    int u=0,len=t.length();
    for (int i=0;i<len;i++){
        u=T[u].son[t[i]-'a'];
        T[u].ans++;
    }
}
void topo(){
    while (!Q.empty()) Q.pop();
    for (int i=0;i<=cntn;i++){
        if (!T[i].in)Q.push(i);
    }
    while (!Q.empty()){
        int u=Q.front();Q.pop();
        ans[T[u].id]=T[u].ans;
        int v=T[u].fail;
        T[v].ans+=T[u].ans;
        if (!--T[v].in)Q.push(v);
    }
}
```

[AC自动机模板](https://www.luogu.com.cn/problem/P5357)
ACAM完整代码

```cpp
namespace ACAM {
    struct tire{
        int son[26],fail,in,id,ans;
        void clear(){
            fail=in=id=ans=0;
            memset(son,0,sizeof(son));
        }
    }T[N];
    int cntid,cntn,ans[N];
    queue<int>Q;
    void init(){
        cntid=cntn=0;
        T[0].clear();
    }
    int insert(string s){//return id;
        int u=0,len=s.length();
        for (int i=0;i<len;i++){
            int& son=T[u].son[s[i]-'a'];//地址写法更方便
            if (!son)son=++cntn,T[son].clear();
            u=son;
        }
        if (!T[u].id)T[u].id=++cntid;//防止重复
        return T[u].id;//记录编号
    }
    void build(){
        //建立ac自动机
        while (!Q.empty()) Q.pop();
        for (int i=0;i<26;i++)
            if (T[0].son[i])Q.push(T[0].son[i]);
        while (!Q.empty()){
            int u=Q.front();Q.pop();
            for (int i=0;i<26;i++){
                if (T[u].son[i]){
                    T[T[u].son[i]].fail=T[T[u].fail].son[i];
                    T[T[T[u].fail].son[i]].in++;
                    Q.push(T[u].son[i]);
                }
                else T[u].son[i]=T[T[u].fail].son[i];//改变树的结构
            }
        }
    }
    void qry(string t){
        int u=0,len=t.length();
        for (int i=0;i<len;i++){
            u=T[u].son[t[i]-'a'];
            T[u].ans++;
        }
    }
    void topo(){
        while (!Q.empty()) Q.pop();
        for (int i=0;i<=cntn;i++){
            if (!T[i].in)Q.push(i);
        }
        while (!Q.empty()){
            int u=Q.front();Q.pop();
            ans[T[u].id]=T[u].ans;
            int v=T[u].fail;
            T[v].ans+=T[u].ans;
            if (!--T[v].in)Q.push(v);
        }
    }
}
```

#### ACAM上的DP

---
title: "LGV 引理 · 不相交路径计数与行列式"
published: 2026-09-06
tags:
  - 模板
category: "算法笔记"
draft: true
description: "整理 LGV 引理的适用条件、路径权与行列式的联系，以及高斯消元代码。"
---

**LGV 引理 (Lindström–Gessel–Viennot Lemma)**
- **适用场景**：有向无环图 (DAG) 上的多源多汇不相交路径计数，或具有特定相交符号反转性质的代数和计算。
- **前置定义**：

    - 起点集 $A = \{a_1, a_2, \dots, a_n\}$，终点集 $B = \{b_1, b_2, \dots, b_n\}$。
    - $e(u, v)$ 表示从 $u$ 到 $v$ 的路径方案数（或生成函数/边权总和）。
    - 构造 $n \times n$ 的转移矩阵 $M$，其中 $M_{i,j} = e(a_i, b_j)$。
- **核心定理**：

    $$
    \det(M) = \sum_{P \in U} (-1)^{t(\sigma)} W(P)
    $$

    - $U$：所有 $n$ 条路径互不相交的并发路径组集合。
    - $\sigma$：该路径组对应的起终点映射排列（$a_i \to b_{\sigma(i)}$）。
    - $t(\sigma)$：排列 $\sigma$ 的逆序对数。
    - $W(P)$：该路径组中所有单条路径权值的乘积。
- **竞技推论**：若在二维网格图中，由于拓扑限制，**只有恒等排列 $\sigma(i)=i$ 才可能产生不相交路径**，则 $\det(M)$ 的值严格等于 $A \to B$ 的不相交路径组总数。

**核心代码模板**

计算矩阵行列式的 $O(n^3)$ 极简高斯消元，方便直接敲入板子：

```cpp
long long qpow(long long a, long long b) {
    long long res = 1;
    while (b) {
        if (b & 1) {
            res = res * a % MOD;
        }
        a = a * a % MOD;
        b >>= 1;
    }
    return res;
}

long long det(int n) {
    long long res = 1;
    for (int i = 1; i <= n; ++i) {
        int p = i;
        // 寻找当前列的非零主元
        for (int j = i + 1; j <= n; ++j) {
            if (a[j][i]) {
                p = j;
            }
        }
        // 交换行，行列式符号取反
        if (i != p) {
            swap(a[i], a[p]);
            res = (MOD - res) % MOD; 
        }
        // 对角线元素为 0，行列式为 0
        if (!a[i][i]) {
            return 0;
        }
        
        long long inv = qpow(a[i][i], MOD - 2);
        // 消去当前列下方的所有元素
        for (int j = i + 1; j <= n; ++j) {
            long long mul = a[j][i] * inv % MOD;
            for (int k = i; k <= n; ++k) {
                a[j][k] = (a[j][k] - mul * a[i][k] % MOD + MOD) % MOD;
            }
        }
        // 累乘对角线元素
        res = res * a[i][i] % MOD;
    }
    return res;
}
```

**解题流水线**

- **剥离起终点**：确认图为 DAG，找齐 $n$ 个起点和 $n$ 个终点（如相交起点需通过走第一步强行分离）。

- **填装矩阵**：使用 $O(V+E)$ 的拓扑 DP，或利用组合数公式 $\binom{\Delta x + \Delta y}{\Delta x}$ 快速计算两点间的合法路径数 $e(A_i, B_j)$，将其填入矩阵 `a[i][j]`。
- **一键消元**：直接调用 `det(n)` 求解，注意矩阵运算中的负数取模安全（`(x % MOD + MOD) % MOD`）。

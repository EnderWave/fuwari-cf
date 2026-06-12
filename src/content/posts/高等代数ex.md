---
title: 高等代数ex
published: 2026-06-12
tags:
  - 高等代数
  - 数学，线性代数
  - 数学
category: 工高代
draft: false
---
  

# 专题 1：向量范数与矩阵范数 (Vector and Matrix Norms)

  

### 1.1 基本定义

*   **向量范数 (Vector Norm)**：定义在实向量空间 $\mathbb{R}^m$ 上的实值函数 $\|\cdot\|$，满足：

    1.  **非负性与唯一性**：$\|\vec{v}\| \geq 0$ 且 $\|\vec{v}\| = 0 \iff \vec{v} = \vec{0}$。

    2.  **齐次性**：$\|\alpha \vec{v}\| = |\alpha| \|\vec{v}\|, \forall \alpha \in \mathbb{R}$。

    3.  **三角不等式**：$\|\vec{v} + \vec{u}\| \leq \|\vec{v}\| + \|\vec{u}\|$。

*   **常用向量范数**：

    *   $\ell_1$ 范数：$\|\vec{v}\|_1 = \sum_{i=1}^m |v_i|$

    *   $\ell_2$ 范数（欧氏范数）：$\|\vec{v}\|_2 = \sqrt{\sum_{i=1}^m |v_i|^2}$

    *   $\ell_\infty$ 范数：$\|\vec{v}\|_\infty = \max_{1 \leq i \leq m} |v_i|$

*   **诱导矩阵范数 (Induced Matrix Norm)**：由特定的向量范数诱导得出：

    $$\|A\| = \max_{\|\vec{v}\|=1} \|A\vec{v}\|$$

    *   最大列和范数（$1$-范数）：$\|A\|_1 = \max_{1 \leq j \leq n} \sum_{i=1}^m |a_{ij}|$

    *   最大行和范数（$\infty$-范数）：$\|A\|_\infty = \max_{1 \leq i \leq m} \sum_{j=1}^n |a_{ij}|$

    *   谱范数（$2$-范数）：$\|A\|_2 = \max_{\|\vec{v}\|_2 = 1} \|A\vec{v}\|_2 = \sqrt{\lambda_{\max}(A^T A)} = \sigma_{\max}(A)$

*   **Frobenius 范数 (F-范数)**：$\|A\|_F = \sqrt{\sum_{i=1}^m \sum_{j=1}^n |a_{ij}|^2} = \sqrt{\text{tr}(A^T A)}$。

*   **核范数 (Nuclear Norm)**：$\|A\|_* = \sum_{i=1}^r \sigma_i$，其中 $\sigma_i$ 为 $A$ 的奇异值。

  

---

  

### 1.2 核心定理与证明

  

#### 定理 1.1 (Cauchy-Schwarz 不等式)

对于任意 $x, y \in \mathbb{R}^n$，满足：

$$|\langle x, y \rangle| \leq \|x\|_2 \|y\|_2$$

  

##### 【证明】

若 $y = 0$，不等式显然成立。设 $y \neq 0$，对于任意实数 $t \in \mathbb{R}$，考察二次非负实值函数 $\phi(t) = \|x - ty\|_2^2$：

$$\phi(t) = \langle x - ty, x - ty \rangle = \|x\|_2^2 - 2t\langle x, y \rangle + t^2 \|y\|_2^2 \geq 0$$

这是一个关于 $t$ 的二次实系数多项式。由于其对所有 $t \in \mathbb{R}$ 恒非负，其判别式 $\Delta$ 必须满足 $\Delta \leq 0$：

$$\Delta = (-2\langle x, y \rangle)^2 - 4\|y\|_2^2 \|x\|_2^2 = 4\left( \langle x, y \rangle^2 - \|x\|_2^2 \|y\|_2^2 \right) \leq 0$$

由此可得：

$$\langle x, y \rangle^2 \leq \|x\|_2^2 \|y\|_2^2$$

两端开平方根，即证：

$$|\langle x, y \rangle| \leq \|x\|_2 \|y\|_2 \quad \square$$

  

---

  

### 1.3 关键性质与证明

  

#### 性质 1.2 (谱范数与行列和范数的关系) (习题 4)

对任意矩阵 $A \in \mathbb{R}^{m \times n}$，谱范数满足以下不等式：

$$\|A\|_2 \leq \sqrt{\|A\|_1 \|A\|_\infty}$$

  

##### 【证明】

由于 $A^T A$ 是对称半正定矩阵，其谱半径 $\rho(A^T A)$ 等于其最大特征值 $\lambda_{\max}(A^T A)$：

$$\|A\|_2^2 = \lambda_{\max}(A^T A) = \rho(A^T A)$$

由于任何矩阵的谱半径不大于其任意一种诱导矩阵范数，我们选择列和范数（$1$-范数）：

$$\|A\|_2^2 = \rho(A^T A) \leq \|A^T A\|_1$$

由于诱导矩阵范数具有次可乘性，且 $\|A^T\|_1 = \|A\|_\infty$，故：

$$\|A^T A\|_1 \leq \|A^T\|_1 \|A\|_1 = \|A\|_\infty \|A\|_1$$

因此，

$$\|A\|_2^2 \leq \|A\|_1 \|A\|_\infty$$

两端开平方根即得：

$$\|A\|_2 \leq \sqrt{\|A\|_1 \|A\|_\infty} \quad \square$$

  

#### 性质 1.3 (秩 1 矩阵的范数) (习题 5)

设 $A = \mathbf{u}\mathbf{v}^T$，其中 $\mathbf{u} \in \mathbb{R}^m, \mathbf{v} \in \mathbb{R}^n$，则有 $\text{rank}(A) = 1$，且 $\|A\|_2 = \|A\|_F = \|\mathbf{u}\|_2 \|\mathbf{v}\|_2$。

  

##### 【证明】

首先计算 $A^T A$：

$$A^T A = (\mathbf{u}\mathbf{v}^T)^T (\mathbf{u}\mathbf{v}^T) = \mathbf{v}\mathbf{u}^T \mathbf{u}\mathbf{v}^T = (\mathbf{u}^T \mathbf{u}) \mathbf{v}\mathbf{v}^T = \|\mathbf{u}\|_2^2 \mathbf{v}\mathbf{v}^T$$

由于 $\mathbf{v}\mathbf{v}^T$ 是秩为 1 的对称矩阵，其唯一非零特征值为其迹 $\text{tr}(\mathbf{v}\mathbf{v}^T) = \|\mathbf{v}\|_2^2$。

因此，$A^T A$ 的最大特征值为：

$$\lambda_{\max}(A^T A) = \|\mathbf{u}\|_2^2 \cdot \|\mathbf{v}\|_2^2$$

从而谱范数为：

$$\|A\|_2 = \sqrt{\lambda_{\max}(A^T A)} = \|\mathbf{u}\|_2 \|\mathbf{v}\|_2$$

接着计算 F-范数：

$$\|A\|_F^2 = \text{tr}(A^T A) = \text{tr}(\|\mathbf{u}\|_2^2 \mathbf{v}\mathbf{v}^T) = \|\mathbf{u}\|_2^2 \text{tr}(\mathbf{v}\mathbf{v}^T) = \|\mathbf{u}\|_2^2 \|\mathbf{v}\|_2^2$$

开根号即得：

$$\|A\|_F = \|\mathbf{u}\|_2 \|\mathbf{v}\|_2 \quad \square$$

  

#### 性质 1.4 (正交不变性) (习题 32)

设 $Q \in \mathbb{R}^{m \times m}$ 与 $P \in \mathbb{R}^{n \times n}$ 均为正交矩阵，则对任意 $A \in \mathbb{R}^{m \times n}$，满足：

$$\|QAP\|_2 = \|A\|_2, \quad \|QAP\|_F = \|A\|_F$$

  

##### 【证明】

1.  **谱范数**：

    由于正交变换保持向量的 $2$-范数不变（即若 $P^T P = I$，则对任意 $\vec{y}$ 有 $\|P\vec{y}\|_2 = \|\vec{y}\|_2$），可得：

    $$\|QAP\|_2 = \max_{\|\vec{x}\|_2=1} \|QAP\vec{x}\|_2$$

    令 $\vec{y} = P\vec{x}$。由于 $P$ 是正交矩阵，当 $\|\vec{x}\|_2 = 1$ 时，$\|P\vec{x}\|_2 = \|\vec{y}\|_2 = 1$。且由 $Q$ 的正交性知 $\|Q(AP\vec{x})\|_2 = \|AP\vec{x}\|_2$，故：

    $$\|QAP\|_2 = \max_{\|\vec{y}\|_2=1} \|A\vec{y}\|_2 = \|A\|_2$$

2.  **Frobenius 范数**：

    利用迹性质 $\text{tr}(XY) = \text{tr}(YX)$ 以及正交矩阵性质 $Q^T Q = I_m, P P^T = I_n$：

    $$\|QAP\|_F^2 = \text{tr}\left( (QAP)^T (QAP) \right) = \text{tr}\left( P^T A^T Q^T Q A P \right) = \text{tr}\left( P^T A^T A P \right)$$

    利用循环排列不变性：

    $$\text{tr}\left( P^T A^T A P \right) = \text{tr}\left( P P^T A^T A \right) = \text{tr}\left( A^T A \right) = \|A\|_F^2$$

    两端开平方根，即证 $\|QAP\|_F = \|A\|_F \quad \square$

  

---

  

# 专题 2：奇异值分解与低秩逼近 (SVD and Low-Rank Approximation)

  

### 2.1 定义与定理

*   **定理 2.1 (SVD 定理)**：对任意 $A \in \mathbb{R}^{n \times m}$，存在正交阵 $U \in \mathbb{R}^{n \times n}$ 和 $V \in \mathbb{R}^{m \times m}$，使得：

    $$A = U \Sigma V^T$$

    其中 $\Sigma \in \mathbb{R}^{n \times m}$ 的前 $r$ 个对角元素为 $\sigma_1 \geq \sigma_2 \geq \dots \geq \sigma_r > 0$，其余部分为零。

  

---

  

### 2.2 低秩逼近定理与证明

  

#### 定理 2.2 (Eckhart-Young 定理) (习题 15)

设 $A \in \mathbb{R}^{n \times m}$ 的奇异值分解为 $A = \sum_{i=1}^r \sigma_i \vec{u}_i \vec{v}_i^T$。令 $k < r$，定义 $A_k = \sum_{i=1}^k \sigma_i \vec{u}_i \vec{v}_i^T$。则：

$$\min_{\text{rank}(B) \leq k} \|A - B\|_2 = \|A - A_k\|_2 = \sigma_{k+1}$$

  

##### 【证明】

首先，显然有 $\text{rank}(A_k) = k$，且：

$$A - A_k = \sum_{i=k+1}^r \sigma_i \vec{u}_i \vec{v}_i^T$$

其最大奇异值为 $\sigma_{k+1}$，因此 $\|A - A_k\|_2 = \sigma_{k+1}$。

现在证明对于任何满足 $\text{rank}(B) \leq k$ 的矩阵 $B$，均有 $\|A - B\|_2 \geq \sigma_{k+1}$。

由于 $\text{rank}(B) \leq k$，其零空间 $\text{Null}(B)$ 的维数满足：

$$\dim(\text{Null}(B)) = m - \text{rank}(B) \geq m - k$$

令 $V_{k+1} = \text{span}\{\vec{v}_1, \dots, \vec{v}_{k+1}\}$，则 $\dim(V_{k+1}) = k + 1$。

根据维数公式，两个子空间的交集满足：

$$\dim\left( \text{Null}(B) \cap V_{k+1} \right) = \dim(\text{Null}(B)) + \dim(V_{k+1}) - \dim\left( \text{Null}(B) + V_{k+1} \right)$$

由于整个空间维度为 $m$，故 $\dim\left( \text{Null}(B) + V_{k+1} \right) \leq m$。从而：

$$\dim\left( \text{Null}(B) \cap V_{k+1} \right) \geq (m - k) + (k + 1) - m = 1$$

说明存在一个非零单位向量 $\vec{z} \in \text{Null}(B) \cap V_{k+1}$ 且 $\|\vec{z}\|_2 = 1$。

因为 $\vec{z} \in V_{k+1}$，它可以表示为 $\vec{z} = \sum_{i=1}^{k+1} c_i \vec{v}_i$，且 $\sum_{i=1}^{k+1} c_i^2 = 1$。

因为 $\vec{z} \in \text{Null}(B)$，故 $B\vec{z} = \vec{0}$。

因此：

$$\|A - B\|_2^2 \geq \|(A - B)\vec{z}\|_2^2 = \|A\vec{z}\|_2^2 = \left\| \sum_{i=1}^{k+1} c_i A\vec{v}_i \right\|_2^2 = \left\| \sum_{i=1}^{k+1} c_i \sigma_i \vec{u}_i \right\|_2^2$$

由于 $\vec{u}_i$ 是标准正交向量组，上式展开为：

$$\sum_{i=1}^{k+1} c_i^2 \sigma_i^2 \geq \sigma_{k+1}^2 \sum_{i=1}^{k+1} c_i^2 = \sigma_{k+1}^2$$

两端开根号即得：

$$\|A - B\|_2 \geq \sigma_{k+1} \quad \square$$

  

---

  

# 专题 3：实矩阵微分与梯度理论 (Matrix Differentials and Gradients)

  

### 3.1 矩阵梯度定义与万能迹公式

*   **矩阵梯度定义**：对标量函数 $f(X): \mathbb{R}^{m \times n} \to \mathbb{R}$，

    $$[\nabla_X f(X)]_{ij} = \frac{\partial f}{\partial X_{ij}}$$

*   **全微分的迹形式 (万能迹公式)**：

    $$df = \sum_{i=1}^m \sum_{j=1}^n \frac{\partial f}{\partial X_{ij}} dX_{ij} = \text{tr}\left( (\nabla_X f(X))^T dX \right)$$

    **若通过微分性质将标量微分化为 $df = \text{tr}(M dX)$ 的形式，则梯度为：**

    $$\nabla_X f(X) = M^T$$

  

---

  

### 3.2 矩阵逆微分定理与证明

  

#### 定理 3.1 (矩阵逆的微分)

若 $X \in \mathbb{R}^{n \times n}$ 为非奇异矩阵，则：

$$d(X^{-1}) = -X^{-1} (dX) X^{-1}$$

  

##### 【证明】

由于 $X X^{-1} = I$，在恒等式两端施加微分算子 $d$，并利用乘积的莱布尼茨法则：

$$d(X X^{-1}) = d(I) = 0$$

$$(dX) X^{-1} + X d(X^{-1}) = 0$$

整理可得：

$$X d(X^{-1}) = -(dX) X^{-1}$$

由于 $X$ 可逆，两端左乘 $X^{-1}$ 即证：

$$d(X^{-1}) = -X^{-1} (dX) X^{-1} \quad \square$$

  

---

  

### 3.3 典型梯度公式推导

  

#### 1. 导数公式：$\nabla_{\mathbf{x}}(\mathbf{x}^T A \mathbf{x}) = (A + A^T)\mathbf{x}$

##### 【证明】

设标量函数 $f(\mathbf{x}) = \mathbf{x}^T A \mathbf{x}$。对其施加微分：

$$df = d(\mathbf{x}^T A \mathbf{x}) = (d\mathbf{x})^T A \mathbf{x} + \mathbf{x}^T A (d\mathbf{x})$$

由于 $(d\mathbf{x})^T A \mathbf{x}$ 是一个实数标量，其转置等于自身：

$$(d\mathbf{x})^T A \mathbf{x} = \left((d\mathbf{x})^T A \mathbf{x}\right)^T = \mathbf{x}^T A^T d\mathbf{x}$$

代入微分式得：

$$df = \mathbf{x}^T A^T d\mathbf{x} + \mathbf{x}^T A d\mathbf{x} = \mathbf{x}^T (A + A^T) d\mathbf{x} = \left((A+A^T)\mathbf{x}\right)^T d\mathbf{x}$$

对照向量全微分与梯度的关系 $df = (\nabla_{\mathbf{x}} f)^T d\mathbf{x}$，即得：

$$\nabla_{\mathbf{x}}(\mathbf{x}^T A \mathbf{x}) = (A + A^T)\mathbf{x} \quad \square$$

  

#### 2. 导数公式：$\nabla_X \text{tr}(AX^{-1}B) = -X^{-T} A^T B^T X^{-T}$

##### 【证明】

对标量函数 $f(X) = \text{tr}(AX^{-1}B)$ 施加微分，并利用迹的线性性质：

$$df = d\left(\text{tr}(AX^{-1}B)\right) = \text{tr}\left(A d(X^{-1}) B\right)$$

代入定理 3.1 的逆矩阵微分公式：

$$df = \text{tr}\left( A \left( -X^{-1} (dX) X^{-1} \right) B \right) = -\text{tr}\left( A X^{-1} dX X^{-1} B \right)$$

利用迹的循环排列不变性（将 $X^{-1} B$ 作为一个整体移到最左端）：

$$df = -\text{tr}\left( X^{-1} B A X^{-1} dX \right) = \text{tr}\left( \left(-X^{-1} B A X^{-1}\right) dX \right)$$

欲对照迹形式的标准型 $df = \text{tr}(M^T dX)$，令 $M^T = -X^{-1} B A X^{-1}$：

$$M = \left( -X^{-1} B A X^{-1} \right)^T = -X^{-T} A^T B^T X^{-T}$$

因此：

$$\nabla_X \text{tr}(AX^{-1}B) = M = -X^{-T} A^T B^T X^{-T} \quad \square$$

  

#### 3. 导数公式：$\nabla_X \det(X) = \det(X)X^{-T}$

##### 【证明】

按行列式的拉普拉斯按行展开定理，有 $\det(X) = \sum_{j=1}^m X_{ij} C_{ij}$，其中 $C_{ij}$ 是代数余子式。由于 $C_{ij}$ 的定义式中不包含 $X_{ij}$ 元素本身，故其对 $X_{ij}$ 的偏导数为零：

$$\frac{\partial \det(X)}{\partial X_{ij}} = C_{ij}$$

因此，梯度矩阵即为代数余子式矩阵 $C$。由伴随矩阵与逆矩阵的关系：

$$X^{-1} = \frac{1}{\det(X)} X^* = \frac{1}{\det(X)} C^T \implies C^T = \det(X) X^{-1}$$

两端取转置，即证：

$$\nabla_X \det(X) = C = \det(X) X^{-T} \quad \square$$

  

---

  

# 专题 4：对称矩阵梯度与对称化投影法则 (Symmetric Gradients)

  

### 4.1 对称化投影法则

若自变量 $X$ 约束为实对称矩阵（即 $X = X^T \implies dX = dX^T$），由于分量之间不再彼此独立，不能直接使用无约束梯度。

  

#### 定理 4.1 (对称化投影法则)

若无约束下求得的全微分为 $df = \text{tr}(M dX)$，则在 $X$ 属于实对称矩阵的约束下，对应的对称梯度为：

$$\nabla_X f = \frac{M + M^T}{2}$$

  

##### 【证明】

由于 $dX$ 是对称矩阵，有 $dX = dX^T$。利用迹的转置不变性：

$$df = \text{tr}(M dX) = \text{tr}\left( (M dX)^T \right) = \text{tr}(dX^T M^T) = \text{tr}(M^T dX)$$

取这两种等价微分形式的平均值：

$$df = \frac{1}{2} \text{tr}(M dX) + \frac{1}{2} \text{tr}(M^T dX) = \text{tr}\left( \left( \frac{M + M^T}{2} \right) dX \right)$$

两端对照标准型 $df = \text{tr}((\nabla_X f)^T dX)$。因为自变量矩阵 $dX$ 与算子 $\frac{M+M^T}{2}$ 均为对称矩阵，此时内积映射唯一，故对称约束下的梯度为：

$$\nabla_X f = \frac{M + M^T}{2} \quad \square$$

  

---

  

### 4.2 典型应用

  

#### 对称约束下求对数行列式函数 $f(X) = \ln(\det(X))$ 的梯度

##### 【推导】

1.  **求微分**：利用链式法则：

    $$df = \frac{1}{\det(X)} d(\det(X)) = \frac{1}{\det(X)} \det(X) \text{tr}(X^{-1} dX) = \text{tr}(X^{-1} dX)$$

2.  **套用法则**：对应无约束微分因子 $M = X^{-1}$。由定理 4.1 的对称化投影法则：

    $$\nabla_X f = \frac{X^{-1} + (X^{-1})^T}{2}$$

3.  **化简**：因为 $X$ 是实对称矩阵，其逆矩阵 $X^{-1}$ 同样是对称矩阵（即 $(X^{-1})^T = X^{-1}$），故对称梯度退化为：

    $$\nabla_X \ln(\det(X)) = X^{-1} \quad \square$$

  

---

  

# 专题 5：正交投影矩阵性质 (Orthogonal Projections)

  

### 5.1 定义

*   **投影矩阵**：满足幂等性 $P^2 = P$。

*   **正交投影矩阵**：满足对称性 $P^T = P$ 且幂等 $P^2 = P$。

  

---

  

### 5.2 核心性质与证明

  

#### 性质 5.1 (列空间正交投影算子) (习题 9, 24)

设 $A \in \mathbb{R}^{m \times n}$ 满列秩。定义算子 $P = A(A^T A)^{-1} A^T$，则 $P$ 是到列空间 $\text{Col}(A)$ 上的正交投影算子，且残差 $\mathbf{r} = \mathbf{b} - P\mathbf{b}$ 正交于 $\text{Col}(A)$。

  

##### 【证明】

1.  **证明对称性**：

    $$P^T = \left( A(A^T A)^{-1} A^T \right)^T = (A^T)^T \left( (A^T A)^{-1} \right)^T A^T$$

    由于 $(A^T A)^T = A^T A$，其逆矩阵同样对称：

    $$P^T = A (A^T A)^{-1} A^T = P$$

2.  **证明幂等性**：

    $$P^2 = \left( A(A^T A)^{-1} A^T \right) \left( A(A^T A)^{-1} A^T \right) = A (A^T A)^{-1} \left( A^T A \right) (A^T A)^{-1} A^T$$

    由于 $(A^T A)^{-1} (A^T A) = I$，化简得：

    $$P^2 = A (A^T A)^{-1} A^T = P$$

3.  **证明残差正交性**：

    任意属于列空间 $\text{Col}(A)$ 的向量可表示为 $A\vec{y}$。考察残差 $\mathbf{r} = (I - P)\mathbf{b}$：

    $$A^T \mathbf{r} = A^T (I - P)\mathbf{b} = A^T \mathbf{b} - A^T P \mathbf{b}$$

    将 $P$ 展开代入：

    $$A^T P = A^T \left( A (A^T A)^{-1} A^T \right) = (A^T A) (A^T A)^{-1} A^T = A^T$$

    因此：

    $$A^T \mathbf{r} = A^T \mathbf{b} - A^T \mathbf{b} = \vec{0} \quad \square$$

  

---

  

# 专题 6：线性方程组求解与高斯/Householder变换 (Linear Systems)

  

### 6.1 核心定义

*   **高斯消元复杂度**：求解 $U\vec{x} = \vec{b}$ 约耗费 $n^2$ 次 FLOPs。

*   **Householder 矩阵**：对单位向量 $\|\vec{w}\|_2 = 1$，

    $$H = I - 2\vec{w}\vec{w}^T$$

  

---

  

### 6.2 核心性质与证明

  

#### 性质 6.1 (Householder 反射矩阵对称性与正交性)

Householder 变换阵 $H = I - 2 \frac{\vec{v}\vec{v}^T}{\vec{v}^T \vec{v}}$ 满足对称性与正交性。

  

##### 【证明】

1.  **对称性**：

    $$H^T = \left( I - 2 \frac{\vec{v}\vec{v}^T}{\vec{v}^T \vec{v}} \right)^T = I^T - \frac{2}{\vec{v}^T \vec{v}} (\vec{v}\vec{v}^T)^T = I - 2 \frac{\vec{v}\vec{v}^T}{\vec{v}^T \vec{v}} = H$$

2.  **正交性**：利用对称性 $H^T = H$，只需计算 $H^2$：

    $$H^2 = \left( I - 2 \frac{\vec{v}\vec{v}^T}{\vec{v}^T \vec{v}} \right) \left( I - 2 \frac{\vec{v}\vec{v}^T}{\vec{v}^T \vec{v}} \right) = I - 4 \frac{\vec{v}\vec{v}^T}{\vec{v}^T \vec{v}} + 4 \frac{(\vec{v}\vec{v}^T)(\vec{v}\vec{v}^T)}{(\vec{v}^T \vec{v})^2}$$

    由于 $(\vec{v}\vec{v}^T)(\vec{v}\vec{v}^T) = \vec{v}(\vec{v}^T\vec{v})\vec{v}^T = (\vec{v}^T\vec{v})(\vec{v}\vec{v}^T)$，代入上式最后一项：

    $$4 \frac{(\vec{v}^T \vec{v})(\vec{v}\vec{v}^T)}{(\vec{v}^T \vec{v})^2} = 4 \frac{\vec{v}\vec{v}^T}{\vec{v}^T \vec{v}}$$

    因此：

    $$H^2 = I - 4 \frac{\vec{v}\vec{v}^T}{\vec{v}^T \vec{v}} + 4 \frac{\vec{v}\vec{v}^T}{\vec{v}^T \vec{v}} = I$$

    因为 $H^T H = H H = H^2 = I$，即证 $H$ 为正交矩阵 $\quad \square$

  

---

  

# 专题 7：最小二乘问题与 Moore-Penrose 广义逆 (Least Squares)

  

### 7.1 定理与证明

  

#### 定理 7.1 (系数矩阵的正定性) (定理 36)

若 $A \in \mathbb{R}^{m \times n}$ 满足 $m > n$ 且满列秩（即 $\text{rank}(A) = n$），则对称方阵 $A^T A$ 是对称正定矩阵，因而必可逆。

  

##### 【证明】

1.  **对称性**：

    $$(A^T A)^T = A^T (A^T)^T = A^T A$$

    显然其是对称阵。

2.  **正定性**：

    对于任意非零实向量 $\mathbf{x} \in \mathbb{R}^n, \mathbf{x} \neq \mathbf{0}$，考察其二次型：

    $$\mathbf{x}^T (A^T A) \mathbf{x} = (A\mathbf{x})^T (A\mathbf{x}) = \|A\mathbf{x}\|_2^2 \geq 0$$

    由于 $A$ 是满列秩矩阵，其列向量组线性无关，因此其零空间仅包含零向量：

    $$A\mathbf{x} = \mathbf{0} \iff \mathbf{x} = \mathbf{0}$$

    既然已知 $\mathbf{x} \neq \mathbf{0}$，则必有 $A\mathbf{x} \neq \mathbf{0}$，从而：

    $$\|A\mathbf{x}\|_2^2 > 0$$

    故对于任意 $\mathbf{x} \neq \mathbf{0}$，恒有 $\mathbf{x}^T (A^T A) \mathbf{x} > 0$，即证 $A^T A$ 对称正定 $\quad \square$

  

---

  

### 7.2 典型应用分析

  

#### 1. 习题 25：常数最小二乘拟合问题

设拟合模型为 $y = c$，系数矩阵 $A = \begin{bmatrix} 1 & 1 & \dots & 1 \end{bmatrix}^T \in \mathbb{R}^{m \times 1}$，观测向量为 $\mathbf{b} = \begin{bmatrix} b_1 & \dots & b_m \end{bmatrix}^T$。

  

##### 【证明：最佳拟合常数为均值】

根据正规方程组公式 $A^T A c_* = A^T \mathbf{b}$：

$$A^T A = \begin{bmatrix} 1 & 1 & \dots & 1 \end{bmatrix} \begin{bmatrix} 1 \\ 1 \\ \vdots \\ 1 \end{bmatrix} = m$$

$$A^T \mathbf{b} = \begin{bmatrix} 1 & 1 & \dots & 1 \end{bmatrix} \begin{bmatrix} b_1 \\ b_2 \\ \vdots \\ b_m \end{bmatrix} = \sum_{i=1}^m b_i$$

代入方程可得 $m c_* = \sum_{i=1}^m b_i$，即：

$$c_* = \frac{1}{m} \sum_{i=1}^m b_i \quad \square$$

  

#### 2. 习题 26：欠定方程的最小范数解

设方程组为 $A\mathbf{x} = \mathbf{b}$，其中 $A \in \mathbb{R}^{m \times n}$ 满行秩（$m < n$）。证明其最小二乘范数解为 $\mathbf{x}_* = A^T(A A^T)^{-1}\mathbf{b}$。

  

##### 【证明】

由于 $A$ 满行秩，对称阵 $A A^T \in \mathbb{R}^{m \times m}$ 可逆。令拉格朗日乘子向量为 $\boldsymbol{\lambda} \in \mathbb{R}^m$，构造约束极值优化函数：

$$\mathcal{L}(\mathbf{x}, \boldsymbol{\lambda}) = \frac{1}{2} \|\mathbf{x}\|_2^2 - \boldsymbol{\lambda}^T(A\mathbf{x} - \mathbf{b})$$

对 $\mathbf{x}$ 求梯度并令其归零：

$$\nabla_{\mathbf{x}} \mathcal{L} = \mathbf{x} - A^T \boldsymbol{\lambda} = \mathbf{0} \implies \mathbf{x}_* = A^T \boldsymbol{\lambda}$$

将该解带入约束条件 $A\mathbf{x}_* = \mathbf{b}$：

$$A (A^T \boldsymbol{\lambda}) = \mathbf{b} \implies (A A^T) \boldsymbol{\lambda} = \mathbf{b}$$

解得 $\boldsymbol{\lambda} = (A A^T)^{-1}\mathbf{b}$，代回 $\mathbf{x}_*$ 的表达式中即得：

$$\mathbf{x}_* = A^T (A A^T)^{-1} \mathbf{b} \quad \square$$

  

---

  

# 专题 8：敏感度与病态方程组 (Sensitivity and Condition Numbers)

  

### 8.1 正规方程法 vs QR分解法 (习题 28)

在最小二乘求解 $\min \|A_\epsilon \mathbf{x} - \mathbf{b}\|_2$ 中，若 $A_\epsilon = \begin{bmatrix} 1 & 1 \\ 1 & 1+\epsilon \\ 1 & 1-\epsilon \end{bmatrix}$，其中 $0 < \epsilon \ll 1$：

  

#### 1. 证明正规方程法会导致病态加重

##### 【证明】

计算 $A_\epsilon^T A_\epsilon$ 矩阵：

$$A_\epsilon^T A_\epsilon = \begin{bmatrix} 1 & 1 & 1 \\ 1 & 1+\epsilon & 1-\epsilon \end{bmatrix} \begin{bmatrix} 1 & 1 \\ 1 & 1+\epsilon \\ 1 & 1-\epsilon \end{bmatrix} = \begin{bmatrix} 3 & 3 \\ 3 & 3 + 2\epsilon^2 \end{bmatrix}$$

计算两列的线性相关性：由于当 $\epsilon \to 0$ 时，第二列逼近第一列，两列高度线性相关。

根据谱条件数平方性质：

$$\kappa_2(A_\epsilon^T A_\epsilon) = \kappa_2(A_\epsilon)^2$$

例如若 $\kappa_2(A_\epsilon) \approx 10^4$，则正规方程矩阵的条件数骤增至 $\kappa_2(A_\epsilon^T A_\epsilon) \approx 10^8$。在计算机浮点数运算中，这会导致有效精度的双倍流失。

  

#### 2. QR分解的优越性分析

若采用薄 QR 分解，则正规方程等价转为：

$$R\mathbf{x} = Q^T \mathbf{b}$$

由于其对应的系数矩阵为上三角矩阵 $R$，且由定理 7.2 已知其条件数不发生退化：

$$\kappa_2(R) = \kappa_2(A_\epsilon)$$

由于未采用自乘，求解系统避免了病态性的平方级恶化，在数值计算上具有更佳的后向稳定性。

  

---

  

# 附录：核心公式速查指南 (Cheat Sheet)

  

### 1. 向量数范与矩阵范数不等式

*   $\|A\|_2 \leq \sqrt{\|A\|_1 \|A\|_\infty}$

*   $\|A\|_2 \leq \|A\|_F \leq \|A\|_*$

*   若 $\text{rank}(A)=r$，则 $\|A\|_F \leq \sqrt{r} \|A\|_2$

  

### 2. 常用梯度公式（无约束）

*   $\nabla_{\mathbf{x}} (\mathbf{a}^T \mathbf{x}) = \mathbf{a}$

*   $\nabla_{\mathbf{x}} (\mathbf{x}^T A \mathbf{x}) = (A + A^T)\mathbf{x}$

*   $\nabla_X \text{tr}(AX) = A^T$

*   $\nabla_X \text{tr}(AXB) = A^T B^T$

*   $\nabla_X \text{tr}(X^T A X) = (A + A^T)X$

*   $\nabla_X \text{tr}(AX^{-1}B) = -X^{-T} A^T B^T X^{-T}$

*   $\nabla_X \det(X) = \det(X)X^{-T}$

  

### 3. 对称约束梯度（对称化投影）

*   $\nabla_{X_{\text{sym}}} f(X) = \frac{\nabla_X f + (\nabla_X f)^T}{2}$

*   $\nabla_{X_{\text{sym}}} \ln(\det(X)) = X^{-1}$
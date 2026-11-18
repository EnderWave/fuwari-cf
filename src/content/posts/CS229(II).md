---
title: CS229 · 笔记（二） · 核方法与支持向量机
published: 2026-10-10
tags:
  - CS229
  - 核方法
  - 支持向量机
  - 凸优化
  - SMO算法
category: 机器学习
draft: false
description: 特征映射与维数灾难、LMS 中的核技巧（Kernel Trick）与对偶表示、多项式核与高斯核、Mercer 定理正定性证明、函数间隔与几何间隔、最大间隔分类器、拉格朗日对偶与 KKT 互补松弛条件、软间隔 SVM 以及坐标上升与 SMO 序列最小优化算法，附全章推导与折叠解答。
---

## 导读

在第一篇笔记（第 1–4 章）中，我们学习了线性回归与逻辑回归。然而，真实世界的数据往往是高度非线性的（例如房价随面积呈三次多项式曲线变化，或者正负样本在二维平面上呈同心圆分布）。如果我们直接显式构造高阶多项式特征 $\phi(x)$，当原始特征维度 $d = 1000$ 时，仅仅三次多项式特征的维度就会爆炸到 $p \approx d^3 = 10^9$！

本篇讨论核方法与支持向量机，内容包括以下几个部分：

1. **核技巧（The Kernel Trick, 第 5 章）**：利用数学归纳法证明梯度下降参数始终位于训练样本特征张成的 $n$ 维子空间 $\theta = \sum_{i=1}^n \beta_i \phi(x^{(i)})$ 中，通过将内积折叠为核函数 $K(x, z) = \langle \phi(x), \phi(z) \rangle$，把每次迭代复杂度从 $O(d^k)$ 降低到 $O(d)$，并用 **Mercer 定理**严格刻画合法核函数的对称半正定充要条件。

2. **支持向量机与拉格朗日对偶（SVM & Lagrange Duality, 第 6.1–6.7 节）**：从分类置信度与超平面正交投影出发，严格区分**函数间隔（Functional Margin）**与**几何间隔（Geometric Margin）**；通过尺度归一化 $\hat{\gamma} = 1$ 将非凸几何间隔最大化化归为凸二次规划（QP）；借助**广义拉格朗日函数与 KKT 互补松弛条件**导出仅依赖样本内积的 **SVM 对偶问题**，解释为什么绝大多数样本系数 $\alpha_i^* = 0$（仅支持向量非零），并通过引入松弛变量 $\xi_i$ 导出盒式约束 $0 \le \alpha_i \le C$ 的**软间隔 SVM**。

3. **坐标上升与 SMO 算法（第 6.8 节）**：剖析为什么等式约束 $\sum_{i=1}^n \alpha_i y^{(i)} = 0$ 锁死了单变量坐标上升，并一步步推导出 John Platt 的 **SMO（序列最小优化）算法**——每次联合更新两个乘子 $(\alpha_1, \alpha_2)$ 的闭式二次极值、盒式截断区间 $[L, H]$ 与阈值 $b$ 更新法则。

---

:::tip[学习重点]

- 理解特征内积如何转换为核函数。
- 区分间隔、对偶变量与 KKT 条件，跟踪 SMO 的约束。

:::

## 一、第 5 章：核方法 (Kernel Methods)

### 5.1–5.2 特征映射 (Feature Maps) 与高维算力瓶颈

回顾第 1 章的房价预测问题：如果房价 $y$ 与居住面积 $x \in \mathbb{R}$ 呈三次多项式关系 $y = \theta_3 x^3 + \theta_2 x^2 + \theta_1 x + \theta_0$，我们无需发明新的非线性回归算法，只需定义一个将一维标量映射为四维向量的**特征映射（Feature Map）** $\phi : \mathbb{R} \to \mathbb{R}^4$：

$$

\phi(x) = \begin{bmatrix} 1 \\ x \\ x^2 \\ x^3 \end{bmatrix} \in \mathbb{R}^4 \tag{5.1}

$$

令参数向量为 $\theta = [\theta_0, \theta_1, \theta_2, \theta_3]^T \in \mathbb{R}^4$，则三次多项式立刻表示为特征变量 $\phi(x)$ 上的标准线性函数：$\theta_3 x^3 + \theta_2 x^2 + \theta_1 x + \theta_0 = \theta^T \phi(x)$。

在核方法的术语体系中，我们将原始输入 $x \in \mathbb{R}^d$ 称为问题的**输入属性（Input Attributes）**，而将映射后的新向量 $\phi(x) \in \mathbb{R}^p$ 称为**特征变量（Feature Variables）**。

将第 1 章普通最小二乘（LMS）批量梯度下降更新式 $\theta := \theta + \alpha \sum_{i=1}^n (y^{(i)} - \theta^T x^{(i)}) x^{(i)}$（式 5.2）中的所有 $x^{(i)}$ 替换为 $\phi(x^{(i)}) \in \mathbb{R}^p$，即可得到特征空间 $\mathbb{R}^p$ 中的**批量梯度下降更新规则（式 5.3）**与**随机梯度下降更新规则（式 5.4）**：

$$

\begin{aligned}

\text{Batch GD:} \quad \theta &:= \theta + \alpha \sum_{i=1}^n \left( y^{(i)} - \theta^T \phi(x^{(i)}) \right) \phi(x^{(i)}) \qquad \text{(5.3)} \\

\text{Stochastic GD:} \quad \theta &:= \theta + \alpha \left( y^{(i)} - \theta^T \phi(x^{(i)}) \right) \phi(x^{(i)}) \qquad \text{(5.4)}

\end{aligned}

$$

---

### 5.3 LMS 中的核技巧 (LMS with the Kernel Trick)

当输入属性 $x \in \mathbb{R}^d$ 维度很高时，直接运行式 $(5.3)$ 或 $(5.4)$ 会遭遇灾难性的计算与存储瓶颈！

例如，将式 $(5.1)$ 推广到 $d$ 维输入 $x \in \mathbb{R}^d$：令 $\phi(x)$ 包含 $x$ 的所有次数不超过 $3$ 的单项式（Monomials，允许下标重复排列，见 Footnote 1 与式 5.5）：

$$

\phi(x) = \left[ 1, \ x_1, \dots, x_d, \ x_1^2, x_1 x_2, \dots, x_d^2, \ x_1^3, x_1^2 x_2, \dots, x_d^3 \right]^T \in \mathbb{R}^{1 + d + d^2 + d^3} \tag{5.5}

$$

此时特征维度为 $p = 1 + d + d^2 + d^3 = \Theta(d^3)$。如果原始维度 $d = 1000$，那么 $p \approx 1000^3 = 10^9$（十亿维）！每次梯度更新光是存储和遍历一遍向量 $\theta \in \mathbb{R}^p$ 就需要 $10^9$ 次浮点运算，比普通线性回归慢了整整 $10^6$ 倍！

**如何打破 $O(p)$ 的维度诅咒，在不显式构造和存储 $p$ 维向量 $\theta$ 与 $\phi(x)$ 的前提下完成训练与预测？** 下面我们分三步完成**核技巧（The Kernel Trick）**的严密推导：

#### 第一步：数学归纳法证明 $\theta$ 的对偶表示 (Equations 5.6–5.7)

假设我们将参数初始化为零向量 $\theta = 0 \in \mathbb{R}^p$，并运行批量梯度下降 $(5.3)$。我们断言：**在任意迭代步 $t \ge 0$，高维参数向量 $\theta \in \mathbb{R}^p$ 恒可表示为 $n$ 个训练样本特征向量 $\phi(x^{(1)}), \dots, \phi(x^{(n)})$ 的线性组合**：

$$

\theta = \sum_{i=1}^n \beta_i \phi(x^{(i)}) \tag{5.6}

$$

其中 $\beta = (\beta_1, \dots, \beta_n)^T \in \mathbb{R}^n$ 是仅与样本数 $n$ 等长的对偶系数向量。

- **归纳奠基（初始化）**：当 $\theta = 0$ 时，取 $\beta_1 = \dots = \beta_n = 0$，显然有 $\theta = \sum_{i=1}^n 0 \cdot \phi(x^{(i)})$ 成立。

- **归纳递推**：假设在当前步 $\theta = \sum_{i=1}^n \beta_i \phi(x^{(i)})$ 成立。代入下一轮更新式 $(5.3)$：

$$

\begin{aligned}

\theta &:= \theta + \alpha \sum_{i=1}^n \left( y^{(i)} - \theta^T \phi(x^{(i)}) \right) \phi(x^{(i)}) \\

&= \sum_{i=1}^n \beta_i \phi(x^{(i)}) + \alpha \sum_{i=1}^n \left( y^{(i)} - \theta^T \phi(x^{(i)}) \right) \phi(x^{(i)}) \\

&= \sum_{i=1}^n \underbrace{\left( \beta_i + \alpha \left( y^{(i)} - \theta^T \phi(x^{(i)}) \right) \right)}_{\text{新的对偶系数 } \beta_i} \phi(x^{(i)}) \tag{5.7}

\end{aligned}

$$

归纳法证毕！这表明我们根本不需要在内存中维护 $p$ 维向量 $\theta$，只需维护 **$n$ 维系数向量 $\beta = (\beta_1, \dots, \beta_n)^T \in \mathbb{R}^n$**！

#### 第二步：将更新规则与内积折叠为核函数 $K(x, z)$ (Equations 5.8–5.10)

由式 $(5.7)$，新旧对偶系数 $\beta_i$ 的更新关系为 $\beta_i := \beta_i + \alpha (y^{(i)} - \theta^T \phi(x^{(i)}))$（式 5.8）。将 $\theta = \sum_{j=1}^n \beta_j \phi(x^{(j)})$ 代入右端的内积项，消去 $\theta$：

$$

\forall i \in \{1, \dots, n\}, \qquad \beta_i := \beta_i + \alpha \left( y^{(i)} - \sum_{j=1}^n \beta_j \left\langle \phi(x^{(j)}), \phi(x^{(i)}) \right\rangle \right)

$$

表面上看，计算两个 $p \approx d^3$ 维向量的内积 $\langle \phi(x), \phi(z) \rangle = \phi(x)^T \phi(z)$ 似乎仍需 $O(d^3)$ 时间。但对于式 $(5.5)$ 的三次多项式特征映射，我们可以利用乘法分配律将求和号因式分解（式 5.9）：

$$

\begin{aligned}

\langle \phi(x), \phi(z) \rangle &= 1 + \sum_{i=1}^d x_i z_i + \sum_{i, j \in \{1, \dots, d\}} x_i x_j z_i z_j + \sum_{i, j, k \in \{1, \dots, d\}} x_i x_j x_k z_i z_j z_k \\

&= 1 + \left(\sum_{i=1}^d x_i z_i\right) + \left(\sum_{i=1}^d x_i z_i\right)^2 + \left(\sum_{i=1}^d x_i z_i\right)^3 \\

&= 1 + \langle x, z \rangle + \langle x, z \rangle^2 + \langle x, z \rangle^3 \tag{5.9}

\end{aligned}

$$

**奇迹发生了**！要计算十亿维特征向量的内积 $\langle \phi(x), \phi(z) \rangle$，我们根本不需要构造 $\phi(x)$ 和 $\phi(z)$，只需先花 **$O(d)$ 时间**算出原始 $d$ 维内积 $\langle x, z \rangle = x^T z$，再做两次标量平方/立方加法（$O(1)$ 时间）即可！

为此，我们正式定义特征映射 $\phi$ 所诱导的**核函数（Kernel Function）** $K : \mathcal{X} \times \mathcal{X} \to \mathbb{R}$：

$$

K(x, z) \triangleq \langle \phi(x), \phi(z) \rangle = \phi(x)^T \phi(z) \tag{5.10}

$$

#### 第三步：核化 LMS 完整算法与 $O(nd)$ 测试预测 (Equations 5.11–5.12)

将式 $(5.10)$ 代入训练循环与测试预测，得到全程不接触 $\phi(x)$ 的**核化 LMS 算法**：

:::important[算法 5.3：基于核技巧的 LMS 算法 (Kernelized LMS)]

1. **预计算核矩阵（Gram Matrix）**：在迭代开始前，花 $O(n^2 d)$ 时间计算所有训练样本对之间的核矩阵 $K \in \mathbb{R}^{n \times n}$，其中 $K_{ij} = K(x^{(i)}, x^{(j)}) \triangleq \langle \phi(x^{(i)}), \phi(x^{(j)}) \rangle$。初始化对偶向量 $\beta := 0 \in \mathbb{R}^n$。

2. **迭代更新 $\beta$**：在每轮循环中，按如下公式更新 $\beta$（每个分量耗时 $O(n)$，全向量耗时 $O(n^2)$，完全独立于特征空间维度 $p$！）：

$$

\forall i \in \{1, \dots, n\}, \quad \beta_i := \beta_i + \alpha \left( y^{(i)} - \sum_{j=1}^n \beta_j K\left(x^{(i)}, x^{(j)}\right) \right) \iff \beta := \beta + \alpha \left(\ec{y} - K \beta\right) \tag{5.11}

$$

3. **测试预测**：给定任意新测试样本 $x$，无需恢复 $\theta$，直接用 $\beta$ 和核函数在 $O(nd)$ 时间内算出预测值：

$$

\theta^T \phi(x) = \sum_{i=1}^n \beta_i \phi(x^{(i)})^T \phi(x) = \sum_{i=1}^n \beta_i K\left(x^{(i)}, x\right) \tag{5.12}

$$

:::

---

### 5.4 核函数的性质、经典实例与 Mercer 定理 (Properties of Kernels)

既然整个训练和预测过程只需要调用二元函数 $K(x, z)$，我们就可以徹底颠覆建模流程：**不再手工设计特征映射 $\phi(x)$，而是直接根据领域知识设计衡量 $x$ 与 $z$ 相似度的核函数 $K(x, z)$！**

#### 1. 四大经典核函数剖析

1. **齐次二次与 $k$ 次多项式核 $K(x, z) = (x^T z)^k$**：

   当 $k = 2, \ d = 3$ 时，展开 $K(x, z) = \left(\sum_{i=1}^3 x_i z_i\right)\left(\sum_{j=1}^3 x_j z_j\right) = \sum_{i, j=1}^3 (x_i x_j)(z_i z_j)$，对应的显式特征映射为 $9$ 维向量 $\phi(x) = [x_1 x_1, x_1 x_2, x_1 x_3, x_2 x_1, x_2 x_2, x_2 x_3, x_3 x_1, x_3 x_2, x_3 x_3]^T \in \mathbb{R}^{d^2}$。

2. **非齐次多项式核 $K(x, z) = (x^T z + c)^k \ (c > 0)$**：

   当 $k = 2, \ d = 3$ 时，展开得：

   $$

   K(x, z) = (x^T z + c)^2 = \sum_{i, j=1}^d (x_i x_j)(z_i z_j) + \sum_{i=1}^d \left(\sqrt{2c} \, x_i\right)\left(\sqrt{2c} \, z_i\right) + c^2

   $$

   对应的特征映射为 $\phi(x) = \left[x_1^2, x_1 x_2, \dots, x_3^2, \ \sqrt{2c}x_1, \sqrt{2c}x_2, \sqrt{2c}x_3, \ c\right]^T \in \mathbb{R}^{d^2 + d + 1}$，其中常数 $c$ 控制一阶项 $x_i$ 与二阶交叉项 $x_i x_j$ 之间的相对权重！对于一般阶数 $k$，$K(x, z) = (x^T z + c)^k$ 对应包含所有阶数 $\le k$ 的单项式特征空间（不计重复排列时维度为 $\binom{d+k}{k} = O(d^k)$），但计算 $K(x, z)$ 永远只需 **$O(d)$ 时间**！

3. **高斯径向基核（Gaussian RBF Kernel）**：

   $$

   K(x, z) = \exp\left( -\frac{\|x - z\|_2^2}{2\sigma^2} \right)

   $$

   当 $x$ 与 $z$ 重合时 $K(x, z) = 1$；当 $\|x - z\|_2 \to \infty$ 时 $K(x, z) \to 0$。通过将 $\exp\left(\frac{x^T z}{\sigma^2}\right) = \sum_{k=0}^\infty \frac{1}{k! \sigma^{2k}} (x^T z)^k$ 展开为泰勒无穷级数可知，高斯核对应一个**无穷维（Infinite-Dimensional, $p = \infty$）**的特征映射 $\phi(x)$！

4. **蛋白质/文本子串核（String Substring Kernel，讲义第 58 页实例）**：

   假设输入 $x$ 是变长的氨基酸序列或英文字符串，我们令特征向量 $\phi(x) \in \mathbb{R}^{26^k}$ 统计所有长度为 $k$ 的子串在 $x$ 中出现的次数。即使 $k=4$，特征维度也高达 $26^4 \approx 460,000$。但利用动态规划（Dynamic Programming）字符串匹配算法，我们可以高效算出内积 $K(x, z) = \phi(x)^T \phi(z)$，从而在 $26^k$ 维空间中隐式完成分类！

#### 2. 什么样的函数 $K(x, z)$ 才是合法核函数？Mercer 定理证明

并非随便写一个相似度函数都能表示为内积 $\phi(x)^T \phi(z)$。怎么判断是否存在对应的特征映射 $\phi$？

**必要性推导（Necessary Condition）**：

假设 $K$ 是合法核函数，即存在某个 $\phi$ 使得 $K(x, z) = \phi(x)^T \phi(z)$。任取有限个点 $\left\{x^{(1)}, \dots, x^{(n)}\right\}$，构造 $n \times n$ 核矩阵 $K_{ij} = K(x^{(i)}, x^{(j)})$：

1. **对称性（Symmetry）**：$K_{ij} = \phi(x^{(i)})^T \phi(x^{(j)}) = \phi(x^{(j)})^T \phi(x^{(i)}) = K_{ji}$；

2. **半正定性（Positie Semi-Definiteness, $K \succeq 0$）**：对任意实向量 $z \in \mathbb{R}^n$，设 $\phi_k(x)$ 为 $\phi(x)$ 的第 $k$ 个坐标分量，交换求和顺序并利用完全平方公式 $\sum_{i, j} a_i a_j = \left(\sum_i a_i\right)^2$：

$$

\begin{aligned}

z^T K z &= \sum_{i=1}^n \sum_{j=1}^n z_i K_{ij} z_j = \sum_{i=1}^n \sum_{j=1}^n z_i \phi(x^{(i)})^T \phi(x^{(j)}) z_j \\

&= \sum_{i=1}^n \sum_{j=1}^n z_i \left( \sum_k \phi_k(x^{(i)}) \phi_k(x^{(j)}) \right) z_j \\

&= \sum_k \sum_{i=1}^n \sum_{j=1}^n z_i \phi_k(x^{(i)}) \phi_k(x^{(j)}) z_j \\

&= \sum_k \left( \sum_{i=1}^n z_i \phi_k(x^{(i)}) \right)^2 \ge 0

\end{aligned}

$$

由于 $z \in \mathbb{R}^n$ 是任意的，这证明了核矩阵 $K$ 必然是**对称半正定矩阵（$K \succeq 0$）**！Mercer 定理指出，这一条件不仅是必要的，而且是**充分的**：

:::important[定理 5.4.1 (Mercer 定理, Mercer's Theorem)]

给定函数 $K : \mathbb{R}^d \times \mathbb{R}^d \mapsto \mathbb{R}$。$K$ 是一个合法核函数（即存在特征映射 $\phi$ 使得对一切 $x, z$ 有 $K(x, z) = \phi(x)^T \phi(z)$，又称 **Mercer 核**）的**充要条件（Necessary and Sufficient Condition）**是：

对于任意有限个输入点集合 $\left\{x^{(1)}, x^{(2)}, \dots, x^{(n)}\right\} \ (n < \infty)$，其对应的 $n \times n$ 核矩阵 $K_{ij} = K(x^{(i)}, x^{(j)})$ 都是**对称半正定矩阵**！

:::

---

## 二、第 6 章：支持向量机 (Support Vector Machines, SVMs)

### 6.1–6.3 间隔直观、符号约定、函数间隔与几何间隔

#### 1. 间隔的两大直观来源 (Section 6.1)

1. **逻辑回归的概率置信度视角**：在逻辑回归中，$h_\theta(x) = g(\theta^T x) \ge 0.5 \iff \theta^T x \ge 0$。当 $y^{(i)} = 1$ 时，$\theta^T x^{(i)} \gg 0$ 越大，预测概率 $h_\theta(x^{(i)})$ 越接近 $1$，分类越有把握（Confident）；当 $y^{(i)} = 0$ 时，$\theta^T x^{(i)} \ll 0$ 越负越有把握。这启发我们寻找参数使所有样本都具有巨大的**函数间隔**。

2. **分界超平面的欧氏几何距离视角**：观察讲义第 61 页图中正类点 $A, B, C$ 到分界超平面 $\theta^T x = 0$ 的空间距离——点 $A$ 远离分界面，决策极其稳健；点 $C$ 紧贴分界面，超平面稍微抖动就会使 $C$ 的预测结果翻转。这启发我们寻找一条能以**最宽的几何隔离带（Gap）**分开正负样本的超平面！

#### 2. SVM 专用符号约定 (Section 6.2)

为了直接体现超平面几何，第 6 章对二分类符号作如下调整：

- **类别标签取值**：令 **$y \in \{-1, +1\}$**（代替 $\{0, 1\}$）；

- **显式分离法向量 $w$ 与截距 $b$**：不再填充 $x_0 = 1$，将线性分类器写为：

$$

h_{w, b}(x) = g(w^T x + b), \qquad \text{其中 } g(z) = \begin{cases} +1, & \text{若 } z \ge 0 \\ -1, & \text{若 } z < 0 \end{cases}

$$

这里 $w \in \mathbb{R}^d$ 是分界超平面 $w^T x + b = 0$ 的法向量，$b \in \mathbb{R}$ 是截距标量。

#### 3. 函数间隔与几何间隔的严格定义及正交投影推导 (Section 6.3)

- **函数间隔（Functional Margin）**：

  给定单个训练样本 $(x^{(i)}, y^{(i)})$，定义 $(w, b)$ 关于该样本的函数间隔为：

  $$

  \hat{\gamma}^{(i)} \triangleq y^{(i)} \left( w^T x^{(i)} + b \right)

  $$

  当 $y^{(i)} = +1$ 时需 $w^T x^{(i)} + b \gg 0$，当 $y^{(i)} = -1$ 时需 $w^T x^{(i)} + b \ll 0$，故 $\hat{\gamma}^{(i)} > 0 \iff$ 分类正确，且数值越大代表越自信。定义整批训练集 $S$ 的函数间隔为所有样本中的最小值：

  $$

  \hat{\gamma} \triangleq \min_{i = 1, \dots, n} \hat{\gamma}^{(i)}

  $$

  *致命缺陷（缺乏尺度不变性）*：如果把参数同乘以 $2$ 变为 $(2w, 2b)$，由于 $g(2w^T x + 2b) = g(w^T x + b)$，分界超平面 $w^T x + b = 0$ 和分类器行为**分毫未变**，但函数间隔 $\hat{\gamma}^{(i)}$ 却平白无故翻了 2 倍！

- **几何间隔（Geometric Margin）的正交投影几何推导（讲义第 63–64 页图）**：

  设点 $A$ 代表某个正样本 $x^{(i)}$（$y^{(i)} = +1$），它到分界超平面 $w^T x + b = 0$ 的垂直欧氏距离为 $\gamma^{(i)}$，垂足为超平面上的点 $B$。怎么求 $\gamma^{(i)}$？

  注意到法向量 $w$ 垂直于超平面，其单位方向向量为 $\frac{w}{\|w\|_2}$。从点 $A(x^{(i)})$ 沿着反法向 $-\frac{w}{\|w\|_2}$ 走距离 $\gamma^{(i)}$ 即可到达垂足点 $B$，故点 $B$ 的坐标为：

  $$

  x_B = x^{(i)} - \gamma^{(i)} \frac{w}{\|w\|_2}

  $$

  因为垂足 $B$ 位于分界超平面 $w^T x + b = 0$ 上，将 $x_B$ 代入超平面方程：

  $$

  w^T \left( x^{(i)} - \gamma^{(i)} \frac{w}{\|w\|_2} \right) + b = 0 \implies w^T x^{(i)} - \gamma^{(i)} \frac{w^T w}{\|w\|_2} + b = 0

  $$

  利用 $w^T w = \|w\|_2^2$，解出距离 $\gamma^{(i)} = \frac{w^T x^{(i)} + b}{\|w\|_2}$！结合负类样本情形（乘上符号 $y^{(i)} \in \{-1, +1\}$），正式定义单样本与全训练集 $S$ 的**几何间隔**：

  $$

  \gamma^{(i)} \triangleq y^{(i)} \left( \left(\frac{w}{\|w\|_2}\right)^T x^{(i)} + \frac{b}{\|w\|_2} \right) = \frac{\hat{\gamma}^{(i)}}{\|w\|_2}, \qquad \gamma \triangleq \min_{i = 1, \dots, n} \gamma^{(i)} = \frac{\hat{\gamma}}{\|w\|_2}

  $$

  - **关键性质**：(1) 当 $\|w\|_2 = 1$ 时，函数间隔等于几何间隔；(2) **几何间隔具有完美的缩放不变性**：将 $(w, b)$ 替换为 $(\alpha w, \alpha b) \ (\alpha > 0)$，分子分母中的 $\alpha$ 精确约去，$\gamma^{(i)}$ 完全不变！正是这一缩放自由度允许我们在下一节任意固定函数间隔的尺度。

---

### 6.4 最优间隔分类器 (The Optimal Margin Classifier)：三步化归为凸二次规划

假设训练集线性可分，我们的目标是寻找使训练集几何间隔 $\gamma$ 最大的超平面 $(w, b)$。观察讲义第 65–66 页教科书级的**三步等价化归**：

1. **第一步（原始几何表述，含非凸球面约束）**：

   $$

   \max_{\gamma, w, b} \ \gamma \qquad \text{s.t.} \quad y^{(i)}(w^T x^{(i)} + b) \ge \gamma \ (i = 1, \dots, n), \quad \|w\|_2 = 1

   $$

   *障碍*：单位球面约束 $\|w\|_2 = 1$ 是一个**非凸集合**，无法直接用凸优化求解器求解。

2. **第二步（消去 $\|w\|_2 = 1$，含非凸分式目标）**：

   用关系式 $\gamma = \frac{\hat{\gamma}}{\|w\|_2}$ 替换目标函数：

   $$

   \max_{\hat{\gamma}, w, b} \ \frac{\hat{\gamma}}{\|w\|_2} \qquad \text{s.t.} \quad y^{(i)}(w^T x^{(i)} + b) \ge \hat{\gamma} \ (i = 1, \dots, n)

   $$

   *障碍*：虽然去掉了 $\|w\|_2 = 1$，但目标函数 $\frac{\hat{\gamma}}{\|w\|_2}$ 是**非凸函数**！

3. **第三步（利用缩放不变性锁定 $\hat{\gamma} = 1$，化为标准凸二次规划 QP！）**：

   既然几何间隔对 $(w, b)$ 的正数倍缩放完全不变，我们直接施加尺度归一化约束：**强制令训练集上的最小函数间隔等于 $1$，即 $\hat{\gamma} = 1$**！

   此时最大化 $\frac{\hat{\gamma}}{\|w\|_2} = \frac{1}{\|w\|_2}$ 完全等价于最小化 $\|w\|_2$，进而等价于最小化光滑凸二次函数 $\frac{1}{2}\|w\|_2^2$！于是我们得到**硬间隔 SVM 的原始凸二次规划问题（Primal Problem, Equation 6.8）**：

   $$

   \begin{aligned}

   \min_{w, b} \quad &\frac{1}{2} \|w\|_2^2 \tag{6.8} \\

   \text{s.t.} \quad &y^{(i)}\left(w^T x^{(i)} + b\right) \ge 1, \qquad i = 1, \dots, n

   \end{aligned}

   $$

   目标函数是严格凸二次函数，约束全是线性不等式，具有全局唯一最优解！

---

### 6.5 拉格朗日对偶与 KKT 条件 (Lagrange Duality & KKT Conditions)

为了给 SVM 注入核技巧并导出极速 SMO 算法，我们需要建立一般约束优化问题的**拉格朗日对偶理论（Lagrange Duality）**。

考虑同时包含不等式约束与等式约束的**原始优化问题（Primal Optimization Problem）**：

$$

\begin{aligned}

\min_w \quad &f(w) \\

\text{s.t.} \quad &g_i(w) \le 0, \qquad i = 1, \dots, k \\

&h_i(w) = 0, \qquad i = 1, \dots, l

\end{aligned}

$$

引入非负拉格朗日乘子向量 $\alpha = (\alpha_1, \dots, \alpha_k)^T \ge 0$ 与无符号限制乘子向量 $\beta = (\beta_1, \dots, \beta_l)^T$，定义**广义拉格朗日函数（Generalized Lagrangian）**：

$$

\mathcal{L}(w, \alpha, \beta) = f(w) + \sum_{i=1}^k \alpha_i g_i(w) + \sum_{i=1}^l \beta_i h_i(w)

$$

#### 1. 原始问题 $\theta_{\mathcal{P}}(w)$ 与对偶问题 $\theta_{\mathcal{D}}(\alpha, \beta)$

- **原始函数 $\theta_{\mathcal{P}}(w)$**：定义

$$

\theta_{\mathcal{P}}(w) \triangleq \max_{\alpha, \beta : \, \alpha_i \ge 0} \mathcal{L}(w, \alpha, \beta) \tag{6.1}

$$

  - 若给定的 $w$ **违反了任何一个原始约束**（例如存在某个 $g_i(w) > 0$，则令对应的 $\alpha_i \to +\infty$；若存在某个 $h_i(w) \neq 0$，则令 $\beta_i$ 取同号无穷大），则 $\theta_{\mathcal{P}}(w) = +\infty$（式 6.2）；

  - 若 $w$ **满足所有原始约束**（即一切 $g_i(w) \le 0$ 且 $h_i(w) = 0$），由于 $\alpha_i \ge 0$，必有 $\sum_{i=1}^k \alpha_i g_i(w) \le 0$，最大值在 $\alpha_i g_i(w) = 0$ 处取到，此时 $\theta_{\mathcal{P}}(w) = f(w)$！

  - 因此，$\theta_{\mathcal{P}}(w) = \begin{cases} f(w), & \text{若 } w \text{ 满足所有原始约束} \\ +\infty, & \text{其他} \end{cases}$，极小化 $\theta_{\mathcal{P}}(w)$ 与原始问题完全等价，记原始最优值为 $p^* = \min_w \theta_{\mathcal{P}}(w) = \min_w \max_{\alpha, \beta : \alpha_i \ge 0} \mathcal{L}(w, \alpha, \beta)$。

- **对偶函数 $\theta_{\mathcal{D}}(\alpha, \beta)$ 与对偶问题**：将 $\min$ 与 $\max$ 的顺序对调，定义 $\theta_{\mathcal{D}}(\alpha, \beta) \triangleq \min_w \mathcal{L}(w, \alpha, \beta)$，则**对偶优化问题（Dual Optimization Problem）**及其最优值 $d^*$ 为：

$$

d^* = \max_{\alpha, \beta : \, \alpha_i \ge 0} \theta_{\mathcal{D}}(\alpha, \beta) = \max_{\alpha, \beta : \, \alpha_i \ge 0} \min_w \mathcal{L}(w, \alpha, \beta)

$$

- **弱对偶性（Weak Duality）**：对任意二元函数，“最大值的最小值”恒不大于“最小值的最大值”（因为对任意固定的 $w_0, \alpha_0, \beta_0$，恒有 $\min_w \mathcal{L}(w, \alpha_0, \beta_0) \le \mathcal{L}(w_0, \alpha_0, \beta_0) \le \max_{\alpha \ge 0, \beta} \mathcal{L}(w_0, \alpha, \beta)$），故恒有：

$$

d^* = \max_{\alpha, \beta : \, \alpha_i \ge 0} \min_w \mathcal{L}(w, \alpha, \beta) \le \min_w \max_{\alpha, \beta : \, \alpha_i \ge 0} \mathcal{L}(w, \alpha, \beta) = p^*

$$

#### 2. 强对偶定理 (Slater 条件) 与 KKT 充要条件 (Equations 6.3–6.7)

:::important[定理 6.5.1 (强对偶性与 Karush-Kuhn-Tucker (KKT) 充要条件)]

设目标函数 $f$ 与不等式约束函数 $g_1, \dots, g_k$ 均为**凸函数**（当二阶可微时即 Hessian 半正定），等式约束函数 $h_1, \dots, h_l$ 均为**仿射函数**（即 $h_i(w) = a_i^T w + b_i$），且不等式约束满足**严格可行性条件（Slater's Condition：存在至少一个点 $w$ 使得对所有 $i$ 严格成立 $g_i(w) < 0$）**。

则必存在最优解 $w^*, \alpha^*, \beta^*$ 使得**强对偶成立 $p^* = d^* = \mathcal{L}(w^*, \alpha^*, \beta^*)$**，且 $(w^*, \alpha^*, \beta^*)$ 分别为原始问题与对偶问题的全局最优解**当且仅当**它们同时满足以下五条 **KKT 条件**：

$$

\begin{aligned}

\frac{\partial}{\partial w_i} \mathcal{L}(w^*, \alpha^*, \beta^*) &= 0, \qquad i = 1, \dots, d \qquad &&\text{(6.3 拉格朗日一阶驻点条件)} \\

\frac{\partial}{\partial \beta_i} \mathcal{L}(w^*, \alpha^*, \beta^*) &= 0, \qquad i = 1, \dots, l \qquad &&\text{(6.4 原始等式约束可行性 } h_i(w^*) = 0\text{)} \\

\alpha_i^* g_i(w^*) &= 0, \qquad i = 1, \dots, k \qquad &&\text{(6.5 KKT 对偶互补松弛条件 Dual Complementarity)} \\

g_i(w^*) &\le 0, \qquad i = 1, \dots, k \qquad &&\text{(6.6 原始不等式约束可行性)} \\

\alpha_i^* &\ge 0, \qquad i = 1, \dots, k \qquad &&\text{(6.7 对偶乘子非负可行性)}

\end{aligned}

$$

**式 $(6.5)$ KKT 对偶互补松弛条件的深远意义**：因为 $\alpha_i^* \ge 0$ 且 $g_i(w^*) \le 0$，两数之积为 $0$ 意味着：**只要 $\alpha_i^* > 0$，就必然有 $g_i(w^*) = 0$（即第 $i$ 条不等式约束取到等号，处于紧激活状态 Actie）**；反之，只要 $g_i(w^*) < 0$（非紧约束），就必然有 $\alpha_i^* = 0$！

:::

---

### 6.6 最优间隔分类器的对偶形式与支持向量 (The Dual Form)

现在我们将第 6.5 节的对偶武器应用到 SVM 原始问题 $(6.8)$ 上。将第 $i$ 个样本的不等式约束改写为标准形式：

$$

g_i(w, b) = -y^{(i)}\left(w^T x^{(i)} + b\right) + 1 \le 0, \qquad i = 1, \dots, n

$$

由 KKT 互补松弛条件 $\alpha_i^* g_i(w^*, b^*) = 0$ 立知：**只有那些函数间隔恰好等于 $1$（即 $y^{(i)}(w^{*T} x^{(i)} + b^*) = 1$，精确落在虚线间隔边界上、离超平面最近）的训练样本，其拉格朗日乘子才可能满足 $\alpha_i^* > 0$！这些极少数支撑起超平面的关键样本就称为支持向量（Support Vectors）**！所有远离分界面的内部样本均满足 $g_i(w^*, b^*) < 0 \implies \alpha_i^* = 0$。

#### 完整推导 SVM 对偶目标函数 $W(\alpha)$ (Equations 6.9–6.12)

引入乘子 $\alpha = (\alpha_1, \dots, \alpha_n)^T \ge 0$，写出 SVM 的拉格朗日函数（式 6.9）：

$$

\mathcal{L}(w, b, \alpha) = \frac{1}{2} \|w\|_2^2 - \sum_{i=1}^n \alpha_i \left[ y^{(i)}\left(w^T x^{(i)} + b\right) - 1 \right] \tag{6.9}

$$

为了求对偶函数 $\theta_{\mathcal{D}}(\alpha) = \min_{w, b} \mathcal{L}(w, b, \alpha)$，固定 $\alpha$，分别对 $w$ 和 $b$ 求偏导并令其等于 $0$：

1. **对权重向量 $w$ 求梯度（式 6.10）**：

$$

\nabla_w \mathcal{L}(w, b, \alpha) = w - \sum_{i=1}^n \alpha_i y^{(i)} x^{(i)} = 0 \implies w = \sum_{i=1}^n \alpha_i y^{(i)} x^{(i)} \tag{6.10}

$$

2. **对截距标量 $b$ 求偏导（式 6.11）**：

$$

\frac{\partial}{\partial b} \mathcal{L}(w, b, \alpha) = -\sum_{i=1}^n \alpha_i y^{(i)} = 0 \implies \sum_{i=1}^n \alpha_i y^{(i)} = 0 \tag{6.11}

$$

3. **代回 $\mathcal{L}(w, b, \alpha)$ 化简**：将式 $(6.10)$ 的 $w = \sum_{i=1}^n \alpha_i y^{(i)} x^{(i)}$ 代入式 $(6.9)$（注意 $\frac{1}{2} w^T w = \frac{1}{2} \sum_{i, j=1}^n \alpha_i \alpha_j y^{(i)} y^{(j)} (x^{(i)})^T x^{(j)}$，而 $-\sum_{i=1}^n \alpha_i y^{(i)} w^T x^{(i)} = -\sum_{i, j=1}^n \alpha_i \alpha_j y^{(i)} y^{(j)} (x^{(i)})^T x^{(j)}$，两项合并恰好为 $-\frac{1}{2}$ 倍！）：

$$

\begin{aligned}

\mathcal{L}(w, b, \alpha) &= \frac{1}{2} \sum_{i, j=1}^n y^{(i)} y^{(j)} \alpha_i \alpha_j (x^{(i)})^T x^{(j)} - \sum_{i, j=1}^n y^{(i)} y^{(j)} \alpha_i \alpha_j (x^{(i)})^T x^{(j)} - b \underbrace{\sum_{i=1}^n \alpha_i y^{(i)}}_{= 0 \ (\text{由式 6.11})} + \sum_{i=1}^n \alpha_i \\

&= \sum_{i=1}^n \alpha_i - \frac{1}{2} \sum_{i, j=1}^n y^{(i)} y^{(j)} \alpha_i \alpha_j \left\langle x^{(i)}, x^{(j)} \right\rangle \triangleq W(\alpha)

\end{aligned}

$$

加上约束 $\alpha_i \ge 0$ 与式 $(6.11)$，即得到**硬间隔 SVM 的对偶优化问题（Dual Problem, Equation 6.12）**：

$$

\begin{aligned}

\max_\alpha \quad &W(\alpha) = \sum_{i=1}^n \alpha_i - \frac{1}{2} \sum_{i, j=1}^n y^{(i)} y^{(j)} \alpha_i \alpha_j \left\langle x^{(i)}, x^{(j)} \right\rangle \tag{6.12} \\

\text{s.t.} \quad &\alpha_i \ge 0, \qquad i = 1, \dots, n \\

&\sum_{i=1}^n \alpha_i y^{(i)} = 0

\end{aligned}

$$

- **恢复最优原始参数 $(w^*, b^*)$**：解出对偶最优解 $\alpha^*$ 后，由式 $(6.10)$ 直接得 $w^* = \sum_{i=1}^n \alpha_i^* y^{(i)} x^{(i)}$；而最优截距 $b^*$ 由正负支持向量到超平面距离相等（即 $\min_{i : y^{(i)}=1} (w^{*T} x^{(i)} + b^*) = 1$ 且 $\max_{i : y^{(i)}=-1} (w^{*T} x^{(i)} + b^*) = -1$）直接给出（式 6.13）：

$$

b^* = -\frac{\max_{i : y^{(i)} = -1} w^{*T} x^{(i)} + \min_{i : y^{(i)} = 1} w^{*T} x^{(i)}}{2} \tag{6.13}

$$

- **核化预测与稀疏加速（Equations 6.14–6.15）**：对新测试样本 $x$，线性打分函数完全表示为与支持向量的内积（将其中的 $\langle x^{(i)}, x \rangle$ 替换为核函数 $K(x^{(i)}, x)$ 即可在无穷维空间中运行非线性 SVM！）：

$$

w^T x + b = \left(\sum_{i=1}^n \alpha_i y^{(i)} x^{(i)}\right)^T x + b = \sum_{i=1}^n \alpha_i y^{(i)} \left\langle x^{(i)}, x \right\rangle + b = \sum_{i \in \text{SV}} \alpha_i y^{(i)} K\left(x^{(i)}, x\right) + b \tag{6.14–6.15}

$$

---

### 6.7 $\ell_1$ 正则化与线性不可分软间隔 SVM (Soft-Margin SVM)

硬间隔 SVM 要求所有训练样本百分之百线性可分，且对单个离群噪声点（Outlier，见讲义第 73 页右图）极其敏感。为了同时处理线性不可分数据并增强对离群点的鲁棒性，我们为每个样本引入非负松弛变量（Slack Variable）$\xi_i \ge 0$，允许样本的函数间隔小于 $1$（即 $y^{(i)}(w^T x^{(i)} + b) \ge 1 - \xi_i$），并在目标函数中对总违规量施加系数为 $C > 0$ 的 $\ell_1$ 惩罚：

$$

\begin{aligned}

\min_{w, b, \xi} \quad &\frac{1}{2} \|w\|_2^2 + C \sum_{i=1}^n \xi_i \\

\text{s.t.} \quad &y^{(i)}\left(w^T x^{(i)} + b\right) \ge 1 - \xi_i, \qquad i = 1, \dots, n \\

&\xi_i \ge 0, \qquad i = 1, \dots, n

\end{aligned}

$$

引入对应的非负拉格朗日乘子 $\alpha_i \ge 0$ 和 $r_i \ge 0$，构造拉格朗日函数：

$$

\mathcal{L}(w, b, \xi, \alpha, r) = \frac{1}{2} w^T w + C \sum_{i=1}^n \xi_i - \sum_{i=1}^n \alpha_i \left[ y^{(i)}(x^{(i)T} w + b) - 1 + \xi_i \right] - \sum_{i=1}^n r_i \xi_i

$$

对 $w$ 和 $b$ 求偏导令其为 $0$ 依然给出式 $(6.10)$ 和 $(6.11)$；而对松弛变量 $\xi_i$ 求偏导并令其为 $0$ 得：

$$

\frac{\partial \mathcal{L}}{\partial \xi_i} = C - \alpha_i - r_i = 0 \implies r_i = C - \alpha_i

$$

将 $C - \alpha_i - r_i = 0$ 代回 $\mathcal{L}$ 后，含 $\xi_i$ 的项全部精确抵消！同时，由于乘子要求 $r_i \ge 0$，即 $C - \alpha_i \ge 0 \iff \alpha_i \le C$！

由此得到**软间隔 SVM 的对偶问题**：

$$

\begin{aligned}

\max_\alpha \quad &W(\alpha) = \sum_{i=1}^n \alpha_i - \frac{1}{2} \sum_{i, j=1}^n y^{(i)} y^{(j)} \alpha_i \alpha_j \left\langle x^{(i)}, x^{(j)} \right\rangle \\

\text{s.t.} \quad &0 \le \alpha_i \le C, \qquad i = 1, \dots, n \\

&\sum_{i=1}^n \alpha_i y^{(i)} = 0

\end{aligned}

$$

以及作为 SMO 算法收敛判据的**软间隔 KKT 对偶互补松弛条件（Equations 6.16–6.18）**：

$$

\begin{aligned}

\alpha_i = 0 &\implies y^{(i)}\left(w^T x^{(i)} + b\right) \ge 1 \qquad &&\text{（间隔边界外部的正确分类点，}\xi_i = 0\text{）} \qquad \text{(6.16)} \\

\alpha_i = C &\implies y^{(i)}\left(w^T x^{(i)} + b\right) \le 1 \qquad &&\text{（侵入间隔内部或分类错误的违规支持向量，}\xi_i \ge 0\text{）} \qquad \text{(6.17)} \\

0 < \alpha_i < C &\implies y^{(i)}\left(w^T x^{(i)} + b\right) = 1 \qquad &&\text{（恰好落在间隔边界上的自由支持向量，}\xi_i = 0\text{）} \qquad \text{(6.18)}

\end{aligned}

$$

---

### 6.8 坐标上升与 SMO 序列最小优化算法 (The SMO Algorithm)

#### 6.8.1 坐标上升法 (Coordinate Ascent)

对于无约束优化问题 $\max_\alpha W(\alpha_1, \dots, \alpha_n)$，**坐标上升法**在每次内层循环中固定除 $\alpha_i$ 以外的其余 $n-1$ 个变量，仅关于单变量 $\hat{\alpha}_i$ 精确最大化：$\alpha_i := \arg\max_{\hat{\alpha}_i} W(\alpha_1, \dots, \hat{\alpha}_i, \dots, \alpha_n)$，其搜索轨迹由平行于坐标轴的折线组成（见讲义第 75–76 页图）。

#### 6.8.2 为什么 SVM 必须同时更新两个变量？John Platt 的 SMO 算法完整推导

在 SVM 对偶问题 $(6.19\text{–}6.21)$ 中，如果我们固定 $\alpha_2, \dots, \alpha_n$，试图只更新 $\alpha_1$，由于等式约束 $\sum_{i=1}^n \alpha_i y^{(i)} = 0$（式 6.21）以及 $(y^{(1)})^2 = 1$，$\alpha_1$ 被其余变量唯一锁死：

$$

\alpha_1 y^{(1)} = -\sum_{i=2}^n \alpha_i y^{(i)} \iff \alpha_1 = -y^{(1)} \sum_{i=2}^n \alpha_i y^{(i)}

$$

因此，单变量坐标上升一步也动不了！为了在不违反线性等式约束的前提下移动参数，**每次至少必须同时更新两个变量 $(\alpha_i, \alpha_j)$**——这就是 **SMO（Sequential Minimal Optimization, Platt 1998）** 的核心动机！

不妨设当前选中联合优化的两个变量为 $\alpha_1$ 和 $\alpha_2$，固定 $\alpha_3, \dots, \alpha_n$：

1. **直线等式约束与盒式边界 $[L, H]$（Equation 6.22）**：

   由式 $(6.21)$，令常数 $\zeta \triangleq -\sum_{i=3}^n \alpha_i y^{(i)} = \alpha_1^{\text{old}} y^{(1)} + \alpha_2^{\text{old}} y^{(2)}$，则新变量必须位于直线：

   $$

   \alpha_1 y^{(1)} + \alpha_2 y^{(2)} = \zeta \iff \alpha_1 = \left(\zeta - \alpha_2 y^{(2)}\right) y^{(1)} \tag{6.22}

   $$

   同时，$(\alpha_1, \alpha_2)$ 必须落在正方形盒 $[0, C] \times [0, C]$ 内（见讲义第 77 页图）。由于 $\alpha_1 \in [0, C]$ 会反过来限制 $\alpha_2$ 的取值范围，$\alpha_2$ 的合法闭区间 $[L, H]$ 由下式精确给出：

   - **当 $y^{(1)} \neq y^{(2)}$（异号，直线斜率为 $+1$，即 $\alpha_1 - \alpha_2 = \pm \zeta$）**：

   $$

   L = \max\left(0, \ \alpha_2^{\text{old}} - \alpha_1^{\text{old}}\right), \qquad H = \min\left(C, \ C + \alpha_2^{\text{old}} - \alpha_1^{\text{old}}\right)

   $$

   - **当 $y^{(1)} = y^{(2)}$（同号，直线斜率为 $-1$，即 $\alpha_1 + \alpha_2 = \pm \zeta$）**：

   $$

   L = \max\left(0, \ \alpha_1^{\text{old}} + \alpha_2^{\text{old}} - C\right), \qquad H = \min\left(C, \ \alpha_1^{\text{old}} + \alpha_2^{\text{old}}\right)

   $$

2. **一元二次目标函数闭式求导与 Clip 截断更新**：

   将 $\alpha_1 = (\zeta - \alpha_2 y^{(2)}) y^{(1)}$ 代入 $W(\alpha_1, \alpha_2, \dots, \alpha_n)$，对偶目标化为关于单变量 $\alpha_2$ 的凹二次函数 $W(\alpha_2) = a \alpha_2^2 + b \alpha_2 + c$，其中二阶曲率系数为 $-\frac{1}{2}\eta$，这里：

   $$

   \eta \triangleq K_{11} + K_{22} - 2 K_{12} = \left\|\phi(x^{(1)}) - \phi(x^{(2)})\right\|_2^2 \ge 0

   $$

   记第 $i$ 个样本当前的预测误差为 $E_i \triangleq \left(\sum_{j=1}^n \alpha_j^{\text{old}} y^{(j)} K(x^{(j)}, x^{(i)}) + b\right) - y^{(i)}$。令二次函数对 $\alpha_2$ 的导数为 $0$，解得无约束极值点：

   $$

   \alpha_2^{\text{new, unclipped}} = \alpha_2^{\text{old}} + \frac{y^{(2)} (E_1 - E_2)}{\eta}

   $$

   随后将其**截断（Clip）**到合法闭区间 $[L, H]$ 内：

   $$

   \alpha_2^{\text{new}} = \begin{cases}

   H, & \text{若 } \alpha_2^{\text{new, unclipped}} > H \\

   \alpha_2^{\text{new, unclipped}}, & \text{若 } L \le \alpha_2^{\text{new, unclipped}} \le H \\

   L, & \text{若 } \alpha_2^{\text{new, unclipped}} < L

   \end{cases}

   $$

   最后由式 $(6.22)$ 一步代回求出 $\alpha_1^{\text{new}}$：

   $$

   \alpha_1^{\text{new}} = \alpha_1^{\text{old}} + y^{(1)} y^{(2)} \left( \alpha_2^{\text{old}} - \alpha_2^{\text{new}} \right)

   $$

---

## 三、本章代码示例：完整 SMO 支持向量机求解器与核函数实现

```python title="cs229_part2_smo_svm.py"
import numpy as np

def rbf_kernel_matrix(X1, X2, sigma=1.0):
    """计算高斯 RBF 核矩阵 K(x, z) = exp(-||x - z||^2 / (2 * sigma^2))"""
    sq_dists = np.sum(X1**2, axis=1, keepdims=True) + np.sum(X2**2, axis=1) - 2 * (X1 @ X2.T)
    return np.exp(-np.maximum(sq_dists, 0.0) / (2.0 * sigma**2))

def train_smo_svm(X, y, C=1.0, sigma=1.0, tol=1e-3, max_passes=20):
    """
    CS229 6.8.2 节：John Platt 简化版 SMO 算法求解非线性核 SVM
    y 取值于 {-1, +1}
    """
    n = X.shape[0]
    K = rbf_kernel_matrix(X, X, sigma=sigma)
    alpha = np.zeros(n)
    b = 0.0
    passes = 0

    while passes < max_passes:
        num_changed = 0
        for i in range(n):
            f_i = np.sum(alpha * y * K[:, i]) + b
            E_i = f_i - y[i]
            # 检查样本 i 是否违反软间隔 KKT 条件 (6.16)-(6.18)
            if (y[i] * E_i < -tol and alpha[i] < C) or (y[i] * E_i > tol and alpha[i] > 0):
                j = (i + 1) % n
                f_j = np.sum(alpha * y * K[:, j]) + b
                E_j = f_j - y[j]

                alpha_i_old, alpha_j_old = alpha[i], alpha[j]
                if y[i] != y[j]:
                    L = max(0.0, alpha[j] - alpha[i])
                    H = min(C, C + alpha[j] - alpha[i])
                else:
                    L = max(0.0, alpha[i] + alpha[j] - C)
                    H = min(C, alpha[i] + alpha[j])
                if L == H:
                    continue

                eta = K[i, i] + K[j, j] - 2.0 * K[i, j]
                if eta <= 1e-12:
                    continue

                alpha_j_unclipped = alpha[j] + y[j] * (E_i - E_j) / eta
                alpha[j] = np.clip(alpha_j_unclipped, L, H)
                if abs(alpha[j] - alpha_j_old) < 1e-5:
                    continue

                alpha[i] = alpha_i_old + y[i] * y[j] * (alpha_j_old - alpha[j])
                b1 = b - E_i - y[i] * (alpha[i] - alpha_i_old) * K[i, i] - y[j] * (alpha[j] - alpha_j_old) * K[i, j]
                b2 = b - E_j - y[i] * (alpha[i] - alpha_i_old) * K[i, j] - y[j] * (alpha[j] - alpha_j_old) * K[j, j]
                b = b1 if 0 < alpha[i] < C else (b2 if 0 < alpha[j] < C else 0.5 * (b1 + b2))
                num_changed += 1
        passes = passes + 1 if num_changed == 0 else 0
    return alpha, b

if __name__ == "__main__":
    # 构造二维非线性异或 (XOR) 数据集测试高斯核 SMO SVM
    X_xor = np.array([[1.0, 1.0], [-1.0, -1.0], [1.0, -1.0], [-1.0, 1.0],
                      [1.2, 0.9], [-0.9, -1.1], [0.9, -1.2], [-1.1, 0.8]])
    y_xor = np.array([1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, -1.0])
    alpha, b = train_smo_svm(X_xor, y_xor, C=10.0, sigma=1.0, max_passes=50)
    preds = np.sign(rbf_kernel_matrix(X_xor, X_xor, 1.0) @ (alpha * y_xor) + b)
    print("XOR Training Accuracy:", np.mean(preds == y_xor))
    print("Learned Support Vector Alphas:", np.round(alpha, 3))
```

---

## 四、第 5–6 章课后推导与习题解答 (Exercises & Detailed Solutions)

### 习题 5.1：核岭回归 (Kernel Ridge Regression) 的表示定理与闭式解推导

在特征空间 $\mathbb{R}^p$ 中，考虑带 $\ell_2$ 正则化的岭回归问题：

$$

\min_{\theta \in \mathbb{R}^p} J_\lambda(\theta) = \frac{1}{2} \sum_{i=1}^n \left( \theta^T \phi(x^{(i)}) - y^{(i)} \right)^2 + \frac{\lambda}{2} \|\theta\|_2^2, \qquad \lambda > 0

$$

记特征设计矩阵为 $\Phi = [\phi(x^{(1)}), \dots, \phi(x^{(n)})]^T \in \mathbb{R}^{n \times p}$，核矩阵为 $K = \Phi \Phi^T \in \mathbb{R}^{n \times n}$。

(a) 直接由一阶最优性条件 $\nabla_\theta J_\lambda(\theta) = 0$ 严格证明最优解满足表示定理（Representer Theorem）：$\theta^* = \sum_{i=1}^n \beta_i \phi(x^{(i)}) = \Phi^T \beta$；

(b) 推导出对偶系数向量 $\beta \in \mathbb{R}^n$ 的闭式解 $\beta = (K + \lambda I_n)^{-1} \ec{y}$，并对比为什么原始空间求逆需要 $O(p^3)$ 而对偶核空间求逆只需 $O(n^3)$！

:::spoiler[习题 5.1 解答]

**解**：

**(a) 表示定理证明**：

将目标函数写成矩阵形式 $J_\lambda(\theta) = \frac{1}{2} \|\Phi \theta - \ec{y}\|_2^2 + \frac{\lambda}{2} \|\theta\|_2^2$。关于 $\theta$ 求梯度并令其等于 $0$：

$$
\nabla_\theta J_\lambda(\theta) = \Phi^T (\Phi \theta - \ec{y}) + \lambda \theta = 0 \implies \theta = \Phi^T \underbrace{\left( \frac{1}{\lambda} (\ec{y} - \Phi \theta) \right)}_{\triangleq \beta \in \mathbb{R}^n}
$$

因此，最优解 $\theta^*$ 必然严格满足 $\theta^* = \Phi^T \beta = \sum_{i=1}^n \beta_i \phi(x^{(i)})$！

**(b) 对偶系数 $\beta$ 的闭式解推导**：

将 $\theta = \Phi^T \beta$ 代入关系式 $\lambda \beta = \ec{y} - \Phi \theta$：

$$
\lambda \beta = \ec{y} - \Phi \Phi^T \beta = \ec{y} - K \beta \implies (K + \lambda I_n) \beta = \ec{y}
$$

因为核矩阵 $K \succeq 0$ 半正定且 $\lambda > 0$，所以 $K + \lambda I_n \succ 0$ 永远严格正定可逆！解得：

$$
\beta = (K + \lambda I_n)^{-1} \ec{y}
$$

**复杂度对比**：若直接在原始空间求 $\theta = (\Phi^T \Phi + \lambda I_p)^{-1} \Phi^T \ec{y}$，需要对 $p \times p$ 矩阵求逆（当高斯核 $p = \infty$ 时根本不可能）；而在对偶空间求 $(K + \lambda I_n)^{-1} \ec{y}$ 只需对 $n \times n$ 矩阵求逆，耗时仅为 $O(n^3)$！ $\blacksquare$

:::

### 习题 5.2：核函数的构造代数法则与正定性判别 (CS229 PS2 核心题)

设 $K_1(x, z)$ 和 $K_2(x, z)$ 是定义在 $\mathbb{R}^d \times \mathbb{R}^d$ 上的合法 Mercer 核，$f : \mathbb{R}^d \to \mathbb{R}$ 为任意实值函数，$p(u) = \sum_{j=0}^m a_j u^j$ 为系数全非负（$a_j \ge 0$）的多项式。严格判断并证明下列函数是否为合法 Mercer 核：

(a) $K(x, z) = c_1 K_1(x, z) + c_2 K_2(x, z)$，其中 $c_1, c_2 \ge 0$；

(b) $K(x, z) = f(x) K_1(x, z) f(z)$；

(c) $K(x, z) = K_1(x, z) K_2(x, z)$（逐点乘积）；

(d) $K(x, z) = \exp\left(K_1(x, z)\right)$。

:::spoiler[习题 5.2 解答]

**解**：

**(a) 是合法核**：对任意有限点集和任意向量 $ \in \mathbb{R}^n$，$^T (c_1 K^{(1)} + c_2 K^{(2)})  = c_1 ^T K^{(1)}  + c_2 ^T K^{(2)}  \ge 0$（因为 $c_1, c_2 \ge 0$ 且 $K^{(1)}, K^{(2)} \succeq 0$）。

**(b) 是合法核**：设 $K_1(x, z) = \phi(x)^T \phi(z)$，构造新特征映射 $\tilde{\phi}(x) = f(x) \phi(x)$，则 $K(x, z) = (f(x)\phi(x))^T (f(z)\phi(z)) = \tilde{\phi}(x)^T \tilde{\phi}(z)$。

**(c) 是合法核**：设 $K_1(x, z) = \sum_{i=1}^{p_1} \phi_i^{(1)}(x) \phi_i^{(1)}(z)$，$K_2(x, z) = \sum_{j=1}^{p_2} \phi_j^{(2)}(x) \phi_j^{(2)}(z)$。则乘积为：

$$
K_1(x, z) K_2(x, z) = \sum_{i=1}^{p_1} \sum_{j=1}^{p_2} \underbrace{\left(\phi_i^{(1)}(x)\phi_j^{(2)}(x)\right)}_{\tilde{\phi}_{ij}(x)} \underbrace{\left(\phi_i^{(1)}(z)\phi_j^{(2)}(z)\right)}_{\tilde{\phi}_{ij}(z)} = \langle \tilde{\phi}(x), \tilde{\phi}(z) \rangle
$$

故两个核的乘积对应张量积（Kronecker Product）特征映射，必为合法核！

**(d) 是合法核**：将指数函数展开为幂级数 $\exp(K_1(x, z)) = \sum_{k=0}^\infty \frac{1}{k!} \left(K_1(x, z)\right)^k$。由性质 (c) 的数学归纳法，$\left(K_1(x, z)\right)^k$ 对任意正整数 $k$ 均为合法核；再由性质 (a) 及半正定矩阵锥的闭性（非负系数级数的逐点极限保持半正定），$\exp(K_1(x, z))$ 必为合法 Mercer 核！（特别地，高斯核 $\exp(-\frac{\|x-z\|^2}{2\sigma^2}) = e^{-\|x\|^2/(2\sigma^2)} \exp\left(\frac{x^T z}{\sigma^2}\right) e^{-\|z\|^2/(2\sigma^2)}$ 直接由性质 (b) 和 (d) 得证！） $\blacksquare$

:::

### 习题 6.1：软间隔 SVM 与 Hinge Loss（合页损失）无约束优化的严格等价性证明

证明第 6.7 节的软间隔 SVM 原始约束优化问题：

$$

\min_{w, b, \xi} \ \frac{1}{2}\|w\|_2^2 + C \sum_{i=1}^n \xi_i \qquad \text{s.t.} \quad y^{(i)}(w^T x^{(i)} + b) \ge 1 - \xi_i, \quad \xi_i \ge 0 \quad (\forall i)

$$

完全等价于如下无约束的 **$\ell_2$ 正则化合页损失（Hinge Loss）最小化问题**：

$$

\min_{w, b} \ \frac{1}{2}\|w\|_2^2 + C \sum_{i=1}^n \max\left\{ 0, \ 1 - y^{(i)}\left(w^T x^{(i)} + b\right) \right\}

$$

:::spoiler[习题 6.1 解答]

**解**：

对于任意固定的 $(w, b)$，我们来求关于松弛变量 $\xi = (\xi_1, \dots, \xi_n)$ 的最优取值。

观察约束条件：每个 $\xi_i$ 必须同时满足两个下界：

$$
\xi_i \ge 1 - y^{(i)}\left(w^T x^{(i)} + b\right) \qquad \text{且} \qquad \xi_i \ge 0
$$

这等价于：

$$
\xi_i \ge \max\left\{ 0, \ 1 - y^{(i)}\left(w^T x^{(i)} + b\right) \right\}
$$

由于目标函数 $\frac{1}{2}\|w\|_2^2 + C \sum_{i=1}^n \xi_i$ 中惩罚系数 $C > 0$，要最小化目标函数，每个 $\xi_i$ 必然精确取到其允许的最小下界：

$$
\xi_i^* = \max\left\{ 0, \ 1 - y^{(i)}\left(w^T x^{(i)} + b\right) \right\} \triangleq \ell_{\text{hinge}}\left(y^{(i)}(w^T x^{(i)} + b)\right)
$$

将 $\xi_i^*$ 代回原始目标函数，即得无约束 Hinge Loss 目标函数！这也表明：**软间隔 SVM 本质上就是将逻辑损失 $\log(1 + e^{-z})$ 替换为分段线性的合页损失 $\max(0, 1 - z)$、并加上 $\ell_2$ 权重衰减 $\frac{1}{2}\|w\|_2^2$ 的线性模型**！ $\blacksquare$

:::

### 习题 6.2：SMO 算法中一元二次目标函数导数与无约束更新公式 $\alpha_2^{\text{new, unclipped}}$ 的完整代数推导

在 6.8.2 节 SMO 算法中，固定 $\alpha_3, \dots, \alpha_n$，利用 $\alpha_1 y^{(1)} + \alpha_2 y^{(2)} = \zeta$ 将 $W(\alpha_1, \alpha_2, \dots, \alpha_n)$ 表为单变量 $\alpha_2$ 的二次函数，通过对 $\alpha_2$ 求导并令导数为 $0$，严格推导出：

$$

\alpha_2^{\text{new, unclipped}} = \alpha_2^{\text{old}} + \frac{y^{(2)}(E_1 - E_2)}{\eta}, \qquad \text{其中 } \eta = K_{11} + K_{22} - 2K_{12}

$$

:::spoiler[习题 6.2 解答]

**解**：

将对偶目标函数 $W(\alpha)$ 中与 $\alpha_1, \alpha_2$ 有关的项分离出来（记 $K_{ij} = K(x^{(i)}, x^{(j)})$，并定义常数向量值 $_i = \sum_{j=3}^n \alpha_j y^{(j)} K_{ij}$ 对 $i=1, 2$）：

$$
W(\alpha_1, \alpha_2) = \alpha_1 + \alpha_2 - \frac{1}{2} K_{11} \alpha_1^2 - \frac{1}{2} K_{22} \alpha_2^2 - y^{(1)} y^{(2)} K_{12} \alpha_1 \alpha_2 - y^{(1)} \alpha_1 v_1 - y^{(2)} \alpha_2 v_2 + \text{const}
$$

代入 $\alpha_1 = (\zeta - \alpha_2 y^{(2)}) y^{(1)}$（注意 $\alpha_1 y^{(1)} = \zeta - \alpha_2 y^{(2)}$ 且 $\alpha_1^2 = (\zeta - \alpha_2 y^{(2)})^2$）：

$$
\begin{aligned}

W(\alpha_2) &= \left(\zeta - \alpha_2 y^{(2)}\right)y^{(1)} + \alpha_2 - \frac{1}{2} K_{11} \left(\zeta - \alpha_2 y^{(2)}\right)^2 - \frac{1}{2} K_{22} \alpha_2^2 \\

&\quad - y^{(2)} K_{12} \left(\zeta - \alpha_2 y^{(2)}\right) \alpha_2 - \left(\zeta - \alpha_2 y^{(2)}\right) v_1 - y^{(2)} \alpha_2 v_2 + \text{const}

\end{aligned}
$$

对 $\alpha_2$ 求一阶导数并令 $\frac{dW(\alpha_2)}{d\alpha_2} = 0$（利用 $(y^{(2)})^2 = 1$）：

$$
\frac{dW}{d\alpha_2} = -y^{(1)} y^{(2)} + 1 + K_{11}\left(\zeta y^{(2)} - \alpha_2\right) - K_{22} \alpha_2 - y^{(2)} K_{12} \zeta + 2 K_{12} \alpha_2 + y^{(2)} v_1 - y^{(2)} v_2 = 0
$$

将含 $\alpha_2$ 的项移到左边，常数项留在右边：

$$
\underbrace{\left(K_{11} + K_{22} - 2 K_{12}\right)}_{\eta} \alpha_2 = y^{(2)} \left[ y^{(2)} - y^{(1)} + \zeta(K_{11} - K_{12}) + v_1 - v_2 \right]
$$

由预测输出定义 $f_i = \alpha_1^{\text{old}} y^{(1)} K_{1i} + \alpha_2^{\text{old}} y^{(2)} K_{2i} + v_i + b$，有 $_1 - v_2 = (f_1 - f_2) - \alpha_1^{\text{old}} y^{(1)}(K_{11} - K_{12}) - \alpha_2^{\text{old}} y^{(2)}(K_{12} - K_{22})$。结合 $\zeta = \alpha_1^{\text{old}} y^{(1)} + \alpha_2^{\text{old}} y^{(2)}$ 代入右端中括号化简：

$$
\begin{aligned}

\eta \alpha_2^{\text{new, unclipped}} &= y^{(2)} \left[ (f_1 - y^{(1)}) - (f_2 - y^{(2)}) + \alpha_2^{\text{old}} y^{(2)} (K_{11} + K_{22} - 2K_{12}) \right] \\

&= \eta \alpha_2^{\text{old}} + y^{(2)} (E_1 - E_2)

\end{aligned}
$$

两边同除以 $\eta = K_{11} + K_{22} - 2 K_{12}$，即得 $\alpha_2^{\text{new, unclipped}} = \alpha_2^{\text{old}} + \frac{y^{(2)}(E_1 - E_2)}{\eta}$！ $\blacksquare$

:::

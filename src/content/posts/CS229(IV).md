---
title: CS229 · 笔记（四） · 泛化理论与正则化
published: 2026-10-30
tags:
  - CS229
  - 机器学习
  - Statistical_Learning_Theory
  - Generalization
  - Regularization
category: 机器学习
draft: false
description: 推导 MSE 的偏差-方差-噪声三重分解，剖析现代深度学习的双重下降（Double Descent）与最小范数插值解，基于 Hoeffding 不等式与 VC 维建立样本复杂度界，并完整梳理显式/隐式正则化、交叉验证与贝叶斯 MAP 估计。
---

## 导读

在前三篇笔记中，我们已经掌握了线性模型、广义线性模型（GLM）、核方法与支持向量机（SVM）以及深度神经网络与反向传播。然而，机器学习的终极目标从来不是在已知的训练集 $S = \{(x^{(i)}, y^{(i)})\}_{i=1}^n$ 上把损失函数刷到零，而是让模型在从未见过的测试数据 $(x, y) \sim \mathcal{D}$ 上具备低**泛化误差（Generalization Error / Population Risk）**。

本篇讨论泛化理论与正则化，内容包括以下几个部分：

1. **偏差-方差分解（Bias-Variance Tradeoff）**：严格证明回归测试误差 $\text{MSE}(x) = \sigma^2 + \text{Bias}^2 + \text{Variance}$ 的恒等分解，理解欠拟合（高偏差）与过拟合（高方差）的数学本质。

2. **双重下降现象（Double Descent Phenomenon）**：为什么现代深度神经网络参数量 $d \gg n$ 却不会过拟合？我们将解析内插阈值（Interpolation Threshold）$n \approx d$ 处的测试误差尖峰，以及梯度下降隐式寻找**最小 $\ell_2$ 范数插值解**的机制。

3. **样本复杂度界与 VC 维（Sample Complexity & VC Dimension）**：从联合界（Union Bound）与 Hoeffding 集中不等式出发，完整证明有限假设类 $|\mathcal{H}| = k$ 的一致收敛界（Uniform Conergence）与经验风险最小化（ERM）超额风险界，并推广到无限假设类的 **VC 维（Vapnik-Cheronenkis Dimension）**。

4. **显式与隐式正则化、交叉验证与贝叶斯统计（Regularization, Cross Validation & Bayesian MAP）**：对比 $\ell_2$ 权重衰减（Weight Decay）与 $\ell_1$ 稀疏正则化（LASSO），剖析过参数化网络中学习率、Batch Size 对平坦极小值（Flat Minima）的**隐式正则化（Implicit Regularization）**，并证明高斯先验下的最大后验估计（MAP）与 $\ell_2$ 正则化的严格等价性。

---

:::tip[学习重点]

- 区分训练误差、泛化误差与不可约噪声。
- 检查样本复杂度界的前提，比较正则化与模型选择方法。

:::

## 一、第 8 章：泛化理论 (Generalization)

在监督学习中，我们最小化的是训练集上的**经验风险（Empirical Risk / Training Loss）**：

$$

J(\theta) = \frac{1}{n} \sum_{i=1}^n \left(y^{(i)} - h_\theta(x^{(i)})\right)^2

$$

但我们真正关心的是数据生成分布 $\mathcal{D}$ 上的**期望风险（Population Risk / Test Loss）**：

$$

L(\theta) = \mathbb{E}_{(x, y) \sim \mathcal{D}} \left[ (y - h_\theta(x))^2 \right] \tag{8.1}

$$

:::note[核心概念：泛化误差与泛化间隔 (Generalization Gap)]

- **泛化误差（Generalization Error）**：通常直接指代模型在新样本上的测试误差 $L(\theta)$。

- **泛化间隔（Generalization Gap）**：测试误差与训练误差之差 $L(\theta) - J(\theta)$。要使测试误差 $L(\theta)$ 足够小，我们需要同时满足两个条件：(1) 训练误差 $J(\theta)$ 小（不做欠拟合）；(2) 泛化间隔 $L(\theta) - J(\theta)$ 小（不做过拟合）。

:::

### 8.1 偏差-方差权衡 (Bias-Variance Tradeoff)

考虑一个一维回归任务：假设真实标签由未知的确定性真值函数 $h^\star(x)$ 加上独立同分布的高斯观测噪声生成：

$$

y^{(i)} = h^\star(x^{(i)}) + \xi^{(i)}, \qquad \xi^{(i)} \sim \mathcal{N}(0, \sigma^2)

$$

当我们从分布中采样出一个包含 $n$ 个样本的训练集 $S = \{(x^{(1)}, y^{(1)}), \dots, (x^{(n)}, y^{(n)})\}$ 时，训练算法在数据集 $S$ 上拟合出一个假设函数，记为 $h_S$（或 $\hat{h}_S$）。注意：**由于训练集 $S$ 是随机采样的，学到的模型 $h_S$ 本身是一个依赖于随机变量 $S$ 的随机函数！**

- **欠拟合（Underfitting / High Bias）**：如果我们用线性函数去拟合真实的二次或高次非线性曲线 $h^\star(x)$，无论给多少训练数据（哪怕 $n \to \infty$），线性模型受限于表达能力（Expressiity），其平均预测值也无法逼近 $h^\star(x)$。

- **过拟合（Oerfitting / High Variance）**：如果我们用 20 阶多项式去拟合只有 $n=10$ 个带噪样本的数据集，模型会精确穿过每一个含噪数据点（训练误差为 $0$）。一旦换一组重新采样的训练集 $S'$，拟合出的多项式曲线就会发生剧烈震荡。

#### 8.1.1 偏差-方差的严格数学分解 (Mathematical Decomposition)

为了定量刻画上述现象，我们固定一个测试输入点 $x$，其观测测试标签为 $y = h^\star(x) + \xi$，其中测试噪声 $\xi \sim \mathcal{N}(0, \sigma^2)$ 与训练集 $S$ 相互独立。我们考察模型 $h_S(x)$ 在点 $x$ 处的期望测试均方误差（对训练集 $S$ 和测试噪声 $\xi$ 同时取期望）：

$$

\text{MSE}(x) = \mathbb{E}_{S, \xi} \left[ (y - h_S(x))^2 \right] \tag{8.2}

$$

在展开式 $(8.2)$ 之前，我们先证明一个在概率论与统计学习中极其高频的辅助引理。

:::important[引理 (Claim 8.1.1：零均值独立随机变量的平方期望分解)]

设 $A$ 和 $B$ 是两个相互独立的实值随机变量，且 $\mathbb{E}[A] = 0$。则有：

$$

\mathbb{E}\left[(A + B)^2\right] = \mathbb{E}[A^2] + \mathbb{E}[B^2]

$$

特别地，若 $B = c$ 为确定性常数，则有推论：

$$

\mathbb{E}\left[(A + c)^2\right] = \mathbb{E}[A^2] + c^2

$$

**证明**：利用期望的线性性质以及 $A, B$ 独立时 $\mathbb{E}[AB] = \mathbb{E}[A]\mathbb{E}[B]$，展开平方项得：

$$

\mathbb{E}\left[(A + B)^2\right] = \mathbb{E}[A^2 + 2AB + B^2] = \mathbb{E}[A^2] + 2\underbrace{\mathbb{E}[A]}_{=0}\mathbb{E}[B] + \mathbb{E}[B^2] = \mathbb{E}[A^2] + \mathbb{E}[B^2] \qquad \blacksquare

$$

:::

现在我们定义**平均模型（Aerage Model）** $h_{\text{ag}}(x)$ 为在无穷多个独立采样的同规模训练集 $S$ 上训练出的模型的数学期望：

$$

h_{\text{ag}}(x) \triangleq \mathbb{E}_S [h_S(x)] \tag{8.3}

$$

下面我们分两步完成 $\text{MSE}(x)$ 的三重分解：

**第一步：分离不可约观测噪声 $\sigma^2$**。将 $y = h^\star(x) + \xi$ 代入式 $(8.2)$，改写为：

$$

\text{MSE}(x) = \mathbb{E}_{S, \xi} \left[ \left( \xi + (h^\star(x) - h_S(x)) \right)^2 \right] \tag{8.4}

$$

令 $A = \xi$，$B = h^\star(x) - h_S(x)$。因为测试噪声 $\xi$ 与训练集 $S$ 独立，所以 $A$ 与 $B$ 相互独立；同时 $\mathbb{E}[\xi] = 0$。直接应用 Claim 8.1.1 可得：

$$

\text{MSE}(x) = \mathbb{E}[\xi^2] + \mathbb{E}_S \left[ (h^\star(x) - h_S(x))^2 \right] = \sigma^2 + \mathbb{E}_S \left[ (h^\star(x) - h_S(x))^2 \right] \tag{8.5}

$$

**第二步：通过加减 $h_{\text{ag}}(x)$ 分离偏差与方差**。观察式 $(8.5)$ 第二项中的随机变量 $h^\star(x) - h_S(x)$，我们在括号内引入中间项 $h_{\text{ag}}(x) = \mathbb{E}_S [h_S(x)]$：

$$

h^\star(x) - h_S(x) = \underbrace{\left(h_{\text{ag}}(x) - h_S(x)\right)}_{A'} + \underbrace{\left(h^\star(x) - h_{\text{ag}}(x)\right)}_{c}

$$

注意：在这里，$c = h^\star(x) - h_{\text{ag}}(x)$ 不依赖于具体的训练集 $S$，因此它是**确定性常数**！而随机变量 $A' = h_{\text{ag}}(x) - h_S(x)$ 的期望为：

$$

\mathbb{E}_S [A'] = h_{\text{ag}}(x) - \mathbb{E}_S [h_S(x)] = h_{\text{ag}}(x) - h_{\text{ag}}(x) = 0

$$

再次调用 Claim 8.1.1 的常数推论 $\mathbb{E}[(A'+c)^2] = \mathbb{E}[{A'}^2] + c^2$，立即得到：

$$

\mathbb{E}_S \left[ (h^\star(x) - h_S(x))^2 \right] = \left(h^\star(x) - h_{\text{ag}}(x)\right)^2 + \mathbb{E}_S \left[ (h_S(x) - h_{\text{ag}}(x))^2 \right] \tag{8.6}

$$

注意到第二项恰为随机变量 $h_S(x)$ 的方差 $\text{ar}(h_S(x))$，合并式 $(8.5)$ 与 $(8.6)$ 即得著名的**偏差-方差分解公式**：

$$

\text{MSE}(x) = \underbrace{\sigma^2}_{\text{不可约噪声 (Unaoidable Noise)}} + \underbrace{\left(h^\star(x) - h_{\text{ag}}(x)\right)^2}_{\triangleq \text{Bias}^2 \text{ (偏差平方)}} + \underbrace{\text{ar}(h_S(x))}_{\triangleq \text{Variance} \text{ (方差)}} \tag{8.7}

$$

| 分解项 | 数学表达式 | 物理含义与影响因素 | 随模型复杂度 $d$ 增加的变化趋势 |
| :--- | :--- | :--- | :--- |
| **不可约噪声** | $\sigma^2 = \mathbb{E}[\xi^2]$ | 数据采集过程固有的随机测量误差下界，任何模型都无法消除 | 保持恒定不变 |
| **偏差平方 ($\text{Bias}^2$)** | $(h^\star(x) - \mathbb{E}_S [h_S(x)])^2$ | 衡量假设类 $\mathcal{H}$ 的平均拟合能力与真实函数 $h^\star(x)$ 之间的系统性逼近误差 | 单调下降（模型越复杂，表达能力越强） |
| **方差 ($\text{Variance}$)** | $\mathbb{E}_S [(h_S(x) - h_{\text{ag}}(x))^2]$ | 衡量模型对特定有限训练集 $S$ 中随机噪声的敏感程度与波动幅度 | 经典视角下单调上升（但在内插阈值后会出现新现象） |

---

### 8.2 双重下降现象 (The Double Descent Phenomenon)

在传统统计学习教科书中，随着模型参数量（复杂度）$d$ 的增加，偏差单调减小而方差单调增大，因此测试误差曲线呈现出经典的 **U 型曲线（U-shaped Cure）**，并在某个中间维度达到最佳平衡点（Sweet Spot）。

然而，在现代深度学习中，神经网络的参数量 $d$ 往往远大于训练样本数 $n$（即**过参数化区间 Oerparameterized Regime，$d \gg n$**），测试误差不仅没有爆炸，反而随着网络进一步加深加宽而持续下降！这一融合了经典统计与现代深度学习的规律被称为**双重下降现象（Double Descent）**。

#### 1. 模型维度双重下降 (Model-wise Double Descent)

固定训练样本数 $n$，令模型参数量 $d$ 从小到大连续变化：

1. **欠参数化区间（Underparameterized Regime, $d < n$）**：遵循经典 U 型曲线——测试误差先随 $d$ 增大而下降（偏差迅速减小），随后在接近 $d \approx n$ 时急剧飙升（方差剧增）。

2. **内插阈值尖峰（Interpolation Threshold, $d \approx n$）**：当参数量 $d$ 恰好等于样本数 $n$ 时，训练误差刚好归零，模型首次具备完全记住（Interpolate）所有训练样本（含噪声 $\xi^{(i)}$）的能力。此时**测试误差达到全局最高尖峰**。

3. **过参数化区间（Oerparameterized Regime, $d > n$）**：当参数量 $d$ 跨过内插阈值继续增大（$d \gg n$）时，训练误差保持为 $0$，但**测试误差出现第二次单调下降**，且最终收敛到的误差往往比经典 U 型曲线的最低点还要低！

:::tip[样本维度双重下降 (Sample-wise Double Descent, Nakkiran 2019)]

双重下降不仅发生在改变模型大小 $d$ 时，也发生在改变样本量 $n$ 时！固定模型参数量 $d$，当训练样本数 $n$ 逐渐增加经过 $n \approx d$ 时，测试误差竟然会出现反常的局部上升（即**“更多的数据反而损害测试性能”**），直到 $n \gg d$ 时才重新下降。

:::

#### 2. 为什么 $d \approx n$ 是灾难，而 $d \gg n$ 反而泛化极佳？

让我们用线性回归 $X \theta = y$（其中设计矩阵 $X \in \mathbb{R}^{n \times d}$）给出最透彻的几何与代数解释：

- **当 $d = n$ 且 $X$ 满秩时**：满足 $X\theta = y$ 的完美插值解是**唯一**的，即 $\hat{\theta} = X^{-1} y = X^{-1}(X\theta^\star + \xi) = \theta^\star + X^{-1}\xi$。由于随机矩阵 $X$ 在 $d=n$ 时极易出现接近于 $0$ 的极小奇异值 $\sigma_{\min}(X) \approx 0$，$X^{-1}\xi$ 会将观测噪声 $\xi$ 放大成百上千倍！这导致求出的唯一解范数 $\|\hat{\theta}\|_2$ 极其巨大，函数曲线在测试点处剧烈震荡。

- **当 $d \gg n$ 时**：线性方程组 $X\theta = y$ 是欠定方程组，存在**无穷多个**能使训练误差为 $0$ 的插值解（构成一个 $d-n$ 维仿射子空间 $\{\theta : X\theta = y\}$）。此时，从零初始化 $\theta^{(0)} = 0$ 出发运行梯度下降（Gradient Descent），每次梯度更新量 $\nabla_\theta J(\theta) = \frac{1}{n} X^T (X\theta - y)$ 都严格位于 $X$ 的行空间 $\text{row}(X) = \text{span}(x^{(1)}, \dots, x^{(n)})$ 中！

- **最小 $\ell_2$ 范数插值解（Minimum $\ell_2$-norm Interpolating Solution）**：根据线性代数正交分解，位于行空间 $\text{row}(X)$ 中的插值解恰为所有插值解中**欧氏范数 $\|\theta\|_2$ 最小**的解（即 Moore-Penrose 伪逆解）：

$$

\theta_{\min} = \arg\min_{\theta \in \mathbb{R}^d} \|\theta\|_2^2 \quad \text{s.t.} \quad X\theta = y \implies \theta_{\min} = X^T (X X^T)^{-1} y

$$

当 $d$ 远大于 $n$ 时，行向量之间更加正交，Gram 矩阵 $X X^T \in \mathbb{R}^{n \times n}$ 的最小特征值显著增大（远离 $0$，条件数改善），从而使最小范数解 $\|\theta_{\min}\|_2$ 随 $d$ 的增加而**单调减小**！更小的参数范数意味着更平滑、Lipschitz 常数更小的拟合函数，方差随之大幅回落。

:::important[核心洞见：如何消除双重下降的尖峰？]

讲义第 8.2 节（图 8.11 与图 8.12）指出两个关键事实：

1. **最优 $\ell_2$ 正则化消除尖峰**：如果在训练时加入经过精细调优的 $\ell_2$ 正则化项 $\lambda_{\text{opt}} \|\theta\|_2^2$，模型在 $d \approx n$ 处不再被强迫去完美插值噪声，$d \approx n$ 处的测试误差尖峰会完全消失，测试误差随 $d$ 增加平滑地单调下降。

2. **横轴替换为参数范数 $\|\hat{\theta}\|_2$ 即可恢复经典 U 型曲线**：为什么传统统计理论认为参数越多越容易过拟合？因为经典理论默认“参数维度 $d$ 越大 $\iff$ 复杂度（范数 $\|\hat{\theta}\|_2$）越大”。但在无正则化的过参数化区间（$d > n$）中，最小范数解的范数 $\|\theta_{\min}\|_2$ 实际上随 $d$ 增大而减小！如果我们把图的横坐标从“参数个数 $d$”换成“学到的模型参数范数 $\|\hat{\theta}\|_2$”，测试误差曲线就会重新恢复经典的单调 U 型关系。

:::

---

### 8.3 样本复杂度界与统计学习理论 (Sample Complexity Bounds)

为了从数学上严格回答“究竟需要多少训练样本 $n$，才能保证学到的模型泛化误差接近理论最优？”，我们建立统计学习理论（Statistical Learning Theory）的经典分析框架。

考虑二分类问题，输入 $x \in \mathcal{X}$，标签 $y \in \{0, 1\}$，假设类为 $\mathcal{H} = \{h : \mathcal{X} \to \{0, 1\}\}$。对于任意固定假设 $h \in \mathcal{H}$：

- **训练误差（经验风险 Empirical Risk）**：

$$

\hat{\varepsilon}(h) = \frac{1}{n} \sum_{i=1}^n \mathbf{1}\left\{h(x^{(i)}) \neq y^{(i)}\right\}

$$

- **泛化误差（期望风险 Generalization Error）**：

$$

\varepsilon(h) = P_{(x, y) \sim \mathcal{D}} \left(h(x) \neq y\right)

$$

- **经验风险最小化（Empirical Risk Minimization, ERM）**：算法在训练集上选出的最优假设为：

$$

\hat{h} = \arg\min_{h \in \mathcal{H}} \hat{\varepsilon}(h)

$$

- **假设类内的理论最优假设（Best-in-class Hypothesis）**：

$$

h^* = \arg\min_{h \in \mathcal{H}} \varepsilon(h)

$$

我们需要用到的两个核心概率论工具如下：

:::note[两大基础概率不等式：联合界与 Hoeffding 不等式]

1. **联合界（Union Bound / Boole's Inequality）**：设 $A_1, A_2, \dots, A_k$ 为任意 $k$ 个随机事件（**无需相互独立**），则它们至少发生一个的概率不超过各自概率之和：

$$

P(A_1 \cup A_2 \cup \dots \cup A_k) \le P(A_1) + P(A_2) + \dots + P(A_k)

$$

2. **Hoeffding 不等式（Hoeffding's Inequality / Chernoff Bound）**：设 $Z_1, Z_2, \dots, Z_n \stackrel{\text{i.i.d.}}{\sim} \text{Bernoulli}(\phi)$ 是 $n$ 个独立同分布的伯努利随机变量（即 $P(Z_i = 1) = \phi, \ P(Z_i = 0) = 1 - \phi$），记样本均值为 $\hat{\phi} = \frac{1}{n} \sum_{i=1}^n Z_i$。则对任意容忍偏差 $\gamma > 0$，有双边指数集中界：

$$

P\left( |\phi - \hat{\phi}| > \gamma \right) \le 2 \exp\left(-2 \gamma^2 n\right)

$$

:::

#### 8.3.1 有限假设类 ($|\mathcal{H}| = k$) 的一致收敛与样本复杂度证明

假设 $\mathcal{H} = \{h_1, h_2, \dots, h_k\}$ 是一个包含 $k$ 个候选假设的有限集合。我们的目标是证明 $\varepsilon(\hat{h})$ 与 $\varepsilon(h^*)$ 非常接近。

**第一步：单个固定假设 $h_j \in \mathcal{H}$ 的集中界**。

对于任意一个预先固定的 $h_j \in \mathcal{H}$，定义指示随机变量 $Z_i = \mathbf{1}\{h_j(x^{(i)}) \neq y^{(i)}\}$。由于训练样本 $(x^{(i)}, y^{(i)}) \stackrel{\text{i.i.d.}}{\sim} \mathcal{D}$，随机变量 $Z_1, \dots, Z_n$ 独立同分布且服从参数为 $\phi = \varepsilon(h_j)$ 的伯努利分布，其样本均值恰为训练误差 $\hat{\phi} = \hat{\varepsilon}(h_j)$！直接应用 Hoeffding 不等式可得：

$$

P\left( |\varepsilon(h_j) - \hat{\varepsilon}(h_j)| > \gamma \right) \le 2 \exp(-2 \gamma^2 n)

$$

:::caution[为什么不能对 $\hat{h}$ 直接套用单个 Hoeffding 不等式？]

初学者常犯的一个致命错误是：“既然 $\hat{h} \in \mathcal{H}$，那直接令 $h_j = \hat{h}$ 套用 Hoeffding 不等式不就完了吗？”

**绝对不行！** 因为 Hoeffding 不等式要求假设 $h_j$ 必须在看到训练数据 $S$ **之前**就固定下来，这样 $Z_1, \dots, Z_n$ 才是独立同分布的伯努利变量。而 ERM 选出的 $\hat{h}$ 是依赖于整个训练集 $S$ 的随机假设，它在 $S$ 上被刻意挑选出来最小化训练误差，因此 $\hat{\varepsilon}(\hat{h})$ 是有偏的！为了控制随机选择的 $\hat{h}$，我们必须要求 $\mathcal{H}$ 中的**所有** $k$ 个假设同时满足训练误差接近泛化误差，这就是**一致收敛（Uniform Conergence）**。

:::

**第二步：利用联合界建立一致收敛（Uniform Conergence）**。

定义坏事件 $A_j$ 为“第 $j$ 个假设 $h_j$ 的训练误差与泛化误差之差超过 $\gamma$”，即 $A_j = \{ |\varepsilon(h_j) - \hat{\varepsilon}(h_j)| > \gamma \}$。已知 $P(A_j) \le 2 \exp(-2\gamma^2 n)$。由联合界可得，存在至少一个假设偏离超过 $\gamma$ 的概率满足：

$$

P\left( \exists h \in \mathcal{H}, \ |\varepsilon(h) - \hat{\varepsilon}(h)| > \gamma \right) = P(A_1 \cup A_2 \cup \dots \cup A_k) \le \sum_{j=1}^k P(A_j) \le 2k \exp(-2\gamma^2 n)

$$

用 $1$ 减去上式两边（取对偶补事件），即得到**一致收敛高概率下界**：

$$

P\left( \forall h \in \mathcal{H}, \ |\varepsilon(h) - \hat{\varepsilon}(h)| \le \gamma \right) \ge 1 - 2k \exp(-2\gamma^2 n)

$$

从这个不等式我们可以衍生出三个等价视角（固定其中两个量，求解第三个量）：

1. **给定样本数 $n$ 和容忍误差 $\gamma$**：一致收敛成立的概率至少为 $1 - \delta$，其中失败概率 $\delta = 2k \exp(-2\gamma^2 n)$。

2. **给定失败概率 $\delta$ 和容忍误差 $\gamma$（求样本复杂度 $n$）**：令 $2k \exp(-2\gamma^2 n) \le \delta$，两边取对数解出所需的最小样本量：

$$

n \ge \frac{1}{2\gamma^2} \log \frac{2k}{\delta}

$$

3. **给定样本数 $n$ 和失败概率 $\delta$（求泛化间隔上界 $\gamma$）**：令 $2k \exp(-2\gamma^2 n) = \delta$，解出 $\gamma$：

$$

\gamma = \sqrt{\frac{1}{2n} \log \frac{2k}{\delta}}

$$

**第三步：利用三明治夹逼推导 ERM 超额风险界**。

假设一致收敛事件 $\forall h \in \mathcal{H}, \ |\varepsilon(h) - \hat{\varepsilon}(h)| \le \gamma$ 已经发生（其发生概率至少为 $1 - \delta$）。因为 $\hat{h} \in \mathcal{H}$ 且 $h^* \in \mathcal{H}$，一致收敛保证它们同时满足 $|\varepsilon(\cdot) - \hat{\varepsilon}(\cdot)| \le \gamma$。我们按如下三步链式放大：

$$

\begin{aligned}

\varepsilon(\hat{h}) &\le \hat{\varepsilon}(\hat{h}) + \gamma \qquad &&\text{（对 }\hat{h}\text{ 应用一致收敛：}\varepsilon(\hat{h}) - \hat{\varepsilon}(\hat{h}) \le \gamma\text{）} \\

&\le \hat{\varepsilon}(h^*) + \gamma \qquad &&\text{（由 ERM 定义，}\hat{h}\text{ 最小化训练误差，故 }\hat{\varepsilon}(\hat{h}) \le \hat{\varepsilon}(h^*)\text{）} \\

&\le \left(\varepsilon(h^*) + \gamma\right) + \gamma = \varepsilon(h^*) + 2\gamma \qquad &&\text{（对 }h^*\text{ 应用一致收敛：}\hat{\varepsilon}(h^*) - \varepsilon(h^*) \le \gamma\text{）}

\end{aligned}

$$

将 $\gamma = \sqrt{\frac{1}{2n} \log \frac{2k}{\delta}}$ 代入上式，我们便证明了有限假设类的核心泛化定理！

:::important[定理 8.3.1 (有限假设类的泛化误差界与样本复杂度)]

设 $|\mathcal{H}| = k$，对于任意固定的分布 $\mathcal{D}$ 和任意 $\delta \in (0, 1)$，当抽取 $n$ 个独立同分布的训练样本时，以至少 $1 - \delta$ 的概率，ERM 输出的假设 $\hat{h}$ 满足：

$$

\varepsilon(\hat{h}) \le \left( \min_{h \in \mathcal{H}} \varepsilon(h) \right) + 2 \sqrt{\frac{1}{2n} \log \frac{2k}{\delta}}

$$

- **对偏差-方差权衡的理论解释**：如果我们将假设类 $\mathcal{H}$ 扩大为更大的假设类 $\mathcal{H}' \supset \mathcal{H}$，第一项 $\min_{h \in \mathcal{H}} \varepsilon(h)$（对应**近似误差/偏差 Bias**）不会变大甚至显著减小；但与此同时，假设类大小 $k = |\mathcal{H}|$ 增大，导致第二项 $2\sqrt{\frac{1}{2n}\log\frac{2k}{\delta}}$（对应**估计误差/方差 Variance**）随之增大！

- **推论（样本复杂度 Sample Complexity）**：为了以至少 $1 - \delta$ 的概率保证 $\varepsilon(\hat{h}) \le \min_{h \in \mathcal{H}} \varepsilon(h) + 2\gamma$，所需的训练样本数只需满足：

$$

n \ge \frac{1}{2\gamma^2} \log \frac{2k}{\delta} = O\left(\frac{1}{\gamma^2} \log \frac{k}{\delta}\right)

$$

:::

#### 8.3.2 无限假设类与 VC 维 (Infinite $\mathcal{H}$ & Vapnik-Cheronenkis Dimension)

如果 $\mathcal{H}$ 包含连续实数参数（例如 $\mathbb{R}^d$ 中的所有线性分类器），从数学上讲 $|\mathcal{H}| = \infty$，定理 8.3.1 中的 $\log k$ 会变成 $\infty$。如何度量无限假设类的容量？

**视角一：64 位浮点数离散化启发式推导（Software Engineering Argument）**。

在计算机实现中，一个具有 $d$ 个实数参数的模型 $\theta \in \mathbb{R}^d$ 是用 64 位双精度浮点数（Double Precision Floating-Point）表示的。每个参数有 $2^{64}$ 种可能的二进制取值，因此整个参数空间在计算机中最多只能表示 $k = (2^{64})^d = 2^{64d}$ 个不同的假设！将 $\log k = \log(2^{64d}) = 64 d \log 2$ 代入有限假设类的样本复杂度公式，立刻得到：

$$

n \ge \frac{1}{2\gamma^2} \left( 64 d \log 2 + \log \frac{2}{\delta} \right) = O_{\gamma, \delta}(d)

$$

即**所需的训练样本数 $n$ 与模型的自由参数个数 $d$ 呈线性正比**！

**视角二：严格的 VC 维理论（Vapnik-Cheronenkis Dimension）**。

浮点数论证依赖于具体的参数化方式（例如给线性分类器冗余地复制两套参数，实质函数集没变，但参数量翻倍了）。为了给出不依赖于参数化表示的纯几何容量度量，Vapnik 和 Cheronenkis 提出了**打散（Shattering）**与 **VC 维**的概念：

:::note[定义：打散 (Shatter) 与 VC 维 ($\text{VC}(\mathcal{H})$)]

- **打散（Shattering）**：给定一个包含 $D$ 个输入点的有限点集 $S = \{x^{(1)}, x^{(2)}, \dots, x^{(D)}\} \subset \mathcal{X}$。一个二分类假设类 $\mathcal{H}$ 能够在 $S$ 上产生 $2^D$ 种可能的二元标记组合 $\{(y^{(1)}, \dots, y^{(D)}) \in \{0, 1\}^D\}$。如果对于 $S$ 的**全部 $2^D$ 种标记方式**，都存在某个 $h \in \mathcal{H}$ 能实现零错误分类（即 $\forall i, \ h(x^{(i)}) = y^{(i)}$），则称假设类 $\mathcal{H}$ **打散（Shatters）**了集合 $S$。

- **VC 维（$\text{VC}(\mathcal{H})$）**：假设类 $\mathcal{H}$ 的 VC 维定义为**能够被 $\mathcal{H}$ 打散的最大点集 $S$ 的大小 $D$**。如果 $\mathcal{H}$ 能打散任意有限大小的点集，则称 $\text{VC}(\mathcal{H}) = \infty$。

:::

:::warning[高频易错点：证明 $\text{VC}(\mathcal{H}) = D$ 必须分哪两步？]

许多同学误以为“只要找到某 3 个共线的点不能被线性分类器分开，就说明二维线性分类器的 VC 维小于 3”。**这是完全错误的！**

要证明 $\text{VC}(\mathcal{H}) = D$，必须同时完成以下两个不对等的证明步骤：

1. **证明 $\text{VC}(\mathcal{H}) \ge D$（存在性构造）**：只需在空间中**人为挑选出一组特定位置**的 $D$ 个点 $S = \{x^{(1)}, \dots, x^{(D)}\}$，证明它能被 $\mathcal{H}$ 打散（实现全部 $2^D$ 种标记）。

2. **证明 $\text{VC}(\mathcal{H}) < D + 1$（全称否定证明）**：必须证明对于空间中**任意位置**的 $D+1$ 个点（无一例外！），都至少存在一种标记方式是 $\mathcal{H}$ 无法实现的。

**经典实例：二维平面上的线性分类器 $\mathcal{H} = \{h(x) = \mathbf{1}\{\theta_0 + \theta_1 x_1 + \theta_2 x_2 \ge 0\}\}$**：

- 在 $\mathbb{R}^2$ 中取不共线的 3 个点（构成三角形顶点），无论给这 3 个点赋予 $2^3 = 8$ 种正负标签中的哪一种，总能画出一条直线将正负点严格分开，故 $\text{VC}(\mathcal{H}) \ge 3$。

- 对平面上**任意** 4 个点，由凸包理论（Radon 定理）：若其中一点在另外三点构成的三角形内部，则内部点为正、外部三点为负无法线性分开；若四点构成凸四边形，则将两条对角线的端点分别染成异号（XOR 构型）无法用一条直线分开。故任意 4 点均不可被打散，$\text{VC}(\mathcal{H}) = 3$。

- **一般结论**：$d$ 维欧氏空间 $\mathbb{R}^d$ 中含截距项的线性分类器，其 VC 维严格等于 **$\text{VC}(\mathcal{H}) = d + 1$**。

:::

:::important[定理 8.3.2 (Vapnik 一致收敛与泛化界定理)]

设假设类 $\mathcal{H}$ 的 VC 维为 $D = \text{VC}(\mathcal{H}) < \infty$。则对任意 $\delta > 0$，当样本量为 $n$ 时，以至少 $1 - \delta$ 的概率，对**所有** $h \in \mathcal{H}$ 同时成立：

$$

|\varepsilon(h) - \hat{\varepsilon}(h)| \le O\left( \sqrt{\frac{D}{n} \log \frac{n}{D} + \frac{1}{n} \log \frac{1}{\delta}} \right)

$$

进而，ERM 选出的假设 $\hat{h}$ 以至少 $1 - \delta$ 的概率满足：

$$

\varepsilon(\hat{h}) \le \varepsilon(h^*) + O\left( \sqrt{\frac{D}{n} \log \frac{n}{D} + \frac{1}{n} \log \frac{1}{\delta}} \right)

$$

**推论（无限假设类的样本复杂度）**：为了以至少 $1 - \delta$ 的概率保证对所有 $h \in \mathcal{H}$ 有 $|\varepsilon(h) - \hat{\varepsilon}(h)| \le \gamma$（从而 $\varepsilon(\hat{h}) \le \varepsilon(h^*) + 2\gamma$），所需的训练样本量为：

$$

n = O_{\gamma, \delta}(D)

$$

即**样本复杂度与模型的 VC 维 $D$ 呈线性正比**！对于大多数常规模型，VC 维 $D$ 与模型参数个数 $d$ 大致处于同一数量级。

:::

---

## 二、第 9 章：正则化与模型选择 (Regularization and Model Selection)

### 9.1 显式正则化 ($\ell_2$ Weight Decay s. $\ell_1$ LASSO)

既然过拟合的根源在于学到的模型参数范数过大、函数过于陡峭复杂，最直接的控制手段就是在训练损失 $J(\theta)$ 后显式加上一个非负的**正则化器（Regularizer）** $R(\theta)$，最小化正则化目标函数：

$$

J_\lambda(\theta) = J(\theta) + \lambda R(\theta) \tag{9.1}

$$

其中超参数 $\lambda \ge 0$ 控制对模型复杂度的惩罚力度。

#### 1. $\ell_2$ 正则化（岭回归 Ridge Regression / 权重衰减 Weight Decay）

取 $R(\theta) = \frac{1}{2} \|\theta\|_2^2 = \frac{1}{2} \sum_{j=1}^d \theta_j^2$。此时梯度下降的更新规则为：

$$

\theta \leftarrow \theta - \eta \nabla_\theta J_\lambda(\theta) = \theta - \eta \left( \nabla J(\theta) + \lambda \theta \right) = (1 - \lambda \eta) \theta - \eta \nabla J(\theta) \tag{9.2}

$$

观察式 $(9.2)$：在每一步梯度更新前，参数向量 $\theta$ 都会先乘以一个略小于 $1$ 的收缩因子 $(1 - \lambda \eta)$，使其向原点指数衰减——这就是深度学习中将 $\ell_2$ 正则化称为**权重衰减（Weight Decay）**的原因！此外，我们在第 5 章（核方法）中已经见过，$\ell_2$ 正则化保证最优解满足表示定理 $\theta = \sum_{i=1}^n \beta_i \phi(x^{(i)})$，因此**$\ell_2$ 正则化天然兼容核技巧（Kernel Trick）**。

#### 2. $\ell_0$ 与 $\ell_1$ 正则化（稀疏性 Sparsity 与 LASSO）

如果我们希望模型自动进行特征选择（即让绝大部分不重要特征的权重严格等于 $0$，得到**稀疏向量 Sparse Parameters**），最直观的指标是非零元素个数 $\|\theta\|_0 = \sum_{j=1}^d \mathbf{1}\{\theta_j \neq 0\}$。然而，$\|\theta\|_0$ 是非连续、非凸的阶跃函数，直接优化 $\|\theta\|_0$ 是 NP-Hard 组合优化问题。

为此，我们用 $\|\theta\|_0$ 的最优凸松弛——**$\ell_1$ 范数正则化（LASSO）** $R(\theta) = \|\theta\|_1 = \sum_{j=1}^d |\theta_j|$ 来替代：

- **为什么 $\ell_1$ 能产生精确的 $0$，而 $\ell_2$ 不能？** 当某个坐标 $\theta_j$ 接近 $0$ 时，$\ell_2$ 正则项 $\frac{1}{2}\theta_j^2$ 的导数为 $\theta_j \to 0$，向原点拉动的力变得微乎其微，因此参数只会无限逼近 $0$ 而不等于 $0$；相反，$\ell_1$ 正则项 $|\theta_j|$ 在 $\theta_j \neq 0$ 处的次梯度恒为常数 $\text{sign}(\theta_j) = \pm 1$，即使 $\theta_j$ 已经很小，它依然以恒定的力度 $\lambda$ 将 $\theta_j$ 直接推到 $0$ 并锁死在坐标轴上！

- **局限性**：$\ell_1$ 正则化破坏了内积结构，因此**无法与核技巧（Kernel Trick）结合使用**。

---

### 9.2 隐式正则化效应 (Implicit Regularization Effect)

在现代深度学习中，一个极具颠覆性的实验发现是：对于过参数化神经网络，**存在无穷多个训练损失完全相等（均等于 $0$）、甚至连显式 $\ell_2$ 范数 $\|\theta\|_2$ 都完全相同的全局极小值点**，但它们在测试集上的泛化误差却可能相差 $10\%$ 以上！

为什么不同的优化算法（或不同的超参数设置）即使最小化同一个无偏目标函数 $J(\theta)$，也会收敛到泛化性能截然不同的全局极小值？这种由优化算法自身的动力学轨迹赋予模型的归纳偏置，被称为**隐式正则化（Implicit Regularization / Algorithmic Regularization）**。

:::important[平坦极小值 s. 尖锐极小值 (Flat s. Sharp Global Minima)]

讲义第 9.2 节（图 9.1 与图 9.2）揭示了深度学习隐式正则化的核心几何机制：

- **尖锐极小值（Sharp Minimum）**：损失曲面在该极小值点附近的曲率极大（Hessian 矩阵 $\nabla^2 J(\theta)$ 的特征值很大）。由于测试集分布与训练集存在微小偏移，损失函数曲线在测试集上会发生轻微水平平移，尖锐极小值点在平移后的测试损失会急剧飙升！

- **平坦极小值（Flat Minimum）**：损失曲面在极小值点周围非常宽阔平坦（Hessian 曲率小，对应网络函数的 Lipschitz 常数更小、对输入扰动更鲁棒）。当训练损失向测试损失发生微小的分布偏移时，平坦极小值处的测试损失依然保持在极低水平。

**哪些训练策略能产生有利于泛化的隐式正则化（偏好平坦极小值）？**

1. **较大的初始学习率（Large Initial Learning Rate）**：步长较大时，梯度下降无法在狭窄陡峭的尖锐山谷中稳定停留，会被剧烈的梯度反弹出去，最终只能落入宽阔的平坦盆地。

2. **较小的批量大小（Small Mini-batch Size）**：小 Batch SGD 引入了显著的各向异性梯度噪声，这种随机振荡充当了隐式热运动，帮助模型逃离尖锐极小值。

3. **较小的权重初始化（Small Parameter Initialization）**：如 8.2 节所述，靠近原点的初始化使优化轨迹优先寻找最小范数/低复杂度的插值解。

4. **动量（Momentum）与归一化层（BatchNorm / LayerNorm）**：改善损失曲面的条件数，引导优化轨迹沿低曲率方向前进。

:::

---

### 9.3 交叉验证 (Cross Validation)

在实际工程中，我们需要从候选假设类集合（例如不同阶数的多项式 $d \in \{1, 2, \dots, 10\}$，或不同的正则化系数 $\lambda$）中挑选最优超参数。如果直接看谁在训练集 $S$ 上的误差最小，必然会选出最复杂、最过拟合的模型。为此，我们使用三种标准的**交叉验证（Cross Validation）**流程：

1. **留出交叉验证（Hold-out Cross Validation / Simple CV）**：

   - 将全部数据集 $S$ 随机划分为两部分：例如 $70\%$ 作为**训练集 $S_{\text{train}}$**，$30\%$ 作为**开发集/验证集 $S_{\text{c}}$（Hold-out Validation Set）**。

   - 在 $S_{\text{train}}$ 上分别训练各个候选模型 $h_i$，然后评估它们在从未参与训练的 $S_{\text{c}}$ 上的验证误差 $\hat{\varepsilon}_{S_{\text{c}}}(h_i)$，选出验证误差最小的模型（最后可在全部 $S$ 上重训或直接输出）。

   - *缺点*：浪费了 $30\%$ 的宝贵数据没有用于模型训练。

2. **$k$ 折交叉验证（$k$-Fold Cross Validation）**：

   - 当数据量适中或偏少时，将数据集 $S$ 随机均分为 $k$ 个不相交的子集（通常取 **$k = 10$**）：$S = S_1 \cup S_2 \cup \dots \cup S_k$。

   - 对每个候选模型，进行 $k$ 轮训练与评估：第 $j$ 轮留出子集 $S_j$ 作为验证集，在其余 $k-1$ 个子集的并集 $S \setminus S_j$ 上训练模型，并计算在 $S_j$ 上的测试误差 $\hat{\varepsilon}_{S_j}(h_{i, j})$。

   - 计算 $k$ 轮验证误差的平均值 $\frac{1}{k} \sum_{j=1}^k \hat{\varepsilon}_{S_j}(h_{i, j})$，选出平均验证误差最小的模型，最后在**全部数据 $S$** 上用该超参数重新训练一次最终模型。

3. **留一交叉验证（Leae-One-Out Cross Validation, LOOCV）**：

   - 即令 $k = n$（样本总数）的极端 $k$ 折交叉验证：每次只留出**单个样本** $(x^{(j)}, y^{(j)})$ 作为测试，在其余 $n-1$ 个样本上训练模型并检验该单点的预测误差，循环 $n$ 次取平均。

   - *适用场景*：计算代价极高（需训练 $n$ 次模型），仅在样本极其稀缺（例如 $n < 50$ 的医疗或罕见实验数据）时使用。

---

### 9.4 贝叶斯统计与正则化 (Bayesian Statistics and Regularization)

在第 1–4 章中，我们使用极大似然估计（MLE）求解参数：这是**频率派（Frequentist）**的观点——认为真实参数 $\theta$ 是一个未知但固定的常数向量。

与此相对，**贝叶斯学派（Bayesian）**认为：既然参数 $\theta$ 未知，我们就应当把 $\theta$ 视为一个**随机变量**，并用一个**先验分布（Prior Distribution）** $p(\theta)$ 来编码我们在看到数据之前对参数合理取值的信念（例如认为参数倾向于接近 $0$）。

给定训练集 $S = \{(x^{(i)}, y^{(i)})\}_{i=1}^n$，根据贝叶斯公式，观测数据后的参数**后验分布（Posterior Distribution）**为：

$$

p(\theta \mid S) = \frac{p(S \mid \theta) p(\theta)}{p(S)} = \frac{\left( \prod_{i=1}^n p(y^{(i)} \mid x^{(i)}, \theta) \right) p(\theta)}{\int_\theta \left( \prod_{i=1}^n p(y^{(i)} \mid x^{(i)}, \theta) \right) p(\theta) \, d\theta} \tag{9.3}

$$

在纯正的贝叶斯预测中，面对新测试输入 $x$，我们不对 $\theta$ 做单点估计，而是对后验分布求全概率积分，得到**后验预测分布（Posterior Predictie Distribution）**：

$$

p(y \mid x, S) = \int_\theta p(y \mid x, \theta) p(\theta \mid S) \, d\theta \tag{9.4}

$$

然而，当 $\theta \in \mathbb{R}^d$ 维数很高时，式 $(9.3)$ 分母中的高维积分 $p(S)$ 往往不存在解析解且无法直接计算。为此，我们在工程上退一步，不去求整个后验分布积分，而是寻找使后验概率密度 $p(\theta \mid S)$ 最大的单点估计——这就是**最大后验概率估计（Maximum A Posteriori, MAP）**：

$$

\theta_{\text{MAP}} = \arg\max_\theta p(\theta \mid S) = \arg\max_\theta \left( \prod_{i=1}^n p(y^{(i)} \mid x^{(i)}, \theta) \right) p(\theta) \tag{9.5}

$$

（注意式 $(9.3)$ 的分母与 $\theta$ 无关，因此在 $\arg\max_\theta$ 中被直接约去。）

:::important[核心等价定理：高斯先验下的 MAP 估计 $\iff \ell_2$ 正则化 (Weight Decay)]

假设我们对参数 $\theta \in \mathbb{R}^d$ 施加零均值各向同性高斯先验 $\theta \sim \mathcal{N}(0, \tau^2 I)$，其先验概率密度为：

$$

p(\theta) = \frac{1}{(2\pi)^{d/2} \tau^d} \exp\left( -\frac{\|\theta\|_2^2}{2\tau^2} \right)

$$

对 MAP 目标函数 $(9.5)$ 两边取自然对数（再取负号转化为最小化问题）：

$$

\begin{aligned}

\theta_{\text{MAP}} &= \arg\min_\theta \left\{ -\sum_{i=1}^n \log p(y^{(i)} \mid x^{(i)}, \theta) - \log p(\theta) \right\} \\

&= \arg\min_\theta \left\{ \underbrace{-\sum_{i=1}^n \log p(y^{(i)} \mid x^{(i)}, \theta)}_{\text{负对数似然训练损失 } J(\theta)} + \frac{1}{2\tau^2} \|\theta\|_2^2 \right\}

\end{aligned}

$$

对比式 $(9.1)$ 可见：**带有高斯先验 $\mathcal{N}(0, \tau^2 I)$ 的 MAP 估计，在数学上与正则化系数为 $\lambda = \frac{1}{2\tau^2}$（若线性回归噪声方差为 $\sigma^2$ 则对应 $\lambda = \frac{\sigma^2}{\tau^2}$）的 $\ell_2$ 正则化完全等价！** 先验方差 $\tau^2$ 越小（越坚信 $\theta$ 靠近原点），对应的正则化惩罚 $\lambda$ 就越大。同理，若取拉普拉斯先验（Laplace Prior）$p(\theta_j) = \frac{1}{2b}\exp(-|\theta_j|/b)$，则 MAP 估计完全等价于 **$\ell_1$ 正则化（LASSO）**！

:::

---

## 三、本章代码示例：双重下降现象与最小范数插值解实验

下面的 Python 代码完整复现了 CS229 第 8.2 节中过参数化线性模型的**双重下降（Double Descent）**曲线，并对比了无正则化最小范数伪逆解与 $\ell_2$ 岭回归（Ridge Regression）在内插阈值 $d = n$ 处的行为差异：

```python title="double_descent_simulation.py"
import numpy as np

def run_double_descent_experiment(n_train=30, n_test=500, d_max=80, sigma=0.3, seed=42):
    rng = np.random.default_rng(seed)
    # 真实生成模型存在于高维空间前 d_true=10 个坐标上
    d_true = 10
    theta_star_full = np.zeros(d_max)
    theta_star_full[:d_true] = rng.normal(0, 1.0, size=d_true) / np.sqrt(d_true)

    # 采样训练集与测试集特征 X ~ N(0, I)
    X_train_full = rng.normal(0, 1.0, size=(n_train, d_max))
    y_train = X_train_full @ theta_star_full + rng.normal(0, sigma, size=n_train)

    X_test_full = rng.normal(0, 1.0, size=(n_test, d_max))
    y_test = X_test_full @ theta_star_full + rng.normal(0, sigma, size=n_test)

    dims = [5, 10, 20, 28, 30, 32, 45, 60, 80]
    print(f"{'d':>4} | {'Train MSE':>10} | {'Test MSE (PinV)':>15} | {'||theta_min||_2':>15} | {'Test MSE (Ridge)':>16}")
    print("-" * 72)

    for d in dims:
        X_tr = X_train_full[:, :d]
        X_te = X_test_full[:, :d]

        # 1. 无正则化最小 L2 范数插值解（Moore-Penrose 伪逆，等价于从 0 初始化的 GD 收敛解）
        theta_min = np.linalg.pinv(X_tr) @ y_train
        train_mse = np.mean((y_train - X_tr @ theta_min) ** 2)
        test_mse_pinv = np.mean((y_test - X_te @ theta_min) ** 2)
        norm_theta = np.linalg.norm(theta_min)

        # 2. 加入 L2 正则化 (lambda = 1.0) 消除 d == n 处的奇异值爆炸尖峰
        lam = 1.0
        theta_ridge = np.linalg.solve(X_tr.T @ X_tr + lam * np.eye(d), X_tr.T @ y_train)
        test_mse_ridge = np.mean((y_test - X_te @ theta_ridge) ** 2)

        print(f"{d:4d} | {train_mse:10.4f} | {test_mse_pinv:15.4f} | {norm_theta:15.4f} | {test_mse_ridge:16.4f}")

if __name__ == "__main__":
    run_double_descent_experiment()
```

---

## 四、第 8–9 章课后推导与习题解答 (Exercises & Detailed Solutions)

### 习题 8.1：岭回归（Ridge Regression）的偏差-方差显式分解推导

设真实数据生成过程为 $y = X \theta^\star + \xi$，其中设计矩阵 $X \in \mathbb{R}^{n \times d}$ 固定（假设 $X^T X = n I_d$ 正交归一化），噪声向量 $\xi \sim \mathcal{N}(0, \sigma^2 I_n)$。考虑带 $\ell_2$ 正则化的岭回归目标函数：

$$

J_\lambda(\theta) = \frac{1}{2n} \|X\theta - y\|_2^2 + \frac{\lambda}{2} \|\theta\|_2^2

$$

(a) 求参数估计量 $\hat{\theta}_\lambda$ 的闭式解；

(b) 计算估计量 $\hat{\theta}_\lambda$ 的偏差向量 $\text{Bias}(\hat{\theta}_\lambda) = \mathbb{E}_\xi [\hat{\theta}_\lambda] - \theta^\star$ 的欧氏范数平方，以及协方差矩阵的迹 $\text{Tr}(\text{Co}(\hat{\theta}_\lambda))$；

(c) 证明总均方参数误差 $\mathbb{E}_\xi [\|\hat{\theta}_\lambda - \theta^\star\|_2^2]$ 关于 $\lambda$ 存在一个严格大于 $0$ 的最优值 $\lambda^* > 0$，使其严格小于无偏普通最小二乘估计（$\lambda = 0$）的均方误差！

:::spoiler[习题 8.1 解答]

**解**：

**(a) 闭式解推导**：

对 $J_\lambda(\theta)$ 关于 $\theta$ 求梯度并令其为 $0$：

$$
\nabla_\theta J_\lambda(\theta) = \frac{1}{n} X^T (X\theta - y) + \lambda \theta = \left(\frac{1}{n} X^T X + \lambda I_d\right)\theta - \frac{1}{n} X^T y = 0
$$

代入正交条件 $\frac{1}{n} X^T X = I_d$，得 $(1 + \lambda) \hat{\theta}_\lambda = \frac{1}{n} X^T y$。再将 $y = X\theta^\star + \xi$ 代入，有：

$$
\hat{\theta}_\lambda = \frac{1}{1 + \lambda} \left( \theta^\star + \frac{1}{n} X^T \xi \right)
$$

**(b) 偏差平方与方差计算**：

因为 $\mathbb{E}[\xi] = 0$，所以 $\mathbb{E}_\xi [\hat{\theta}_\lambda] = \frac{1}{1+\lambda} \theta^\star$。由此得到偏差向量及其范数平方：

$$
\|\text{Bias}(\hat{\theta}_\lambda)\|_2^2 = \left\| \frac{1}{1+\lambda}\theta^\star - \theta^\star \right\|_2^2 = \left(\frac{\lambda}{1+\lambda}\right)^2 \|\theta^\star\|_2^2
$$

可见当 $\lambda = 0$ 时偏差为 $0$（无偏估计），随着 $\lambda$ 增大，偏差单调递增。

再来计算协方差矩阵：

$$
\text{Co}(\hat{\theta}_\lambda) = \mathbb{E}_\xi \left[ \left(\hat{\theta}_\lambda - \mathbb{E}[\hat{\theta}_\lambda]\right)\left(\hat{\theta}_\lambda - \mathbb{E}[\hat{\theta}_\lambda]\right)^T \right] = \frac{1}{(1+\lambda)^2 n^2} X^T \underbrace{\mathbb{E}[\xi \xi^T]}_{\sigma^2 I_n} X = \frac{\sigma^2}{n(1+\lambda)^2} I_d
$$

求迹即得总方差：

$$
\text{Var}(\hat{\theta}_\lambda) = \text{Tr}(\text{Co}(\hat{\theta}_\lambda)) = \frac{d \sigma^2}{n(1+\lambda)^2}
$$

可见随着 $\lambda$ 增大，方差以 $(1+\lambda)^{-2}$ 的速度单调递减！

**(c) 最优正则化系数 $\lambda^* > 0$ 的存在性证明**：

总参数均方误差为偏差平方加方差：

$$
f(\lambda) = \mathbb{E}_\xi \left[\|\hat{\theta}_\lambda - \theta^\star\|_2^2\right] = \frac{\lambda^2}{(1+\lambda)^2} \|\theta^\star\|_2^2 + \frac{d\sigma^2}{n(1+\lambda)^2}
$$

对 $\lambda$ 求导：

$$
f'(\lambda) = \frac{2\lambda(1+\lambda)^2 \|\theta^\star\|_2^2 - 2(1+\lambda)\left(\lambda^2 \|\theta^\star\|_2^2 + \frac{d\sigma^2}{n}\right)}{(1+\lambda)^4} = \frac{2\left(\lambda \|\theta^\star\|_2^2 - \frac{d\sigma^2}{n}\right)}{(1+\lambda)^3}
$$

注意到在 $\lambda = 0$ 处，$f'(0) = -\frac{2d\sigma^2}{n} < 0$！这说明从 $\lambda = 0$ 开始稍微引入一点正的正则化（牺牲极其微小的有偏性，但大幅削减方差），总 MSE 必定严格下降！令 $f'(\lambda^*) = 0$，解得全局最优正则化系数为：

$$
\lambda^* = \frac{d \sigma^2}{n \|\theta^\star\|_2^2} > 0
$$

此时最小均方误差为 $f(\lambda^*) = \frac{d\sigma^2 / n}{1 + d\sigma^2 / (n\|\theta^\star\|_2^2)} < \frac{d\sigma^2}{n} = f(0)$。这从数学上完美阐释了“有偏估计击败无偏估计”的偏差-方差权衡哲学！ $\blacksquare$

:::

### 习题 8.2：一维闭区间与正弦波假设类的 VC 维计算

求实数轴 $\mathbb{R}$ 上以下三个二分类假设类的 VC 维 $\text{VC}(\mathcal{H})$，并给出严格证明：

(a) 阈值分类器（半射线）：$\mathcal{H}_1 = \{ h_a(x) = \mathbf{1}\{x \ge a\} : a \in \mathbb{R} \}$；

(b) 闭区间分类器：$\mathcal{H}_2 = \{ h_{a, b}(x) = \mathbf{1}\{a \le x \le b\} : a, b \in \mathbb{R}, \ a \le b \}$；

(c) 任意频率的正弦波分类器：$\mathcal{H}_3 = \{ h_\omega(x) = \mathbf{1}\{\sin(\omega x) \ge 0\} : \omega \in \mathbb{R} \}$。

:::spoiler[习题 8.2 解答]

**解**：

**(a) $\text{VC}(\mathcal{H}_1) = 1$**：

- 取单点集 $S = \{x^{(1)}\}$：当 $a \le x^{(1)}$ 时标记为 $1$，当 $a > x^{(1)}$ 时标记为 $0$，可打散 1 个点，故 $\text{VC}(\mathcal{H}_1) \ge 1$。

- 对任意两个不同的点 $x^{(1)} < x^{(2)}$，若要求标记为 $(y^{(1)}, y^{(2)}) = (1, 0)$，则需要 $x^{(1)} \ge a$ 且 $x^{(2)} < a$，从而得出 $x^{(2)} < a \le x^{(1)}$，与 $x^{(1)} < x^{(2)}$ 矛盾！因此任意 2 个点都无法被 $\mathcal{H}_1$ 打散，故 $\text{VC}(\mathcal{H}_1) = 1$。

**(b) $\text{VC}(\mathcal{H}_2) = 2$**：

- 取两个不同的点 $x^{(1)} < x^{(2)}$：4 种标记 $(0,0), (1,0), (0,1), (1,1)$ 分别可通过取闭区间 $[x^{(2)}+1, x^{(2)}+2]$、$[x^{(1)}, x^{(1)}]$、$[x^{(2)}, x^{(2)}]$、$[x^{(1)}, x^{(2)}]$ 全部实现，故 $\text{VC}(\mathcal{H}_2) \ge 2$。

- 对实数轴上**任意** 3 个点，不妨按从小到大排序为 $x^{(1)} < x^{(2)} < x^{(3)}$。考虑交替标记 $(y^{(1)}, y^{(2)}, y^{(3)}) = (1, 0, 1)$：若某个闭区间 $[a, b]$ 包含 $x^{(1)}$ 和 $x^{(3)}$（即 $a \le x^{(1)}$ 且 $x^{(3)} \le b$），由闭区间的凸性，中间点 $x^{(2)}$ 必然满足 $a \le x^{(1)} < x^{(2)} < x^{(3)} \le b$，故 $h_{a,b}(x^{(2)})$ 必定为 $1$，绝不可能为 $0$！因此任意 3 个点都无法被打散，$\text{VC}(\mathcal{H}_2) = 2$。

**(c) $\text{VC}(\mathcal{H}_3) = \infty$**：

- 尽管 $\mathcal{H}_3$ 只有 **1 个自由实数参数 $\omega$**，但它的 VC 维是无穷大！

- 对任意正整数 $D$，我们构造点集 $S = \{x^{(i)} = 2^{-i} : i = 1, 2, \dots, D\}$。对任意给定的二元标签序列 $(y^{(1)}, y^{(2)}, \dots, y^{(D)}) \in \{0, 1\}^D$，令 $b_i = 1 - y^{(i)} \in \{0, 1\}$，并构造频率参数：

$$
\omega = 2\pi \left( \sum_{j=1}^D b_j 2^{j-1} + \frac{1}{2^{D+1}} \right)
$$

此时对第 $i$ 个点 $x^{(i)} = 2^{-i}$，计算 $\frac{\omega x^{(i)}}{2\pi}$ 的小数部分，其整数部分是 $2\pi$ 的整数倍（在 $\sin$ 中直接消去），决定正负号的首位二进制小数位恰好是 $0.b_i\dots$！当 $y^{(i)}=1$（$b_i=0$）时相位落在 $(0, \pi)$，$\sin(\omega x^{(i)}) > 0$；当 $y^{(i)}=0$（$b_i=1$）时相位落在 $(\pi, 2\pi)$，$\sin(\omega x^{(i)}) < 0$。故任意大小的 $D$ 点集均可被打散，$\text{VC}(\mathcal{H}_3) = \infty$。这也证明了：**模型的 VC 维不一定等于参数个数 $d$**！ $\blacksquare$

:::

### 习题 9.1：拉普拉斯先验下的 MAP 估计与 LASSO ($\ell_1$ 正则化) 软阈值算子推导

在线性回归模型 $y^{(i)} = \theta^T x^{(i)} + \epsilon^{(i)}$（其中 $\epsilon^{(i)} \stackrel{\text{i.i.d.}}{\sim} \mathcal{N}(0, \sigma^2)$）中，假设我们对参数 $\theta \in \mathbb{R}^d$ 的各个分量施加独立同分布的**拉普拉斯先验（Laplace Prior）**：

$$

p(\theta) = \prod_{j=1}^d \frac{1}{2b} \exp\left( -\frac{|\theta_j|}{b} \right), \qquad b > 0

$$

(a) 证明该先验下的最大后验估计 $\theta_{\text{MAP}}$ 完全等价于正则化系数为 $\lambda = \frac{\sigma^2}{n b}$ 的 LASSO 问题：

$$

\min_{\theta \in \mathbb{R}^d} \frac{1}{2n} \|X\theta - y\|_2^2 + \lambda \|\theta\|_1

$$

(b) 假设设计矩阵正交归一化（$\frac{1}{n} X^T X = I_d$），记无正则化最小二乘解为 $\hat{\theta}^{\text{OLS}} = \frac{1}{n} X^T y$。利用次梯度最优性条件，推导 $\theta_{\text{MAP}}$ 每个坐标分量的闭式解（即著名的**软阈值算子 Soft-Thresholding Operator**），并直接从公式说明为什么 $\ell_1$ 正则化能产生精确的稀疏零解！

:::spoiler[习题 9.1 解答]

**解**：

**(a) MAP 与 LASSO 等价性证明**：

写出对数后验概率并舍去与 $\theta$ 无关的常数项：

$$
\begin{aligned}

\log p(\theta \mid S) &= \sum_{i=1}^n \log p(y^{(i)} \mid x^{(i)}, \theta) + \log p(\theta) + \text{const} \\

&= -\frac{1}{2\sigma^2} \sum_{i=1}^n \left(y^{(i)} - \theta^T x^{(i)}\right)^2 - \frac{1}{b} \sum_{j=1}^d |\theta_j| + \text{const}

\end{aligned}
$$

最大化 $\log p(\theta \mid S)$ 等价于最小化其相反数。两边同乘以正数 $\frac{\sigma^2}{n}$：

$$
\theta_{\text{MAP}} = \arg\min_{\theta \in \mathbb{R}^d} \left\{ \frac{1}{2n} \|X\theta - y\|_2^2 + \frac{\sigma^2}{n b} \|\theta\|_1 \right\}
$$

令 $\lambda = \frac{\sigma^2}{nb}$，即得标准 LASSO 目标函数。

**(b) 软阈值算子（Soft-Thresholding Operator）推导**：

当 $\frac{1}{n} X^T X = I_d$ 且 $\hat{\theta}^{\text{OLS}} = \frac{1}{n} X^T y$ 时，我们将目标函数展开并按坐标分量完全解耦：

$$
\begin{aligned}

\frac{1}{2n} \|X\theta - y\|_2^2 + \lambda \|\theta\|_1 &= \frac{1}{2}\theta^T \left(\frac{1}{n} X^T X\right) \theta - \theta^T \left(\frac{1}{n} X^T y\right) + \frac{1}{2n}\|y\|_2^2 + \lambda \|\theta\|_1 \\

&= \sum_{j=1}^d \left[ \frac{1}{2} \left(\theta_j - \hat{\theta}_j^{\text{OLS}}\right)^2 + \lambda |\theta_j| \right] + \text{const}

\end{aligned}
$$

因此，我们可以对每个坐标 $\theta_j$ 独立最小化一维凸函数 $g(\theta_j) = \frac{1}{2}(\theta_j - \hat{\theta}_j^{\text{OLS}})^2 + \lambda |\theta_j|$：

- **情形 1：$\theta_j > 0$**：此时 $|\theta_j| = \theta_j$，求导令 $g'(\theta_j) = \theta_j - \hat{\theta}_j^{\text{OLS}} + \lambda = 0 \implies \theta_j = \hat{\theta}_j^{\text{OLS}} - \lambda$。要满足 $\theta_j > 0$，必须有 $\hat{\theta}_j^{\text{OLS}} > \lambda$。

- **情形 2：$\theta_j < 0$**：此时 $|\theta_j| = -\theta_j$，求导令 $g'(\theta_j) = \theta_j - \hat{\theta}_j^{\text{OLS}} - \lambda = 0 \implies \theta_j = \hat{\theta}_j^{\text{OLS}} + \lambda$。要满足 $\theta_j < 0$，必须有 $\hat{\theta}_j^{\text{OLS}} < -\lambda$。

- **情形 3：$\theta_j = 0$**：根据凸函数次微分极小值充要条件 $0 \in \partial g(0)$，由于 $\partial |\theta_j|\big|_{\theta_j=0} = [-1, 1]$，有：

$$
0 \in -\hat{\theta}_j^{\text{OLS}} + \lambda [-1, 1] \iff \left|\hat{\theta}_j^{\text{OLS}}\right| \le \lambda
$$

综合以上三种情形，得到软阈值闭式解：

$$
\theta_{\text{MAP}, j} = \text{sign}\left(\hat{\theta}_j^{\text{OLS}}\right) \cdot \max\left\{ \left|\hat{\theta}_j^{\text{OLS}}\right| - \lambda, \ 0 \right\}
$$

**物理意义**：只要第 $j$ 个特征的无正则化相关性幅值 $|\hat{\theta}_j^{\text{OLS}}|$ 不超过阈值 $\lambda$，LASSO 就会将其系数**硬生生截断为精确的 $0$**（形成一个宽度为 $2\lambda$ 的死区 Dead Zone），从而实现自动特征筛选与稀疏化！ $\blacksquare$

:::

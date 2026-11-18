---
title: CS229 · 笔记（三） · 神经网络与反向传播
published: 2026-10-20
tags:
  - CS229
  - 深度学习
  - 反向传播
  - 神经网络
  - 自动微分
category: 机器学习
draft: false
description: 非线性监督学习与 Mini-batch SGD、单神经元到多层全连接网络（MLP）向量化、8 种激活函数与 GLU/SwiGLU 门控机制、与核方法的本质联系、现代模块（ResNet 残差、LayerNorm 缩放不变性证明、RMSNorm、多通道 1D/2D 卷积参数分析）以及反向传播（Backpropagation）复杂度定理、Hessian-向量积技巧与局部反向算子 B[g, z] 完整推导，附全章习题折叠解答。
---

## 导读

在 Part I（第 1–6 章）中，无论是线性模型 $h_\theta(x) = \theta^T x$ 还是核方法 $h_\theta(x) = \theta^T \phi(x)$，模型关于可学习参数 $\theta$ 都是**线性**的。当面对高度复杂的视觉、语音与自然语言任务时，手工设计特征映射 $\phi(x)$（Feature Engineering）不仅费时费力，而且上限受制于人类专家的先验知识。

本篇讨论神经网络与反向传播，内容包括以下几个部分：

1. **非线性监督学习与小批量随机梯度下降（Section 7.1）**：用统一的 Logits 主干输出 $\bar{h}_\theta(x)$ 统合回归、二分类与多分类损失函数，给出 **SGD（Algorithm 1）** 与 **Mini-batch SGD（Algorithm 2）** 的标准范式。

2. **多层神经网络、激活函数家族与自动特征学习（Section 7.2）**：从房价预测的 ReLU 折点（Kink）与双层乐高拼装网络出发，完成多层全连接网络（MLP）的矩阵向量化（Equations 7.17–7.23）；全面剖析 8 种标量激活函数及 **GLU/SwiGLU** 门控单元，证明恒等激活函数的矩阵坍缩定理（Equations 7.32–7.36），并揭示深度学习自动学习倒数第二层表征 $\phi_\beta(x) = a^{[r-1]}$ 的本质。

3. **现代神经网络核心模块（Section 7.3）**：形式化定义矩阵乘法模块 $\text{MM}_{W, b}$、**残差连接（ResNet）**、**层归一化（LayerNorm）与 RMSNorm**，严密证明 **LayerNorm 的参数缩放不变性定理（Equations 7.45–7.50）**，并推导单通道/多通道 1D 与 2D **卷积层（Conolutional Layers）**的带状 Toeplitz 参数共享矩阵 $Q$ 及参数量/计算复杂度。

4. **反向传播（Backpropagation）与批量向量化（Sections 7.4–7.5）**：阐述计算图上的 **$O(N)$ 线性时间反向传播定理（Theorem 7.4.1）** 与 **$O(N+\ell)$ 快速计算 Hessian-向量积 $\nabla^2 f(x)$ 推论**；引入极具现代感的**局部反向算子 $\mathcal{B}[g, z](v)$**，逐个下标证明 $\text{MM}$、激活层与损失层的反向函数（Equations 7.66–7.75），汇总完整的 **MLP 反向传播算法（Algorithm 3）**，最后打通论文列优先（Column-major）与 PyTorch/NumPy 行优先（Row-major）的批量矩阵转换法则。

---

:::tip[学习重点]

- 按模块写出前向计算和反向梯度的形状。
- 用链式法则与有限差分检查实现，关注归一化和残差连接。

:::

## 一、7.1 非线性模型监督学习与 Mini-batch SGD (Supervised Learning with Non-linear Models)

在进入具体的神经网络结构之前，我们先将假设模型抽象为一个关于参数 $\theta$ 和输入 $x \in \mathbb{R}^d$ **均为非线性**的参数化映射 $\bar{h}_\theta(x)$（例如可以临时想象一个玩具非线性模型 $\bar{h}_\theta(x) = \theta_1^2 x_1^2 + \dots + \theta_d^2 x_d^2$，见 Footnote 1）。为了统一处理三大监督学习任务，我们将模型主干输出记为 $\bar{h}_\theta(x)$（在分类任务中称为 **Logits**），并在全数据集 $\{(x^{(i)}, y^{(i)})\}_{i=1}^n$ 上定义平均损失函数：

$$

J(\theta) = \frac{1}{n} \sum_{i=1}^n J^{(i)}(\theta) \tag{7.2}

$$

（注：与第 1 章相比，这里在求和号前显式乘上了归一化因子 $\frac{1}{n}$，以便学习率 $\alpha$ 的尺度不随样本总数 $n$ 剧烈变化；乘以正常数不会改变 $J(\theta)$ 的任何局部或全局极小值点。）

### 1. 三大监督学习任务的损失函数统一表述 (Equations 7.1–7.7)

| 任务类型 | 网络主干输出 $\bar{h}_\theta(x)$ 空间 | 最终预测概率/输出 $h_\theta(x)$ | 单样本损失函数 $J^{(i)}(\theta)$ | 对应讲义公式编号 |
| :--- | :--- | :--- | :--- | :--- |
| **回归（Regression）** | $\mathbb{R}$ | $h_\theta(x) = \bar{h}_\theta(x)$ | $J^{(i)}(\theta) = \frac{1}{2}\left(h_\theta(x^{(i)}) - y^{(i)}\right)^2 = \ell_{\text{MSE}}\left(\bar{h}_\theta(x^{(i)}), y^{(i)}\right)$ | 式 $(7.1)$ |
| **二分类（Binary Classification）** | $\mathbb{R}$（标量 Logit） | $h_\theta(x) = g(\bar{h}_\theta(x)) = \frac{1}{1 + \exp(-\bar{h}_\theta(x))}$ | $J^{(i)}(\theta) = -\log p(y^{(i)} \mid x^{(i)}; \theta) = \ell_{\text{logistic}}\left(\bar{h}_\theta(x^{(i)}), y^{(i)}\right)$ | 式 $(7.3)\text{–}(7.4)$ |
| **多分类（Multi-class, $k$ 类）** | $\mathbb{R}^k$（$k$ 维 Logits） | $P(y=j \mid x; \theta) = \frac{\exp(\bar{h}_\theta(x)_j)}{\sum_{s=1}^k \exp(\bar{h}_\theta(x)_s)}$ | $J^{(i)}(\theta) = -\log \frac{\exp(\bar{h}_\theta(x^{(i)})_{y^{(i)}})}{\sum_{s=1}^k \exp(\bar{h}_\theta(x^{(i)})_s)} = \ell_{\text{ce}}\left(\bar{h}_\theta(x^{(i)}), y^{(i)}\right)$ | 式 $(7.5)\text{–}(7.7)$ |

（*推广*：上述框架可直接推广至任意指数分布族模型 $y \mid x; \theta \sim \text{ExponentialFamily}(y; \eta)$，只需将自然参数设为非线性网络输出 $\eta = \bar{h}_\theta(x)$ 即可！）

### 2. 优化器：SGD 与 Mini-batch SGD (Algorithms 1 & 2, Equations 7.8–7.10)

为了最小化非凸损失函数 $J(\theta)$，全批量梯度下降（GD）执行更新 $\theta := \theta - \alpha \nabla_\theta J(\theta)$（式 7.8）。在现代深度学习中，由于 GPU 并行计算一個小批量（Mini-batch）包含的 $B$ 个样本的梯度远快于串行计算 $B$ 次单样本梯度，最广泛使用的是 **Mini-batch SGD（Algorithm 2）**：

:::important[算法 1 & 算法 2：随机梯度下降 (SGD) 与小批量随机梯度下降 (Mini-batch SGD)]

**Algorithm 1：随机梯度下降 (Stochastic Gradient Descent)**

1. **超参数**：学习率 $\alpha > 0$，总迭代步数 $n_{\text{iter}}$。

2. 随机初始化参数 $\theta$。

3. **for** $i = 1$ **to** $n_{\text{iter}}$ **do**：

   - 从 $\{1, \dots, n\}$ 中均匀随机采样一个样本下标 $j$，按单样本梯度更新参数：

   $$

   \theta := \theta - \alpha \nabla_\theta J^{(j)}(\theta) \tag{7.9}

   $$

**Algorithm 2：小批量随机梯度下降 (Mini-batch Stochastic Gradient Descent)**

1. **超参数**：学习率 $\alpha > 0$，批量大小（Batch Size）$B$，总迭代步数 $n_{\text{iter}}$。

2. 随机初始化参数 $\theta$。

3. **for** $i = 1$ **to** $n_{\text{iter}}$ **do**：

   - 从 $\{1, \dots, n\}$ 中无放回均匀随机采样 $B$ 个样本下标 $j_1, \dots, j_B$，并行计算小批量平均梯度并更新：

   $$

   \theta := \theta - \frac{\alpha}{B} \sum_{k=1}^B \nabla_\theta J^{(j_k)}(\theta) \tag{7.10}

   $$

:::

由此，训练任何深度学习模型的标准三部曲即为：

1. **定义网络前向参数化结构** $\bar{h}_\theta(x)$（第 7.2–7.3 节）；

2. **编写反向传播算法（Backpropagation）** 高效计算单样本或小批量梯度 $\nabla_\theta J^{(j)}(\theta)$（第 7.4–7.5 节）；

3. **运行 Mini-batch SGD**（或 AdamW 等现代自适应一阶优化器）迭代更新参数 $\theta$。

---

## 二、7.2 神经网络：从单神经元、多层感知机 (MLP) 到现代激活函数

### 1. 从单神经元 (Single Neuron) 到乐高式神经元堆叠 (Stacking Neurons)

再次回到波特兰房价预测问题：假设我们拟合一条随房屋面积 $x$ 增长的直线，但房价绝不可能为负数。为了保证预测房价非负，我们在 $0$ 处引入一个折点（Kink，讲义图 7.1）：

$$

\bar{h}_\theta(x) = \max(w x + b, 0), \qquad \theta = (w, b) \in \mathbb{R}^2 \tag{7.11}

$$

在神经网络中，非线性函数 $\text{ReLU}(t) \triangleq \max\{t, 0\}$ 被称为**修正线性单元（Rectified Linear Unit, ReLU）**。一般地，任何将 $\mathbb{R}$ 映射为 $\mathbb{R}$ 的一维非线性函数都称为**激活函数（Actiation Function）**。当输入 $x \in \mathbb{R}^d$ 为多维向量时，包含**单个神经元（Single Neuron / 1-Layer Network）**的模型写为：

$$

\bar{h}_\theta(x) = \text{ReLU}(w^T x + b), \qquad \text{其中权重向量 } w \in \mathbb{R}^d, \text{ 偏置标量 } b \in \mathbb{R} \tag{7.12}

$$

**乐高积木式堆叠（讲义图 7.2 房价预测网络实例）**：

假设输入包含 4 个原始特征：$x_1$（面积 Size）、$x_2$（卧室数 #Bedrooms）、$x_3$（邮政编码 Zip Code）、$x_4$（社区富裕程度 Wealth）。我们可以先用 3 个隐藏神经元（Hidden Units / Neurons）$a_1, a_2, a_3$ 提取高级语义特征：

- $a_1 = \text{ReLU}(\theta_1 x_1 + \theta_2 x_2 + \theta_3)$：由面积和卧室数预测**可容纳家庭规模（Family Size）**；

- $a_2 = \text{ReLU}(\theta_4 x_3 + \theta_5)$：由邮编预测**社区步行便利度（Walkability）**；

- $a_3 = \text{ReLU}(\theta_6 x_3 + \theta_7 x_4 + \theta_8)$：由邮编和富裕程度预测**学区质量（School Quality）**；

最后将这 3 个衍生特征线性组合输出最终房价预测（式 7.13，共含 $\theta_1, \dots, \theta_{12}$ 计 12 个参数）：

$$

\bar{h}_\theta(x) = \theta_9 a_1 + \theta_{10} a_2 + \theta_{11} a_3 + \theta_{12} \tag{7.13}

$$

### 2. 两层与多层全连接网络 (MLP) 及其矩阵向量化 (Equations 7.14–7.23)

在图 7.2 中，我们凭人类先验知识硬性规定了“$a_1$ 只看 $x_1, x_2$”。在缺乏先验知识的通用任务中，最灵活的做法是让每个隐藏神经元 $a_j$ 连接**所有**输入特征 $x_1, \dots, x_d$——这就是**全连接神经网络（Fully-Connected Neural Network）**！

对于包含 $m$ 个隐藏神经元的两层全连接网络（又称单隐层网络 One-Hidden-Layer Network），第 $j$ 个神经元（$j \in \{1, \dots, m\}$）计算（式 7.15–7.16）：

$$

z_j = w_j^{[1]T} x + b_j^{[1]} \quad \left(w_j^{[1]} \in \mathbb{R}^d, \ b_j^{[1]} \in \mathbb{R}\right), \qquad a_j = \text{ReLU}(z_j), \qquad \bar{h}_\theta(x) = w^{[2]T} a + b^{[2]} \quad \left(w^{[2]} \in \mathbb{R}^m, \ b^{[2]} \in \mathbb{R}\right) \tag{7.15–7.16}

$$

:::important[向量化 (Vectorization)：告别低效 `for` 循环，释放 GPU 矩阵算力 (Equations 7.17–7.21)]

如果在代码中用 `for j in range(m)` 逐个计算式 $(7.15)$，在高维场景下速度会慢得无法接受。我们将第 1 层的 $m$ 个权重行向量 $w_j^{[1]T} \in \mathbb{R}^{1 \times d}$ 上下拼接为一个 **$m \times d$ 权重矩阵 $W^{[1]} \in \mathbb{R}^{m \times d}$**，并将偏置拼成列向量 $b^{[1]} \in \mathbb{R}^{m \times 1}$（式 7.17–7.19）：

$$

W^{[1]} = \begin{bmatrix}

— \ w_1^{[1]T} \ — \\

— \ w_2^{[1]T} \ — \\

\dots \\

— \ w_m^{[1]T} \ —

\end{bmatrix} \in \mathbb{R}^{m \times d} \implies

\underbrace{\begin{bmatrix} z_1 \\ \dots \\ z_m \end{bmatrix}}_{z \in \mathbb{R}^{m \times 1}} =

\underbrace{\begin{bmatrix} — \ w_1^{[1]T} \ — \\ \dots \\ — \ w_m^{[1]T} \ — \end{bmatrix}}_{W^{[1]} \in \mathbb{R}^{m \times d}}

\underbrace{\begin{bmatrix} x_1 \\ \dots \\ x_d \end{bmatrix}}_{x \in \mathbb{R}^{d \times 1}} +

\underbrace{\begin{bmatrix} b_1^{[1]} \\ \dots \\ b_m^{[1]} \end{bmatrix}}_{b^{[1]} \in \mathbb{R}^{m \times 1}} = W^{[1]} x + b^{[1]} \tag{7.17–7.19}

$$

重载 $\text{ReLU}(z)$ 表示对向量 $z$ 按元素逐位（Element-wise）并行作用 ReLU，并记 $W^{[2]} = [w^{[2]T}] \in \mathbb{R}^{1 \times m}$，两层全连接网络化为极简矩阵表达式（式 7.21）：

$$

a = \text{ReLU}\left(W^{[1]} x + b^{[1]}\right), \qquad \bar{h}_\theta(x) = W^{[2]} a + b^{[2]} \tag{7.21}

$$

:::

继续堆叠 $r$ 层权重矩阵 $W^{[1]}, \dots, W^{[r]}$ 与偏置 $b^{[1]}, \dots, b^{[r]}$，即得到 **$r$ 层全连接神经网络（Multi-Layer Perceptron, MLP，Equations 7.22–7.23）**：

$$

\begin{aligned}

a^{[1]} &= \text{ReLU}\left(W^{[1]} x + b^{[1]}\right) \\

a^{[2]} &= \text{ReLU}\left(W^{[2]} a^{[1]} + b^{[2]}\right) \\

&\ \ \dots \\

a^{[r-1]} &= \text{ReLU}\left(W^{[r-1]} a^{[r-2]} + b^{[r-1]}\right) \\

\bar{h}_\theta(x) &= W^{[r]} a^{[r-1]} + b^{[r]} \tag{7.22}

\end{aligned}

$$

- **维度兼容性与总参数量核算**：设第 $k$ 层激活向量为 $a^{[k]} \in \mathbb{R}^{m_k}$（记输入层 $a^{[0]} = x \in \mathbb{R}^{m_0}$，其中 $m_0 = d$；输出层维度为 $m_r$）。则第 $k$ 层权重矩阵必有形状 **$W^{[k]} \in \mathbb{R}^{m_k \times m_{k-1}}$**，偏置为 **$b^{[k]} \in \mathbb{R}^{m_k}$**。

  - 全网**总神经元个数**为：$m_1 + m_2 + \dots + m_r$；

  - 全网**总可学习参数个数**为：$(d + 1)m_1 + (m_1 + 1)m_2 + \dots + (m_{r-1} + 1)m_r = \sum_{k=1}^r (m_{k-1} + 1)m_k$。

- **为什么最后一层 $W^{[r]} a^{[r-1]} + b^{[r]}$ 不加 ReLU？（Footnote 3）**：因为回归输出或分类 Logits 需要能够取任意负数或正数，且保留线性顶层便于将其解释为学习到的特征之上的线性模型。

---

### 3. 激活函数大家族与门控线性单元 GLU / SwiGLU (Equations 7.24–7.31)

我们可以将 MLP 中的 $\text{ReLU}$ 替换为任意逐元素非线性函数 $\sigma : \mathbb{R} \to \mathbb{R}$。讲义第 90–91 页系统梳理了现代深度学习中的 **8 种核心激活函数**（含导数与架构定位对比）：

| 激活函数名称 | 数学定义 $\sigma(z)$ | 一阶导数 $\sigma'(z)$（反向传播必备） | 特性、缺陷与现代大模型应用场景 |
| :--- | :--- | :--- | :--- |
| **ReLU** | $\max\{z, 0\}$ | $\mathbf{1}\{z > 0\}$ | 正半轴导数恒为 $1$ 不衰减；负半轴梯度为 $0$（神经元死亡）。 |
| **Sigmoid** (7.24) | $\dfrac{1}{1 + e^{-z}}$ | $\sigma(z)(1 - \sigma(z))$ | 双侧有界于 $(0, 1)$，当 $z \to \pm\infty$ 时**梯度指数消失**；现用于 **MoE 路由门控**与**门控注意力（Gated Attention）**。 |
| **Tanh** (7.25) | $\dfrac{e^z - e^{-z}}{e^z + e^{-z}}$ | $1 - \tanh^2(z)$ | 零中心化、有界于 $(-1, 1)$，同样在两端存在梯度消失。 |
| **Leaky ReLU** (7.26) | $\max\{z, \gamma z\}, \ \gamma \in (0, 1)$ | $z > 0$ 时为 $1$，否则为 $\gamma$ | 给负半轴保留微小斜率 $\gamma$，解决 Dead ReLU 问题。 |
| **$\text{Swish}_\beta$ / SiLU** (7.27) | $\dfrac{z}{1 + e^{-\beta z}} \ (\beta > 0)$ | $\sigma(z) + \beta z \, g(\beta z)(1 - g(\beta z))$ | 平滑非单调自门控函数（Ramachandran et al., 2017）；$\beta = 1$ 时称为 **SiLU**，用于 EfficientNet 与 LLaMA。 |
| **GELU** (7.28) | $\dfrac{z}{2}\left[1 + \text{erf}\left(\dfrac{z}{\sqrt{2}}\right)\right] = z \Phi(z)$ | $\Phi(z) + z \phi(z)$（$\Phi, \phi$ 为标准正态 CDF/PDF） | 高斯误差线性单元（Hendrycks & Gimpel, 2016），BERT、GPT 及扩散模型（Hunyuan-DiT）标配。 |
| **$\text{ReLU}^2$** (7.29) | $\max\{z, 0\}^2$ | $2 \max\{z, 0\}$ | 一阶导数连续，在 Primer 与稀疏大模型（Sparse LLMs）中显著增强激活稀疏度。 |
| **Softplus** (7.30) | $\dfrac{1}{\beta} \log\left(1 + \exp(\beta z)\right)$ | $\dfrac{1}{1 + e^{-\beta z}}$ | ReLU 的二阶光滑近似（导数恰为带缩放的 Sigmoid）。 |
| **GLU / SwiGLU** (7.31) | $\text{GLU}(h) = (W_1 h + b_1) \odot g(W_2 h + b_2)$ | 乘法法则双分支求导（见习题 7.1） | **门控线性单元**（非标量映射）：用两条仿射变换做逐元素乘法门控；当 $g$ 取 SiLU 时即 **SwiGLU**，是 **LLaMA、Qwen、GPT-OSS** 等现代 Transformer FFN 层的绝对统治架构！ |

:::warning[基本原理证明：为什么绝不能用恒等函数 $\sigma(z) = z$ 作激活函数？(Equations 7.32–7.36)]

假设偏置 $b^{[1]} = 0, \ b^{[2]} = 0$，如果我们把激活函数换成线性恒等映射 $\sigma(z) = z$，那么两层神经网络的前向输出为：

$$

\begin{aligned}

\bar{h}_\theta(x) &= W^{[2]} a^{[1]} \qquad \text{(7.32)} \\

&= W^{[2]} \sigma(z^{[1]}) \qquad \text{(7.33)} \\

&= W^{[2]} z^{[1]} \qquad &&\text{（因为 }\sigma(z) = z\text{）} \qquad \text{(7.34)} \\

&= W^{[2]} W^{[1]} x \qquad &&\text{（由式 7.18）} \qquad \text{(7.35)} \\

&= \tilde{W} x \qquad &&\text{（其中 }\tilde{W} = W^{[2]} W^{[1]}\text{）} \qquad \text{(7.36)}

\end{aligned}

$$

**结论**：由于线性变换的复合仍然是线性变换，多层矩阵连乘 $W^{[r]} W^{[r-1]} \cdots W^{[1]}$ 会直接**坍缩（Collapse）为单个等效权重矩阵 $\tilde{W}$**！如果没有非线性激活函数，1000 层的深度神经网络在表达能力上与 1 层普通线性回归没有任何区别！

:::

### 4. 与核方法的深刻联系：自动学习特征映射 (Connection to Kernel Method, Equation 7.37)

在式 $(7.22)$ 的 $r$ 层神经网络中，如果我们把前 $r-1$ 层的所有参数集合记为 $\beta = \{W^{[1]}, b^{[1]}, \dots, W^{[r-1]}, b^{[r-1]}\}$，则倒数第二层激活向量 $a^{[r-1]}$ 完全由输入 $x$ 和参数 $\beta$ 决定，记作 $a^{[r-1]} = \phi_\beta(x)$。此时网络顶层输出写为：

$$

\bar{h}_\theta(x) = W^{[r]} \phi_\beta(x) + b^{[r]} \tag{7.37}

$$

对比第 5 章核方法 $\theta^T \phi(x)$：核方法中的 $\phi(x)$ 是人工预先写死的固定函数；而在深度学习中，**我们同时联合优化顶层线性模型 $(W^{[r]}, b^{[r]})$ 和底层特征映射本身的参数 $\beta$**！因此，深度学习的本质就是**自动特征工程（Automatic Representation Learning）**，倒数第二层激活向量 $a^{[r-1]} = \phi_\beta(x)$ 即为网络从数据中自动涌现出的**学习表征（Learned Representations）**。

---

## 三、7.3 现代神经网络的核心构建模块 (Modules in Modern Neural Networks)

为了像搭积木一样清晰表达现代复杂网络，我们把带参数 $(W, b)$ 的仿射变换抽象为基础模块 $\text{MM}_{W, b}(z) = Wz + b$（式 7.38）。如此一来，$r$ 层 MLP 可简洁写为模块复合（式 7.39–7.40）：

$$

\text{MLP}(x) = \text{MM}_{W^{[r]}, b^{[r]}}\left( \sigma\left( \text{MM}_{W^{[r-1]}, b^{[r-1]}}\left( \sigma\left( \cdots \text{MM}_{W^{[1]}, b^{[1]}}(x) \right) \right) \right) \right) = \text{MM}(\sigma(\text{MM}(\sigma(\cdots \text{MM}(x))))) \tag{7.39–7.40}

$$

（*注：讲义约定不同位置出现的同名模块 $\text{MM}$ 默认拥有各自独立的参数集合。*）

### 1. 残差连接 (Residual Connections / ResNet, Equations 7.41–7.42)

当普通 MLP 堆叠超过几十层时，梯度在连乘中极易消失或爆炸，甚至训练误差都会反常退化。He et al. [2016] 提出的 **ResNet（残差网络）** 在两层非线性变换旁并联了一条恒等跨层捷径（Skip Connection，式 7.41–7.42）：

$$

\text{Res}(z) = z + \sigma\left(\text{MM}(\sigma(\text{MM}(z)))\right), \qquad \text{ResNet-S}(x) = \text{MM}\left(\text{Res}(\text{Res}(\cdots \text{Res}(x)))\right) \tag{7.41–7.42}

$$

只要子模块的权重初始化接近于 $0$，每个 $\text{Res}(z) \approx z$ 就天然保持恒等映射，反向传播时上游梯度可以沿着 $+$ 号无损直达网络最底层！

---

### 2. 层归一化 (LayerNorm)、RMSNorm 与权重缩放不变性证明 (Equations 7.43–7.51)

为了把深层网络各层激活值的均值和方差稳定在受控范围内，现代架构广泛插入归一化层。给定隐藏层向量 $z \in \mathbb{R}^m$，**层归一化（Layer Normalization, LN）**分两步定义：

1. **无参数标准化子模块 $\text{LN-S}(z)$（式 7.43）**：计算单个样本特征向量 $z$ 内部各分量的经验均值 $\hat{\mu}$ 与经验标准差 $\hat{\sigma}$：

$$

\hat{\mu} = \frac{1}{m} \sum_{i=1}^m z_i, \qquad \hat{\sigma} = \sqrt{\frac{1}{m} \sum_{i=1}^m (z_i - \hat{\mu})^2}, \qquad \text{LN-S}(z) = \begin{bmatrix} \frac{z_1 - \hat{\mu}}{\hat{\sigma}} \\ \frac{z_2 - \hat{\mu}}{\hat{\sigma}} \\ \dots \\ \frac{z_m - \hat{\mu}}{\hat{\sigma}} \end{bmatrix} \in \mathbb{R}^m \tag{7.43}

$$

（*注：见 Footnote 4，这里分母除以 $m$ 而非统计学无偏估计的 $m-1$，是因为我们的目标是严格强制输出向量 $\text{LN-S}(z)$ 的经验均值等于 $0$、经验方差等于 $1$（即分量平方和恒等于 $m$）！*）

2. **可学习仿射重缩放 $\text{LN}(z)$（式 7.44）**：引入可学习的标量（或逐维向量）均值参数 $\beta$ 和标准差参数 $\gamma$：

$$

\text{LN}(z) = \beta + \gamma \cdot \text{LN-S}(z) = \begin{bmatrix} \beta + \gamma \left(\frac{z_1 - \hat{\mu}}{\hat{\sigma}}\right) \\ \dots \\ \beta + \gamma \left(\frac{z_m - \hat{\mu}}{\hat{\sigma}}\right) \end{bmatrix} \tag{7.44}

$$

:::important[定理 7.3.1：LayerNorm 的参数缩放不变性证明 (Scale-Inariance Property, Equations 7.45–7.50)]

**定理**：将线性层 $\text{MM}_{W, b}(z) = Wz + b$ 的权重 $W$ 和偏置 $b$ 同时乘以任意正实数 $\alpha > 0$，复合模块 $\text{LN}(\text{MM}_{W, b}(z))$ 的输出**完全不变**：

$$

\text{LN}\left(\text{MM}_{\alpha W, \alpha b}(z)\right) = \text{LN}\left(\text{MM}_{W, b}(z)\right), \qquad \forall \alpha > 0 \tag{7.45}

$$

**严格证明**：

首先验证 $\text{LN-S}(\alpha z) = \text{LN-S}(z)$：当向量 $z$ 被放大为 $\alpha z \ (\alpha > 0)$ 时，新均值为 $\frac{1}{m}\sum_i (\alpha z_i) = \alpha \hat{\mu}$，新标准差为 $\sqrt{\frac{1}{m}\sum_i (\alpha z_i - \alpha \hat{\mu})^2} = \alpha \hat{\sigma}$。代入式 $(7.43)$，分子与分母中的正因子 $\alpha$ 精确约消（式 7.46）：

$$

\text{LN-S}(\alpha z) = \begin{bmatrix} \frac{\alpha z_1 - \alpha \hat{\mu}}{\alpha \hat{\sigma}} \\ \dots \\ \frac{\alpha z_m - \alpha \hat{\mu}}{\alpha \hat{\sigma}} \end{bmatrix} = \begin{bmatrix} \frac{z_1 - \hat{\mu}}{\hat{\sigma}} \\ \dots \\ \frac{z_m - \hat{\mu}}{\hat{\sigma}} \end{bmatrix} = \text{LN-S}(z) \tag{7.46}

$$

再由线性层齐次性 $\text{MM}_{\alpha W, \alpha b}(z) = \alpha W z + \alpha b = \alpha \text{MM}_{W, b}(z)$，立即得到（式 7.47–7.50）：

$$

\text{LN}\left(\text{MM}_{\alpha W, \alpha b}(z)\right) = \beta + \gamma \text{LN-S}\left(\text{MM}_{\alpha W, \alpha b}(z)\right) = \beta + \gamma \text{LN-S}\left(\alpha \text{MM}_{W, b}(z)\right) = \beta + \gamma \text{LN-S}\left(\text{MM}_{W, b}(z)\right) = \text{LN}\left(\text{MM}_{W, b}(z)\right) \qquad \blacksquare

$$

**全局推论**：在现代视觉与语言大模型中，由于除了最后一层分类头 $W_{\text{last}}$ 外，每个线性层后都跟着归一化层，整个网络对除最后一层外的所有权重 $W$ 均满足全局缩放不变性：**$f_{W_{\text{last}}, \alpha W}(x) = f_{W_{\text{last}}, W}(x) \ (\forall \alpha > 0)$**！这意味着权重的绝对大小不影响网络函数，只有权重的方向和有效学习率才起作用。

:::

- **RMSNorm（均方根层归一化，Zhang & Sennrich 2019，Equation 7.51）**：

  在 LLaMA、Qwen、DeepSeek 等现代 Decoder-only Transformer 中，进一步省去了减均值 $\hat{\mu}$ 的步骤，直接除以分量的均方根（Root Mean Square），节省约 $7\%\text{–}40\%$ 的归一化访存时间且同样具备缩放不变性：

  $$

  \text{RMSNorm}(z) = \gamma \cdot \frac{z}{\sqrt{\frac{1}{m} \sum_{i=1}^m z_i^2}} \tag{7.51}

  $$

---

### 3. 卷积层 (1D & 2D Conolutional Layers)：Toeplitz 矩阵与参数共享 (Equations 7.52–7.55)

在处理具有空间或时间局部平移不变性的信号（如图像、语音、文本）时，全连接矩阵乘法 $\text{MM}_{W, b}$ 参数量过大且破坏了空间局部拓扑。**卷积层（Conolutional Layer）**是具有**局部连接与参数共享（Parameter Sharing）**特性的结构化矩阵乘法！

#### 1. 单通道 1D 卷积 $\text{Con1D-S}(z)$ 与带状 Toeplitz 矩阵 $Q$ (Equations 7.52–7.53)

设输入向量为 $z \in \mathbb{R}^m$，卷积核（Filter / Kernel）为 $w \in \mathbb{R}^k$（其中窗口大小 $k = 2\ell + 1 \ll m$ 为奇数）。首先在 $z$ 的首尾两端各补 $\ell$ 个零（Zero-Padding）：令 $z_{1-\ell} = \dots = z_0 = 0$ 且 $z_{m+1} = \dots = z_{m+\ell} = 0$。则输出向量 $\text{Con1D-S}(z) \in \mathbb{R}^m$ 的第 $i$ 个分量定义为局部滑动窗口内积（式 7.52）：

$$

\text{Con1D-S}(z)_i = w_1 z_{i-\ell} + w_2 z_{i-\ell+1} + \dots + w_{2\ell+1} z_{i+\ell} = \sum_{j=1}^{2\ell+1} w_j z_{i - \ell + (j - 1)} \tag{7.52}

$$

把上式写成矩阵与向量相乘 $\text{Con1D-S}(z) = Q z$，则等效权重矩阵 $Q \in \mathbb{R}^{m \times m}$ 是一个每条对角线上元素恒相等（$Q_{i, j} = Q_{i-1, j-1}$）的**带状常对角矩阵（Banded Toeplitz Matrix，式 7.53）**：

$$

Q = \begin{bmatrix}

w_{\ell+1} & \cdots & w_{2\ell+1} & 0 & 0 & \cdots & 0 \\

w_\ell & \cdots & w_{2\ell} & w_{2\ell+1} & 0 & \cdots & 0 \\

\dots & \ddots & \ddots & \ddots & \ddots & \ddots & \dots \\

w_1 & \cdots & w_{\ell+1} & \cdots & w_{2\ell+1} & \cdots & 0 \\

0 & w_1 & \cdots & \cdots & w_{2\ell} & w_{2\ell+1} & 0 \\

\dots & \ddots & \ddots & \ddots & \ddots & \ddots & \dots \\

0 & \cdots & 0 & w_1 & \cdots & \cdots & w_{\ell+1}

\end{bmatrix} \in \mathbb{R}^{m \times m} \tag{7.53}

$$

#### 2. 多通道 1D 卷积与 2D 卷积参数量及复杂度全景对比 (Equations 7.54–7.55)

- **多通道 1D 卷积 $\text{Con1D}$（式 7.54）**：输入包含 $C$ 个通道 $z = (z_1, \dots, z_C) \in \mathbb{R}^{m \times C}$，输出 $C'$ 个通道 $\text{Con1D}(z) \in \mathbb{R}^{m \times C'}$。每个输出通道 $i \in \{1, \dots, C'\}$ 是对所有 $C$ 个输入通道分别作用独立的单通道卷积核 $\text{Con1D-S}_{i, j}$ 后求和：

$$

\forall i \in [C'], \qquad \text{Con1D}(z)_i = \sum_{j=1}^C \text{Con1D-S}_{i, j}(z_j) \tag{7.54}

$$

- **多通道 2D 卷积 $\text{Con2D}$（式 7.55）**：输入三维图像张量 $z = (z_1, \dots, z_C) \in \mathbb{R}^{m \times m \times C}$，使用 $k \times k$ 二维卷积核，输出 $\mathbb{R}^{m \times m \times C'}$：

$$

\forall i \in [C'], \qquad \text{Con2D}(z)_i = \sum_{j=1}^C \text{Con2D-S}_{i, j}(z_j) \tag{7.55}

$$

| 模块类型 | 输入维度 | 输出维度 | 可学习参数量（不含偏置） | 前向计算时间复杂度 |
| :--- | :--- | :--- | :--- | :--- |
| **普通全连接层（1D 单通道对比）** | $\mathbb{R}^m$ | $\mathbb{R}^m$ | $m^2$ | $O(m^2)$ |
| **单通道 1D 卷积 $\text{Con1D-S}$** | $\mathbb{R}^m$ | $\mathbb{R}^m$ | **$k$**（其中 $k \ll m$） | **$O(k m)$** |
| **多通道 1D 卷积 $\text{Con1D}$** | $\mathbb{R}^{m \times C}$ | $\mathbb{R}^{m \times C'}$ | **$k C C'$**（3D 张量 $k \times C \times C'$，对比全连接 $m^2 C C'$） | **$O(k m C C')$** |
| **多通道 2D 卷积 $\text{Con2D}$** | $\mathbb{R}^{m \times m \times C}$ | $\mathbb{R}^{m \times m \times C'}$ | **$C C' k^2$**（4D 张量 $C \times C' \times k \times k$） | **$O(m^2 k^2 C C')$** |

---

## 四、7.4 反向传播与自动微分 (Backpropagation / Auto-differentiation)

### 1. 反向传播线性时间复杂度定理与 Hessian-向量积推论 (Theorem 7.4.1)

设一个可微计算电路（Differentiable Circuit）由 $N$ 个基本算术运算（加、减、乘、除）和初等可微函数（ReLU、$\exp$、$\log$、$\sin$ 等，每个基本运算及其导数均耗时 $O(1)$）复合而成，计算标量函数 $f : \mathbb{R}^\ell \to \mathbb{R}$。

:::important[定理 7.4.1 (反向传播 $O(N)$ 时间复杂度定理) 与二阶导数推论]

**定理 7.4.1**：若规模为 $N$ 的可微电路计算实值标量函数 $f : \mathbb{R}^\ell \to \mathbb{R}$，则其全梯度向量 $\nabla f \in \mathbb{R}^\ell$ 可以在 **$O(N)$ 时间**内、由一个规模同样为 $O(N)$ 的可微电路精确算出！（注：见 Footnote 5，若 $N < \ell$，未被使用的输入坐标梯度默认置零，不计入运行时间。）

- **物理意义**：对于拥有百亿参数的神经网络，**反向传播计算所有参数梯度的总时间，与前向传播计算一次损失函数值的时间处于完全相同的数量级（仅差一个小常数倍，通常约 2 倍）**！（相反，若用有限差分法对每个参数 $\theta_j$ 单独微扰求导，则需要运行 $\ell$ 次前向传播，耗时高达 $O(\ell N)$，慢上百亿倍！）

- **推论 1（梯度的标量函数求导）**：任何关于梯度 $\nabla f(x)$ 的标量函数 $s(\nabla f(x))$（例如元学习中的一步更新损失 $\ell(\theta - \eta \nabla \ell(\theta))$）依然可以在 $O(N)$ 时间内算出关于 $x$ 的梯度！

- **推论 2（Pearlmutter 技巧：$O(N + \ell)$ 时间计算 Hessian-向量积 $\nabla^2 f(x) $）**：

  当参数量 $\ell = 10^9$ 时，显式构造和存储 $\ell \times \ell$ 的二阶 Hessian 矩阵 $\nabla^2 f(x)$ 需要 $10^{18}$ 字节内存，绝对不可能实现。但如果二阶优化算法（如共轭梯度法或信任域法）只需要计算 Hessian 矩阵与任意给定向量 $ \in \mathbb{R}^\ell$ 的乘积 **$\nabla^2 f(x) $**，我们只需定义一个标量辅助函数：

  $$

  g(x) \triangleq \langle \nabla f(x),  \rangle = (\nabla f(x))^T  \in \mathbb{R}

  $$

  由定理 7.4.1，前向+反向计算 $\nabla f(x)$ 再与 $v$ 做内积得到标量 $g(x)$ 仅需一个规模为 $O(N + \ell)$ 的计算图；随后**对标量函数 $g(x)$ 再次调用定理 7.4.1 执行一次反向传播**，即可在 **$O(N + \ell)$ 时间与 $O(N + \ell)$ 内存**下精确算出：

  $$

  \nabla_x g(x) = \nabla_x \left( (\nabla f(x))^T  \right) = \nabla^2 f(x)

  $$

:::

---

### 7.4.1–7.4.2 偏导数形状约定与局部反向算子 $\mathcal{B}[g, z](v)$

为了彻底避免高阶雅可比张量（Jacobian Tensor）带来的符号混乱与显存爆炸（见 Remark 7.4.2），CS229 确立了一条黄金准则：**永远只考虑最终标量损失 $J \in \mathbb{R}$ 关于任意变量 $z$（向量、矩阵或张量）的偏导数 $\frac{\partial J}{\partial z}$，且严格規定 $\frac{\partial J}{\partial z}$ 的维度形状与 $z$ 本身完全一致**（例如若 $W \in \mathbb{R}^{n \times m}$，则 $\frac{\partial J}{\partial W} \in \mathbb{R}^{n \times m}$，其 $(i, j)$ 元即为 $\frac{\partial J}{\partial W_{ij}}$）！

#### 链式法则新视角与反向函数 $\mathcal{B}[g, z]$ 定义 (Equations 7.56–7.63)

设标量损失 $J = f(u) \in \mathbb{R}$ 通过中间模块 $u = g(z) \in \mathbb{R}^n$ 依赖于输入 $z \in \mathbb{R}^m$（式 7.56）。由多元微积分链式法则，对每个分量 $i \in \{1, \dots, m\}$ 有（式 7.57–7.58）：

$$

\frac{\partial J}{\partial z_i} = \sum_{j=1}^n \frac{\partial J}{\partial u_j} \cdot \frac{\partial g_j}{\partial z_i} \iff \frac{\partial J}{\partial z} = \begin{bmatrix}

\frac{\partial g_1}{\partial z_1} & \cdots & \frac{\partial g_n}{\partial z_1} \\

\dots & \ddots & \dots \\

\frac{\partial g_1}{\partial z_m} & \cdots & \frac{\partial g_n}{\partial z_m}

\end{bmatrix} \cdot \frac{\partial J}{\partial u} \tag{7.57–7.58}

$$

（若 $z \in \mathbb{R}^{r \times s}$ 为矩阵，则分量形式为 $\frac{\partial J}{\partial z_{ik}} = \sum_{j=1}^n \frac{\partial J}{\partial u_j} \cdot \frac{\partial g_j}{\partial z_{ik}}$，见式 7.59。）

观察式 $(7.58)$：无论上游函数 $f$ 多么复杂，只要上游模块已经把梯度向量 $v = \frac{\partial J}{\partial u} \in \mathbb{R}^n$ 传了下来，当前模块 $g$ 只需要利用自身的局部输入 $z$ 和局部偏导数 $\frac{\partial g_j}{\partial z_i}$，就能通过一个关于 $v$ 的**线性映射**算出下游梯度 $\frac{\partial J}{\partial z}$！我们将这个把上游梯度 $v = \frac{\partial J}{\partial u}$ 映射为下游梯度 $\frac{\partial J}{\partial z}$ 的算子封装为模块 $g$ 的**反向函数（Backward Function）$\mathcal{B}[g, z]$**（式 7.61–7.63）：

$$

\frac{\partial J}{\partial z} = \mathcal{B}[g, z]\left(\frac{\partial J}{\partial u}\right), \qquad \text{其中 } \left(\mathcal{B}[g, z](v)\right)_i = \sum_{j=1}^n \frac{\partial g_j}{\partial z_i} \cdot v_j \tag{7.61–7.62}

$$

#### 复合模块链 $J = M_k(M_{k-1}(\cdots M_1(x)))$ 的前向与反向双通道流 (Section 7.4.2)

对于由 $k$ 个模块串联而成的网络（每个模块 $M_i$ 带有自身参数 $\theta^{[i]}$，见图 7.5）：

1. **前向传播（Forward Pass，式 F）**：从 $u^{[0]} = x$ 出发，按 $i = 1, \dots, k$ 依次计算 $u^{[i]} = M_i(u^{[i-1]})$ 直至算出 $J = u^{[k]}$，**并将所有中间激活变量 $u^{[0]}, \dots, u^{[k-1]}$ 缓存在显存中**！

2. **反向传播（Backward Pass，式 B1 & B2）**：从顶层初始化 $\frac{\partial J}{\partial J} = 1$ 出发，按 $i = k, k-1, \dots, 1$ 的逆序，在每一层同时调用两次局部反向算子：

   - **向下一层传递激活梯度（式 B1）**：

   $$

   \frac{\partial J}{\partial u^{[i-1]}} = \mathcal{B}\left[M_i, u^{[i-1]}\right]\left(\frac{\partial J}{\partial u^{[i]}}\right) \tag{B1}

   $$

   - **计算当前层参数梯度（式 B2）**：

   $$

   \frac{\partial J}{\partial \theta^{[i]}} = \mathcal{B}\left[M_i, \theta^{[i]}\right]\left(\frac{\partial J}{\partial u^{[i]}}\right) \tag{B2}

   $$

---

### 7.4.3 基础原子模块的反向函数逐分量严格推导 (Equations 7.66–7.75)

现在我们用式 $(7.62)$ 和 $(7.63)$ 严格推导神经网络中最核心的三个基础模块（矩阵乘法 $\text{MM}$、逐元素激活 $\sigma$、损失函数）的反向算子闭式解！

#### 1. 矩阵乘法模块 $\text{MM}_{W, b}(z) = W z + b$ 的三大反向函数推导 (Equations 7.66–7.70)

设输入 $z \in \mathbb{R}^m$，权重矩阵 $W \in \mathbb{R}^{n \times m}$，偏置 $b \in \mathbb{R}^n$，输出 $u = Wz + b \in \mathbb{R}^n$，上游传来的梯度向量为 $v = \frac{\partial J}{\partial u} \in \mathbb{R}^n$。注意第 $j$ 个输出分量为 $(Wz + b)_j = b_j + \sum_{k=1}^m W_{jk} z_k$。

- **(1) 关于输入向量 $z \in \mathbb{R}^m$ 的反向函数 $\mathcal{B}[\\text{MM}, z](v)$（式 7.66–7.67）**：

  对任意 $i \in [m], \ j \in [n]$，求偏导得 $\frac{\partial (Wz + b)_j}{\partial z_i} = \frac{\partial}{\partial z_i}\left(b_j + \sum_{k=1}^m W_{jk} z_k\right) = W_{ji}$。代入式 $(7.63)$：

  $$

  \mathcal{B}[\\text{MM}, z](v) = \begin{bmatrix}

  \frac{\partial (Wz+b)_1}{\partial z_1} & \cdots & \frac{\partial (Wz+b)_n}{\partial z_1} \\

  \dots & \ddots & \dots \\

  \frac{\partial (Wz+b)_1}{\partial z_m} & \cdots & \frac{\partial (Wz+b)_n}{\partial z_m}

  \end{bmatrix}  = \begin{bmatrix}

  W_{11} & \cdots & W_{n1} \\

  \dots & \ddots & \dots \\

  W_{1m} & \cdots & W_{nm}

  \end{bmatrix}  = W^T v \in \mathbb{R}^m \tag{7.66–7.67}

  $$

- **(2) 关于权重矩阵 $W \in \mathbb{R}^{n \times m}$ 的反向函数 $\mathcal{B}[\\text{MM}, W](v)$（式 7.68–7.69）**：

  因为 $W$ 是矩阵，直接用矩阵索引式 $(7.59)$ 计算第 $(i, j)$ 个元素（其中 $i \in [n], \ j \in [m]$）。注意在所有输出分量 $k \in \{1, \dots, n\}$ 中，只有第 $k = i$ 个分量 $(Wz+b)_i = b_i + \sum_{s=1}^m W_{is} z_s$ 包含元素 $W_{ij}$，且其对 $W_{ij}$ 的偏导数恰为 $z_j$（当 $k \neq i$ 时偏导数为 $0$）！因此：

  $$

  \left(\mathcal{B}[\\text{MM}, W](v)\right)_{ij} = \sum_{k=1}^n \frac{\partial (Wz + b)_k}{\partial W_{ij}} \cdot v_k = \sum_{k=1}^n \frac{\partial \left(\sum_{s=1}^m W_{ks} z_s\right)}{\partial W_{ij}} \cdot v_k = z_j \cdot v_i = v_i z_j \tag{7.68}

  $$

  第 $(i, j)$ 元等于 $_i z_j$，写成向量外积矩阵形式即为：

  $$

  \mathcal{B}[\\text{MM}, W](v) = v z^T \in \mathbb{R}^{n \times m} \tag{7.69}

  $$

- **(3) 关于偏置向量 $b \in \mathbb{R}^n$ 的反向函数 $\mathcal{B}[\\text{MM}, b](v)$（式 7.70）**：

  由于 $\frac{\partial (Wz + b)_j}{\partial b_i} = \mathbf{1}\{i = j\}$，雅可比矩阵为单位阵 $I_n$，故：

  $$

  \mathcal{B}[\\text{MM}, b](v) = I_n v = v \in \mathbb{R}^n \tag{7.70}

  $$

  （*复杂度核验*：计算 $W^T v$ 和外积 $ z^T$ 均只需 $O(mn)$ 次运算，与前向计算 $Wz$ 的 $O(mn)$ 复杂度完全相同！）

#### 2. 逐元素激活模块 $M(z) = \sigma(z)$ 的反向函数推导 (Equations 7.71–7.73)

设 $z \in \mathbb{R}^m$，由于第 $j$ 个输出 $\sigma(z_j)$ 仅依赖于第 $j$ 个输入 $z_j$，当 $j \neq i$ 时跨位偏导数 $\frac{\partial \sigma(z_j)}{\partial z_i} = 0$；当 $j = i$ 时为 $\sigma'(z_i)$。因此雅可比矩阵是对角矩阵 $\text{diag}(\sigma'(z_1), \dots, \sigma'(z_m))$，矩阵乘法退化为 **$O(m)$ 时间**的逐元素 Hadamard 乘积 $\odot$：

$$

\mathcal{B}[\\sigma, z](v) = \text{diag}\left(\sigma'(z_1), \dots, \sigma'(z_m)\right)  = \sigma'(z) \odot  \in \mathbb{R}^m \tag{7.71–7.73}

$$

#### 3. 三大损失函数层的反向函数 (Equations 7.74–7.75)

在网络最顶层，损失模块输出标量 $J$，输入的上游种子梯度为标量 $v = \frac{\partial J}{\partial J} = 1$：

- **均方误差损失 $\ell_{\text{MSE}}(z, y) = \frac{1}{2}(z - y)^2$**：$\mathcal{B}[\\ell\_{\\text{MSE}}, z](v) = (z - y) \cdot v$；

- **二分类逻辑损失 $\ell_{\text{logistic}}(t, y)$（式 7.74）**：由式 $(2.6)$ 得 $\mathcal{B}[\\ell\_{\\text{logistic}}, t](v) = \left(\frac{1}{1 + \exp(-t)} - y\right) \cdot v$；

- **多分类交叉熵损失 $\ell_{\text{ce}}(t, y)$（式 7.75）**：由式 $(2.17)$ 得 $\mathcal{B}[\\ell\_{\\text{ce}}, t](v) = (\phi - e_y) \cdot v$，其中 $\phi = \text{softmax}(t)$。

---

### 7.4.4 多层感知机 (MLP) 完整反向传播算法 (Algorithm 3, Equations 7.76–7.84)

将上述基础模块的反向算子串联起来，对于一个使用逻辑损失的 $r$ 层 MLP（前向传播依次计算 $z^{[k]} = \text{MM}_{W^{[k]}, b^{[k]}}(a^{[k-1]})$ 与 $a^{[k]} = \sigma(z^{[k]})$，其中 $a^{[0]} = x$，顶层 $J = \ell_{\text{logistic}}(z^{[r]}, y)$，式 7.76），我们得到标准 **Algorithm 3**：

:::important[Algorithm 3：多层神经网络反向传播完整伪代码 (Back-propagation for MLPs)]

1. **前向传播（Forward Pass）**：按式 $(7.76)$ 从 $k = 1$ 到 $r$ 依次计算并缓存所有中间变量 $z^{[k]}, a^{[k]}$ 以及损失值 $J$。

2. **输出层梯度初始化**：计算损失 $J$ 关于最后一层线性输出 $z^{[r]}$ 的梯度（式 7.80）：

$$

\frac{\partial J}{\partial z^{[r]}} = \mathcal{B}\left[\ell_{\text{logistic}}, z^{[r]}\right](1) = \frac{1}{1 + \exp(-z^{[r]})} - y \tag{7.80}

$$

3. **反向递推循环**：**for** $k = r - 1$ **down to** $0$ **do**：

   - **(a) 计算第 $k+1$ 层参数 $W^{[k+1]}$ 和 $b^{[k+1]}$ 的梯度（式 7.81–7.82）**：

   $$

   \begin{aligned}

   \frac{\partial J}{\partial W^{[k+1]}} &= \mathcal{B}\left[\text{MM}, W^{[k+1]}\right]\left(\frac{\partial J}{\partial z^{[k+1]}}\right) = \frac{\partial J}{\partial z^{[k+1]}} \, a^{[k]T} \qquad \text{(7.81)} \\

   \frac{\partial J}{\partial b^{[k+1]}} &= \mathcal{B}\left[\text{MM}, b^{[k+1]}\right]\left(\frac{\partial J}{\partial z^{[k+1]}}\right) = \frac{\partial J}{\partial z^{[k+1]}} \qquad \text{(7.82)}

   \end{aligned}

   $$

   - **(b) 当 $k \ge 1$ 时，向下一层传播激活梯度 $\frac{\partial J}{\partial a^{[k]}}$ 与线性前梯度 $\frac{\partial J}{\partial z^{[k]}}$（式 7.83–7.84）**：

   $$

   \begin{aligned}

   \frac{\partial J}{\partial a^{[k]}} &= \mathcal{B}\left[\text{MM}, a^{[k]}\right]\left(\frac{\partial J}{\partial z^{[k+1]}}\right) = W^{[k+1]T} \frac{\partial J}{\partial z^{[k+1]}} \qquad \text{(7.83)} \\

   \frac{\partial J}{\partial z^{[k]}} &= \mathcal{B}\left[\sigma, z^{[k]}\right]\left(\frac{\partial J}{\partial a^{[k]}}\right) = \sigma'\left(z^{[k]}\right) \odot \frac{\partial J}{\partial a^{[k]}} \qquad \text{(7.84)}

   \end{aligned}

   $$

:::

---

## 五、7.5 跨训练样本的批量向量化 (Vectorization Over Training Examples)

在实际 GPU 训练中，我们绝不会对 Mini-batch 中的 $B$ 个样本写 `for` 循环逐个调用 Algorithm 3，而是把 $B$ 个样本打包成一个矩阵，一次性完成全 Batch 的前向与反向矩阵乘法！这里必须特别注意**数学论文列优先（Column-Major）**与**深度学习框架行优先（Row-Major）**两种惯例的转换（Equations 7.85–7.88）：

1. **数学讲义惯例（Column-Major，每个样本是列向量，式 7.85–7.87）**：

   将 $B$ 个样本（如 $B=3$）按**列**拼成输入矩阵 $X = \left[x^{(1)}, x^{(2)}, x^{(3)}\right] \in \mathbb{R}^{d \times 3}$（式 7.85）。此时第 1 层前向计算为：

   $$

   Z^{[1]} = \left[z^{[1](1)}, z^{[1](2)}, z^{[1](3)}\right] = W^{[1]} X + b^{[1]} \in \mathbb{R}^{m \times 3} \tag{7.86}

   $$

   这里 $W^{[1]} X \in \mathbb{R}^{m \times 3}$ 加上列向量 $b^{[1]} \in \mathbb{R}^{m \times 1}$ 利用了**广播机制（Broadcasting）**，等价于隐式将 $b^{[1]}$ 复制 3 列构造出 $\tilde{b}^{[1]} = [b^{[1]}, b^{[1]}, b^{[1]}] \in \mathbb{R}^{m \times 3}$（式 7.87）再相加。

2. **工业界框架惯例（PyTorch / NumPy / JAX Row-Major，每个样本是行向量，式 7.88）**：

   所有现代深度学习框架都把 Batch 维度放在第 0 维，即每**行**是一个样本：$X \in \mathbb{R}^{B \times d}$！

   - **一键转换口诀**：将列优先公式中的所有列向量变行向量、所有矩阵转置、所有矩阵乘法左右颠倒！

   - 此时第 1 层权重矩阵形状定义为 $W^{[1]} \in \mathbb{R}^{d \times m}$，偏置为行向量 $b^{[1]} \in \mathbb{R}^{1 \times m}$，前向传播公式变为（式 7.88）：

   $$

   Z^{[1]} = X W^{[1]} + b^{[1]} \in \mathbb{R}^{B \times m} \tag{7.88}

   $$

   对应的批量反向传播公式（设上游批量梯度矩阵为 $dZ^{[1]} = \frac{\partial J}{\partial Z^{[1]}} \in \mathbb{R}^{B \times m}$）则为：

   $$

   \frac{\partial J}{\partial W^{[1]}} = X^T dZ^{[1]} \in \mathbb{R}^{d \times m}, \qquad \frac{\partial J}{\partial b^{[1]}} = \mathbf{1}_B^T dZ^{[1]} = \text{sum}(dZ^{[1]}, \text{axis}=0) \in \mathbb{R}^{1 \times m}, \qquad \frac{\partial J}{\partial X} = dZ^{[1]} W^{[1]T} \in \mathbb{R}^{B \times d}

   $$

---

## 六、本章代码示例：模块化自动微分引擎（含 Linear、SwiGLU、RMSNorm、LayerNorm）与有限差分梯度校验

```python title="cs229_part3_modular_autodiff.py"
import numpy as np

class LayerNormModule:
    """CS229 7.3 & 7.4 节：带精确反向算子 B[LN, z](v) 的层归一化模块"""
    def __init__(self, dim: int, eps: float = 1e-8):
        self.gamma = np.ones((1, dim))
        self.beta = np.zeros((1, dim))
        self.eps = eps

    def forward(self, Z: np.ndarray) -> np.ndarray:
        self.Z = Z
        self.mu = np.mean(Z, axis=-1, keepdims=True)
        self.sigma = np.sqrt(np.mean((Z - self.mu) ** 2, axis=-1, keepdims=True) + self.eps)
        self.Z_hat = (Z - self.mu) / self.sigma
        return self.beta + self.gamma * self.Z_hat

    def backward(self, dOut: np.ndarray):
        m = self.Z.shape[-1]
        self.dgamma = np.sum(dOut * self.Z_hat, axis=0, keepdims=True)
        self.dbeta = np.sum(dOut, axis=0, keepdims=True)
        v = dOut * self.gamma
        # B[LN-S, z](v) = (1 / sigma) * (v - mean(v) - z_hat * mean(z_hat * v))
        dZ = (v - np.mean(v, axis=-1, keepdims=True)
              - self.Z_hat * np.mean(self.Z_hat * v, axis=-1, keepdims=True)) / self.sigma
        return dZ

if __name__ == "__main__":
    rng = np.random.default_rng(42)
    Z = rng.normal(size=(4, 8))
    upstream_v = rng.normal(size=(4, 8))
    ln = LayerNormModule(dim=8)

    # 1. 验证定理 7.3.1: LayerNorm 的参数缩放不变性 LN(alpha * Z) == LN(Z)
    out1 = ln.forward(Z)
    out2 = ln.forward(3.7 * Z)
    print("Max Scale-Invariance Error:", np.max(np.abs(out1 - out2)))

    # 2. 验证反向传播算子 B[LN, Z](v) 与中心有限差分数值梯度的精确一致性
    _ = ln.forward(Z)
    analytic_dZ = ln.backward(upstream_v)
    eps = 1e-6
    num_dZ = np.zeros_like(Z)
    for i in range(Z.shape[0]):
        for j in range(Z.shape[1]):
            Z_pos, Z_neg = Z.copy(), Z.copy()
            Z_pos[i, j] += eps
            Z_neg[i, j] -= eps
            num_dZ[i, j] = np.sum((ln.forward(Z_pos) - ln.forward(Z_neg)) * upstream_v) / (2 * eps)
    print("Max Backprop vs Finite-Difference Error:", np.max(np.abs(analytic_dZ - num_dZ)))
```

---

## 七、第 7 章课后推导与习题解答 (Exercises & Detailed Solutions)

### 习题 7.1：推导残差连接块 $\text{Res}(z)$ 与门控线性单元 $\text{GLU}(h)$ 的精确反向算子 $\mathcal{B}$

利用第 7.4.3 节的反向算子记号，求以下两个现代神经网络核心模块的反向函数：

(a) 残差模块 $u = \text{Res}(z) = z + f(z)$，其中已知子网络 $f$ 的反向函数为 $\mathcal{B}[f, z](v)$。从所得公式解释为什么残差连接能彻底解决深层网络的梯度消失问题；

(b) 门控线性单元 $u = \text{GLU}(h) = (W_1 h + b_1) \odot g(W_2 h + b_2)$（式 7.31，其中 $h \in \mathbb{R}^d, \ W_1, W_2 \in \mathbb{R}^{m \times d}$，给定上游梯度 $v = \frac{\partial J}{\partial u} \in \mathbb{R}^m$），求 $\frac{\partial J}{\partial h}, \frac{\partial J}{\partial W_1}, \frac{\partial J}{\partial b_1}, \frac{\partial J}{\partial W_2}, \frac{\partial J}{\partial b_2}$。

:::spoiler[习题 7.1 解答]

**解**：

**(a) 残差块的反向算子**：

由 $u_j = z_j + f_j(z)$，对 $z_i$ 求偏导得 $\frac{\partial u_j}{\partial z_i} = \mathbf{1}\{i = j\} + \frac{\partial f_j(z)}{\partial z_i}$。代入反向函数定义式 $(7.62)$：

$$
\left(\mathcal{B}[\\text{Res}, z](v)\right)_i = \sum_{j=1}^m \left(\mathbf{1}\{i = j\} + \frac{\partial f_j(z)}{\partial z_i}\right) v_j = v_i + \sum_{j=1}^m \frac{\partial f_j(z)}{\partial z_i} v_j \implies \mathcal{B}[\\text{Res}, z](v) = v + \mathcal{B}[f, z](v)
$$

**为什么能解决梯度消失**：在传统无残差深层网络中，反向梯度是各层雅可比矩阵的连乘积 $\prod_{l} J_l$，一旦多层算子范数小于 $1$，梯度就会指数级衰减至 $0$；而在 ResNet 中，每一层的反向传播都是**恒等直通项 $v$ 加上残差分支梯度 $\mathcal{B}[f, z](v)$**！即使某些深层分支的梯度 $\mathcal{B}[f, z](v) \to 0$，上游梯度 $v$ 依然能沿着加号恒等通路无衰减地传回第一层！

**(b) GLU 门控模块的反向算子**：

引入中间变量 $z_1 = W_1 h + b_1 \in \mathbb{R}^m$，$z_2 = W_2 h + b_2 \in \mathbb{R}^m$，$a_2 = g(z_2) \in \mathbb{R}^m$，则输出为逐元素乘积 $u = z_1 \odot a_2$。

给定上游梯度 $v = \frac{\partial J}{\partial u} \in \mathbb{R}^m$：

1. 先对逐元素乘法 $u = z_1 \odot a_2$ 求关于两个因子的偏导：

   - 第一分支梯度：$_1 \triangleq \frac{\partial J}{\partial z_1} =  \odot a_2 =  \odot g(W_2 h + b_2)$；

   - 第二分支激活后梯度：$\frac{\partial J}{\partial a_2} =  \odot z_1 =  \odot (W_1 h + b_1)$；

   - 第二分支穿过门控激活 $g$ 的梯度：$_2 \triangleq \frac{\partial J}{\partial z_2} = \mathcal{B}[g, z_2]\left(\frac{\partial J}{\partial a_2}\right) = g'(z_2) \odot  \odot z_1$（若 $g$ 为 Sigmoid，则 $g'(z_2) = a_2 \odot (1 - a_2)$）。

2. 再对两个并行的矩阵乘法分支 $\text{MM}_{W_1, b_1}(h)$ 和 $\text{MM}_{W_2, b_2}(h)$ 调用式 $(7.67)\text{–}(7.70)$，并将汇聚到同一输入节点 $h$ 的两条路径梯度相加：

$$
\begin{aligned}

\frac{\partial J}{\partial W_1} &= v_1 h^T, \qquad \frac{\partial J}{\partial b_1} = v_1 \\

\frac{\partial J}{\partial W_2} &= v_2 h^T, \qquad \frac{\partial J}{\partial b_2} = v_2 \\

\frac{\partial J}{\partial h} &= W_1^T v_1 + W_2^T v_2 \qquad \blacksquare

\end{aligned}
$$

:::

### 习题 7.2：严格推导层归一化子模块 $\text{LN-S}(z)$ 与 $\text{RMSNorm}(z)$ 的反向算子闭式公式

在讲义第 95–96 页中特别强调：在 $\text{LN-S}(z)_i = \frac{z_i - \hat{\mu}}{\hat{\sigma}} \ (z \in \mathbb{R}^m)$ 中，均值 $\hat{\mu} = \frac{1}{m}\sum_{k=1}^m z_k$ 和标准差 $\hat{\sigma} = \sqrt{\frac{1}{m}\sum_{k=1}^m (z_k - \hat{\mu})^2}$ **都是 $z$ 的函数，求导时绝不能把它们当作常数**！

(a) 记标准化后的输出向量为 $\hat{z} = \text{LN-S}(z) \in \mathbb{R}^m$。给定上游梯度 $v = \frac{\partial J}{\partial \hat{z}} \in \mathbb{R}^m$，严格推导证明：

$$

\frac{\partial J}{\partial z} = \mathcal{B}[\\text{LN-S}, z](v) = \frac{1}{\hat{\sigma}} \left( v - \frac{1}{m} \mathbf{1}\left(\mathbf{1}^T v\right) - \frac{1}{m} \hat{z}\left(\hat{z}^T v\right) \right)

$$

(b) 验证当上游梯度 $v = c \mathbf{1}$（全常数平移方向）或 $v = c \hat{z}$（径向缩放方向）时，反向梯度 $\mathcal{B}[\\text{LN-S}, z](v)$ 恒等于 $0$，并说明其几何意义！

:::spoiler[习题 7.2 解答]

**解**：

**(a) 逐分量求导与向量化合拢**：

首先计算 $\hat{\mu}$ 和 $\hat{\sigma}$ 关于 $z_i$ 的偏导数：

$$
\frac{\partial \hat{\mu}}{\partial z_i} = \frac{1}{m}
$$

对于 $\hat{\sigma}^2 = \frac{1}{m}\sum_{k=1}^m (z_k - \hat{\mu})^2$，两边对 $z_i$ 求偏导（注意 $\sum_{k=1}^m (z_k - \hat{\mu}) = 0$）：

$$
2 \hat{\sigma} \frac{\partial \hat{\sigma}}{\partial z_i} = \frac{2}{m} \sum_{k=1}^m (z_k - \hat{\mu}) \left(\delta_{ki} - \frac{1}{m}\right) = \frac{2}{m}(z_i - \hat{\mu}) - \frac{2}{m^2}\underbrace{\sum_{k=1}^m (z_k - \hat{\mu})}_{=0} = \frac{2}{m}(z_i - \hat{\mu})
$$

两边同除以 $2\hat{\sigma}$，并利用 $\hat{z}_i = \frac{z_i - \hat{\mu}}{\hat{\sigma}}$，得：

$$
\frac{\partial \hat{\sigma}}{\partial z_i} = \frac{z_i - \hat{\mu}}{m \hat{\sigma}} = \frac{\hat{z}_i}{m}
$$

现在应用商法则求第 $j$ 个输出 $\hat{z}_j = \frac{z_j - \hat{\mu}}{\hat{\sigma}}$ 对 $z_i$ 的偏导数：

$$
\frac{\partial \hat{z}_j}{\partial z_i} = \frac{\left(\delta_{ji} - \frac{\partial \hat{\mu}}{\partial z_i}\right) \hat{\sigma} - (z_j - \hat{\mu}) \frac{\partial \hat{\sigma}}{\partial z_i}}{\hat{\sigma}^2} = \frac{1}{\hat{\sigma}} \left( \delta_{ji} - \frac{1}{m} - \frac{\hat{z}_j \hat{z}_i}{m} \right)
$$

代入反向算子定义式 $(7.62)$ 对 $j = 1, \dots, m$ 求和：

$$
\left(\mathcal{B}[\\text{LN-S}, z](v)\right)_i = \sum_{j=1}^m \frac{\partial \hat{z}_j}{\partial z_i} v_j = \frac{1}{\hat{\sigma}} \left( v_i - \frac{1}{m} \sum_{j=1}^m v_j - \frac{\hat{z}_i}{m} \sum_{j=1}^m \hat{z}_j v_j \right)
$$

写成向量形式即得：

$$
\mathcal{B}[\\text{LN-S}, z](v) = \frac{1}{\hat{\sigma}} \left( v - \frac{1}{m} \mathbf{1}\left(\mathbf{1}^T v\right) - \frac{1}{m} \hat{z}\left(\hat{z}^T v\right) \right)
$$

**(b) 零空间与几何不变性验证**：

注意到标准化向量 $\hat{z}$ 天然满足两条正交与模长性质：

$$
\mathbf{1}^T \hat{z} = \sum_{i=1}^m \hat{z}_i = 0, \qquad \hat{z}^T \hat{z} = \sum_{i=1}^m \hat{z}_i^2 = m
$$

- 当 $v = \mathbf{1}$ 时：$\mathbf{1} - \frac{1}{m}\mathbf{1}(m) - \frac{1}{m}\hat{z}(0) = 0$（对应 LayerNorm 对输入加上任意常数偏移 $z + c\mathbf{1}$ 具有平移不变性！）；

- 当 $v = \hat{z}$ 时：$\hat{z} - \frac{1}{m}\mathbf{1}(0) - \frac{1}{m}\hat{z}(m) = 0$（对应定理 7.3.1：LayerNorm 对输入乘以正数倍 $\alpha z$ 具有缩放不变性，因此沿径向 $\hat{z}$ 的方向导数恒为 $0$！）。 $\blacksquare$

:::

### 习题 7.3：单通道 1D 卷积模块 $\text{Con1D-S}(z) = Q z$ 的反向传播算子推导

在 7.3 节式 $(7.52)\text{–}(7.53)$ 中，单通道 1D 卷积定义为 $u_i = \text{Con1D-S}(z)_i = \sum_{j=1}^{2\ell+1} w_j z_{i - \ell + (j - 1)}$（其中 $i \in \{1, \dots, m\}$，卷积核 $w \in \mathbb{R}^{2\ell+1}$，边界外补零）。给定上游梯度 $v = \frac{\partial J}{\partial u} \in \mathbb{R}^m$：

(a) 写出关于卷积核权重 $w \in \mathbb{R}^{2\ell+1}$ 的反向梯度分量 $\frac{\partial J}{\partial w_j} \ (j = 1, \dots, 2\ell+1)$，并解释为什么参数共享对应的反向规则是“跨空间位置梯度求和”；

(b) 证明关于输入向量 $z \in \mathbb{R}^m$ 的反向梯度 $\frac{\partial J}{\partial z} = Q^T v$ 恰好等价于将原卷积核 $w$ **左右翻转 180 度**（即 $\tilde{w}_j = w_{2\ell + 2 - j}$）后作用在 $v$ 上的 1D 卷积！

:::spoiler[习题 7.3 解答]

**解**：

**(a) 关于卷积核参数 $w_j$ 的反向梯度**：

由 $u_i = \sum_{s=1}^{2\ell+1} w_s z_{i - \ell + (s - 1)}$，对 $w_j$ 求偏导得 $\frac{\partial u_i}{\partial w_j} = z_{i - \ell + (j - 1)}$。代入链式法则式 $(7.57)$ 对所有输出位置 $i = 1, \dots, m$ 求和：

$$
\frac{\partial J}{\partial w_j} = \sum_{i=1}^m \frac{\partial J}{\partial u_i} \cdot \frac{\partial u_i}{\partial w_j} = \sum_{i=1}^m v_i \, z_{i - \ell + (j - 1)}, \qquad \forall j = 1, \dots, 2\ell + 1
$$

因为同一个权重 $w_j$ 在前向传播中被所有 $m$ 个空间滑动窗口共享使用，所以在反向传播时，它收到的总梯度等于所有 $m$ 个窗口位置上传回的局部梯度之和（即上游梯度向量 $v$ 与输入向量 $z$ 的互相关运算）！

**(b) 关于输入 $z$ 的反向梯度等于翻转卷积核的 1D 卷积**：

因为前向传播等价于矩阵乘法 $u = Q z$，由式 $(7.67)$ 知 $\frac{\partial J}{\partial z} = Q^T v$。我们来求第 $r$ 个输入分量 $z_r \ (r \in \{1, \dots, m\})$ 的偏导数：

在式 $(7.52)$ 中，当下标满足 $i - \ell + (j - 1) = r \iff j = r - i + \ell + 1$ 时，$u_i$ 包含 $z_r$，且系数为 $w_{r - i + \ell + 1}$。因此：

$$
\left(\frac{\partial J}{\partial z}\right)_r = \sum_{i = r - \ell}^{r + \ell} w_{r - i + \ell + 1} v_i
$$

令 $j' = i - (r - \ell) + 1 \in \{1, \dots, 2\ell + 1\}$，则 $i = r - \ell + (j' - 1)$，而权重下标变为 $r - i + \ell + 1 = 2\ell + 2 - j'$。定义翻转后的卷积核为 $\tilde{w}_{j'} \triangleq w_{2\ell + 2 - j'}$，则上式立即化为：

$$
\left(\frac{\partial J}{\partial z}\right)_r = \sum_{j'=1}^{2\ell+1} \tilde{w}_{j'} v_{r - \ell + (j' - 1)} = \text{Con1D-S}_{\tilde{w}}(v)_r
$$

这证明了：**1D/2D 卷积层关于输入的反向传播，在数学上本身就是一个将卷积核旋转 180 度后的标准卷积运算**！ $\blacksquare$

:::

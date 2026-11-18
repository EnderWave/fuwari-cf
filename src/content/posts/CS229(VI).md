---
title: CS229 · 笔记（六） · 扩散模型与基座模型
published: 2026-11-20
tags:
  - CS229
  - 机器学习
  - Diffusion_Models
  - LLM
  - LoRA
category: 机器学习
draft: false
description: 完整推导 DDPM 前向/反向扩散过程、ELBO 噪声预测损失与连续时间反向 SDE（Anderson 定理），详解基座模型 LP-FT 与 LoRA 低秩微调、SimCLR 对比学习、HNSW/SPANN 向量检索与 RAG，以及现代 LLM 架构（KV-Cache、GQA、MoE、SFT）与强化学习推理（RLVR、PPO、GRPO、CISPO）。
---

## 导读

本篇讨论扩散模型与基座模型，内容包括以下几个部分：

1. **附录 A（高维高斯与 KL 散度四大引理）**：为扩散模型提供基石支撑的独立高斯线性组合、条件高斯 Schur 补公式、同方差高斯 KL 散度以及 KL 散度链式法则。

2. **第 14 章：扩散模型（Diffusion Models）**：从离散时间 **DDPM** 的前向加噪重参数化、反向去噪变分下界（ELBO）、后验高斯均值 $\tilde{\mu}_t(x_t, x_0)$ 推导、噪声预测网络 $\epsilon_\theta(x_t, t)$，一直推导到连续时间随机微分方程（**Forward & Reverse-Time SDE**）以及基于 Taylor 展开与贝叶斯公式的 **Anderson 反向 SDE 定理严格证明**。

3. **第 15 章：基座模型与参数高效微调（Foundation Models & LoRA）**：剖析预训练-微调范式、全量微调的特征扭曲（Feature Distortion）与 **LP-FT（先线性探测后全量微调）**，以及工业界标配 **LoRA（Low-Rank Adaptation）** 的参数量分析、零初始化技巧与多租户推理部署优势。

4. **第 16 章：表征学习、向量检索与检索增强生成（Representation Learning & RAG）**：详解自监督对比学习 **SimCLR（InfoNCE 损失）**、语义向量检索中的近似最近邻索引（内存图索引 **HNSW** s. 磁盘聚类索引 **SPANN**）、排序指标 **Recall@k 与 NDCG@k**，以及 **RAG** 架构。

5. **第 17 章：大语言模型全栈剖析（Large Language Models）**：从子词分词 **BPE 算法**、自回归解码采样（温度 $\tau$、Top-$k$、Top-$p$ 核采样），到 **Transformer** 因果自注意力、缩放因子 $\sqrt{d_h}$ 的方差推导、**KV-Cache** 显存与复杂度分析、PreNorm s. PostNorm、注意力变体（**MQA、GQA、滑动窗口注意力、QK-Norm**）、**MoE（混合专家模型，如 DeepSeek-V3）**、上下文学习（ICL）与指令微调（**SFT 仅对回答 Token 计算掩码损失**）。

6. **第 18 章：大语言模型推理与可验证强化学习（Reasoning in LLMs & RLVR）**：从思维链（CoT）到 OpenAI o1 / DeepSeek-R1-Zero 的 **RLVR（基于可验证奖励的强化学习）**，建立 Token 级 MDP 与 KL 正则化目标，并横向对比 **PPO**、**GRPO（无 Critic 组内相对优势）** 与 **CISPO（MiniMax-M1 截断重要性采样权重）**。

---

:::tip[学习重点]

- 从前向加噪和反向去噪理解扩散模型的训练目标。
- 比较微调、检索与推理方法，核对参数量和计算成本。

:::

## 一、附录 A：扩散模型必备的四大概率与信息论引理 (Appendix A)

在正式推导第 14 章的扩散模型之前，我们先完整梳理讲义 **Appendix A（第 266–268 页）** 中的四个核心引理。它们是推导 DDPM 闭式前向分布与反向变分下界的数学基石。

:::important[引理 A.1.1–A.1.4：多元高斯分布与 KL 散度四大黄金恒等式]

- **引理 A.1.1（独立高斯随机变量的线性组合）**：设 $X_1 \sim \mathcal{N}(\mu_1, \Sigma_1)$ 与 $X_2 \sim \mathcal{N}(\mu_2, \Sigma_2)$ 为相互独立的 $d$ 维高斯随机向量，则对任意标量 $a, b \in \mathbb{R}$，线性组合 $a X_1 + b X_2$ 仍服从多元高斯分布：

$$

a X_1 + b X_2 \sim \mathcal{N}\left(a \mu_1 + b \mu_2, \ a^2 \Sigma_1 + b^2 \Sigma_2\right)

$$

- **引理 A.1.2（多元高斯的边缘分布与条件分布 / Schur 补公式）**：设分块随机向量 $\begin{bmatrix} X_A \\ X_B \end{bmatrix} \sim \mathcal{N}\left(\begin{bmatrix} \mu_A \\ \mu_B \end{bmatrix}, \begin{bmatrix} \Sigma_{AA} & \Sigma_{AB} \\ \Sigma_{BA} & \Sigma_{BB} \end{bmatrix}\right)$。则：

  1. 边缘分布：$X_A \sim \mathcal{N}(\mu_A, \Sigma_{AA})$，$X_B \sim \mathcal{N}(\mu_B, \Sigma_{BB})$；

  2. 给定 $X_B = b$ 时，$X_A$ 的条件分布仍为多元高斯分布 $X_A \mid (X_B = b) \sim \mathcal{N}(\mu_{A \mid B}, \Sigma_{A \mid B})$，其中：

  $$

  \mu_{A \mid B} = \mu_A + \Sigma_{AB} \Sigma_{BB}^{-1} (b - \mu_B), \qquad \Sigma_{A \mid B} = \Sigma_{AA} - \Sigma_{AB} \Sigma_{BB}^{-1} \Sigma_{BA}

  $$

- **引理 A.1.3（同协方差高斯分布之间的 KL 散度）**：对于具有相同协方差矩阵 $\Sigma$ 的两个多元高斯分布 $\mathcal{N}(\mu_1, \Sigma)$ 与 $\mathcal{N}(\mu_2, \Sigma)$，它们的 KL 散度等于马氏距离的一半：

$$

D_{\text{KL}}\left(\mathcal{N}(\mu_1, \Sigma) \parallel \mathcal{N}(\mu_2, \Sigma)\right) = \frac{1}{2} (\mu_1 - \mu_2)^T \Sigma^{-1} (\mu_1 - \mu_2)

$$

特别地，当 $\Sigma = \sigma^2 I$ 时，$D_{\text{KL}}\left(\mathcal{N}(\mu_1, \sigma^2 I) \parallel \mathcal{N}(\mu_2, \sigma^2 I)\right) = \frac{1}{2\sigma^2} \|\mu_1 - \mu_2\|_2^2$。

- **引理 A.1.4（KL 散度的链式法则 Chain Rule for KL Diergence）**：设 $q(x, y) = q(x) q(y \mid x)$ 与 $p(x, y) = p(x) p(y \mid x)$ 为两个联合分布，则联合分布的 KL 散度可分解为边缘 KL 散度与条件 KL 散度期望之和：

$$

D_{\text{KL}}\left(q(x, y) \parallel p(x, y)\right) = D_{\text{KL}}\left(q(x) \parallel p(x)\right) + \mathbb{E}_{x \sim q(x)} \left[ D_{\text{KL}}\left(q(y \mid x) \parallel p(y \mid x)\right) \right]

$$

:::

---

## 二、第 14 章：扩散模型 (Diffusion Models)

### 14.1 前向加噪扩散过程 (The Forward Diffusion Process)

给定真实数据分布中的原始样本 $x_0 \sim q(x_0)$（其中 $x_0 \in \mathbb{R}^d$），**去噪扩散概率模型（DDPM, Ho et al., 2020）**定义了一个由预定方差调度序列 $0 < \beta_1 < \beta_2 < \dots < \beta_T < 1$ 控制的**前向马尔可夫链（Forward Process）**，逐步向数据中注入高斯噪声：

$$

q(x_t \mid x_{t-1}) = \mathcal{N}\left(x_t; \ \sqrt{1 - \beta_t} \, x_{t-1}, \ \beta_t I\right), \qquad \forall t \in \{1, \dots, T\} \tag{14.1}

$$

利用重参数化表示，单步转移等价于：

$$

x_t = \sqrt{1 - \beta_t} \, x_{t-1} + \sqrt{\beta_t} \, \epsilon_t, \qquad \epsilon_t \stackrel{\text{i.i.d.}}{\sim} \mathcal{N}(0, I) \tag{14.2}

$$

令 $\alpha_t \triangleq 1 - \beta_t$，以及累积乘积 **$\bar{\alpha}_t \triangleq \prod_{s=1}^t \alpha_s$**。通过不断递归展开式 $(14.2)$ 并反复调用**引理 A.1.1**（两个独立零均值高斯 $\sqrt{\alpha_t \beta_{t-1}} \epsilon_{t-1}$ 与 $\sqrt{\beta_t} \epsilon_t$ 合并后的方差为 $\alpha_t \beta_{t-1} + \beta_t = \alpha_t(1-\alpha_{t-1}) + (1-\alpha_t) = 1 - \alpha_t \alpha_{t-1}$），我们可以在 **$O(1)$ 时间内从 $x_0$ 直接一步采样出任意时刻 $t$ 的加噪样本 $x_t$**：

$$

q(x_t \mid x_0) = \mathcal{N}\left(x_t; \ \sqrt{\bar{\alpha}_t} \, x_0, \ (1 - \bar{\alpha}_t) I\right) \iff x_t = \sqrt{\bar{\alpha}_t} \, x_0 + \sqrt{1 - \bar{\alpha}_t} \, \hat{\epsilon}_t, \quad \hat{\epsilon}_t \sim \mathcal{N}(0, I) \tag{14.4–14.5}

$$

当总步数 $T$ 足够大且 $\bar{\alpha}_T \to 0$ 时，终点分布 $q(x_T \mid x_0) \approx \mathcal{N}(0, I)$ 退化为纯标准高斯白噪声。

---

### 14.2 反向去噪过程与变分下界 (Reverse Process & ELBO Decomposition)

为了从纯噪声 $x_T \sim p(x_T) = \mathcal{N}(0, I)$ 生成真实图像，我们训练一个参数化反向马尔可夫链 $p_\theta(x_{0:T}) = p(x_T) \prod_{t=1}^T p_\theta(x_{t-1} \mid x_t)$，其中每一步反向转移也是高斯分布：

$$

p_\theta(x_{t-1} \mid x_t) = \mathcal{N}\left(x_{t-1}; \ \mu_\theta(x_t, t), \ \sigma_t^2 I\right) \tag{14.12}

$$

这里 $\mu_\theta(x_t, t)$ 是由神经网络参数化的均值预测函数，而方差 $\sigma_t^2$ 通常固定为预定常数（见下文 $\tilde{\beta}_t$）。生成阶段（Inference）只需从 $x_T \sim \mathcal{N}(0, I)$ 出发，按 $t = T, T-1, \dots, 1$ 依次迭代采样：

$$

x_{t-1} = \mu_\theta(x_t, t) + \sigma_t z_t, \qquad z_t \sim \mathcal{N}(0, I) \tag{14.13}

$$

#### 1. 扩散模型的 ELBO 逐时间步分解 (Equations 14.14–14.17)

把隐变量序列 $x_{1:T}$ 视为第 11 章 EM/VAE 中的隐变量 $z$，将前向过程 $q(x_{1:T} \mid x_0)$ 视为变分分布 $Q$，对负对数似然 $-\log p_\theta(x_0)$ 应用证据下界（ELBO）：

$$

-\log p_\theta(x_0) \le \mathbb{E}_{q(x_{1:T} \mid x_0)} \left[ -\log \frac{p_\theta(x_{0:T})}{q(x_{1:T} \mid x_0)} \right] = D_{\text{KL}}\left( q(x_{1:T} \mid x_0) \parallel p_\theta(x_{1:T} \mid x_0) \right) - \log p_\theta(x_0)

$$

利用马尔可夫性质将前向链逆向条件化：$q(x_{1:T} \mid x_0) = q(x_T \mid x_0) \prod_{t=2}^T q(x_{t-1} \mid x_t, x_0)$，并对 KL 散度反复应用**引理 A.1.4（KL 链式法则）**，可将总变分上界完美拆解为 $T+1$ 个独立时间步的损失之和（式 14.16–14.17）：

$$

-\log p_\theta(x_0) \le \underbrace{\mathbb{E}_{q(x_1 \mid x_0)} [-\log p_\theta(x_0 \mid x_1)]}_{L_0 \text{ (最终步重构损失)}} + \sum_{t=2}^T \underbrace{\mathbb{E}_{q(x_t \mid x_0)} \left[ D_{\text{KL}}\left(q(x_{t-1} \mid x_t, x_0) \parallel p_\theta(x_{t-1} \mid x_t)\right) \right]}_{L_{t-1} \text{ (第 }t\text{ 步去噪匹配损失)}} + \underbrace{D_{\text{KL}}\left(q(x_T \mid x_0) \parallel p(x_T)\right)}_{L_T \text{ (与 }\theta\text{ 无关的常数项)}} \tag{14.16–14.17}

$$

#### 2. 真实前向后验分布 $q(x_{t-1} \mid x_t, x_0)$ 的闭式推导 (Equations 14.18–14.22)

为什么式 $(14.16)$ 中要条件化在起点 $x_0$ 上？因为无条件的 $q(x_{t-1} \mid x_t)$ 依赖于未知的真实数据分布 $q(x_0)$，无法计算；但一旦**同时给定 $x_t$ 和原始图像 $x_0$**，后验分布 $q(x_{t-1} \mid x_t, x_0)$ 完全由高斯前向核决定！

具体地，给定 $x_0$，由于 $x_{t-1} \mid x_0 \sim \mathcal{N}(\sqrt{\bar{\alpha}_{t-1}}x_0, (1-\bar{\alpha}_{t-1})I)$ 且 $x_t = \sqrt{\alpha_t} x_{t-1} + \sqrt{\beta_t}\epsilon_t$，二者的协方差为 $\text{Co}(x_{t-1}, x_t \mid x_0) = \sqrt{\alpha_t}(1-\bar{\alpha}_{t-1})I$。直接代入**引理 A.1.2（条件高斯 Schur 补公式）**，立即得出后验分布依然是各向同性高斯分布：

$$

q(x_{t-1} \mid x_t, x_0) = \mathcal{N}\left(x_{t-1}; \ \tilde{\mu}_t(x_t, x_0), \ \tilde{\beta}_t I\right) \tag{14.18}

$$

其中后验方差 $\tilde{\beta}_t$ 和后验均值 $\tilde{\mu}_t(x_t, x_0)$ 的精确表达式分别为：

$$

\tilde{\beta}_t \triangleq \frac{1 - \bar{\alpha}_{t-1}}{1 - \bar{\alpha}_t} \beta_t, \qquad \tilde{\mu}_t(x_t, x_0) \triangleq \frac{\sqrt{\bar{\alpha}_{t-1}} \beta_t}{1 - \bar{\alpha}_t} x_0 + \frac{\sqrt{\alpha_t} (1 - \bar{\alpha}_{t-1})}{1 - \bar{\alpha}_t} x_t \tag{14.19–14.20}

$$

更妙的是，利用前向重参数化式 $(14.5)$ 解出 $x_0 = \frac{1}{\sqrt{\bar{\alpha}_t}}\left(x_t - \sqrt{1 - \bar{\alpha}_t} \, \hat{\epsilon}_t\right)$ 并代入式 $(14.19)$ 化简（注意到系数分子合并为 $\beta_t + \alpha_t(1-\bar{\alpha}_{t-1}) = 1 - \bar{\alpha}_t$），后验均值可以写成关于累计噪声 $\hat{\epsilon}_t$ 的极简形式：

$$

\tilde{\mu}_t(x_t, x_0) = \frac{1}{\sqrt{\alpha_t}} \left( x_t - \frac{\beta_t}{\sqrt{1 - \bar{\alpha}_t}} \hat{\epsilon}_t \right) \tag{14.22}

$$

#### 3. 噪声预测网络 $\epsilon_\theta(x_t, t)$ 与简化去噪损失 (Equations 14.23–14.26)

我们在反向模型 $p_\theta(x_{t-1} \mid x_t) = \mathcal{N}(x_{t-1}; \mu_\theta(x_t, t), \sigma_t^2 I)$ 中直接取方差 $\sigma_t^2 = \tilde{\beta}_t$。此时 $q(x_{t-1} \mid x_t, x_0)$ 与 $p_\theta(x_{t-1} \mid x_t)$ 具有完全相同的协方差矩阵 $\tilde{\beta}_t I$！应用**引理 A.1.3**，第 $t$ 步的 KL 散度立化为均值欧氏距离平方：

$$

L_{t-1} = \mathbb{E}_{q(x_t \mid x_0)} \left[ \frac{1}{2\tilde{\beta}_t} \left\| \tilde{\mu}_t(x_t, x_0) - \mu_\theta(x_t, t) \right\|_2^2 \right] \tag{14.23}

$$

对照式 $(14.22)$ 的结构，由于输入 $x_t$ 已知，我们无需让神经网络直接预测均值 $\mu_\theta$，而是**将 $\mu_\theta(x_t, t)$ 参数化为预测添加到 $x_0$ 上的标准高斯噪声 $\epsilon_\theta(x_t, t)$**：

$$

\mu_\theta(x_t, t) = \frac{1}{\sqrt{\alpha_t}} \left( x_t - \frac{\beta_t}{\sqrt{1 - \bar{\alpha}_t}} \epsilon_\theta(x_t, t) \right)

$$

代入式 $(14.23)$，公因子 $\frac{\beta_t}{\sqrt{\alpha_t(1-\bar{\alpha}_t)}}$ 提出范数平方号外，得到**噪声预测均方误差损失（Noise-Prediction Loss）**：

$$

L_{t-1} = \frac{\beta_t^2}{2 \tilde{\beta}_t \alpha_t (1 - \bar{\alpha}_t)} \mathbb{E}_{\hat{\epsilon}_t \sim \mathcal{N}(0, I)} \left[ \left\| \hat{\epsilon}_t - \epsilon_\theta\left(\sqrt{\bar{\alpha}_t} x_0 + \sqrt{1 - \bar{\alpha}_t} \hat{\epsilon}_t, \ t\right) \right\|_2^2 \right] \tag{14.24}

$$

（同理，对 $t=1$ 步亦有 $L_0 = \frac{\beta_1}{2\alpha_1(1-\bar{\alpha}_1)} \mathbb{E}[\|\hat{\epsilon}_1 - \epsilon_\theta(x_1, 1)\|_2^2] + \text{const}$，见式 14.26。在 DDPM 实践中，丢弃前置权重系数直接最小化无权重的 $\mathbb{E}_{t, x_0, \hat{\epsilon}_t}[\|\hat{\epsilon}_t - \epsilon_\theta(x_t, t)\|_2^2]$ 效果甚至更好！）

---

### 14.4 连续时间极限与随机微分方程 (Continuous-Time Limit & SDEs)

当我们将时间步切分得无限细（令步长 $\Delta t \to 0$）时，离散马尔可夫链便收敛为连续时间的**随机微分方程（Stochastic Differential Equation, SDE）**。

#### 1. 前向 SDE 与布朗运动 (Forward SDE & Brownian Motion)

在式 $(14.2)$ 中，将时间重标度为连续区间 $[0, T]$，设步长为 $\Delta t$，令每步噪声方差为 $\beta(t) \Delta t$。当 $\Delta t \to 0$ 时，一阶泰勒展开 $\sqrt{1 - \beta(t)\Delta t} \approx 1 - \frac{1}{2}\beta(t)\Delta t$ 给出：

$$

X_{t + \Delta t} - X_t \approx -\frac{1}{2} \beta(t) X_t \Delta t + \sqrt{\beta(t) \Delta t} \, \epsilon_t, \qquad \epsilon_t \sim \mathcal{N}(0, I) \tag{14.28}

$$

在随机微积分中，标准**布朗运动（Brownian Motion / Wiener Process）** $\{W_t\}_{t \ge 0}$ 满足独立高斯增量 $W_{t + \Delta t} - W_t \sim \mathcal{N}(0, \Delta t \cdot I)$，即无穷小增量记作 $dW_t \sim \mathcal{N}(0, dt \cdot I)$。因此式 $(14.28)$ 即为方差保持型（VP-SDE）前向方程 $dX_t = -\frac{1}{2}\beta(t) X_t dt + \sqrt{\beta(t)} dW_t$。更一般地，讲义考虑如下具有漂移系数（Drift）$f(X_t, t)$ 和扩散系数（Diffusion）$g(t)$ 的一般前向 SDE：

$$

dX_t = f(X_t, t) \, dt + g(t) \, dW_t \tag{14.30}

$$

#### 2. Anderson 反向时间 SDE 定理及其严格证明 (Theorem 14.4.1)

设 $p_t(x)$ 为前向过程 $X_t$ 在时刻 $t$ 的边缘概率密度。如果我们把时间倒流，令反向时间参数为 $\tau = T - t \in [0, T]$，定义反向过程 $Y_\tau \triangleq X_{T - \tau}$，那么 $Y_\tau$ 满足什么样的随机微分方程？

:::important[定理 14.4.1 (Anderson 反向时间 SDE 定理, 1982)]

与前向 SDE $(14.30)$ 具有完全相同边缘分布（即 $Y_\tau \stackrel{d}{=} X_{T-\tau}$）的反向时间过程 $\{Y_\tau\}_{\tau \in [0, T]}$ 满足如下反向随机微分方程：

$$

dY_\tau = \left( -f(Y_\tau, T - \tau) + g(T - \tau)^2 \nabla_x \log p_{T - \tau}(Y_\tau) \right) d\tau + g(T - \tau) \, d\bar{W}_\tau \tag{14.32}

$$

其中 $\bar{W}_\tau$ 是反向时间下的标准布朗运动，而 **$\nabla_x \log p_t(x)$** 被称为时刻 $t$ 密度分布的**得分函数（Score Function）**！

:::

:::important[定理 14.4.1 的直观推导证明（贝叶斯公式 + 一阶泰勒展开，讲义式 14.34–14.40）]

为了理解为什么反向漂移项除了把 $f$ 取负号变成 $-f$ 之外，会多出一项 **$+g(t)^2 \nabla_x \log p_t(x)$**，我们考察从时刻 $t$ 倒退回 $t - \Delta t$ 的无穷小反向转移概率密度 $p(x_{t - \Delta t} \mid x_t)$。

由前向离散化 $X_t \approx X_{t - \Delta t} + f(X_{t - \Delta t}, t - \Delta t)\Delta t + g(t - \Delta t)\sqrt{\Delta t}\epsilon$，当 $\Delta t$ 极小时，用 $f(x_t, t)$ 和 $g(t)$ 近似替换，前向条件密度为高斯分布：

$$

p(x_t \mid x_{t - \Delta t}) \approx \frac{1}{(2\pi g(t)^2 \Delta t)^{d/2}} \exp\left( -\frac{\|x_t - x_{t - \Delta t} - f(x_t, t)\Delta t\|_2^2}{2 g(t)^2 \Delta t} \right) \tag{14.34}

$$

根据贝叶斯公式，反向转移密度满足：

$$

p(x_{t - \Delta t} \mid x_t) = \frac{p(x_t \mid x_{t - \Delta t}) p_{t - \Delta t}(x_{t - \Delta t})}{p_t(x_t)} = p(x_t \mid x_{t - \Delta t}) \exp\left( \log p_{t - \Delta t}(x_{t - \Delta t}) - \log p_t(x_t) \right) \tag{14.35}

$$

在 $x_t$ 附近对 $\log p_{t-\Delta t}(x_{t-\Delta t}) \approx \log p_t(x_{t-\Delta t})$ 作关于空间变量的一阶泰勒展开（忽略 $O(\Delta t)$ 时间偏导高阶小量）：

$$

\log p_t(x_{t - \Delta t}) - \log p_t(x_t) \approx \left\langle \nabla_x \log p_t(x_t), \ x_{t - \Delta t} - x_t \right\rangle \tag{14.36}

$$

将式 $(14.34)$ 与 $(14.36)$ 代入式 $(14.35)$ 的指数部分，并对变量 $x_{t - \Delta t}$ 进行**配方法（Completing the Square，见式 14.37–14.39）**：

$$

\begin{aligned}

&-\frac{\|(x_{t - \Delta t} - x_t) + f(x_t, t)\Delta t\|_2^2}{2 g(t)^2 \Delta t} + \left\langle \nabla_x \log p_t(x_t), \ x_{t - \Delta t} - x_t \right\rangle \\

&= -\frac{\left\| (x_{t - \Delta t} - x_t) + f(x_t, t)\Delta t - g(t)^2 \Delta t \nabla_x \log p_t(x_t) \right\|_2^2}{2 g(t)^2 \Delta t} + O(\Delta t)

\end{aligned}

$$

观察配方后的高斯指数核！给定 $x_t$，反向一步后的位置 $x_{t - \Delta t}$ 服从高斯分布，其条件均值为：

$$

\mu_{\text{re}} = x_t - f(x_t, t)\Delta t + g(t)^2 \nabla_x \log p_t(x_t) \Delta t

$$

方差仍为 $g(t)^2 \Delta t \cdot I$！令 $\Delta t \to d\tau$，即得反向 SDE $(14.32)$！

**得分函数与噪声预测网络的统一**：由于 $q(x_t \mid x_0) = \mathcal{N}(\sqrt{\bar{\alpha}_t}x_0, (1-\bar{\alpha}_t)I)$，对数密度求梯度立得 $\nabla_{x_t} \log q(x_t \mid x_0) = -\frac{x_t - \sqrt{\bar{\alpha}_t}x_0}{1 - \bar{\alpha}_t} = -\frac{\hat{\epsilon}_t}{\sqrt{1 - \bar{\alpha}_t}}$。因此 DDPM 训练的噪声预测网络 $\epsilon_\theta(x_t, t)$ 本质上就是在估计负缩放得分函数 $-\sqrt{1 - \bar{\alpha}_t} \nabla_x \log p_t(x_t)$！ $\blacksquare$

:::

---

## 三、第 15 章：基座模型与参数高效微调 (Foundation Models, LP-FT & LoRA)

现代人工智能的核心范式已从“针对单一任务从零训练小模型”演变为**基座模型（Foundation Models）范式**：先在海量无标注数据上通过自监督目标最小化预训练损失 $L_{\text{pre}}(\theta) = \frac{1}{N} \sum_{i=1}^N \ell_{\text{pre}}(x_{\text{pre}}^{(i)}; \theta)$（式 15.1），学习通用特征提取器 $\phi_\theta(x)$，再适配到下游任务。

### 15.2 下游适配方法对比：Linear Probing、Full Finetuning 与 LP-FT

设预训练得到的骨干网络参数为 $\theta_{\text{pre}}$，下游任务带有少量标注数据 $\{(x^{(i)}, y^{(i)})\}_{i=1}^n$，我们在骨干特征 $\phi_\theta(x) \in \mathbb{R}^k$ 之上嫁接一个线性预测头 $U \in \mathbb{R}^{c \times k}$：

1. **线性探测（Linear Probing, LP）**：冻结骨干网络参数 $\theta = \theta_{\text{pre}}$，仅训练顶层线性分类器 $U$：

$$

\min_{U} L_{\text{task}}(U, \theta_{\text{pre}}) = \frac{1}{n} \sum_{i=1}^n \ell_{\text{task}}\left(U \phi_{\theta_{\text{pre}}}(x^{(i)}), y^{(i)}\right) \tag{15.2}

$$

   - *优缺点*：极快、省显存、绝不破坏预训练特征，但在复杂下游任务上表达能力受限。

2. **全量微调（Full Finetuning, FT）**：将 $\theta$ 初始化为 $\theta_{\text{pre}}$，$U$ 随机初始化，联合优化 $(U, \theta)$：

$$

\min_{U, \theta} L_{\text{task}}(U, \theta) \tag{15.3}

$$

   - *特征扭曲风险（Feature Distortion, Kumar et al., 2022）*：在微调初期，由于顶层线性头 $U$ 是**随机初始化**的，其产生的梯度极其巨大且杂乱。如果此时直接放开骨干网络 $\theta$ 的梯度，第一轮反向传播就会严重破坏 $\theta_{\text{pre}}$ 原本学好的高质量预训练特征，导致在分布外（Out-of-Distribution, OOD）测试集上泛化能力暴跌！

3. **两阶段微调（LP-FT：Linear Probing then Full Finetuning）**：

   - **第一阶段（LP）**：先冻结 $\theta_{\text{pre}}$，只训练线性头 $U$ 直至收敛到合理的 $U_{\text{LP}}$；

   - **第二阶段（FT）**：以 $(U_{\text{LP}}, \theta_{\text{pre}})$ 作为起点，解冻全体参数并使用较小学习率进行全量微调。这样在第二阶段开始时，顶层误差已经很小，彻底避免了随机头对骨干特征的冲击，在分布内（ID）和分布外（OOD）测试集上均取得最优性能！

---

### 15.3 低秩自适应微调 (Low-Rank Adaptation, LoRA)

对于拥有数百亿乃至数千亿参数的大语言模型（LLM），全量微调不仅需要存储完整的优化器状态（Adam 需要 2 倍参数量的动量与方差显存），而且如果有 100 个下游客户，存储 100 份完整模型权重的成本不可承受。

**LoRA（Hu et al., 2021）**基于一个关键洞察：在微调过程中，预训练权重矩阵 $W_0 \in \mathbb{R}^{d_{\text{out}} \times d_{\text{in}}}$ 的更新增量 $\Delta W = W - W_0$ 具有极低的**本征秩（Intrinsic Rank）**！因此，LoRA 冻结原始权重矩阵 $W_0$，将更新量 $\Delta W$ 参数化为两个极窄的低秩矩阵 $B \in \mathbb{R}^{d_{\text{out}} \times r}$ 与 $A \in \mathbb{R}^{r \times d_{\text{in}}}$ 的乘积（其中秩 $r \ll \min(d_{\text{out}}, d_{\text{in}})$，通常取 $r = 4, 8, 16$）：

$$

W = W_0 + \Delta W = W_0 + \frac{\alpha}{r} B A \implies h = W_0 x + \frac{\alpha}{r} B (A x) \tag{15.6–15.8}

$$

:::important[LoRA 的三大核心工程与数学细节]

1. **参数压缩率计算**：原始矩阵参数量为 $d_{\text{out}} \times d_{\text{in}}$，而 LoRA 仅需训练 **$r (d_{\text{out}} + d_{\text{in}})$** 个参数！例如当 $d_{\text{out}} = d_{\text{in}} = 4096$、取 $r = 8$ 时，原始参数量为 $16,777,216$，而 LoRA 参数量仅为 $8 \times (4096 + 4096) = 65,536$，**参数量直接缩小为原来的 $1/256$（约 $0.39\%$）**！

2. **为什么必须用高斯分布初始化 $A$，而用全零矩阵初始化 $B = 0$？**

   - 如果把 $A$ 和 $B$ 都初始化为 $0$，那么在第一步反向传播时，$\nabla_B L = (\nabla_h L)(Ax)^T = 0$ 且 $\nabla_A L = B^T (\nabla_h L) x^T = 0$，属于鞍点死锁，永远无法学到东西！

   - 如果把 $A$ 和 $B$ 都用随机高斯初始化，那么在微调第 0 步就会产生非零的随机扰动 $\Delta W = B A \neq 0$，瞬间破坏预训练模型的初始行为。

   - **标准做法**：令 **$A \sim \mathcal{N}(0, \sigma^2)$ 随机初始化，且令 $B = 0$ 全零初始化**！这样既保证了微调起点处严格满足 $\Delta W = B A = 0$（与原始预训练模型完全一致），又保证了第 1 步反向传播时 $\nabla_B L = (\nabla_h L)(Ax)^T \neq 0$，使 $B$ 在第一步更新后立即脱离零矩阵！

3. **无额外推理延迟与多租户部署（Multi-tenant Sering）**：

   - 单任务部署时，可直接将训练好的 $\frac{\alpha}{r} B A$ 加回 $W_0$（权重合并 Merge），推理时**零额外 FLOPs、零额外延迟**；

   - 多租户云服务时，GPU 显存中只需常驻一份冻结的基座模型 $W_0$，针对不同用户的请求动态切换几 MB 大小的 $(B_k, A_k)$ 插件，并在一个 Batch 内通过算子批处理同时服务数百个定制化模型。

:::

---

## 四、第 16 章：表征学习、语义检索与 RAG (Representation Learning, Retrieal & RAG)

### 16.1–16.2 监督表征与自监督对比学习 (SimCLR & InfoNCE Loss)

如何让编码器网络 $f_\theta : \mathcal{X} \to \mathbb{R}^d$ 将任意图像或文本映射为语义丰富的向量表征（Embedding）？

- **有监督表征提取（Section 16.1）**：在大规模分类数据集（如 ImageNet）上训练网络 $U f_\theta(x)$，训练完成后**丢弃顶层线性分类头 $U$**，直接将倒数第二层输出 $f_\theta(x)$ 作为通用特征向量。

- **自监督对比学习（Contrastie Learning / SimCLR, Chen et al., 2020, Section 16.2）**：在没有任何人工标签的情况下，核心思想是**“同一个样本的不同数据增强视图在表征空间中应该相互吸引（Positie Pair），不同样本的视图应该相互排斥（Negatie Pairs）”**。

  - 给定一个包含 $B$ 个无标签样本的 Mini-batch $\{x^{(1)}, \dots, x^{(B)}\}$，对每个样本独立应用两次随机数据增强（如随机裁剪、色彩抖动、高斯模糊），生成 $2B$ 个增强视图 $\{\tilde{x}^{(1)}, \tilde{x}^{(2)}, \dots, \tilde{x}^{(2B)}\}$，其中 $(\tilde{x}^{(2k-1)}, \tilde{x}^{(2k)})$ 源自同一个原图，互为正样本对。

  - 通过编码器提取归一化特征 $z_i = \frac{f_\theta(\tilde{x}^{(i)})}{\|f_\theta(\tilde{x}^{(i)})\|_2}$，定义余弦相似度 $\text{sim}(u, v) = \frac{u^T }{\|u\|_2 \|\|_2}$。对于正样本对 $(i, j)$，将其余 $2B - 2$ 个视图视为负样本，最小化带温度系数 $\tau > 0$ 的 **InfoNCE（NT-Xent）对比损失**：

$$

\ell_{i, j} = -\log \frac{\exp\left(\text{sim}(z_i, z_j) / \tau\right)}{\sum_{k=1, k \neq i}^{2B} \exp\left(\text{sim}(z_i, z_k) / \tau\right)} \tag{16.2}

$$

---

### 16.3 语义检索、近似最近邻索引 (HNSW s. SPANN) 与评估指标

在搜索引擎与知识库中，传统的词法匹配（Lexical Search，如 TF-IDF、BM25）无法处理同义词（例如搜“笔记本电脑发烫”匹配不到写着“MacBook 过热降频”的文档）。**密集语义检索（Dense Semantic Retrieal）**使用双塔编码器将查询 $q$ 和文档库 $\{d_i\}_{i=1}^N$ 编码为单位向量 $e_q, e_{d_i} \in \mathbb{R}^d$，通过最大化余弦相似度（等价于内积 $e_q^T e_{d_i}$ 或最小化欧氏距离，因为当 $\|u\|_2 = \|\|_2 = 1$ 时 $\|u - \|_2^2 = 2 - 2 u^T $）检索 Top-$k$ 相关文档。

#### 1. 工业界向量数据库的两大核心 ANN 索引：HNSW s. SPANN

当文档库规模达到十亿级（$N = 10^9$）时，暴力扫描（Exact $k$-NN，$O(N d)$）延迟过高。讲义重点对比了两种主流的**近似最近邻（Approximate Nearest Neighbor, ANN）**索引结构：

| 维度 | HNSW (Hierarchical Naigable Small World) | SPANN ( Inerted Index / Centroid-based) |
| :--- | :--- | :--- |
| **核心数据结构** | 多层跳表式近邻图（高层稀疏负责远距离跳跃导航，底层密集负责精细局部贪心搜索） | $k$-Means 聚类质心树（存于内存） + 磁盘倒排列表（Posting Lists，按簇存储原始向量） |
| **存储介质定位** | **纯内存索引（In-Memory）**：随机图遍历存在大量随机跨页指针跳转，必须常驻 RAM | **磁盘/对象存储友好（Disk / Object Storage）**：先在内存中定位最近的几个质心，再顺序批量读取磁盘块 |
| **延迟与成本权衡** | 查询延迟极低（亚毫秒级），但海量向量场景下内存成本极其高昂 | 内存占用极小（仅存质心），单次顺序 I/O 吞吐极高，适合超大规模低成本云原生向量检索 |

#### 2. 检索与排序评估指标：Recall@k 与 NDCG@k (Equations 16.1–16.3)

- **Recall@$k$（前 $k$ 召回率）**：不关心前 $k$ 个结果内部的先后顺序，只衡量所有真实相关文档集 $R$ 中有多少比例进入了返回的 Top-$k$ 列表 $\hat{R}_k$：

$$

\text{Recall@}k = \frac{|\hat{R}_k \cap R|}{|R|}

$$

- **NDCG@$k$（归一化折损累计增益 Normalized Discounted Cumulatie Gain）**：当不同文档具有多级相关性评分 $r_i \in \{0, 1, 2, 3\}$ 且我们强烈要求**高分文档必须排在最前面**时，定义前 $k$ 位的**折损累计增益（DCG@$k$）**（对排在第 $i$ 位的结果施加对数位置折损 $\frac{1}{\log_2(i+1)}$）：

$$

\text{DCG@}k = \sum_{i=1}^k \frac{2^{r_i} - 1}{\log_2(i + 1)} \tag{16.1}

$$

设将所有真实文档按相关性从高到低理想排列后算出的理论最大 DCG@$k$ 为 **$\text{IDCG@}k$**（式 16.2），则归一化指标为：

$$

\text{NDCG@}k = \frac{\text{DCG@}k}{\text{IDCG@}k} \in [0, 1] \tag{16.3}

$$

---

### 16.4 检索增强生成 (Retrieal-Augmented Generation, RAG)

为了解决大语言模型知识截止（Knowledge Cutoff）、长尾事实幻觉（Hallucination）以及私有企业数据问答问题，**RAG** 将语义检索器与生成式大模型结合：给定用户查询 $q$，先用语义检索器从外部知识库 $\mathcal{D}$ 中检索出 Top-$k$ 最相关的文档片段集合 $\hat{R}(q) = \{d_{i_1}, \dots, d_{i_k}\}$，然后将检索到的文档片段与原始问题拼接到一起作为上下文 Prompt，喂给大语言模型 $p_\psi$ 自回归生成最终答案：

$$

y \sim p_\psi\left(y \ \big|\ q, \ \hat{R}(q)\right) \tag{16.4}

$$

---

## 五、第 17 章：大语言模型架构与训练解答 (Large Language Models)

### 17.1–17.2 子词分词 (BPE)、自回归建模与解码采样策略

#### 1. 字节对编码分词算法 (Byte-Pair Encoding, BPE, Section 17.1)

为什么 LLM 不直接按英文单词（Word-leel）或单个字符（Character-leel）分词？因为按单词分词会导致词表爆炸且无法处理未登录词（OOV），而按单字符分词会导致序列长度 $T$ 增长数倍且单字符缺乏语义。现代 LLM 统一采用 **BPE 子词分词（Subword Tokenization）**：

1. **初始词表**：从所有基础字符（或 UTF-8 字节，共 256 个）构成的初始词表 $\mathcal{V}_0$ 开始；

2. **迭代贪心合并**：在训练语料库中统计当前所有**相邻 Token 对 $(u, v)$** 的共现频次，找出出现频次最高的相邻对 $(u^*, v^*)$，将其合并为一个全新的子词 Token $w = u^* v^*$ 加入词表 $\mathcal{V} \leftarrow \mathcal{V} \cup \{w\}$，并更新语料库中的所有 $(u^*, v^*)$；

3. **终止**：重复步骤 2 直至词表大小 $|\mathcal{V}|$ 达到预设容量（如 GPT-4 的 100k 或 DeepSeek-V3 的 128k）。

#### 2. 自回归链式法则与解码采样算法 (Section 17.2)

给定 Token 序列 $(x_1, x_2, \dots, x_T) \in \mathcal{V}^T$，自回归语言模型利用条件概率链式法则将联合概率精确分解为逐步预测下一个 Token（Next-Token Prediction）：

$$

p(x_1, x_2, \dots, x_T) = \prod_{t=1}^T p(x_t \mid x_1, \dots, x_{t-1}) = \prod_{t=1}^T p(x_t \mid x_{<t}) \tag{17.1}

$$

预训练目标函数即为最小化全语料库上的**下一词交叉熵损失（Next-Token Cross-Entropy Loss）**：

$$

L(\theta) = -\sum_{t=1}^T \log p_\theta(x_t \mid x_{<t}) \tag{17.12–17.13}

$$

在推理生成第 $t$ 个 Token 时，模型最后一层输出未归一化的词表打分向量（Logits）$u_t \in \mathbb{R}^{|\mathcal{V}|}$。我们可以通过以下四种策略从中解码出 $x_t$：

- **温度缩放采样（Temperature Scaling, $\tau > 0$）**：将 Logits 除以温度参数 $\tau$ 后再做 Softmax：

$$

p_\tau(x_t =  \mid x_{<t}) = \frac{\exp(u_{t, } / \tau)}{\sum_{' \in \mathcal{V}} \exp(u_{t, '} / \tau)}

$$

  - 当 $\tau \to 0^+$ 时，最大 Logit 分量的概率趋于 $1$，退化为确定性的**贪心解码（Greedy Decoding）** $x_t = \arg\max_v u_{t,v}$；

  - 当 $0 < \tau < 1$ 时，概率分布变得更尖锐（Sharper），倾向于高确定性回答；当 $\tau > 1$ 时分布变得更平坦，生成的文本更具多样性与创造力。

- **Top-$k$ 采样**：仅保留概率最高的 $k$ 个候选 Token，将其余所有低概率长尾 Token 的概率清零后重新归一化采样（防止采样到完全不通顺的生僻乱码词）。

- **Top-$p$ 采样（核采样 Nucleus Sampling, Holtzman et al., 2020）**：将词表按概率从大到小排序，动态截取累加概率首次达到阈值 $p$（如 $p = 0.9$）的最小候选集合 $V^{(p)}$：$\sum_{ \in V^{(p)}} P() \ge p$，在该集合内重归一化采样。相比固定 $k$ 的 Top-$k$，Top-$p$ 能根据当前步模型的不确定性自动伸缩候选池大小！

---

### 17.3 Transformer 核心架构与 KV-Cache 深度剖析

设第 $l$ 层 Transformer 输入的隐状态矩阵为 $H^{\text{in}} = [h_1^{\text{in}}, \dots, h_T^{\text{in}}]^T \in \mathbb{R}^{T \times d}$。

#### 1. 因果缩放点积自注意力与缩放因子 $c = \sqrt{d_h}$ 的方差证明

对于单个注意力头（頭维度为 $d_h$），通过三个线性投影矩阵 $W^Q, W^K, W^V \in \mathbb{R}^{d \times d_h}$ 计算查询（Query）、键（Key）和值（Value）：

$$

Q = H^{\text{in}} W^Q \in \mathbb{R}^{T \times d_h}, \qquad K = H^{\text{in}} W^K \in \mathbb{R}^{T \times d_h}, \qquad V = H^{\text{in}} W^V \in \mathbb{R}^{T \times d_h}

$$

:::important[为什么点积 $q_t^T k_j$ 必须除以缩放因子 $c = \sqrt{d_h}$？]

假设 $q_t \in \mathbb{R}^{d_h}$ 和 $k_j \in \mathbb{R}^{d_h}$ 的各个分量相互独立，且均具有零均值、单位方差（即 $\mathbb{E}[q_{t, m}] = \mathbb{E}[k_{j, m}] = 0$，$\text{Var}(q_{t, m}) = \text{Var}(k_{j, m}) = 1$）。则对于每一项乘积 $q_{t, m} k_{j, m}$，其均值为 $0$，方差为 $\mathbb{E}[q_{t, m}^2] \mathbb{E}[k_{j, m}^2] = 1 \times 1 = 1$。

当我们将 $d_h$ 个独立分量求和得到内积 $q_t^T k_j = \sum_{m=1}^{d_h} q_{t, m} k_{j, m}$ 时，**内积的方差会膨胀为 $\text{Var}(q_t^T k_j) = d_h$，标准差膨胀为 $\sqrt{d_h}$**！

当 $d_h$ 较大（如 $d_h = 128$）时，未经缩放的内积绝对值会变得很大，导致 $\text{softmax}$ 进入极其尖锐的饱和区（最大值概率接近 $1$，其余接近 $0$），从而引起反向传播时 **Softmax 梯度消失**！除以 $c = \sqrt{d_h}$ 后，缩放内积 $\frac{q_t^T k_j}{\sqrt{d_h}}$ 的方差重新恢复为恒定的 **$1$**！

:::

为了保证自回归因果性（位置 $t$ 绝不能偷看未来位置 $j > t$ 的信息），引入下三角**因果掩码矩阵（Causal Mask）** $M \in \mathbb{R}^{T \times T}$：

$$

M_{t, j} = \begin{cases} 0, & \text{若 } j \le t \\ -\infty, & \text{若 } j > t \end{cases} \implies H^{\text{out}} = \text{softmax}_{\text{row}}\left( \frac{Q K^T}{\sqrt{d_h}} + M \right) V \tag{17.21}

$$

在**多头注意力（Multi-Head Attention, MHA）**中，并行计算 $n_h$ 个独立的注意力头（通常 $n_h d_h = d$），拼接后右乘输出投影矩阵 $W^O \in \mathbb{R}^{(n_h d_h) \times d}$：

$$

\text{MHA}(H^{\text{in}}) = \text{Concat}\left(\text{head}^{(1)}, \text{head}^{(2)}, \dots, \text{head}^{(n_h)}\right) W^O \tag{17.25}

$$

#### 2. 自回归推理的加速引擎：KV-Cache (Equations 17.26–17.27)

在自回归逐词生成（Decoding）阶段，当模型已经生成了前 $t-1$ 个词、正在生成第 $t$ 个词时，由于因果掩码的存在，前 $t-1$ 个位置对应的键向量 $k_1, \dots, k_{t-1}$ 和值向量 $_1, \dots, _{t-1}$ **完全不会随后续新词的到来而改变**！

- 如果每次生成新词都把整个长度为 $t$ 的前缀重新算一遍 $K$ 和 $V$，生成总长为 $T$ 的序列将耗费 $O(T^3 d)$ 的冗余计算！

- **KV-Cache 机制**：在显存中直接缓存历史所有时间步的键矩阵 $K_{1:t-1}$ 和值矩阵 $V_{1:t-1}$。在第 $t$ 步，只需针对最新输入的单个隐向量 $h_t^{\text{in}}$ 计算单个查询 $q_t$、单个键 $k_t$ 和单个值 $_t$，然后追加更新缓存：

$$

K_{1:t} = \begin{bmatrix} K_{1:t-1} \\ k_t^T \end{bmatrix} \in \mathbb{R}^{t \times d_h}, \qquad V_{1:t} = \begin{bmatrix} V_{1:t-1} \\ _t^T \end{bmatrix} \in \mathbb{R}^{t \times d_h} \tag{17.26–17.27}

$$

这样第 $t$ 步只需计算单行向量 $q_t^T K_{1:t}^T$，将单步计算复杂度从 $O(t^2 d)$ 骤降至 **$O(t d)$**！代价是每个注意力头需要额外消耗 **$O(T d_h)$** 的 GPU 显存来驻留 KV-Cache。

#### 3. PreNorm s. PostNorm 与计算/显存复杂度

现代 Transformer 层由多头注意力（MHA）与逐位置前馈网络（FFN/MLP）交替堆叠而成。根据归一化层（LayerNorm 或 RMSNorm）与残差连接的相对位置，分为两种范式：

- **PostNorm（早期原始 Transformer，式 17.28–17.29）**：归一化放在残差相加**之后**：

$$

\tilde{H} = \text{Norm}\left(H^{\text{in}} + \text{MHA}(H^{\text{in}})\right), \qquad H^{\text{out}} = \text{Norm}\left(\tilde{H} + \text{MLP}(\tilde{H})\right)

$$

  *缺点*：主干残差通路被 Norm 截断，深层网络极易在训练初期梯度爆炸，必须依赖严苛的 Learning Rate Warmup。

- **PreNorm（现代 LLM 绝对标配，式 17.30–17.31）**：归一化放在进入子模块分支**之前**，主干残差保持恒等直通：

$$

\tilde{H} = H^{\text{in}} + \text{MHA}\left(\text{Norm}(H^{\text{in}})\right), \qquad H^{\text{out}} = \tilde{H} + \text{MLP}\left(\text{Norm}(\tilde{H})\right)

$$

  *优势*：梯度可以沿着恒等残差捷径无损直达第 1 层，训练深达百层的 LLM 极其稳定！

- **复杂度与 FlashAttention**：序列长度为 $T$、隐层维度为 $d$ 时，单层注意力计算复杂度为 **$O(T^2 d + T d^2)$**。朴素实现需要显式实例化 $T \times T$ 的注意力权重矩阵，耗费 $O(T^2)$ 显存；而 **FlashAttention（Dao et al., 2022）**通过 GPU SRAM 分块（Tiling）与在线 Softmax 重计算，在不改变任何数学输出的前提下将注意力显存开销从 $O(T^2)$ 严格降至线性 **$O(T)$**！

---

### 17.4–17.8 现代注意力变体 (GQA)、混合专家 (MoE) 与指令微调 (SFT)

#### 1. 注意力机制四大现代变体 (Section 17.4)

为了进一步削减长文本推理时 KV-Cache 的显存瓶颈并提升训练稳定性，现代开源/闭源大模型广泛采用以下四种变体：

1. **多查询注意力（Multi-Query Attention, MQA）**：保留 $n_h$ 个独立的查询头 $Q^{(1)}, \dots, Q^{(n_h)}$，但让**所有 $n_h$ 个头共享唯一的一组键和值 $(K^{(1)}, V^{(1)})$**（即 $n_g = 1$）。KV-Cache 显存直接暴降为原来的 $1/n_h$！

2. **分组查询注意力（Grouped-Query Attention, GQA，LLaMA-3 / Qwen / DeepSeek 标配，式 17.32–17.34）**：MQA 的折中升级版。将 $n_h$ 个查询头均分为 $n_g$ 个组（每组包含 $\tau = n_h / n_g$ 个查询头），同一组内的查询头共享同一份键和值：定义组映射下标函数

$$

g(j) = \left\lfloor \frac{j - 1}{\tau} \right\rfloor + 1 \in \{1, \dots, n_g\} \tag{17.32}

$$

则第 $j$ 个查询头计算 $\text{Attention}(Q^{(j)}, K^{(g(j))}, V^{(g(j))})$。GQA 在几乎不损失 MHA 模型精度的同时，将 KV-Cache 显存压缩为原来的 **$n_g / n_h = 1/\tau$**！

3. **滑动窗口注意力（Sliding-Window Attention, SWA，式 17.35）**：规定第 $t$ 个 Token 只关注距离它不超过窗口大小 $w$ 的局部历史 Token（即仅当 $t - w < j \le t$ 时 $M_{t, j} = 0$，其余全部掩码为 $-\infty$），将单层计算复杂度降至线性 $O(T w d)$，KV-Cache 显存上限锁死为固定常数 $O(w d_h)$。

4. **查询-键归一化（QK-Norm）**：在计算点积 $Q K^T$ 之前，先对查询向量和键向量分别施加 RMSNorm：$\tilde{q}_t = \text{RMSNorm}(q_t), \ \tilde{k}_j = \text{RMSNorm}(k_j)$。这彻底消除了大参数模型预训练后期因注意力 Logits 数值失控导致的 Loss Spike（损失尖峰崩溃）。

#### 2. 混合专家模型 (Mixture-of-Experts, MoE, Section 17.5)

为了在不增加单次前向推理计算量（FLOPs）的前提下扩展模型总参数量（知识容量），**MoE 架构**将 Transformer 中的密集前馈网络（Dense MLP）替换为 $N$ 个并行的专家子网络 $\{E_1, \dots, E_N\}$ 和一个轻量级**路由器（Router）**：

- 对每个 Token 的隐向量 $h_t \in \mathbb{R}^d$，路由器计算各专家的打分概率 $r_t = \sigma(h_t W^R) \in \mathbb{R}^N$；

- 仅激活得分最高的 **Top-$k$ 个路由专家**（同时可配置常驻激活的**共享专家 Shared Experts**），加权求和输出：

$$

h_t^{\text{MoE}} = h_t + \sum_{i \in \text{Top-}k(r_t)} \tilde{r}_{t, i} E_i(h_t) + \sum_{s \in \text{Shared}} E_s^{\text{shared}}(h_t)

$$

例如 **DeepSeek-V3** 拥有 671B 总参数（每层 256 个路由专家 + 1 个共享专家，每个 Token 仅激活 Top-8 路由专家），每个 Token 实际参与计算的激活参数仅为 37B！

#### 3. 上下文学习 (ICL)、零样本提示与指令微调 (SFT, Sections 17.6–17.8)

- **上下文学习（In-Context Learning, ICL）**：无需更新任何模型权重 $\theta$，只需在 Prompt 中拼接几个输入-输出示例 $(x^{(1)}, y^{(1)}), \dots, (x^{(k)}, y^{(k)})$，预训练基座模型即可通过自注意力机制在激活状态中自动归纳任务映射。

- **监督指令微调（Supervised Finetuning / Instruction Tuning, SFT，式 17.36–17.37）**：为了将“只会续写网页”的基座模型变成听懂人类指令的助手，我们在高质量（指令 Prompt $x^{(i)}$，标准回答 Response $y^{(i)}$）成对数据上微调。设拼接后的完整 Token 序列为 $z^{(i)} = (x^{(i)}, y^{(i)})$，**核心细节是引入回答掩码 $m_r^{(i)} \in \{0, 1\}$（当第 $r$ 个位置属于回答部分 $y^{(i)}$ 时 $m_r^{(i)} = 1$，属于用户 Prompt 部分 $x^{(i)}$ 时 $m_r^{(i)} = 0$）**，仅对模型生成的回答部分计算交叉熵损失：

$$

\mathcal{L}_{\text{SFT}}(\theta) = -\frac{1}{n} \sum_{i=1}^n \frac{1}{\sum_{r=1}^{T_i} m_r^{(i)}} \sum_{r=1}^{T_i} m_r^{(i)} \log p_\theta\left(z_r^{(i)} \ \big|\ z_{<r}^{(i)}\right) \tag{17.36–17.37}

$$

---

## 六、第 18 章：大语言模型推理与强化学习 (Reasoning in LLMs: CoT, RLVR, PPO, GRPO & CISPO)

### 18.1 思维链提示 (Chain-of-Thought, CoT)

对于复杂的数学竞赛题（如 AIME）、算法编程题（如 ICPC）或逻辑推理问题，如果强迫 LLM 在看到问题 $x$ 后直接输出最终答案 Token，受限于单步前向传播固定的电路深度（计算量 $O(d^2)$），模型极易出错。

**思维链（Chain-of-Thought, CoT, Wei et al., 2022；Kojima et al., 2022 的 Zero-shot CoT `"Let's think step by step"`）**让模型在输出最终答案前，先自回归生成一长串中间推理步骤（Reasoning Trace / Scratchpad）$z_1, z_2, \dots, z_m$。从计算理论视角看，中间生成的每一个思维链 Token 都被写回 KV-Cache 供后续步反复读取，从而将 LLM 的有效推理计算深度从常数级 $O(1)$ 动态扩展到了与思维链长度成正比的 **$O(m)$（测试时扩展定律 Test-Time Scaling Law）**！

---

### 18.2 基于可验证奖励的强化学习 (RLVR: PPO, GRPO & CISPO)

仅靠人工编写的思维链进行 SFT，模型的推理上限被人类标注者锁死。OpenAI o1 与 **DeepSeek-R1-Zero** 开创了 **RLVR（Reinforcement Learning with Verifiable Rewards）** 范式：对于数学题（可比对标准答案）或代码题（可跑沙箱单元测试），我们不需要训练容易被钻空子（Reward Hacking）的神经网络奖励模型，而是直接使用确定性的规则验证器给出精确的终端奖励 $R(x, y) \in \{0, 1\}$！

#### 1. Token 级马尔可夫决策过程与 KL 正则化目标 (Equations 18.1–18.3)

在 LLM 强化学习中，状态 $s_t = (x, y_{<t})$ 是当前已生成的上下文前缀，动作 $a_t = y_t \in \mathcal{V}$ 是选出的下一个 Token，策略即为语言模型本身 $\pi_\theta(y_t \mid x, y_{<t})$。为了防止模型在追求高奖励时语言崩坏或偏离初始预训练/SFT 参考模型 $\pi_{\text{ref}}$ 太远，通用优化目标为**带 KL 散度惩罚的期望奖励**：

$$

J_\beta(\theta) = \mathbb{E}_{x \sim \mathcal{D}, \, y \sim \pi_\theta(\cdot \mid x)} [R(x, y)] - \beta \mathbb{E}_{x \sim \mathcal{D}} \left[ D_{\text{KL}}\left(\pi_\theta(\cdot \mid x) \parallel \pi_{\text{ref}}(\cdot \mid x)\right) \right] \tag{18.2}

$$

当 $\beta = 0$ 时，利用对数导数技巧（Log-Deriatie Trick），序列级策略梯度（REINFORCE）为：

$$

\nabla_\theta J_R(\theta) = \mathbb{E}_{x \sim \mathcal{D}, \, y \sim \pi_\theta(\cdot \mid x)} \left[ R(x, y) \sum_{t=1}^{|y|} \nabla_\theta \log \pi_\theta(y_t \mid x, y_{<t}) \right] \tag{18.3}

$$

#### 2. 三大主流大模型 RL 算法横向对比：PPO s. GRPO s. CISPO

在实际大规模异步 RL 训练中，采样轨迹使用的是旧策略 $\pi_{\theta_{\text{old}}}$，而参数更新会执行多步（Off-policy）。定义为第 $i$ 条轨迹第 $t$ 个 Token 的**重要性采样比率（Importance Sampling Ratio）**：

$$

r_t^{(i)}(\theta) \triangleq \frac{\pi_\theta(y_t^{(i)} \mid x, y_{<t}^{(i)})}{\pi_{\theta_{\text{old}}}(y_t^{(i)} \mid x, y_{<t}^{(i)})} \tag{18.4}

$$

- **1. Token 级近端策略优化（PPO, Schulman et al., 2017，式 18.5–18.6）**：

  - 需要额外训练一个与策略模型同规模的价值评论家网络（Critic / Value Network）$V_\phi(s_t)$ 来估计每个 Token 的优势函数 $\widehat{A}_t^{(i)}$，并通过 $\text{clip}(r_t^{(i)}(\theta), 1 - \epsilon, 1 + \epsilon)$ 截断过大更新：

$$

\mathcal{L}_{\text{PPO}}(\theta) = -\mathbb{E} \left[ \frac{1}{|y^{(i)}|} \sum_{t=1}^{|y^{(i)}|} \min\left\{ r_t^{(i)}(\theta) \widehat{A}_t^{(i)}, \ \text{clip}\left(r_t^{(i)}(\theta), 1 - \epsilon, 1 + \epsilon\right) \widehat{A}_t^{(i)} \right\} \right] \tag{18.5–18.6}

$$

  - *痛点*：在百亿/千亿参数 LLM 上多维护一个同尺寸 Critic 模型会使显存和计算开销直接翻倍！

- **2. 群组相对策略优化（GRPO, Shao et al., 2024 / DeepSeek-R1 核心算法，式 18.7–18.8）**：

  - **彻底砍掉 Critic 价值网络！** 针对同一个问题 $x$，直接从旧策略 $\pi_{\theta_{\text{old}}}(\cdot \mid x)$ 中并行采样一组 **$G$ 条独立回答轨迹** $\{y^{(1)}, y^{(2)}, \dots, y^{(G)}\}$，由验证器分别打出奖励 $\{R_1, R_2, \dots, R_G\}$。

  - 直接用该组内部奖励的均值 $\bar{R} = \frac{1}{G}\sum_{i=1}^G R_i$ 和标准差 $s_R = \sqrt{\frac{1}{G}\sum_{i=1}^G (R_i - \bar{R})^2}$ 对每条轨迹进行标准化，作为整条轨迹所有 Token 共享的**组内相对优势（Group-Relatie Adantage）**：

$$

\widehat{A}_i = \frac{R_i - \bar{R}}{s_R + \epsilon_{\text{norm}}} \tag{18.7}

$$

  - GRPO 的优化目标函数为：

$$

\mathcal{L}_{\text{GRPO}}(\theta) = -\mathbb{E}_{x} \left[ \frac{1}{G} \sum_{i=1}^G \frac{1}{|y^{(i)}|} \sum_{t=1}^{|y^{(i)}|} \left( \min\left\{ r_t^{(i)}(\theta) \widehat{A}_i, \ \text{clip}\left(r_t^{(i)}(\theta), 1 - \epsilon, 1 + \epsilon\right) \widehat{A}_i \right\} - \beta D_{\text{KL}}(\pi_\theta \parallel \pi_{\text{ref}}) \right) \right] \tag{18.8}

$$

- **3. 截断重要性采样策略优化（CISPO, MiniMax-M1, 2025，式 18.9）**：

  - 在超长思维链（如数万 Token）的强化学习中，PPO/GRPO 的 $\min(r \widehat{A}, \text{clip}(r)\widehat{A})$ 一旦触发上界截断，该 Token 的梯度就会完全变为 $0$（丢失稀有的关键推理分叉 Token 梯度）。**CISPO** 改为使用停止梯度算子 $\text{stopgrad}(\cdot)$ 直接对重要性采样权重做上界截断，并乘回原始对数似然梯度：

$$

\mathcal{L}_{\text{CISPO}}(\theta) = -\mathbb{E}_{x} \left[ \frac{1}{G} \sum_{i=1}^G \frac{1}{|y^{(i)}|} \sum_{t=1}^{|y^{(i)}|} \text{stopgrad}\left( \min\left\{ r_t^{(i)}(\theta), \ \epsilon_{\text{high}} \right\} \right) \widehat{A}_i \log \pi_\theta\left(y_t^{(i)} \ \big|\ x, y_{<t}^{(i)}\right) \right] \tag{18.9}

$$

---

## 七、本章代码示例：GQA 分组查询注意力、LoRA 线性层与 GRPO 损失实现

```python title="llm_lora_gqa_grpo.py"
import numpy as np

class LoRALinear:
    """CS229 15.3 节：低秩自适应微调层 h = W0 x + (alpha / r) * B(Ax)"""
    def __init__(self, W0: np.ndarray, r: int = 8, alpha: float = 16.0, seed: int = 42):
        rng = np.random.default_rng(seed)
        self.W0 = W0  # 冻结的预训练权重 (d_out, d_in)
        d_out, d_in = W0.shape
        self.r = r
        self.scale = alpha / r
        # A 高斯初始化，B 严格全零初始化，确保初始 Delta W = B @ A == 0
        self.A = rng.normal(0.0, 0.02, size=(r, d_in))
        self.B = np.zeros((d_out, r))

    def forward(self, X: np.ndarray) -> np.ndarray:
        return X @ self.W0.T + self.scale * ((X @ self.A.T) @ self.B.T)

def compute_grpo_advantages_and_loss(rewards: np.ndarray, ratios: np.ndarray, eps_clip: float = 0.2):
    """
    CS229 18.2 节：GRPO 组内相对优势计算与 Clipped Surrogate 损失
    rewards: shape (G,), 同一问题采样 G 条轨迹的验证器奖励
    ratios: shape (G, T), 每个 Token 的重要性采样比 pi_theta / pi_old
    """
    mean_r = np.mean(rewards)
    std_r = np.std(rewards)
    advantages = (rewards - mean_r) / (std_r + 1e-8)  # shape: (G,)

    adv_expanded = advantages[:, None]  # 广播至 (G, T)
    surr1 = ratios * adv_expanded
    surr2 = np.clip(ratios, 1.0 - eps_clip, 1.0 + eps_clip) * adv_expanded
    loss = -np.mean(np.minimum(surr1, surr2))
    return advantages, loss

if __name__ == "__main__":
    rewards = np.array([1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0])
    ratios = np.ones((8, 16)) * 1.05
    adv, loss = compute_grpo_advantages_and_loss(rewards, ratios)
    print("GRPO Group-Relative Advantages:", np.round(adv, 4))
    print("GRPO Surrogate Loss:", round(float(loss), 4))
```

---

## 八、第 14–18 章课后推导与习题解答 (Exercises & Detailed Solutions)

### 习题 14.1：严格证明附录 A 引理 A.1.3（同协方差多元高斯分布的 KL 散度公式）

设两个 $d$ 维多元高斯分布 $P = \mathcal{N}(\mu_1, \Sigma)$ 与 $Q = \mathcal{N}(\mu_2, \Sigma)$ 具有相同的正定协方差矩阵 $\Sigma \succ 0$。严格推导证明：

$$

D_{\text{KL}}\left(\mathcal{N}(\mu_1, \Sigma) \parallel \mathcal{N}(\mu_2, \Sigma)\right) = \frac{1}{2} (\mu_1 - \mu_2)^T \Sigma^{-1} (\mu_1 - \mu_2)

$$

:::spoiler[习题 14.1 解答]

**解**：

根据连续分布 KL 散度的定义，写出两高斯密度之比的对数（注意归一化常数 $(2\pi)^{-d/2}|\Sigma|^{-1/2}$ 完全相同，直接相消！）：

$$
\begin{aligned}

D_{\text{KL}}(P \parallel Q) &= \mathbb{E}_{x \sim \mathcal{N}(\mu_1, \Sigma)} \left[ \log \frac{p(x)}{q(x)} \right] \\

&= \mathbb{E}_{x \sim \mathcal{N}(\mu_1, \Sigma)} \left[ -\frac{1}{2}(x - \mu_1)^T \Sigma^{-1} (x - \mu_1) + \frac{1}{2}(x - \mu_2)^T \Sigma^{-1} (x - \mu_2) \right]

\end{aligned}
$$

我们将第二项中的 $x - \mu_2$ 拆写为 $(x - \mu_1) + (\mu_1 - \mu_2)$ 并展开二次型：

$$
(x - \mu_2)^T \Sigma^{-1} (x - \mu_2) = (x - \mu_1)^T \Sigma^{-1} (x - \mu_1) + 2(x - \mu_1)^T \Sigma^{-1} (\mu_1 - \mu_2) + (\mu_1 - \mu_2)^T \Sigma^{-1} (\mu_1 - \mu_2)
$$

代入原期望式，首项 $\pm \frac{1}{2}(x - \mu_1)^T \Sigma^{-1} (x - \mu_1)$ 精确抵消！剩下两项对 $x \sim \mathcal{N}(\mu_1, \Sigma)$ 取期望，由于 $\mathbb{E}[x - \mu_1] = 0$，一次交叉项的期望也为 $0$：

$$
D_{\text{KL}}(P \parallel Q) = \mathbb{E}_{x \sim \mathcal{N}(\mu_1, \Sigma)} \left[ (x - \mu_1)^T \Sigma^{-1} (\mu_1 - \mu_2) \right] + \frac{1}{2}(\mu_1 - \mu_2)^T \Sigma^{-1} (\mu_1 - \mu_2) = \frac{1}{2}(\mu_1 - \mu_2)^T \Sigma^{-1} (\mu_1 - \mu_2) \qquad \blacksquare
$$

:::

### 习题 16.1：手工计算排序指标 DCG@4、IDCG@4 与 NDCG@4

假设针对某个查询 $q$，知识库中共有 4 篇文档，人工标注的真实相关性等级为 $r = [3, 0, 2, 1]$（即系统返回的 Top-4 列表依次是相关性为 $3, 0, 2, 1$ 的文档）。按照讲义式 $(16.1)\text{–}(16.3)$，求该返回列表的 $\text{DCG@}4$、$\text{IDCG@}4$ 和 $\text{NDCG@}4$。

:::spoiler[习题 16.1 解答]

**解**：

1. **计算 $\text{DCG@}4$**：代入公式 $\text{DCG@}4 = \sum_{i=1}^4 \frac{2^{r_i} - 1}{\log_2(i + 1)}$，注意 $\log_2(2) = 1, \ \log_2(3) \approx 1.5850, \ \log_2(4) = 2, \ \log_2(5) \approx 2.3219$：

$$
\text{DCG@}4 = \frac{2^3 - 1}{\log_2 2} + \frac{2^0 - 1}{\log_2 3} + \frac{2^2 - 1}{\log_2 4} + \frac{2^1 - 1}{\log_2 5} = \frac{7}{1} + 0 + \frac{3}{2} + \frac{1}{\log_2 5} \approx 7 + 0 + 1.5 + 0.4307 = 8.9307
$$

2. **计算理想排序 $\text{IDCG@}4$**：将相关性分数从大到小理想排列为 $r^* = [3, 2, 1, 0]$：

$$
\text{IDCG@}4 = \frac{2^3 - 1}{\log_2 2} + \frac{2^2 - 1}{\log_2 3} + \frac{2^1 - 1}{\log_2 4} + \frac{2^0 - 1}{\log_2 5} = 7 + \frac{3}{1.5850} + \frac{1}{2} + 0 \approx 7 + 1.8928 + 0.5 = 9.3928
$$

3. **计算 $\text{NDCG@}4$**：

$$
\text{NDCG@}4 = \frac{\text{DCG@}4}{\text{IDCG@}4} \approx \frac{8.9307}{9.3928} \approx 0.9508 \qquad \blacksquare
$$

:::

### 习题 17.1：计算 GQA 与 MHA 在长上下文推理时的 KV-Cache 显存占用对比

假设某大语言模型有 $L = 32$ 层 Transformer，隐层维度 $d = 4096$，查询头数 $n_h = 32$，每个头维度 $d_h = 128$。使用 FP16（每个浮点数占 2 字节）推理上下文长度 $T = 32768$（32k）的单条序列：

(a) 若采用标准多头注意力（MHA），总 KV-Cache 显存占用是多少 GB？

(b) 若采用分组查询注意力（GQA），设键值头组数 $n_g = 4$（即每 $\tau = 8$ 个查询头共享一组 KV），总 KV-Cache 显存降至多少 GB？

:::spoiler[习题 17.1 解答]

**解**：

**(a) 标准 MHA 的 KV-Cache 显存**：

每层、每个头需要缓存矩阵 $K_{1:T} \in \mathbb{R}^{T \times d_h}$ 和 $V_{1:T} \in \mathbb{R}^{T \times d_h}$（共 2 个矩阵）。因此全模型 $L$ 层的总元素个数为：

$$
N_{\text{MHA}} = 2 \times L \times n_h \times T \times d_h = 2 \times 32 \times 32 \times 32768 \times 128 = 8,589,934,592 = 8 \times 2^{30}
$$

每个 FP16 元素占 2 字节，故总字节数为 $16 \times 2^{30} \text{ Bytes} = \mathbf{16.0 \text{ GiB}}$！仅仅缓存单条 32k 序列的 KV-Cache 就吃掉了整整 16 GB 显存！

**(b) GQA ($n_g = 4$) 的 KV-Cache 显存**：

采用 GQA 后，每层只需缓存 $n_g = 4$ 组键值矩阵，压缩比为 $n_g / n_h = 4 / 32 = 1/8$：

$$
\text{Memory}_{\text{GQA}} = \frac{1}{8} \times 16.0 \text{ GiB} = \mathbf{2.0 \text{ GiB}}
$$

这直观展示了为什么现代长文本大模型必须使用 GQA（或 MLA）来压缩 KV-Cache 显存。 $\blacksquare$

:::

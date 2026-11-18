---
title: CS229 · 笔记（七） · 强化学习与最优控制
published: 2026-11-30
tags:
  - CS229
  - 机器学习
  - Reinforcement_Learning
  - Optimal_Control
  - LQR
category: 机器学习
draft: false
description: 从马尔可夫决策过程（MDP）、Bellman 方程、值迭代与策略迭代、拟合值迭代（FVI）出发，严密证明 Bellman 算子无穷范数压缩映射，完整推导线性二次型调节器（LQR）与离散 Riccati 方程、微分动态规划（DDP）、部分可观测 LQG 与卡尔曼滤波（Kalman Filter），并打通 REINFORCE 策略梯度、基线方差缩减与 PPO 裁剪目标。
---

## 导读

在前六篇笔记中，模型面对的大多是单步预测或序列生成。然而，在机器人控制（如机械臂轨迹规划、直升机悬停、自动驾驶）、棋类博弈以及智能体（Agent）交互中，算法需要在环境中进行多步**序贯决策（Sequential Decision Making）**：当前执行的动作 $a_t$ 不仅决定即时奖励，还会改变下一时刻的环境状态 $s_{t+1}$，进而深远影响未来的所有收益。

本篇讨论强化学习与最优控制，内容包括以下几个部分：

1. **第 19 章：马尔可夫决策过程（MDP）与动态规划**：定义五元组 $(S, A, \{P_{sa}\}, \gamma, R)$，推导策略价值函数 $V^\pi(s)$ 与最优价值函数 $V^*(s)$ 的 **Bellman 方程**，对比**值迭代（Value Iteration）**、**策略迭代（Policy Iteration）**与 **$k$ 步广义策略迭代（Algorithm 6）**，并解决连续状态空间下的维度灾难与**拟合值迭代（Fitted Value Iteration, FVI）**。

2. **第 20 章：有限时域 MDP、线性二次型调节器（LQR）、DDP 与卡尔曼滤波（LQG）**：严格证明 Bellman 算子在 $\|\cdot\|_\infty$ 下的 **$\gamma$-压缩映射性质（$\gamma$-Contraction）**；用数学归纳法与二次型求导完整推导 **LQR 最优线性反馈控制律 $a_t^* = L_t s_t$** 与**离散 Riccati 方程**，揭示惊人的**确定性等价原理（噪声协方差 $\Sigma_t$ 不影响最优策略！）**；讲解非线性系统的泰勒线性化 **DDP（微分动态规划）**，以及部分可观测环境（POMDP）下的 **卡尔曼滤波（Kalman Filter）** 与 **LQG 分离原理**。

3. **第 21 章：策略梯度（REINFORCE）与近端策略优化（PPO）**：利用对数导数技巧（Log-Deriatie Trick）消去未知环境转移概率 $P_{s_t a_t}$，严格证明利用因果性（Causality）与状态基线（Baseline $B(s_t)$）缩减方差的**无偏性定理**，最后完整剖析现代强化学习主力算法 **PPO（重要性采样比率 $r_t(\theta)$ 与 $\text{clip}$ 截断代理目标）**。

---

:::tip[学习重点]

- 从状态、动作、转移和回报建立 MDP。
- 区分价值迭代、策略梯度和控制方法的适用条件。

:::

## 一、第 19 章：强化学习与马尔可夫决策过程 (Reinforcement Learning and MDPs)

### 19.1 马尔可夫决策过程与 Bellman 方程 (MDPs & Bellman Equations)

一个**马尔可夫决策过程（Marko Decision Process, MDP）**由五元组 $\left(S, A, \{P_{sa}\}, \gamma, R\right)$ 定义：

- **$S$**：状态集合（State Space，可为有限离散集或连续欧氏空间 $\mathbb{R}^d$）；

- **$A$**：动作集合（Action Space，可为有限集或连续控制空间）；

- **$\{P_{sa}\}$**：状态转移概率分布（State Transition Probabilities），$P_{sa}(s') = P(s_{t+1} = s' \mid s_t = s, a_t = a)$ 描述在状态 $s$ 执行动作 $a$ 后转移到下一状态 $s'$ 的概率分布（满足马尔可夫无后效性）；

- **$\gamma \in [0, 1)$**：折扣因子（Discount Factor），使远期奖励按 $\gamma^t$ 指数折现并保证无穷级数收敛；

- **$R : S \times A \to \mathbb{R}$（或简化为仅依赖状态的 $R : S \to \mathbb{R}$）**：奖励函数（Reward Function）。

给定一个确定性策略（Policy）$\pi : S \to A$，从初始状态 $s_0 = s$ 出发沿策略 $\pi$ 交互产生的折扣累计期望总回报定义为该策略的**价值函数（Value Function）**：

$$

V^\pi(s) = \mathbb{E}\left[ R(s_0) + \gamma R(s_1) + \gamma^2 R(s_2) + \dots \ \big|\ s_0 = s; \, \pi \right]

$$

#### 1. 固定策略 $\pi$ 的 Bellman 期望方程与线性方程组求解

将第 $0$ 步的即时奖励 $R(s_0)$ 拆出，对后续项提出公因子 $\gamma$ 并利用全期望公式对一步转移后的状态 $s_1 = s' \sim P_{s \pi(s)}$ 求条件期望，立得固定策略 $\pi$ 的 **Bellman 方程**：

$$

V^\pi(s) = R(s) + \gamma \sum_{s' \in S} P_{s \pi(s)}(s') V^\pi(s'), \qquad \forall s \in S \tag{19.1}

$$

当状态空间有限（$|S| < \infty$）时，式 $(19.1)$ 是关于 $|S|$ 个未知数 $\{V^\pi(s)\}_{s \in S}$ 的**包含 $|S|$ 个方程的线性方程组**（矩阵形式为 $V^\pi = R + \gamma P_\pi V^\pi \implies (I - \gamma P_\pi) V^\pi = R$），可以直接在 $O(|S|^3)$ 时间内精确解出！

#### 2. 最优价值函数 $V^*(s)$ 与 Bellman 最优性方程

定义**最优价值函数（Optimal Value Function）** $V^*(s) = \max_\pi V^\pi(s)$ 为所有可能策略所能达到的最高期望回报。它满足非线性的 **Bellman 最优性方程（Bellman's Equations）**：

$$

V^*(s) = R(s) + \max_{a \in A} \gamma \sum_{s' \in S} P_{sa}(s') V^*(s') \tag{19.2}

$$

一旦求出了最优价值函数 $V^*$，只需在每个状态 $s$ 下贪心选取使一步前瞻期望回报最大的动作，即可直接得到全局**最优策略 $\pi^* : S \to A$**：

$$

\pi^*(s) = \arg\max_{a \in A} \sum_{s' \in S} P_{sa}(s') V^*(s') \tag{19.3}

$$

且满足对任意状态 $s \in S$ 和任意策略 $\pi$，恒有 $V^{\pi^*}(s) = V^*(s) \ge V^\pi(s)$（即同一个 $\pi^*$ 对所有初始状态同时最优！）。

---

### 19.2–19.3 值迭代、策略迭代与基于模型的强化学习 (Value Iteration & Policy Iteration)

当有限状态集 $|S|$ 较大或包含 $\max_{a \in A}$ 非线性算子时，我们通过以下两大动态规划算法求解 $V^*$ 和 $\pi^*$：

:::important[算法 4 & 算法 5：值迭代 (Value Iteration) s. 策略迭代 (Policy Iteration)]

**1. 值迭代（Value Iteration, Algorithm 4）**：

- 将 $V(s) := 0$ 初始化（对所有 $s \in S$）。

- 重复将式 $(19.2)$ 右端作为不动点迭代算子更新 $V$ 直至收敛：

$$

V(s) := R(s) + \max_{a \in A} \gamma \sum_{s' \in S} P_{sa}(s') V(s'), \qquad \forall s \in S \tag{19.4}

$$

  - *同步更新（Synchronous Update）*：用旧向量 $V^{(t)}$ 同时算出所有状态的新向量 $V^{(t+1)}$，即 $V_{t+1} = B(V_t)$。

  - *异步更新（Asynchronous / Gauss-Seidel Update）*：按某种固定顺序逐个状态就地（In-place）覆写更新 $V(s)$，新算出的值立刻用于后续状态的计算，通常收敛更快。

**2. 策略迭代（Policy Iteration, Algorithm 5）**：

- 随机初始化一个策略 $\pi$。重复以下两步直至策略不再改变：

  - **(a) 策略评估（Policy Ealuation）**：求解线性方程组 $V(s) = R(s) + \gamma \sum_{s'} P_{s\pi(s)}(s') V(s')$，精确算出当前策略的价值 $V := V^\pi$；

  - **(b) 策略改进（Policy Improement）**：对每个状态贪心更新策略 $\pi(s) := \arg\max_{a \in A} \sum_{s'} P_{sa}(s') V(s')$。

**3. 广义 $k$ 步策略迭代（Section 19.5, Algorithm 6）**：

- 在策略迭代的步骤 (a) 中，精确求解线性方程组 $V^\pi$ 代价高昂。我们可以定义子程序 $\text{VE}(\pi, k)$：从当前 $V$ 出发，仅针对固定策略 $\pi$ 执行 **$k$ 次** Bellman 期望迭代 $V(s) \leftarrow R(s) + \gamma \sum_{s'} P_{s\pi(s)}(s') V(s')$！

- **大一统视角**：当 **$k = 1$** 时，做 1 步评估立刻接 1 步贪心改进，恰等价于**值迭代（Value Iteration）**；当 **$k = \infty$** 时，精确评估到底再改进，恰等价于**标准策略迭代（Policy Iteration）**！取有限的 $k \in (1, \infty)$ 即可在二者之间取得极佳的计算效率平衡。

:::

:::tip[基于模型的强化学习 (Model-Based RL, Section 19.3) 转移概率估计]

当状态转移概率 $P_{sa}(s')$ 未知时，我们可以先让智能体在环境中探索采样多条轨迹，直接用经验频率（最大似然估计）拟合环境模型（若分母为 $0$ 则用均匀分布 $1/|S|$ 平滑）：

$$

P_{sa}(s') = \frac{\text{在状态 } s \text{ 执行动作 } a \text{ 后转移到 } s' \text{ 的总次数}}{\text{在状态 } s \text{ 执行动作 } a \text{ 的总次数}} \tag{19.5}

$$

然后将估计出的 $P_{sa}$ 送入值迭代或策略迭代循环，边交互采样更新模型、边更新策略。

:::

---

### 19.4 连续状态 MDP 与拟合值迭代 (Continuous-State MDPs & Fitted Value Iteration)

在倒立摆、自动驾驶或 3D 直升机控制（状态维度 $d = 12$，含三维位置、三维姿态角及各自的速度/角速度）中，状态空间 $S = \mathbb{R}^d$ 是连续的。

- **网格离散化（Discretization）的缺陷**：如果把每个维度切分为 $k$ 个区间，总离散状态数将高达 **$\bar{n} = k^d$**！这种随维度 $d$ 指数爆炸的现象被称为**维数灾难（Curse of Dimensionality）**，且离散分桶无法在相邻状态间平滑泛化。

- **函数逼近与拟合值迭代（Fitted Value Iteration, FVI）**：我们不再维护离散表格，而是选用一个参数化函数（如线性特征映射 $V_\theta(s) = \theta^T \phi(s)$ 或神经网络）来逼近连续价值函数 $V(s)$！

对于连续状态转移，我们通常在模拟器或物理引擎中建模为 $s_{t+1} = f(s_t, a_t) + \epsilon_t$（例如线性高斯模型 $s_{t+1} = A s_t + B a_t + \epsilon_t$）。此时对下一状态 $s' \sim P_{sa}$ 的求和变成了连续积分 $\mathbb{E}_{s' \sim P_{sa}}[V(s')]$，可通过抽取 $k$ 个蒙特卡洛样本取平均来近似。

:::important[算法：拟合值迭代 (Fitted Value Iteration, FVI)]

1. 从连续状态空间 $S$ 中随机采样 $n$ 个代表性状态点 $\left\{s^{(1)}, s^{(2)}, \dots, s^{(n)}\right\}$，初始化参数 $\theta := 0$。

2. 重复以下循环：

   - 对每个样本状态 $i = 1, \dots, n$：

     - 对每个候选动作 $a \in A$，从转移模型 $P_{s^{(i)}, a}$ 中采样 $k$ 个下一状态 $s'_1, \dots, s'_k$（若为确定性动力学模拟器，只需取 $k = 1$ 个状态 $s' = f(s^{(i)}, a)$），计算动作回报估计 $q(a) = \frac{1}{k} \sum_{j=1}^k \left(R(s^{(i)}) + \gamma V_\theta(s'_j)\right)$；

     - 令回归目标标签为 Bellman 最优备份值：$y^{(i)} = \max_{a \in A} q(a)$。

   - **监督回归步**：将 $\left\{\left(s^{(i)}, y^{(i)}\right)\right\}_{i=1}^n$ 视为标准监督回归数据集，通过最小二乘（或带正则化的梯度下降）更新参数 $\theta$，使 $V_\theta(s^{(i)}) = \theta^T \phi(s^{(i)})$ 逼近目标 $y^{(i)}$：

   $$

   \theta := \arg\min_\theta \frac{1}{2} \sum_{i=1}^n \left( \theta^T \phi(s^{(i)}) - y^{(i)} \right)^2 \tag{19.6}

   $$

:::

---

## 二、第 20 章：线性二次型调节器 (LQR)、微分动态规划 (DDP) 与线性二次高斯控制 (LQG)

### 20.1 有限时域 MDP 与 Bellman 算子压缩映射证明 (Finite-Horizon MDPs)

在实际控制任务中，我们经常考虑有限步数 $T$ 的**有限时域 MDP（Finite-Horizon MDP）**：策略 $\pi^{(t)}$、转移概率 $P_{sa}^{(t)}$ 和奖励 $R^{(t)}(s_t, a_t)$ 都可以依赖于当前时间步 $t \in \{0, 1, \dots, T\}$，且通常设折扣因子 $\gamma = 1$。

此时，最优价值函数 $V_t^*(s_t)$ 不再是静态不动点，而是通过**从终点 $t = T$ 向起点 $t = 0$ 逆向归纳的动态规划（Backward Dynamic Programming）**在有限步内精确求解：

1. **终端边界条件（Base Case, $t = T$）**：

$$

V_T^*(s_T) := R^{(T)}(s_T) \tag{20.1}

$$

2. **逆向递推步（Backward Recursion, 对 $t = T-1, T-2, \dots, 0$）**：

$$

V_t^*(s_t) := \max_{a_t \in A} \left\{ R^{(t)}(s_t, a_t) + \mathbb{E}_{s_{t+1} \sim P_{s_t, a_t}^{(t)}} \left[ V_{t+1}^*(s_{t+1}) \right] \right\} \tag{20.2}

$$

$$

\pi_t^*(s_t) := \arg\max_{a_t \in A} \left\{ R^{(t)}(s_t, a_t) + \mathbb{E}_{s_{t+1} \sim P_{s_t, a_t}^{(t)}} \left[ V_{t+1}^*(s_{t+1}) \right] \right\} \tag{20.3}

$$

#### 补充证明：为什么无限时域值迭代 $V_{t+1} = B(V_t)$ 必然指数收敛到 $V^*$？

讲义在第 20.1 节末尾给出了无限时域折扣 MDP（$\gamma < 1$）中 Bellman 最优算子 $B(V)(s) = R(s) + \max_{a \in A} \gamma \sum_{s'} P_{sa}(s') V(s')$ 的**$\gamma$-压缩映射定理（$\gamma$-Contraction in Infinity Norm）**，这是强化学习理论最经典的不动点证明：

:::important[定理 20.1.1 (Bellman 算子的无穷范数 $\gamma$-压缩性)]

定义向量 $V$ 的无穷范数为 $\|V\|_\infty = \max_{s \in S} |V(s)|$。则对任意两个价值函数 $V, U$，Bellman 算子 $B$ 满足：

$$

\|B(V) - B(U)\|_\infty \le \gamma \|V - U\|_\infty

$$

**严格证明**：

利用一个基本不等式：对任意两个函数 $f(a), g(a)$，恒有 $\left|\max_a f(a) - \max_a g(a)\right| \le \max_a |f(a) - g(a)|$。因此对任意固定状态 $s \in S$：

$$

\begin{aligned}

|B(V)(s) - B(U)(s)| &= \gamma \left| \max_{a \in A} \sum_{s'} P_{sa}(s') V(s') - \max_{a \in A} \sum_{s'} P_{sa}(s') U(s') \right| \\

&\le \gamma \max_{a \in A} \left| \sum_{s'} P_{sa}(s') \left(V(s') - U(s')\right) \right| \\

&\le \gamma \max_{a \in A} \sum_{s'} P_{sa}(s') \underbrace{|V(s') - U(s')|}_{\le \|V - U\|_\infty} \\

&\le \gamma \|V - U\|_\infty \max_{a \in A} \underbrace{\sum_{s'} P_{sa}(s')}_{=1} = \gamma \|V - U\|_\infty

\end{aligned}

$$

对左边取遍所有状态 $s \in S$ 的最大值，即得 $\|B(V) - B(U)\|_\infty \le \gamma \|V - U\|_\infty$！由于最优价值函数满足不动点方程 $B(V^*) = V^*$，令 $U = V^*$，则值迭代第 $t$ 步误差满足：

$$

\|V_{t+1} - V^*\|_\infty = \|B(V_t) - B(V^*)\|_\infty \le \gamma \|V_t - V^*\|_\infty \le \dots \le \gamma^t \|V_1 - V^*\|_\infty

$$

误差以 $\gamma^t$ 的几何级数速度指数衰减至 $0$！ $\blacksquare$

:::

---

### 20.2 线性二次型调节器 (Linear Quadratic Regulation, LQR) 完整推导

在连续状态空间 $S = \mathbb{R}^d$ 和连续动作空间 $A = \mathbb{R}^k$ 中，绝大多数 MDP 无法求出最优价值函数的精确解析解。但有一个在机器人学与航空航天控制中统治地位的黄金特例可以求出**百分之百精确的闭式解**——那就是**线性二次型调节器（Linear Quadratic Regulation, LQR）**！

**LQR 的两大基本假设**：

1. **线性高斯状态转移（Linear Transitions with Gaussian Noise）**：

$$

s_{t+1} = A_t s_t + B_t a_t + w_t, \qquad w_t \sim \mathcal{N}(0, \Sigma_t)

$$

其中 $A_t \in \mathbb{R}^{d \times d}$，$B_t \in \mathbb{R}^{d \times k}$，噪声协方差 $\Sigma_t \in \mathbb{R}^{d \times d}$。

2. **二次型负代价奖励函数（Quadratic Rewards）**（希望将状态 $s_t$ 稳定在零点附近，同时避免控制力矩 $a_t$ 过大）：

$$

R^{(t)}(s_t, a_t) = -s_t^T U_t s_t - a_t^T W_t a_t \quad (t < T), \qquad R^{(T)}(s_T) = -s_T^T U_T s_T

$$

其中 $U_t \in \mathbb{R}^{d \times d}$ 为半正定矩阵（$U_t \succeq 0$），$W_t \in \mathbb{R}^{k \times k}$ 为正定矩阵（$W_t \succ 0$）。

#### 数学归纳法推导离散 Riccati 方程与最优线性反馈控制律

我们用逆向数学归纳法证明：**每个时刻 $t$ 的最优价值函数 $V_t^*(s_t)$ 必然是关于状态 $s_t$ 的二次型函数**：

$$

V_t^*(s_t) = s_t^T \Phi_t s_t + \Psi_t

$$

其中 $\Phi_t \in \mathbb{R}^{d \times d}$ 是对称半负定矩阵（$\Phi_t \preceq 0$），$\Psi_t \in \mathbb{R}$ 是标量常数。

- **归纳奠基（$t = T$）**：由 $V_T^*(s_T) = R^{(T)}(s_T) = -s_T^T U_T s_T$，直接取：

$$

\Phi_T = -U_T, \qquad \Psi_T = 0

$$

- **归纳递推（由 $t + 1$ 推导 $t$）**：假设 $V_{t+1}^*(s_{t+1}) = s_{t+1}^T \Phi_{t+1} s_{t+1} + \Psi_{t+1}$ 成立。代入有限时域 Bellman 方程 $(20.2)$：

$$

V_t^*(s_t) = \max_{a_t} \left\{ -s_t^T U_t s_t - a_t^T W_t a_t + \mathbb{E}_{s_{t+1} \sim \mathcal{N}(A_t s_t + B_t a_t, \Sigma_t)} \left[ s_{t+1}^T \Phi_{t+1} s_{t+1} + \Psi_{t+1} \right] \right\}

$$

利用二次型期望恒等式：若 $z \sim \mathcal{N}(\mu, \Sigma)$，则 $\mathbb{E}[z^T \Phi z] = \mu^T \Phi \mu + \text{Tr}(\Sigma \Phi)$（因为 $\mathbb{E}[w_t^T \Phi_{t+1} w_t] = \mathbb{E}[\text{Tr}(w_t w_t^T \Phi_{t+1})] = \text{Tr}(\Sigma_t \Phi_{t+1})$），将期望项展开为：

$$

V_t^*(s_t) = \max_{a_t} \underbrace{\left\{ -s_t^T U_t s_t - a_t^T W_t a_t + (A_t s_t + B_t a_t)^T \Phi_{t+1} (A_t s_t + B_t a_t) + \text{Tr}(\Sigma_t \Phi_{t+1}) + \Psi_{t+1} \right\}}_{g(a_t)}

$$

展开大括号内关于 $a_t$ 的二次函数 $g(a_t)$，并对动作向量 $a_t$ 求梯度令 $\nabla_{a_t} g(a_t) = 0$：

$$

\nabla_{a_t} g(a_t) = -2 W_t a_t + 2 B_t^T \Phi_{t+1} (A_t s_t + B_t a_t) = 2 \left( (B_t^T \Phi_{t+1} B_t - W_t) a_t + B_t^T \Phi_{t+1} A_t s_t \right) = 0

$$

（由于 $\Phi_{t+1} \preceq 0$ 且 $W_t \succ 0$，矩阵 $B_t^T \Phi_{t+1} B_t - W_t \prec 0$ 严格负定可逆！）直接解出全局唯一的最优动作 $a_t^*$：

$$

a_t^* = \pi_t^*(s_t) = \underbrace{\left[ (B_t^T \Phi_{t+1} B_t - W_t)^{-1} B_t^T \Phi_{t+1} A_t \right]^{-1? \text{ No, }- (B_t^T \Phi_{t+1} B_t - W_t)^{-1} B_t^T \Phi_{t+1} A_t}}_{\text{令 } L_t \triangleq -(B_t^T \Phi_{t+1} B_t - W_t)^{-1} B_t^T \Phi_{t+1} A_t = (W_t - B_t^T \Phi_{t+1} B_t)^{-1} B_t^T \Phi_{t+1} A_t} s_t = L_t s_t

$$

（注：讲义中为了书写简略，将负号吸收进矩阵定义或省去了前导负号写作 $L_t = [(B_t^T \Phi_{t+1} B_t - W_t)^{-1} B_t^T \Phi_{t+1} A_t]$，无论符号约定如何，将求出的极值点 $a_t^*$ 代回 $g(a_t)$ 后二次项精确抵消一半，所得 $\Phi_t$ 完全一致！）将 $a_t^*$ 代回 $V_t^*(s_t)$ 整理系数，立即验证 $V_t^*(s_t) = s_t^T \Phi_t s_t + \Psi_t$，其中 $\Phi_t$ 和 $\Psi_t$ 满足著名的**离散时间 Riccati 方程（Discrete Riccati Equations）**：

:::important[定理 20.2.1 (离散 Riccati 递推方程与确定性等价原理)]

1. **Riccati 逆向递推公式**：从 $\Phi_T = -U_T, \ \Psi_T = 0$ 出发，对 $t = T-1, \dots, 0$ 递推计算：

$$

\Phi_t = A_t^T \left( \Phi_{t+1} - \Phi_{t+1} B_t (B_t^T \Phi_{t+1} B_t - W_t)^{-1} B_t^T \Phi_{t+1} \right) A_t - U_t

$$

$$

\Psi_t = \text{Tr}(\Sigma_t \Phi_{t+1}) + \Psi_{t+1} \qquad (\text{注：由于 }\Phi_{t+1}\preceq 0\text{，讲义亦记作 }-\text{tr}(\Sigma_t |\Phi_{t+1}|)+\Psi_{t+1})

$$

2. **最优策略是纯线性状态反馈**：$\pi_t^*(s_t) = L_t s_t$。

3. **确定性等价原理（Certainty Equialence Principle，讲义 Fact 1–3）**：

   观察 $\Phi_t$ 和反馈增益矩阵 $L_t$ 的公式——**它们完全不包含高斯噪声协方差矩阵 $\Sigma_t$！** 噪声协方差 $\Sigma_t$ 仅仅出现在标量偏移项 $\Psi_t$ 中！这意味着：**即使系统受到高斯过程噪声 $w_t \sim \mathcal{N}(0, \Sigma_t)$ 的干扰，LQR 的最优控制策略 $a_t^* = L_t s_t$ 与完全无噪声确定性系统（$\Sigma_t = 0$）下的最优策略百分之百相同！**

:::

---

### 20.3 非线性动力学与微分动态规划 (Differential Dynamic Programming, DDP)

如果真实物理系统是非线性的：$s_{t+1} = F(s_t, a_t) + w_t$（例如单摆方程或机械臂动力学），且奖励函数 $R(s_t, a_t)$ 也不是标准二次型，该怎么用 LQR？

**微分动态规划（DDP / Iteratie LQR）**采用局部泰勒展开迭代逼近的思想：

1. 假设当前有一条标称轨迹（Nominal Trajectory）：状态序列 $s_0^*, s_1^*, \dots, s_T^*$ 与动作序列 $a_0^*, a_1^*, \dots, a_{T-1}^*$。

2. **一阶泰勒线性化动力学方程**：在标称点 $(\bar{s}_t, \bar{a}_t) = (s_t^*, a_t^*)$ 附近对非线性函数 $F$ 作一阶泰勒展开：

$$

s_{t+1} \approx F(\bar{s}_t, \bar{a}_t) + \nabla_s F(\bar{s}_t, \bar{a}_t) \cdot (s_t - \bar{s}_t) + \nabla_a F(\bar{s}_t, \bar{a}_t) \cdot (a_t - \bar{a}_t) = A_t s_t + B_t a_t + \kappa_t

$$

:::tip[吸收常数偏移项 $\kappa_t$ 的增广状态技巧 (State Augmentation Trick)]

线性化后多出了一个常数向量 $\kappa_t = F(\bar{s}_t, \bar{a}_t) - A_t \bar{s}_t - B_t \bar{a}_t$，而标准 LQR 要求齐次线性形式 $s_{t+1} = \tilde{A}_t s_t + \tilde{B}_t a_t$。怎么办？

只需与第 1 章线性回归吸收截距项一样，在状态向量末尾追加一个恒为 $1$ 的维度：定义增广状态 $\tilde{s}_t = \begin{bmatrix} 1 \\ s_t \end{bmatrix} \in \mathbb{R}^{d+1}$！则增广转移方程瞬间化为标准齐次矩阵乘法：

$$

\begin{bmatrix} 1 \\ s_{t+1} \end{bmatrix} = \begin{bmatrix} 1 & 0 \\ \kappa_t & A_t \end{bmatrix} \begin{bmatrix} 1 \\ s_t \end{bmatrix} + \begin{bmatrix} 0 \\ B_t \end{bmatrix} a_t

$$

:::

3. **二阶泰勒展开奖励函数**：同样在 $(\bar{s}_t, \bar{a}_t)$ 处对一般奖励函数 $R(s_t, a_t)$ 作二阶泰勒展开，并吸收进增广状态 $\tilde{s}_t$ 的二次型 $-\tilde{s}_t^T \tilde{U}_t \tilde{s}_t - a_t^T \tilde{W}_t a_t$ 中。

4. **交替迭代更新轨迹**：运行标准 LQR 算出改进策略 $\pi_t$，在真实非线性模拟器上滚动生成一条更好的新标称轨迹 $(s_t^*, a_t^*)$，再次线性化并重跑 LQR，直至轨迹收敛！

---

### 20.4 线性二次高斯控制 (LQG) 与卡尔曼滤波 (Kalman Filter)

在现实世界中，智能体往往无法直接观测到完整精确的状态 $s_t$，而只能通过带噪传感器（如摄像头、雷达、陀螺仪）获取观测向量 $y_t \in \mathbb{R}^m$——这就是**部分可观测马尔可夫决策过程（POMDP）**。

在 **LQG（Linear Quadratic Gaussian）** 框架下，系统状态转移与传感器观测均为线性高斯模型：

$$

\begin{aligned}

s_{t+1} &= A s_t + B a_t + w_t, \qquad w_t \sim \mathcal{N}(0, \Sigma_s) \\

y_t &= C s_t + _t, \qquad \qquad _t \sim \mathcal{N}(0, \Sigma_y)

\end{aligned}

$$

其中 $C \in \mathbb{R}^{m \times d}$ 为观测矩阵。由于我们只能看到历史观测序列 $y_1, \dots, y_t$，智能体需要维护关于当前真实状态 $s_t$ 的后验**信念分布（Belief State）**：

$$

s_t \mid (y_1, \dots, y_t) \sim \mathcal{N}\left(s_{t \mid t}, \ \Sigma_{t \mid t}\right)

$$

如果直接将整个历史向量 $(s_t, y_1, \dots, y_t)$ 拼成一个维度为 $d + m t$ 的巨型高斯分布套用附录 A 引理 A.1.2 求逆，每一步的计算复杂度将高达 **$O(t^3)$**，随着时间推移必然卡死！

**卡尔曼滤波器（Kalman Filter, 1960）**利用马尔可夫性质，将后验均值 $s_{t \mid t}$ 与协方差 $\Sigma_{t \mid t}$ 的更新变为每步仅需 **$O(1)$ 时间（与历史步数 $t$ 完全无关）**的优雅两步递推算法：

:::important[算法 20.4：卡尔曼滤波 (Kalman Filter) 的预测步与更新步]

假设在时刻 $t$ 已知后验分布 $s_t \mid y_{1:t} \sim \mathcal{N}(s_{t \mid t}, \Sigma_{t \mid t})$：

1. **预测步（Predict Step：从 $s_t \mid y_{1:t}$ 推演一步先验 $s_{t+1} \mid y_{1:t}$）**：

   利用线性变换规则 $s_{t+1} = A s_t + B a_t + w_t$，在看到新观测 $y_{t+1}$ 之前，下一状态的预测分布为 $s_{t+1} \mid y_{1:t} \sim \mathcal{N}(s_{t+1 \mid t}, \Sigma_{t+1 \mid t})$：

   $$

   s_{t+1 \mid t} = A s_{t \mid t} + B a_t, \qquad \Sigma_{t+1 \mid t} = A \Sigma_{t \mid t} A^T + \Sigma_s

   $$

2. **更新步（Update Step：融合新传感器观测 $y_{t+1}$ 得到后验 $s_{t+1} \mid y_{1:t+1}$）**：

   在给定 $y_{1:t}$ 的条件下，$s_{t+1}$ 与新观测 $y_{t+1} = C s_{t+1} + _{t+1}$ 的联合分布为：

   $$

   \begin{bmatrix} s_{t+1} \\ y_{t+1} \end{bmatrix} \ \Bigg|\ y_{1:t} \sim \mathcal{N}\left( \begin{bmatrix} s_{t+1 \mid t} \\ C s_{t+1 \mid t} \end{bmatrix}, \ \begin{bmatrix} \Sigma_{t+1 \mid t} & \Sigma_{t+1 \mid t} C^T \\ C \Sigma_{t+1 \mid t} & C \Sigma_{t+1 \mid t} C^T + \Sigma_y \end{bmatrix} \right)

   $$

   直接调用**引理 A.1.2（条件高斯 Schur 补公式）**，定义**卡尔曼增益矩阵（Kalman Gain）** $K_t$：

   $$

   K_t \triangleq \Sigma_{t+1 \mid t} C^T \left( C \Sigma_{t+1 \mid t} C^T + \Sigma_y \right)^{-1}

   $$

   则融合新观测 $y_{t+1}$ 后的最新后验均值与后验协方差为：

   $$

   \begin{aligned}

   s_{t+1 \mid t+1} &= s_{t+1 \mid t} + K_t \left( y_{t+1} - C s_{t+1 \mid t} \right) \\

   \Sigma_{t+1 \mid t+1} &= \Sigma_{t+1 \mid t} - K_t C \Sigma_{t+1 \mid t} = (I - K_t C) \Sigma_{t+1 \mid t}

   \end{aligned}

   $$

**LQG 最优控制分离原理（Separation Principle）**：

在部分可观测的 LQG 问题中，全局最优控制架构完美解耦为两个独立模块：

1. **状态估计模块**：忽略奖励函数，单纯运行**卡尔曼滤波器**实时计算出最优状态均值估计 $s_{t \mid t}$；

2. **LQR 控制模块**：忽略观测噪声，直接假设状态完全可观测，用**离散 Riccati 方程**算出 LQR 反馈矩阵 $L_t$，然后直接把卡尔曼滤波估计出的均值 $s_{t \mid t}$ 当作真实状态代入：**$a_t^* = L_t s_{t \mid t}$**！

:::

---

## 三、第 21 章：策略梯度及其变体 (Policy Gradient: REINFORCE & PPO)

当动作空间复杂或状态空间是高维图像、文本时，我们不再通过价值函数间接导出策略，而是直接用神经网络参数化一个随机策略 $\pi_\theta(a \mid s)$（表示在状态 $s$ 下采取动作 $a$ 的概率分布），并通过梯度上升直接最大化期望总回报！

### 21.1 REINFORCE 策略梯度、因果性与基线方差缩减

设一条长度为 $T$ 的交互轨迹为 $\tau = (s_0, a_0, s_1, a_1, \dots, s_{T-1}, a_{T-1})$，其折扣总回报为 $f(\tau) = \sum_{t=0}^{T-1} \gamma^t R(s_t, a_t)$。在策略 $\pi_\theta$ 下产生轨迹 $\tau$ 的联合概率为：

$$

P_\theta(\tau) = \mu(s_0) \prod_{t=0}^{T-1} \pi_\theta(a_t \mid s_t) P_{s_t a_t}(s_{t+1}) \tag{21.1}

$$

我们的优化目标是最大化期望总回报 $\eta(\theta) = \mathbb{E}_{\tau \sim P_\theta}[f(\tau)] = \sum_\tau P_\theta(\tau) f(\tau)$。

#### 1. 对数导数技巧 (Log-Deriatie Trick) 与未知环境模型的完美消除

由于期望下标 $P_\theta(\tau)$ 依赖于 $\theta$ 且包含了**完全未知的环境状态转移概率 $P_{s_t a_t}(s_{t+1})$**，直接求导似乎无从下手。但利用微积分恒等式 $\nabla_\theta P_\theta(\tau) = P_\theta(\tau) \nabla_\theta \log P_\theta(\tau)$，我们有：

$$

\nabla_\theta \mathbb{E}_{\tau \sim P_\theta}[f(\tau)] = \sum_\tau \left(\nabla_\theta P_\theta(\tau)\right) f(\tau) = \sum_\tau P_\theta(\tau) \left(\nabla_\theta \log P_\theta(\tau)\right) f(\tau) = \mathbb{E}_{\tau \sim P_\theta}\left[ \left(\nabla_\theta \log P_\theta(\tau)\right) f(\tau) \right] \tag{21.3}

$$

现在对式 $(21.1)$ 两边取自然对数：

$$

\log P_\theta(\tau) = \log \mu(s_0) + \sum_{t=0}^{T-1} \log \pi_\theta(a_t \mid s_t) + \sum_{t=0}^{T-1} \log P_{s_t a_t}(s_{t+1})

$$

对 $\theta$ 求梯度！由于初始状态分布 $\mu(s_0)$ 和环境物理转移概率 $P_{s_t a_t}(s_{t+1})$ **均与策略参数 $\theta$ 无关，求导后瞬间全部变为 $0$**！于是得到完全不需要环境模型的 **REINFORCE 策略梯度公式（Williams, 1992）**：

$$

\nabla_\theta \log P_\theta(\tau) = \sum_{t=0}^{T-1} \nabla_\theta \log \pi_\theta(a_t \mid s_t) \implies \nabla_\theta \eta(\theta) = \mathbb{E}_{\tau \sim P_\theta}\left[ \left(\sum_{t=0}^{T-1} \nabla_\theta \log \pi_\theta(a_t \mid s_t)\right) \left(\sum_{t=0}^{T-1} \gamma^t R(s_t, a_t)\right) \right] \tag{21.8–21.9}

$$

#### 2. 因果性化简与状态基线 (Baseline $B(s_t)$) 的零期望无偏性严格证明

朴素 REINFORCE 公式 $(21.9)$ 的蒙特卡洛采样方差极大。我们通过两个极其重要的数学性质在不引入任何偏差（Unbiased）的前提下大幅削减方差：

:::important[定理 21.1.1 (得分函数零期望性质、因果性与基线无偏性证明)]

**基本引理**：对任意固定状态 $s_t$，策略对数梯度关于动作 $a_t \sim \pi_\theta(\cdot \mid s_t)$ 的期望恒等于 $0$：

$$

\mathbb{E}_{a_t \sim \pi_\theta(\cdot \mid s_t)} \left[ \nabla_\theta \log \pi_\theta(a_t \mid s_t) \right] = \sum_{a_t} \pi_\theta(a_t \mid s_t) \frac{\nabla_\theta \pi_\theta(a_t \mid s_t)}{\pi_\theta(a_t \mid s_t)} = \nabla_\theta \left( \sum_{a_t} \pi_\theta(a_t \mid s_t) \right) = \nabla_\theta (1) = 0

$$

由此结合全期望公式（Law of Total Expectation，先固定历史 $(s_{\le t}, a_{<t})$ 对 $a_t \sim \pi_\theta(\cdot \mid s_t)$ 求条件期望），立即导出两条推论：

1. **因果性（Causality：未来的动作不会影响过去的奖励）**：对于任意 $j < t$，过去的奖励 $R(s_j, a_j)$ 在时刻 $t$ 已经是确定常数，因此：

$$

\mathbb{E}_{\tau \sim P_\theta} \left[ \nabla_\theta \log \pi_\theta(a_t \mid s_t) \cdot R(s_j, a_j) \right] = \mathbb{E}_{s_{\le t}, a_{<t}} \left[ R(s_j, a_j) \underbrace{\mathbb{E}_{a_t \sim \pi_\theta(\cdot \mid s_t)} [\nabla_\theta \log \pi_\theta(a_t \mid s_t)]}_{=0} \right] = 0

$$

所以第 $t$ 步的动作梯度只需乘以 $t$ 时刻及之后的未来累计奖励（Reward-to-go）$\sum_{j \ge t}^{T-1} \gamma^j R(s_j, a_j)$！

2. **任意状态基线（Baseline $B(s_t)$）的无偏性**：设 $B : S \to \mathbb{R}$ 是**仅依赖于状态 $s_t$（不依赖于动作 $a_t$）**的任意函数（通常选为状态价值函数的估计 $B(s_t) = \hat{V}(s_t) \approx V^{\pi_\theta}(s_t)$）。同理有：

$$

\mathbb{E}_{\tau \sim P_\theta} \left[ \nabla_\theta \log \pi_\theta(a_t \mid s_t) \cdot B(s_t) \right] = \mathbb{E}_{s_t} \left[ B(s_t) \underbrace{\mathbb{E}_{a_t \sim \pi_\theta(\cdot \mid s_t)} [\nabla_\theta \log \pi_\theta(a_t \mid s_t)]}_{=0} \right] = 0

$$

因此，从未来累计回报中减去基线 $B(s_t)$ **完全不改变策略梯度的数学期望（绝对无偏）**，但将奖励中心化为相对优势（Adantage），使采样方差大幅下降！最终带基线的策略梯度公式（Algorithm 7，式 21.11）为：

$$

\nabla_\theta \eta(\theta) = \sum_{t=0}^{T-1} \mathbb{E}_{\tau \sim P_\theta} \left[ \nabla_\theta \log \pi_\theta(a_t \mid s_t) \cdot \gamma^t \left( \sum_{j \ge t}^{T-1} \gamma^{j - t} R(s_j, a_j) - B(s_t) \right) \right] \tag{21.11}

$$

:::

---

### 21.2 近端策略优化 (Proximal Policy Optimization, PPO)

在带基线的 REINFORCE（式 21.11）中，每次采样出一批轨迹 $\tau \sim P_\theta$，只能执行**一步**梯度更新，随后这批耗费高昂代价采样出的轨迹就作废了（On-policy 单步限制）。如果我们想在同一批由旧策略 $\pi_{\theta_{\text{old}}}$ 采样出的轨迹上连续执行多步梯度更新（Multiple Epochs of SGD），应该如何修正目标函数并防止新策略 $\pi_\theta$ 一步跨得太远导致性能崩溃？

1. **重要性采样重写局部目标（Importance Sampling, Equations 21.13–21.17）**：

   固定旧参数 $\theta_{\text{old}}$，记第 $t$ 步的经验优势估计为 $\widehat{A}_t = \left(\sum_{j=t}^{T-1} \gamma^{j-t} R(s_j, a_j)\right) - V_{\text{old}}(s_t)$，并定义新旧策略在 $(s_t, a_t)$ 处的**概率比率（Probability Ratio）**：

   $$

   r_t(\theta) \triangleq \frac{\pi_\theta(a_t \mid s_t)}{\pi_{\theta_{\text{old}}}(a_t \mid s_t)} \tag{21.15}

   $$

   注意在 $\theta = \theta_{\text{old}}$ 处有 $r_t(\theta_{\text{old}}) = 1$，且其梯度恰满足 $\nabla_\theta r_t(\theta)\big|_{\theta = \theta_{\text{old}}} = \frac{\nabla_\theta \pi_\theta(a_t \mid s_t)}{\pi_{\theta_{\text{old}}}(a_t \mid s_t)} = \nabla_\theta \log \pi_\theta(a_t \mid s_t)\big|_{\theta = \theta_{\text{old}}}$！因此，在 $\theta_{\text{old}}$ 邻域内，最大化未裁剪代理目标 $\mathbb{E}_{\tau \sim P_{\theta_{\text{old}}}}[\sum_t \gamma^t r_t(\theta) \widehat{A}_t]$ 的一阶梯度与策略梯度完全一致。

2. **PPO 裁剪代理目标函数（Clipped Surrogate Objectie, Equations 21.18–21.19）**：

   如果直接无约束地最大化 $r_t(\theta) \widehat{A}_t$，当 $\widehat{A}_t > 0$ 时优化器会把 $\pi_\theta(a_t \mid s_t)$ 推向极端，导致比率 $r_t(\theta) \gg 1$ 远离信任域。为此，**PPO（Schulman et al., 2017）**引入截断超参数 $\epsilon_{\text{clip}} \in (0, 1)$（通常取 $\epsilon_{\text{clip}} = 0.2$），定义单步**裁剪代理目标 $C_t(\theta)$**：

   $$

   C_t(\theta) = \min\left\{ r_t(\theta) \widehat{A}_t, \ \text{clip}_{[1 - \epsilon_{\text{clip}}, \, 1 + \epsilon_{\text{clip}}]}\left(r_t(\theta)\right) \widehat{A}_t \right\} \tag{21.18}

   $$

   全轨迹 PPO 最大化目标为 $\max_\theta \mathbb{E}_{\tau \sim P_{\theta_{\text{old}}}}\left[\sum_{t=0}^{T-1} \gamma^t C_t(\theta)\right]$（式 21.19）。

:::important[深度解析：为什么 PPO 要在未裁剪项与裁剪项之间取最小值 $\min$（悲观下界）？]

分两种情况讨论 $\widehat{A}_t$ 的正负号（讲义第 264–265 页）：

- **情形 1：好动作（优势 $\widehat{A}_t > 0$）**：

  此时我们希望增大 $\pi_\theta(a_t \mid s_t)$，即增大 $r_t(\theta)$。因为 $\widehat{A}_t > 0$，取 $\min$ 后式 $(21.18)$ 简化为：

  $$

  C_t(\theta) = \min\left\{ r_t(\theta), \ 1 + \epsilon_{\text{clip}} \right\} \widehat{A}_t \qquad (\text{当 } \widehat{A}_t > 0)

  $$

  一旦新策略概率比旧策略高出超过 $1 + \epsilon_{\text{clip}}$ 倍（即 $r_t(\theta) > 1 + \epsilon_{\text{clip}}$），目标函数立刻被封顶（Flat Ceiling）在 $(1 + \epsilon_{\text{clip}})\widehat{A}_t$，梯度变为 $0$，阻止策略继续贪婪推高 $r_t(\theta)$！

- **情形 2：坏动作（优势 $\widehat{A}_t < 0$）**：

  此时 $\widehat{A}_t$ 为负数，我们希望减小 $\pi_\theta(a_t \mid s_t)$，即让 $r_t(\theta)$ 变小（从而让乘积 $r_t(\theta) \widehat{A}_t$ 这个负数变大，即更接近 $0$）。因为乘了一个负数 $\widehat{A}_t < 0$，取 $\min$ 会反转不等号方向：

  $$

  C_t(\theta) = \max\left\{ r_t(\theta), \ 1 - \epsilon_{\text{clip}} \right\} \widehat{A}_t \qquad (\text{当 } \widehat{A}_t < 0)

  $$

  一旦新策略把该动作的概率压低到不足旧策略的 $1 - \epsilon_{\text{clip}}$ 倍（即 $r_t(\theta) < 1 - \epsilon_{\text{clip}}$），目标函数同样被封顶在 $(1 - \epsilon_{\text{clip}})\widehat{A}_t$，梯度变为 $0$，防止单次更新过度抹杀某个动作的概率！

:::

---

## 四、本章代码示例：离散时间 LQR (Riccati 方程) 与卡尔曼滤波器完整实现

```python title="lqr_and_kalman_filter.py"
import numpy as np

def solve_finite_horizon_lqr(A, B, U, W, T=20):
    """
    CS229 20.2 节：求解有限时域 LQR 的离散时间 Riccati 递推方程
    返回每一步的最优反馈增益矩阵序列 L_0, ..., L_{T-1} 及价值矩阵 Phi_0, ..., Phi_T
    """
    d, k = B.shape
    Phi = [None] * (T + 1)
    L = [None] * T
    Phi[T] = -U.copy()

    for t in range(T - 1, -1, -1):
        Phi_next = Phi[t + 1]
        # 最优线性反馈增益: a_t^* = L_t s_t, 其中 (B^T Phi_{t+1} B - W) a_t + B^T Phi_{t+1} A s_t = 0
        inv_term = np.linalg.inv(B.T @ Phi_next @ B - W)
        L[t] = -inv_term @ (B.T @ Phi_next @ A)
        # 离散 Riccati 方程更新 Phi_t
        Phi[t] = A.T @ (Phi_next - Phi_next @ B @ inv_term @ B.T @ Phi_next) @ A - U
    return L, Phi

def kalman_filter_step(s_curr, Sigma_curr, a_t, y_next, A, B, C, Sigma_s, Sigma_y):
    """
    CS229 20.4 节：卡尔曼滤波单步递推 (Predict + Update)
    """
    # 1. Predict Step (先验预测)
    s_pred = A @ s_curr + B @ a_t
    Sigma_pred = A @ Sigma_curr @ A.T + Sigma_s

    # 2. Update Step (卡尔曼增益与后验融合)
    S_innov = C @ Sigma_pred @ C.T + Sigma_y
    K_t = Sigma_pred @ C.T @ np.linalg.inv(S_innov)
    s_post = s_pred + K_t @ (y_next - C @ s_pred)
    Sigma_post = (np.eye(len(s_curr)) - K_t @ C) @ Sigma_pred
    return s_post, Sigma_post

if __name__ == "__main__":
    # 双积分器一维小车位置-速度控制系统: s = [pos, vel]^T
    dt = 0.1
    A = np.array([[1.0, dt], [0.0, 1.0]])
    B = np.array([[0.5 * dt**2], [dt]])
    C = np.array([[1.0, 0.0]])  # 仅观测位置 pos
    U = np.diag([10.0, 1.0])
    W = np.array([[0.1]])

    L_seq, Phi_seq = solve_finite_horizon_lqr(A, B, U, W, T=30)
    print("Step 0 Optimal LQR Feedback Gain L_0:", np.round(L_seq[0], 4))
    print("Step 0 Riccati Matrix Phi_0:\n", np.round(Phi_seq[0], 4))
```

---

## 五、第 19–21 章课后推导与习题解答 (Exercises & Detailed Solutions)

### 习题 19.1：策略迭代（Policy Iteration）单调改进定理的严格证明

在策略迭代（Algorithm 5）中，设当前策略为 $\pi$，其价值函数为 $V^\pi$。我们在每个状态 $s \in S$ 按策略改进规则构造新策略 $\pi'(s) = \arg\max_{a \in A} \sum_{s'} P_{sa}(s') V^\pi(s')$。严格证明：对所有状态 $s \in S$，新策略的价值函数满足 **$V^{\pi'}(s) \ge V^\pi(s)$**（即策略迭代绝不会使策略退化，且在有限状态动作空间中必然有限步收敛到最优策略 $\pi^*$）！

:::spoiler[习题 19.1 解答]

**解**：

由新策略 $\pi'(s) = \arg\max_{a \in A} \sum_{s'} P_{sa}(s') V^\pi(s')$ 的贪心构造定义，在任意状态 $s \in S$ 下采取动作 $\pi'(s)$ 的一步前瞻期望价值必然不小于采取旧动作 $\pi(s)$ 的期望价值：

$$
R(s) + \gamma \sum_{s' \in S} P_{s \pi'(s)}(s') V^\pi(s') \ge R(s) + \gamma \sum_{s' \in S} P_{s \pi(s)}(s') V^\pi(s') = V^\pi(s)
$$

记策略 $\pi'$ 对应的固定策略 Bellman 算子为 $T^{\pi'}(V)(s) = R(s) + \gamma \sum_{s'} P_{s\pi'(s)}(s') V(s')$。由于转移概率 $P_{s\pi'(s)}(s') \ge 0$ 非负，算子 $T^{\pi'}$ 具有**保序单调性（Monotonicity）**：若向量 $U \ge W$（逐分量），则 $T^{\pi'}(U) \ge T^{\pi'}(W)$。

上面的不等式表明 $T^{\pi'}(V^\pi) \ge V^\pi$。对两边反复作用保序算子 $T^{\pi'}$，得到单调递增序列：

$$
V^\pi \le T^{\pi'}(V^\pi) \le (T^{\pi'})^2(V^\pi) \le \dots \le \lim_{k \to \infty} (T^{\pi'})^k (V^\pi) = V^{\pi'}
$$

因此对所有 $s \in S$ 恒有 $V^{\pi'}(s) \ge V^\pi(s)$！若在某一步 $\pi' = \pi$ 不再改变，则 $V^\pi$ 已经满足最优 Bellman 方程 $V^\pi(s) = R(s) + \max_a \gamma \sum_{s'} P_{sa}(s') V^\pi(s')$，从而 $V^\pi = V^*$。由于有限 MDP 最多只有 $|A|^{|S|}$ 个确定性策略，策略迭代必然在有限步内终止于全局最优策略 $\pi^*$！ $\blacksquare$

:::

### 习题 20.1：标量一维 LQR 系统的稳态 Riccati 方程手工求解与确定性等价验证

考虑一维连续状态-动作系统：$s_{t+1} = s_t + a_t + w_t$，其中 $A_t = 1, \ B_t = 1, \ w_t \sim \mathcal{N}(0, \sigma_w^2)$。单步奖励为 $R(s_t, a_t) = -s_t^2 - a_t^2$（即 $U_t = 1, \ W_t = 1$）。

(a) 计算有限时域 $T=2$ 时，$\Phi_2, \Phi_1, \Phi_0$、反馈系数 $L_1, L_0$ 以及噪声偏移项 $\Psi_2, \Psi_1, \Psi_0$；

(b) 当时域 $T \to \infty$ 时，求稳态 Riccati 代数方程 $\Phi = \Phi - \frac{\Phi^2}{\Phi - 1} - 1$ 的负根 $\Phi_\infty < 0$ 以及稳态最优控制律 $a_t^* = L_\infty s_t$。

:::spoiler[习题 20.1 解答]

**解**：

**(a) 逆向递推计算 ($T = 2$)**：

- **在终端 $t = 2$**：$\Phi_2 = -U_2 = -1$，$\Psi_2 = 0$。

- **在 $t = 1$**：代入一维 Riccati 公式（$A=1, B=1, U=1, W=1$）：

$$
\Phi_1 = 1 \cdot \left( \Phi_2 - \frac{\Phi_2^2}{\Phi_2 - 1} \right) \cdot 1 - 1 = -1 - \frac{(-1)^2}{-1 - 1} - 1 = -1 + \frac{1}{2} - 1 = -\frac{3}{2} = -1.5
$$

最优反馈增益 $L_1 = -\frac{\Phi_2}{\Phi_2 - 1} = -\frac{-1}{-2} = -\frac{1}{2}$，故 $a_1^* = -0.5 s_1$。噪声偏移项 $\Psi_1 = \sigma_w^2 \Phi_2 + \Psi_2 = -\sigma_w^2$。

- **在 $t = 0$**：

$$
\Phi_0 = \Phi_1 - \frac{\Phi_1^2}{\Phi_1 - 1} - 1 = -\frac{3}{2} - \frac{9/4}{-5/2} - 1 = -\frac{5}{2} + \frac{9}{10} = -\frac{8}{5} = -1.6
$$

最优反馈增益 $L_0 = -\frac{\Phi_1}{\Phi_1 - 1} = -\frac{-3/2}{-5/2} = -\frac{3}{5} = -0.6$，故 $a_0^* = -0.6 s_0$。噪声偏移项 $\Psi_0 = \sigma_w^2 \Phi_1 + \Psi_1 = -1.5 \sigma_w^2 - \sigma_w^2 = -2.5 \sigma_w^2$。

可以看到，无论噪声方差 $\sigma_w^2$ 是 $0$ 还是 $1000$，反馈增益 $L_1 = -0.5$ 和 $L_0 = -0.6$ 分毫不变！

**(b) 无穷时域稳态解 ($T \to \infty$)**：

令 $\Phi_{t} = \Phi_{t+1} = \Phi < 0$，代入稳态代数 Riccati 方程：

$$
\Phi = \Phi - \frac{\Phi^2}{\Phi - 1} - 1 \implies \frac{\Phi^2}{\Phi - 1} = -1 \implies \Phi^2 + \Phi - 1 = 0
$$

取负根得黄金分割共轭数：

$$
\Phi_\infty = -\frac{1 + \sqrt{5}}{2} \approx -1.6180
$$

对应的稳态最优控制增益为：

$$
L_\infty = -\frac{\Phi_\infty}{\Phi_\infty - 1} = -\frac{1}{\Phi_\infty} = -\frac{\sqrt{5} - 1}{2} \approx -0.6180 \implies a_t^* \approx -0.6180 s_t \qquad \blacksquare
$$

:::

### 习题 21.1：高斯策略（Gaussian Policy）在连续动作空间下的对数策略梯度推导

在连续动作控制任务（如机器人关节力矩控制 $a \in \mathbb{R}$）中，设策略网络输出动作均值 $\mu_\theta(s) = \theta^T \phi(s)$，动作方差固定为常数 $\sigma^2$，即策略分布为 $\pi_\theta(a \mid s) = \mathcal{N}(a; \mu_\theta(s), \sigma^2)$。求对数策略梯度（Score Function）$\nabla_\theta \log \pi_\theta(a \mid s)$ 的解析表达式，并解释其在 REINFORCE 更新中的物理直观！

:::spoiler[习题 21.1 解答]

**解**：

写出高斯策略的概率密度函数并取自然对数：

$$
\log \pi_\theta(a \mid s) = \log \left( \frac{1}{\sqrt{2\pi}\sigma} \exp\left( -\frac{(a - \theta^T \phi(s))^2}{2\sigma^2} \right) \right) = -\frac{1}{2}\log(2\pi\sigma^2) - \frac{\left(a - \theta^T \phi(s)\right)^2}{2\sigma^2}
$$

关于参数向量 $\theta$ 求梯度：

$$
\nabla_\theta \log \pi_\theta(a \mid s) = \frac{a - \theta^T \phi(s)}{\sigma^2} \phi(s) = \frac{a - \mu_\theta(s)}{\sigma^2} \phi(s)
$$

**物理直观**：

在带基线的策略梯度更新 $\Delta \theta \propto \nabla_\theta \log \pi_\theta(a_t \mid s_t) \cdot \widehat{A}_t = \frac{a_t - \mu_\theta(s_t)}{\sigma^2} \widehat{A}_t \phi(s_t)$ 中：

- 如果采样出的动作 $a_t$ 取得了**正优势（$\widehat{A}_t > 0$，表现优于预期）**，更新量会将均值预测 $\mu_\theta(s_t)$ 向本次采样的动作 $a_t$ 的方向拉近；

- 如果采样出的动作 $a_t$ 取得了**负优势（$\widehat{A}_t < 0$，表现劣于预期）**，更新量会将均值预测 $\mu_\theta(s_t)$ 向远离 $a_t$ 的反方向推开！ $\blacksquare$

:::

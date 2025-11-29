# Monad Live 部署指南

完整的部署和配置指南，从合约部署到前端运行。

## 目录

1. [准备工作](#准备工作)
2. [部署智能合约](#部署智能合约)
3. [配置前端](#配置前端)
4. [本地开发](#本地开发)
5. [生产部署](#生产部署)
6. [测试应用](#测试应用)

---

## 准备工作

### 1. 安装依赖

#### 合约项目
\`\`\`bash
cd web3-monad-live-contract
npm install
\`\`\`

#### 前端项目
\`\`\`bash
cd web3-monad-live-next
npm install
\`\`\`

### 2. 准备钱包

1. 安装 [MetaMask](https://metamask.io/)
2. 添加 Monad Testnet 网络到 MetaMask:
   - **网络名称**: Monad Testnet
   - **RPC URL**: https://testnet-rpc.monad.xyz
   - **Chain ID**: 10143
   - **货币符号**: MON
   - **区块浏览器**: https://testnet.monadexplorer.com

3. 获取测试代币:
   - 访问 [Monad 测试网水龙头](https://testnet.monad.xyz)
   - 输入你的钱包地址
   - 领取免费的 MON 测试代币

### 3. 获取 Thirdweb Client ID

1. 访问 [Thirdweb Dashboard](https://thirdweb.com/dashboard)
2. 创建账户或登录
3. 创建新项目
4. 在 "API Keys" 部分复制 Client ID

---

## 部署智能合约

### 1. 配置环境变量

在 \`web3-monad-live-contract\` 目录下创建 \`.env\` 文件:

\`\`\`bash
cd web3-monad-live-contract
cp .env.example .env
\`\`\`

编辑 \`.env\` 文件:

\`\`\`env
# Monad Testnet RPC
MONAD_RPC_URL=https://testnet-rpc.monad.xyz

# 你的钱包私钥 (用于部署合约)
# 警告：永远不要提交真实私钥到 Git！
PRIVATE_KEY=your_private_key_here

# 平台收益接收地址
PLATFORM_ADDRESS=your_platform_wallet_address
\`\`\`

> ⚠️ **重要**: 永远不要将包含真实私钥的 \`.env\` 文件提交到 Git！

### 2. 编译合约

\`\`\`bash
npx hardhat compile
\`\`\`

预期输出:
\`\`\`
✓ Compiled 5 Solidity files successfully
\`\`\`

### 3. 部署到 Monad Testnet

\`\`\`bash
npx hardhat run scripts/deploy.js --network monad
\`\`\`

预期输出:
\`\`\`
🚀 Starting deployment to Monad Testnet...

📍 Deploying contracts with account: 0x...
💰 Account balance: 100.0 MON

📦 Deploying LiveRoom contract...
✅ LiveRoom deployed to: 0x...

📦 Deploying TipStream contract...
✅ TipStream deployed to: 0x...

🎉 Deployment Complete!

📋 Contract Addresses:
   LiveRoom:   0xYourLiveRoomAddress
   TipStream:  0xYourTipStreamAddress
\`\`\`

### 4. 保存合约地址

部署成功后，合约地址会保存在 \`deployment-info.json\` 文件中。记录这些地址，你需要在前端配置中使用它们。

---

## 配置前端

### 1. 创建环境变量文件

在 \`web3-monad-live-next\` 目录下创建 \`.env.local\` 文件:

\`\`\`bash
cd web3-monad-live-next
cp .env.example .env.local
\`\`\`

### 2. 更新环境变量

编辑 \`.env.local\` 文件，填入实际值:

\`\`\`env
# Thirdweb API Keys
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id

# Contract Addresses (使用部署脚本输出的地址)
NEXT_PUBLIC_LIVE_ROOM_ADDRESS=0xYourLiveRoomAddress
NEXT_PUBLIC_TIP_STREAM_ADDRESS=0xYourTipStreamAddress

# Network Configuration
NEXT_PUBLIC_MONAD_RPC=https://testnet-rpc.monad.xyz
NEXT_PUBLIC_MONAD_CHAIN_ID=10143

# Ethereum Sepolia (for comparison)
NEXT_PUBLIC_ETHEREUM_RPC=https://eth-sepolia.g.alchemy.com/v2/demo
NEXT_PUBLIC_ETHEREUM_CHAIN_ID=11155111
\`\`\`

---

## 本地开发

### 1. 启动开发服务器

\`\`\`bash
cd web3-monad-live-next
npm run dev
\`\`\`

### 2. 打开浏览器

访问 http://localhost:3000

你应该看到 Monad Live 应用界面，包括:
- ✅ 钱包连接按钮
- ✅ Monad/Ethereum 链切换器
- ✅ 直播页面 (带统计数据)
- ✅ 仪表板页面 (带图表)

---

## 测试应用

### 1. 连接钱包

1. 点击右上角 "Connect Wallet" 按钮
2. 选择 MetaMask
3. 批准连接请求
4. 确认已连接到 Monad Testnet

### 2. 切换网络

1. 点击 "Monad" 或 "Ethereum" 按钮切换网络
2. MetaMask 会提示切换网络
3. 批准切换
4. 观察 TPS 数据变化:
   - Monad: ~10,200 TPS ⚡
   - Ethereum: ~15 TPS 🐢

### 3. 测试打赏功能

#### 快速打赏:
1. 确保钱包已连接
2. 点击 "1 MON", "5 MON" 或 "10 MON" 按钮
3. 确认 MetaMask 交易
4. 等待交易确认 (~0.4秒 on Monad!)
5. 查看成功消息

#### 自定义金额:
1. 在 "自定义金额" 输入框中输入金额
2. 点击 "发送打赏" 按钮
3. 确认 MetaMask 交易
4. 等待确认

---

## 常见问题

### Q: 钱包无法连接
**A**:
- 确保 MetaMask 已安装并解锁
- 检查你在正确的网络 (Monad Testnet)
- 尝试刷新页面

### Q: 交易失败
**A**:
- 确保钱包有足够的 MON 支付 gas
- 检查合约地址是否正确配置
- 查看 MetaMask 中的错误消息

### Q: 页面显示 404
**A**:
- 确保开发服务器正在运行 (\`npm run dev\`)
- 检查端口 3000 是否被占用
- 尝试清除 Next.js 缓存: \`rm -rf .next && npm run dev\`

---

**祝你部署顺利！🚀**

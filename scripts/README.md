# 创建和管理直播间脚本

## create-room.js - 统一创建/注册直播间

这个脚本可以：
1. ✅ 在 LiveRoom 创建新房间（即时打赏）
2. ✅ 在 TipStream 注册房间（流式打赏）
3. ✅ 同时注册两个合约
4. ✅ 支持已存在房间的补充注册

---

## 使用场景

### 场景1：创建新房间（同时注册 LiveRoom + TipStream）

```bash
cd web3-monad-live-next

PRIVATE_KEY=0x你的主播私钥 \
CHAIN=monad \
npm run demo:create-room
```

**效果**：
- 在 LiveRoom 创建新房间 → 获得 roomId
- 自动在 TipStream 注册该房间 → 流式打赏可用
- 发送一笔测试打赏

---

### 场景2：为已存在的房间注册 TipStream（如 Room #1）

```bash
cd web3-monad-live-next

PRIVATE_KEY=0x你的主播私钥 \
CHAIN=monad \
ROOM_ID=1 \
TIP_AMOUNT=0 \
npm run demo:create-room
```

**效果**：
- 跳过创建房间（Room #1 已存在）
- 在 TipStream 注册 Room #1
- 不发送测试打赏（TIP_AMOUNT=0）

**重要**：`PRIVATE_KEY` 必须是 Room #1 的主播地址私钥：
- Room #1 主播地址：`0x500947f01E346093000909882c620b7407129EfB`

---

### 场景3：只创建 LiveRoom，不注册 TipStream

```bash
PRIVATE_KEY=0x你的私钥 \
CHAIN=monad \
REGISTER_TIPSTREAM=false \
npm run demo:create-room
```

---

## 环境变量说明

| 变量 | 必需 | 默认值 | 说明 |
|------|------|--------|------|
| `PRIVATE_KEY` | ✅ | - | 主播地址的私钥 |
| `CHAIN` | ❌ | `monad` | 网络：`monad` 或 `sepolia` |
| `ROOM_ID` | ❌ | - | 如果设置，使用已存在的房间（不创建新房间） |
| `SCHEME_ID` | ❌ | `0` | 创建房间时的分账方案 ID |
| `TIP_AMOUNT` | ❌ | `0.01` | 测试打赏金额，设为 `0` 则跳过 |
| `REGISTER_TIPSTREAM` | ❌ | `true` | 是否注册到 TipStream |
| `RPC_URL` | ❌ | 自动 | 覆盖 RPC 地址 |
| `LIVE_ROOM_ADDRESS` | ❌ | 自动 | 覆盖 LiveRoom 合约地址 |
| `TIP_STREAM_ADDRESS` | ❌ | 自动 | 覆盖 TipStream 合约地址 |

脚本会自动从 `.env` 文件读取这些变量：
- `NEXT_PUBLIC_MONAD_RPC` / `NEXT_PUBLIC_ETHEREUM_RPC`
- `NEXT_PUBLIC_MONAD_LIVE_ROOM_ADDRESS` / `NEXT_PUBLIC_ETHEREUM_LIVE_ROOM_ADDRESS`
- `NEXT_PUBLIC_MONAD_TIP_STREAM_ADDRESS` / `NEXT_PUBLIC_ETHEREUM_TIP_STREAM_ADDRESS`

---

## 为 Room #1 注册 TipStream 的完整步骤

### 步骤1：确认 Room #1 状态

```bash
cd ../web3-monad-live-contract
npx hardhat run scripts/check-room-status.js --network monad
```

应该看到：
```
LiveRoom: ✅ Room #1 exists
TipStream: ❌ Room #1 is NOT registered
```

### 步骤2：注册 Room #1 到 TipStream

```bash
cd ../web3-monad-live-next

PRIVATE_KEY=0x平台地址的私钥 \
CHAIN=monad \
ROOM_ID=1 \
TIP_AMOUNT=0 \
npm run demo:create-room
```

**注意**：
- `PRIVATE_KEY` 必须是主播地址 `0x500947f01E346093000909882c620b7407129EfB` 的私钥
- `ROOM_ID=1` 表示使用已存在的 Room #1
- `TIP_AMOUNT=0` 表示不发送测试打赏

### 步骤3：验证注册成功

再次运行检查脚本：
```bash
cd ../web3-monad-live-contract
npx hardhat run scripts/check-room-status.js --network monad
```

应该看到：
```
LiveRoom: ✅ Room exists
TipStream: ✅ Registered
```

---

## 输出示例

### 成功创建并注册房间：

```
🌐  Chain: monad
🛰  RPC: https://testnet-rpc.monad.xyz
🏠  LiveRoom: 0x3E2a676F83CC030C764a9F942bCEeE5657331CE8
🎬  TipStream: 0x2dAA2b2370F37179E40E815b6D1f05cb107fE8c4
👤  Signer: 0x500947f01E346093000909882c620b7407129EfB

🚀 Creating room in LiveRoom with schemeId: 0
✅ Room created in LiveRoom, roomId = 2

🎬 Registering room in TipStream...
✅ Room registered in TipStream, tx: 0x...
   Streamer: 0x500947f01E346093000909882c620b7407129EfB
   Scheme ID: 0
   Active: true

💸 Tipping room 2 with 0.01
✅ Tip sent, tx: 0x...

📊 Final Status:
────────────────────────────────────────────────────────────
LiveRoom Info:
  Room ID: 2
  Streamer: 0x500947f01E346093000909882c620b7407129EfB
  Scheme ID: 1
  Active: true
  Total Received: 0.01 MON
  Tip Count: 1

TipStream Info:
  ✅ Registered
  Streamer: 0x500947f01E346093000909882c620b7407129EfB
  Scheme ID: 0
  Active: true
────────────────────────────────────────────────────────────

✨ Done! Summary:
  - LiveRoom: ✅ Active
  - TipStream: ✅ Registered
  - Instant Tipping: ✅ Available
  - Stream Tipping: ✅ Available
```

---

## 常见问题

### Q: 为什么注册 TipStream 需要主播的私钥？
A: `TipStream.registerRoom()` 函数要求调用者（msg.sender）是房间的主播地址。这是为了防止其他人随意注册房间。

### Q: Room #1 的主播地址是哪个？
A: `0x500947f01E346093000909882c620b7407129EfB`（平台收益地址）

### Q: 如果没有主播私钥怎么办？
A: 有两个选择：
1. 在前端创建管理页面，用 MetaMask 连接主播地址后注册
2. 修改 TipStream 合约，允许 owner 代替主播注册（需重新部署）

### Q: 我可以只注册 LiveRoom 吗？
A: 可以。设置 `REGISTER_TIPSTREAM=false` 即可。即时打赏功能不需要 TipStream。

### Q: TipStream 和 LiveRoom 有什么区别？
A:
- **LiveRoom**：即时打赏（点击一次 = 发送一笔）
- **TipStream**：流式打赏（持续计费，类似"订阅"）

---

## package.json 配置

确保 `package.json` 中有：

```json
{
  "scripts": {
    "demo:create-room": "node scripts/create-room.js"
  }
}
```

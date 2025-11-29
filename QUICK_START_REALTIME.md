# 🚀 实时赠礼功能 - 快速开始

## ✅ 验证状态

所有功能已完成并验证通过! 共 **715 行**高质量代码。

```
📦 hooks/useLiveEvents.ts      179 行  - 实时事件监听
📦 hooks/useLiveRoom.ts        197 行  - 直播间数据
🎨 components/TipEventStream.tsx   148 行  - 飞屏动画
🎨 components/TipLeaderboard.tsx   191 行  - 排行榜
```

## 📊 数据来源说明

### 1️⃣ 打赏事件序列 (实时飞屏动画)
- **数据源**: Monad 链上 `Tipped` Event
- **延迟**: ~400ms (得益于 Monad 0.4s 出块)
- **实现**: `watchContractEvents` 实时监听

### 2️⃣ 支付礼上见直播区 (排行榜)
- **数据源**: 
  - 历史数据: `tipHistory` 数组
  - 实时数据: `Tipped` Event
- **查询方法**:
  - `getRecentTips(limit)` - 最近打赏
  - `getRoomTips(roomId, limit)` - 房间打赏

## 🎯 5 分钟快速集成

### 步骤 1: 在你的页面导入组件

```tsx
"use client";

import { TipEventStream } from "@/components/TipEventStream";
import { TipLeaderboard } from "@/components/TipLeaderboard";

export default function LiveRoomPage() {
  return (
    <div className="grid grid-cols-3 gap-6">
      {/* 左侧 - 排行榜 */}
      <div className="col-span-2">
        <TipLeaderboard 
          chainId={10143}  // Monad Testnet
          roomId={4}        // 你的直播间ID
          limit={50}        // 查询最近50条
        />
      </div>

      {/* 右侧 - 实时飞屏 */}
      <div>
        <TipEventStream
          chainId={10143}
          roomId={4}
          maxDisplay={15}   // 最多显示15条
        />
      </div>
    </div>
  );
}
```

### 步骤 2: 启动开发服务器

```bash
npm run dev
```

### 步骤 3: 访问测试页面

打开浏览器访问:
- 你的页面: `http://localhost:3000/你的路由`
- 测试页面: `http://localhost:3000/test-realtime`

## 🎨 组件 API

### TipEventStream (打赏飞屏)

```tsx
<TipEventStream
  chainId={10143}      // 必需: 链ID
  roomId={4}           // 可选: 直播间ID (不填显示所有)
  maxDisplay={10}      // 可选: 最多显示条数 (默认10)
/>
```

**特性**:
- ✨ 实时飞入动画
- 💫 大额打赏特效
- 📊 统计面板
- 🎯 自动滚动

### TipLeaderboard (打赏排行榜)

```tsx
<TipLeaderboard
  chainId={10143}      // 必需: 链ID
  roomId={4}           // 可选: 直播间ID
  limit={50}           // 可选: 查询记录数 (默认50)
/>
```

**特性**:
- 🏆 Top 10 排行
- 🥇🥈🥉 前三徽章
- 📈 进度条动画
- 🔄 自动更新

## 🔧 高级用法

### 只使用 Hooks (自定义UI)

```tsx
import { useLiveEvents } from "@/hooks/useLiveEvents";
import { formatEther } from "viem";

export default function CustomUI() {
  const { events, loading } = useLiveEvents(10143, 1);

  return (
    <div>
      {events.map((event, i) => (
        <div key={i}>
          {event.tipper} 打赏 {formatEther(event.amount)} MON
        </div>
      ))}
    </div>
  );
}
```

### 获取直播间统计

```tsx
import { useLiveRoom } from "@/hooks/useLiveRoom";

export default function RoomStats() {
  const { roomInfo, contractStats } = useLiveRoom(10143, 1);

  return (
    <div>
      <p>累计收到: {roomInfo?.totalReceived.toString()}</p>
      <p>打赏次数: {roomInfo?.tipCount.toString()}</p>
    </div>
  );
}
```

## 💡 工作原理

```
用户发起打赏
    ↓
Monad 区块链 (0.4秒确认)
    ↓
触发 Tipped Event
    ↓
watchContractEvents 实时监听
    ↓
React State 更新
    ↓
UI 实时渲染 (动画效果)
```

## 🎭 自定义样式

所有组件使用 Tailwind CSS,可以轻松修改:

```tsx
// 修改飞屏动画速度
transition={{ stiffness: 500, damping: 30 }}

// 修改渐变色
className="bg-gradient-to-r from-purple-500 to-pink-500"
```

## 📦 已安装依赖

- ✅ `framer-motion@^12.23.24` - 动画库
- ✅ `viem@^2.40.3` - 格式化工具

## 🐛 常见问题

**Q: 为什么没有实时更新?**
A: 检查:
1. 合约地址是否正确 (deployment-info.ts)
2. ChainID 是否是 10143
3. 是否有人正在打赏

**Q: 如何测试?**
A: 打开两个浏览器窗口,一个打赏,一个看效果

**Q: 历史数据不显示?**
A: 刷新页面重新加载,或检查合约是否有历史记录

## ✅ 检查清单

在使用前确认:
- [ ] 已安装依赖 (`npm install`)
- [ ] 合约已部署 (检查 deployment-info.ts)
- [ ] ChainID 正确 (10143 for Monad)
- [ ] 有测试用的直播间ID

## 🎉 现在开始使用吧!

所有代码都已经写好并验证通过,直接复制上面的代码就能用!

有问题查看: [VERIFICATION.md](./VERIFICATION.md)

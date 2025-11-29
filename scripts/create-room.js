/**
 * Quick demo script to create a room, register it in TipStream, tip it once, and read it back.
 *
 * Env-driven so it matches your .env:
 *   PRIVATE_KEY                - required (主播地址的私钥)
 *   CHAIN                      - "monad" (default) or "sepolia"
 *   RPC_URL                    - overrides RPC
 *   LIVE_ROOM_ADDRESS          - overrides LiveRoom contract address
 *   TIP_STREAM_ADDRESS         - overrides TipStream contract address
 *   SCHEME_ID                  - optional override; otherwise use room's schemeId
 *   ROOM_ID                    - if set, reuse existing room (skip createRoom)
 *   TIP_AMOUNT                 - defaults to "0.01"
 *   REGISTER_TIPSTREAM         - "true" to register in TipStream (default: true)
 *
 * It also reads chain-specific vars from .env:
 *   NEXT_PUBLIC_MONAD_RPC / NEXT_PUBLIC_ETHEREUM_RPC
 *   NEXT_PUBLIC_MONAD_LIVE_ROOM_ADDRESS / NEXT_PUBLIC_ETHEREUM_LIVE_ROOM_ADDRESS
 *   NEXT_PUBLIC_MONAD_TIP_STREAM_ADDRESS / NEXT_PUBLIC_ETHEREUM_TIP_STREAM_ADDRESS
 */

/**
  cd web3-monad-live-next
  PRIVATE_KEY=0x你的主播私钥 \
  CHAIN=monad \           # or "sepolia"
  npm run demo:create-room
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { ethers } = require("ethers");

const CHAIN = (process.env.CHAIN || "monad").toLowerCase();

const RPC_URL =
  process.env.RPC_URL ||
  (CHAIN === "sepolia" ? process.env.NEXT_PUBLIC_ETHEREUM_RPC : process.env.NEXT_PUBLIC_MONAD_RPC) ||
  (CHAIN === "sepolia" ? "https://eth-sepolia.g.alchemy.com/v2/demo" : "https://testnet-rpc.monad.xyz");

const LIVE_ROOM_ADDRESS =
  process.env.LIVE_ROOM_ADDRESS ||
  (CHAIN === "sepolia"
    ? process.env.NEXT_PUBLIC_ETHEREUM_LIVE_ROOM_ADDRESS
    : process.env.NEXT_PUBLIC_MONAD_LIVE_ROOM_ADDRESS) ||
  "";

const TIP_STREAM_ADDRESS =
  process.env.TIP_STREAM_ADDRESS ||
  (CHAIN === "sepolia"
    ? process.env.NEXT_PUBLIC_ETHEREUM_TIP_STREAM_ADDRESS
    : process.env.NEXT_PUBLIC_MONAD_TIP_STREAM_ADDRESS) ||
  "";

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const SCHEME_ID = process.env.SCHEME_ID ? BigInt(process.env.SCHEME_ID) : null;
const TIP_AMOUNT = process.env.TIP_AMOUNT || "0.01";
const PRESET_ROOM_ID = process.env.ROOM_ID ? BigInt(process.env.ROOM_ID) : null;
const REGISTER_TIPSTREAM = process.env.REGISTER_TIPSTREAM !== "false"; // 默认为 true

if (!PRIVATE_KEY) {
  console.error("❌ Missing PRIVATE_KEY env var");
  process.exit(1);
}

if (!LIVE_ROOM_ADDRESS) {
  console.error("❌ Missing LIVE_ROOM_ADDRESS env var for chain:", CHAIN);
  process.exit(1);
}

const liveRoomAbi = [
  "function createRoom(uint256 _schemeId) returns (uint256)",
  "function tip(uint256 _roomId) payable",
  "function getRoom(uint256 _roomId) view returns (address streamer, uint256 schemeId, bool active, uint256 createdAt, uint256 totalReceived, uint256 tipCount)",
  "event RoomCreated(uint256 indexed roomId, address indexed streamer, uint256 schemeId)",
];

const tipStreamAbi = [
  "function registerRoom(uint256 _roomId, uint256 _schemeId) external",
  "function roomStreamers(uint256) view returns (address)",
  "function roomSchemes(uint256) view returns (uint256)",
  "function roomActive(uint256) view returns (bool)",
  "event RoomRegistered(uint256 indexed roomId, address indexed streamer, uint256 schemeId)",
];

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const liveRoom = new ethers.Contract(LIVE_ROOM_ADDRESS, liveRoomAbi, wallet);

  console.log("🌐  Chain:", CHAIN);
  console.log("🛰  RPC:", RPC_URL);
  console.log("🏠  LiveRoom:", LIVE_ROOM_ADDRESS);
  console.log("🎬  TipStream:", TIP_STREAM_ADDRESS || "(not set)");
  console.log("👤  Signer:", wallet.address);
  console.log("");

  let roomId = PRESET_ROOM_ID;
  let schemeIdForRoom = SCHEME_ID ?? 0n;

  if (!roomId) {
    console.log(
      "🚀 Creating room in LiveRoom with schemeId:",
      schemeIdForRoom.toString()
    );
    const tx = await liveRoom.createRoom(schemeIdForRoom);
    const receipt = await tx.wait();
    const event = receipt.logs
      .map((log) => {
        try {
          return liveRoom.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((e) => e && e.name === "RoomCreated");
    roomId = event?.args?.roomId;
    schemeIdForRoom = event?.args?.schemeId ?? schemeIdForRoom;
    if (!roomId) {
      throw new Error("RoomCreated event not found");
    }
    console.log(
      "✅ Room created in LiveRoom, roomId =",
      roomId.toString(),
      "| schemeId =",
      schemeIdForRoom.toString()
    );
  } else {
    console.log("ℹ️  Using existing roomId =", roomId.toString());
    // 读取房间的真实 schemeId，保证与 TipStream 注册一致
    const room = await liveRoom.getRoom(roomId);
    schemeIdForRoom = room.schemeId;
    console.log(
      "ℹ️  LiveRoom schemeId for this room =",
      schemeIdForRoom.toString()
    );
  }

  // 注册到 TipStream（如果启用）
  if (REGISTER_TIPSTREAM && TIP_STREAM_ADDRESS) {
    console.log("");
    console.log("🎬 Registering room in TipStream...");
    const tipStream = new ethers.Contract(TIP_STREAM_ADDRESS, tipStreamAbi, wallet);

    // 检查是否已注册
    const existingStreamer = await tipStream.roomStreamers(roomId);
    if (existingStreamer !== ethers.ZeroAddress) {
      console.log("ℹ️  Room already registered in TipStream");
      console.log("   Streamer:", existingStreamer);
      const registeredScheme = await tipStream.roomSchemes(roomId);
      console.log("   Scheme ID:", registeredScheme.toString());
    } else {
      const registerTx = await tipStream.registerRoom(roomId, schemeIdForRoom);
      await registerTx.wait();
      console.log("✅ Room registered in TipStream, tx:", registerTx.hash);

      // 验证注册
      const registeredStreamer = await tipStream.roomStreamers(roomId);
      const registeredScheme = await tipStream.roomSchemes(roomId);
      const isActive = await tipStream.roomActive(roomId);
      console.log("   Streamer:", registeredStreamer);
      console.log("   Scheme ID:", registeredScheme.toString());
      console.log("   Active:", isActive);
    }
  } else if (REGISTER_TIPSTREAM && !TIP_STREAM_ADDRESS) {
    console.log("");
    console.log("⚠️  TipStream registration skipped (TIP_STREAM_ADDRESS not set)");
  }

  // 打赏测试（可选，通过 TIP_AMOUNT 控制）
  if (TIP_AMOUNT && parseFloat(TIP_AMOUNT) > 0) {
    console.log("");
    console.log(`💸 Tipping room ${roomId} with ${TIP_AMOUNT}`);
    const tipTx = await liveRoom.tip(roomId, {
      value: ethers.parseEther(TIP_AMOUNT),
    });
    await tipTx.wait();
    console.log("✅ Tip sent, tx:", tipTx.hash);
  }

  // 显示最终状态
  console.log("");
  console.log("📊 Final Status:");
  console.log("─".repeat(60));

  const room = await liveRoom.getRoom(roomId);
  console.log("LiveRoom Info:");
  console.log("  Room ID:", roomId.toString());
  console.log("  Streamer:", room.streamer);
  console.log("  Scheme ID:", room.schemeId.toString());
  console.log("  Active:", room.active);
  console.log("  Total Received:", ethers.formatEther(room.totalReceived), CHAIN === "monad" ? "MON" : "ETH");
  console.log("  Tip Count:", room.tipCount.toString());

  let tsStreamer = null;
  let tsScheme = null;
  let tsActive = false;

  if (TIP_STREAM_ADDRESS) {
    const tipStream = new ethers.Contract(TIP_STREAM_ADDRESS, tipStreamAbi, wallet);
    tsStreamer = await tipStream.roomStreamers(roomId);
    tsScheme = await tipStream.roomSchemes(roomId);
    tsActive = await tipStream.roomActive(roomId);

    console.log("");
    console.log("TipStream Info:");
    if (tsStreamer !== ethers.ZeroAddress) {
      console.log("  ✅ Registered");
      console.log("  Streamer:", tsStreamer);
      console.log("  Scheme ID:", tsScheme.toString());
      console.log("  Active:", tsActive);
    } else {
      console.log("  ❌ Not registered");
      console.log("  💡 Run with ROOM_ID=", roomId.toString(), "to register this room");
    }
  }

  console.log("─".repeat(60));
  console.log("");
  console.log("✨ Done! Summary:");
  console.log("  - LiveRoom:", room.active ? "✅ Active" : "❌ Inactive");
  console.log("  - TipStream:", TIP_STREAM_ADDRESS && tsStreamer !== ethers.ZeroAddress ? "✅ Registered" : "❌ Not registered");
  console.log("  - Instant Tipping:", "✅ Available");
  console.log("  - Stream Tipping:", TIP_STREAM_ADDRESS && tsStreamer !== ethers.ZeroAddress ? "✅ Available" : "❌ Need to register first");
}

main().catch((err) => {
  console.error("❌ Script failed:", err);
  process.exit(1);
});

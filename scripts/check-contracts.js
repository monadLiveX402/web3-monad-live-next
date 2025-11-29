#!/usr/bin/env node
/**
 * 合约地址一致性检查脚本
 *
 * 目标：
 * 1. 确保当前前端使用的合约地址与最近部署的地址一致
 * 2. 支持通过环境变量覆盖，便于临时测试
 * 3. 如果发现缺失或不一致，立即打印错误并以非零状态退出
 */

const fs = require("fs");
const path = require("path");

// 支持的链
const CHAINS = [
  { key: "monad", chainId: 10143, env: "NEXT_PUBLIC_UNIFIED_TIPPING_ADDRESS" },
  { key: "sepolia", chainId: 11155111, env: "NEXT_PUBLIC_ETH_UNIFIED_TIPPING_ADDRESS" },
];

// 读取前端 deployment-info.ts
function readFrontendDeployment() {
  const frontendPath = path.join(__dirname, "..", "deployment-info.ts");
  if (!fs.existsSync(frontendPath)) return null;
  const content = fs.readFileSync(frontendPath, "utf-8");
  // 粗略提取地址（避免引入 ts/esm 解析）
  const extract = (key) => {
    const match = content.match(new RegExp(`${key}:\\s*"(0x[0-9a-fA-F]{40})"`));
    return match ? match[1] : "";
  };
  return {
    monad: {
      unifiedTipping: extract("unifiedTipping"),
    },
    sepolia: {
      unifiedTipping: extract("unifiedTipping"),
    },
  };
}

// 读取合约仓库 deployment-info.json
function readContractDeployment() {
  const contractPath = path.join(__dirname, "..", "..", "web3-monad-live-contract", "deployment-info.json");
  if (!fs.existsSync(contractPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(contractPath, "utf-8"));
  } catch (err) {
    return null;
  }
}

function isAddress(addr) {
  return /^0x[0-9a-fA-F]{40}$/.test(addr || "");
}

function main() {
  const frontend = readFrontendDeployment();
  const contractDeploy = readContractDeployment();

  let ok = true;
  console.log("🔎 Checking contract addresses...\n");

  CHAINS.forEach(({ key, env }) => {
    const envAddr = process.env[env];

    const frontendAddr = frontend?.[key]?.unifiedTipping || "";

    const contractAddr =
      contractDeploy?.contracts?.UnifiedTipping?.address ||
      contractDeploy?.[key]?.unifiedTipping ||
      "";

    const resolved = envAddr || frontendAddr || contractAddr;

    console.log(`Chain: ${key}`);
    console.log(`  UnifiedTipping -> env:${envAddr || "-"} | frontend:${frontendAddr || "-"} | contract:${contractAddr || "-"}`);
    console.log(`                     resolved: ${resolved || "(missing)"}`);

    if (!isAddress(resolved)) {
      ok = false;
      console.error(`❌ [${key}] UnifiedTipping 地址缺失或格式错误`);
    }

    if (frontendAddr && contractAddr && frontendAddr.toLowerCase() !== contractAddr.toLowerCase()) {
      console.warn(`⚠️  [${key}] frontend deployment-info.ts 与 合约仓库 deployment-info.json 不一致`);
      ok = false;
    }
  });

  if (!ok) {
    console.error("\n检查未通过，请修正地址配置后重试。");
    process.exit(1);
  }

  console.log("\n✅ 地址检查通过。");
}

main();

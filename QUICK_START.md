# Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- Node.js 18+
- MetaMask installed
- Monad testnet tokens

## 1. Install Dependencies

```bash
npm install
```

## 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```bash
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
NEXT_PUBLIC_LIVE_ROOM_ADDRESS=deployed_contract_address
NEXT_PUBLIC_TIP_STREAM_ADDRESS=deployed_contract_address
```

**Get Thirdweb Client ID:**
1. Visit https://thirdweb.com/dashboard
2. Create a new project
3. Copy the Client ID from API Keys

**Get Contract Addresses:**
1. Deploy contracts from `web3-monad-live-contract`
2. Or use existing deployed addresses

## 3. Add Monad Network to MetaMask

- Network Name: `Monad Testnet`
- RPC URL: `https://testnet-rpc.monad.xyz`
- Chain ID: `10143`
- Currency: `MON`
- Explorer: `https://testnet.monadexplorer.com`

## 4. Get Testnet Tokens

Visit https://testnet.monad.xyz and request tokens for your wallet.

## 5. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## 6. Test the App

1. Click "Connect Wallet"
2. Select Monad Testnet
3. Send a small tip (e.g., 0.001 MON)
4. Watch the transaction confirm in ~0.4 seconds!

## Troubleshooting

**Issue: Wallet won't connect**
- Make sure MetaMask is installed and unlocked
- Try refreshing the page

**Issue: Transaction failed**
- Ensure you have enough MON for gas
- Check contract address is correct

**Issue: Network not found**
- Manually add Monad Testnet to MetaMask (see step 3)

## Next Steps

- Read the full [README.md](./README.md)
- Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for production deployment
- Explore the code in `components/` and `hooks/`

---

Happy tipping! 🚀

# Monad Live Tipping Platform

A Next.js application showcasing real-time blockchain tipping with performance comparison between Monad Testnet and Ethereum Sepolia.

## Features

- **Dual-Chain Support**: Switch seamlessly between Monad Testnet and Ethereum Sepolia
- **Real-Time Tipping**: Send tips to live streamers with instant feedback
- **Performance Metrics**: Compare transaction speeds between networks in real-time
- **MetaMask Integration**: Connect your wallet with one click using Thirdweb
- **Beautiful UI**: Modern, responsive interface with dark mode support
- **X402 Protocol Support**: Backend integration for micro-payments (coming soon)

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Web3**: Thirdweb SDK, Ethers.js v6
- **Blockchain**: Monad Testnet, Ethereum Sepolia
- **Backend**: Express.js (optional, for X402 integration)

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- MetaMask browser extension
- Testnet tokens for both networks:
  - Monad: Get from [https://testnet.monad.xyz](https://testnet.monad.xyz)
  - Ethereum Sepolia: Get from [https://sepoliafaucet.com](https://sepoliafaucet.com)

## Getting Started

### 1. Installation

```bash
# Clone the repository
cd web3-monad-live-next

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# Copy the example file
cp .env.example .env.local
```

Edit `.env.local` with your values:

```bash
# Thirdweb API Keys (Get from https://thirdweb.com/dashboard)
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id_here

# Contract Addresses (Deploy contracts first)
NEXT_PUBLIC_UNIFIED_TIPPING_ADDRESS=0xYourUnifiedTippingAddress
NEXT_PUBLIC_ETH_UNIFIED_TIPPING_ADDRESS=0xYourSepoliaUnifiedTippingAddress
```

### 3. Deploy Contracts

First, deploy the smart contracts from the `web3-monad-live-contract` directory:

```bash
cd ../web3-monad-live-contract

# Deploy to Monad Testnet
npx hardhat run scripts/deploy.js --network monad

# (Optional) Deploy to Ethereum Sepolia for comparison
npx hardhat run scripts/deploy.js --network sepolia
```

Copy the deployed contract addresses to your `.env.local` file.

### 4. Run Development Server

```bash
cd ../web3-monad-live-next

npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Basic Flow

1. **Connect Wallet**: Click "Connect Wallet" to connect your MetaMask
2. **Select Network**: Choose between Monad Testnet or Ethereum Sepolia
3. **Send Tips**: Enter an amount and click "Send Tip"
4. **Compare Performance**: View real-time metrics showing transaction speeds

### Chain Switching

The app supports switching between networks to compare performance:

- **Monad Testnet**: 0.4s block time, high throughput
- **Ethereum Sepolia**: ~12s block time, standard Ethereum performance

### Performance Metrics

The app tracks and displays:
- Transaction confirmation time
- Block number
- Gas used
- Average confirmation time per network
- Speed improvement comparison

## Project Structure

```
web3-monad-live-next/
├── app/
│   ├── page.tsx                 # Main application page
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── components/
│   ├── ui/
│   │   ├── Button.tsx           # Reusable button component
│   │   └── Card.tsx             # Card components
│   ├── live/
│   │   └── LiveRoom.tsx         # Live room interface
│   ├── ChainSwitcher.tsx        # Network selection component
│   └── PerformanceComparison.tsx # Metrics display
├── hooks/
│   ├── useWallet.ts             # Wallet connection hook
│   └── useTipping.ts            # Tipping functionality hook
├── lib/
│   ├── chains.ts                # Chain configurations
│   ├── contracts.ts             # Contract ABIs and addresses
│   └── thirdweb.ts              # Thirdweb client setup
├── server/                      # Backend server (optional)
│   └── index.js                 # Express + X402 server
└── README.md
```

## Smart Contract

### UnifiedTipping

单合约同时支持一次性打赏与流式打赏：

```solidity
function tip() external payable
function startStream(uint256 _ratePerSecond) external payable
function topUpStream() external payable
function stopStream() external
function getStats() external view returns (uint256 instantVolume, uint256 streamVolume, uint256 activeStreams)
function getStream(address _user) external view returns (uint256 ratePerSecond, uint256 startTime, uint256 balance, bool active, uint256 currentAmount)
```

## Performance Comparison

### Monad Testnet vs Ethereum Sepolia

| Metric | Monad | Ethereum Sepolia |
|--------|-------|------------------|
| Block Time | 0.4s | ~12s |
| TPS | 10,000+ | ~15 |
| Finality | Near-instant | ~13 minutes |
| Gas Costs | Lower | Higher |

Experience the difference by sending identical transactions on both networks!

## X402 Integration (Coming Soon)

The backend server will support X402 protocol for micro-payments:

- HTTP 402 status code for payment requests
- Thirdweb settlePayment for verification
- Automatic payment processing
- AI Agent support

See `X402_INTEGRATION.md` in the contract repository for details.

## Development

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Troubleshooting

### Wallet Connection Issues

1. Make sure MetaMask is installed
2. Check that you're on the correct network
3. Ensure you have testnet tokens

### Transaction Failures

1. Verify contract addresses are correct
2. Check gas price settings (Monad requires minimum 50 gwei)
3. Ensure sufficient balance

### Network Switching

1. Add Monad Testnet to MetaMask manually:
   - Network Name: Monad Testnet
   - RPC URL: https://testnet-rpc.monad.xyz
   - Chain ID: 10143
   - Currency Symbol: MON

## Resources

- [Monad Documentation](https://docs.monad.xyz)
- [Thirdweb Docs](https://portal.thirdweb.com)
- [Contract Repository](../web3-monad-live-contract)
- [Monad Testnet Faucet](https://testnet.monad.xyz)
- [Monad Explorer](https://testnet.monadexplorer.com)

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Support

For questions and support:
- Check the documentation
- Open an issue on GitHub
- Join the Monad Discord community

---

Built with ❤️ using Monad & Thirdweb



直播视频流地址：
https://juejin.cn/post/7319674466169700387

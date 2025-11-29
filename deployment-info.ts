const deploymentInfo = {
  monad: {
    chainId: 10143,
    liveRoom: "0x3E2a676F83CC030C764a9F942bCEeE5657331CE8",
    tipStream: "0x2dAA2b2370F37179E40E815b6D1f05cb107fE8c4",
    deployer: "0x0F07CdFa12e37cB52f88CDdBE06Db475cf89f423",
    explorer: "https://testnet.monadexplorer.com",
  },
  sepolia: {
    chainId: 11155111,
    liveRoom: "0xa7872e86CF0Cc8a811671a93dA8145B57EDE59E2",
    tipStream: "0xc8345A96a53C0A86cC601aB1e619ACeB565920D4",
    explorer: "https://sepolia.etherscan.io",
  },
} as const;

export default deploymentInfo;

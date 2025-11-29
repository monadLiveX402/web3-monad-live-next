const deploymentInfo = {
  monad: {
    chainId: 10143,
    unifiedTipping: "0xcfb9534B39a81271464dF275b2ADBD697cB3b293",
    deployer: "0x0F07CdFa12e37cB52f88CDdBE06Db475cf89f423",
    explorer: "https://testnet.monadexplorer.com",
  },
  sepolia: {
    chainId: 11155111,
    unifiedTipping: "0x18B876906c6F4f555D3b498Ce556A3363462F871",
    explorer: "https://sepolia.etherscan.io",
  },
} as const;

export default deploymentInfo;

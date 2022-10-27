import { SecretNetworkClient } from "secretjs";

const wallet = new Wallet(
  "grant rice replace explain federal release fix clever romance raise often wild taxi quarter soccer fiber love must tape steak together observe swap guitar"
);
const myAddress = wallet.address;

// To create a signer secret.js client, also pass in a wallet
const secretjs = await SecretNetworkClient.create({
  grpcWebUrl: "http://localhost:9091",
  chainId: "secretdev-1",
  wallet: wallet,
  walletAddress: myAddress,
});

const secretBoxHash = "";
const secretBoxContract = "";

const counter = await secretjs.query.compute.queryContract({
    contractAddress: secretBoxContract,
    codeHash: secretBoxHash,
    query: { get_count {} },
});

console.log(`Counter value = ${counter}`);


import * as dotenv from "dotenv";
import assert from "assert";
import { Wallet, SecretNetworkClient, fromUtf8 } from "secretjs";

dotenv.config({ path: __dirname+'/.env' });

// Secret.js Client
let secretjs: SecretNetworkClient;

const wallet = new Wallet(
  "grant rice replace explain federal release fix clever romance raise often wild taxi quarter soccer fiber love must tape steak together observe swap guitar"
)

// Get environment variables from .env
const secretBoxCode: string = process.env.SECRET_BOX_CODE!;
const secretBoxHash: string = process.env.SECRET_BOX_HASH!;
const secretBoxAddress: string = process.env.SECRET_BOX_ADDRESS!;
const localSecretUrl: string = process.env.LOCALSECRET_GRPC!;

console.log(`code id = ${secretBoxCode}`);
console.log(`contract hash = ${secretBoxHash}`);
console.log(`contract address = ${secretBoxAddress}`);
console.log(`localsecret gRPC = ${localSecretUrl}`);

const initialize = async () => {
  // To create a signer secret.js client, also pass in a wallet
  const secretjs = await SecretNetworkClient.create({
    //grpcWebUrl: "http://localhost:9091",
    grpcWebUrl: localSecretUrl,
    chainId: "secretdev-1",
    wallet: wallet,
    walletAddress: wallet.address,
  });

  return secretjs;
}

const queryCounter = async (
    secretjs: SecretNetworkClient
) => {
  type Response = { count: number };

  const response = (await secretjs.query.compute.queryContract({
      contractAddress: secretBoxAddress,
      codeHash: secretBoxHash,
      query: { get_count: {} },
  })) as Response;

  return response.count;
}

const incrementCounter = async (
    secretjs: SecretNetworkClient
) => {
  const tx = await secretjs.tx.compute.executeContract(
  {
    sender: wallet.address,
    contractAddress: secretBoxAddress,
    codeHash: secretBoxHash,
    msg: {
      increment: {},
    },
  },
  {
    gasLimit: 1_000_000,
  });
}

const resetCounter = async (
  secretjs: SecretNetworkClient,
  value: number,
) => {
  const tx = await secretjs.tx.compute.executeContract(
  {
    sender: wallet.address,
    contractAddress: secretBoxAddress,
    codeHash: secretBoxHash,
    msg: {
      reset: { count: value },
    },
  },
  {
    gasLimit: 1_000_000,
  });
}

(async () => {
  // Initialize the Secret.js client
  const secretjs = await initialize()

  // Query the initial counter value
  const beforeCount = await queryCounter(secretjs)
  console.log(`initial counter value is ${beforeCount}`)

  await incrementCounter(secretjs)
  const afterCount = await queryCounter(secretjs)

  assert(
   afterCount == beforeCount + 1,
    `After increment, counter expected to be ${beforeCount + 1} instead of ${afterCount}`
  );

  // Reset counter value to 16876
  await resetCounter(secretjs, 16876)
  const resetCount = await queryCounter(secretjs)

  assert(
   resetCount == 16876,
    `After reset, counter expected to be 56 instead of ${resetCount}`
  );

})();

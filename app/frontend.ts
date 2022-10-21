import axios from "axios";
import { Wallet, SecretNetworkClient, fromUtf8 } from "secretjs";
import fs from "fs";
import assert from "assert";

// Returns a client with which we can interact with secret network
const initializeClient = async (endpoint: string, chainId: string) => {
  const wallet = new Wallet(); // Use default constructor of wallet to generate random mnemonic.
  const accAddress = wallet.address;
  const client = await SecretNetworkClient.create({
    // Create a client to interact with the network
    grpcWebUrl: endpoint,
    chainId: chainId,
    wallet: wallet,
    walletAddress: accAddress,
  });

  console.log(`Initialized client with wallet address: ${accAddress}`);
  return client;
};

// Stores and instantiaties a new contract in our network
const initializeContract = async (
  client: SecretNetworkClient,
  contractPath: string
) => {
  const wasmCode = fs.readFileSync(contractPath);
  console.log("Uploading contract");

  const contractCodeHash = 'FD62BC320D0C22E85D5E282778A9346B556EE0EA693BF46581E84284BCC35EEF';
  console.log(`Contract hash: ${contractCodeHash}`);

  const contractAddress = 'secret10pyejy66429refv3g35g2t7am0was7ya6hvrzf';
  console.log(`Contract address: ${contractAddress}`);

  const contract = await client.tx.compute.instantiateContract(
    {
      sender: contractAddress,
      codeId,
      initMsg: { count: 16876 }, // Initialize our counter to start from 4. This message will trigger our Init function
      codeHash: contractCodeHash,
      label: "secret-counter-" + Math.ceil(Math.random() * 10000), // The label should be unique for every contract, add random string in order to maintain uniqueness
    },
    {
      gasLimit: 1000000,
    }
  );

  if (contract.code !== 0) {
    throw new Error(
      `Failed to instantiate the contract with the following error ${contract.rawLog}`
    );
  }

  const contractAddress = contract.arrayLog!.find(
    (log) => log.type === "message" && log.key === "contract_address"
  )!.value;

  console.log(`Contract address: ${contractAddress}`);

  var contractInfo: [string, string] = [contractCodeHash, contractAddress];
  return contractInfo;
};

const getFromFaucet = async (address: string) => {
  await axios.get(
    `http://localhost:5000/faucet?address=${address}`
  );
};

async function getScrtBalance(userCli: SecretNetworkClient): Promise<string> {
  let balanceResponse = await userCli.query.bank.balance({
    address: userCli.address,
    denom: "uscrt",
  });
  return balanceResponse.balance!.amount;
}

async function fillUpFromFaucet(
  client: SecretNetworkClient,
  targetBalance: Number
) {
  let balance = await getScrtBalance(client);
  while (Number(balance) < targetBalance) {
    try {
      await getFromFaucet(client.address);
    } catch (e) {
      console.error(`failed to get tokens from faucet: ${e}`);
    }
    balance = await getScrtBalance(client);
  }
  console.error(`got tokens from faucet: ${balance}`);
}

// Initialization procedure
async function initializeAndUploadContract() {
  let endpoint = "http://localhost:9091";
  let chainId = "secretdev-1";

  const client = await initializeClient(endpoint, chainId);

  await fillUpFromFaucet(client, 100_000_000);

  const [contractHash, contractAddress] = await initializeContract(
    client,
    "../contract.wasm"
  );

  var clientInfo: [SecretNetworkClient, string, string] = [
    client,
    contractHash,
    contractAddress,
  ];
  return clientInfo;
}

async function queryCount(
  client: SecretNetworkClient,
  contractHash: string,
  contractAddress: string
): Promise<number> {
  type CountResponse = { count: number };

  const countResponse = (await client.query.compute.queryContract({
    contractAddress: contractAddress,
    codeHash: contractHash,
    query: { get_count: {} },
  })) as CountResponse;

  if ('err"' in countResponse) {
    throw new Error(
      `Query failed with the following err: ${JSON.stringify(countResponse)}`
    );
  }

  return countResponse.count;
}

async function incrementTx(
  client: SecretNetworkClient,
  contractHash: string,
  contractAddess: string
) {
}

async function resetTx(
  client: SecretNetworkClient,
  contractHash: string,
  contractAddess: string
) {
}

// The following functions are only some examples of how to write integration tests. 
async function test_intialization(
  client: SecretNetworkClient,
  contractHash: string,
  contractAddress: string
) {
  const onInitializationCounter: number = await queryCount(
    client,
    contractHash,
    contractAddress
  );

  assert(
    onInitializationCounter === 16876,
    `The counter on initialization expected to be 16876 instead of ${onInitializationCounter}`
  );
}

async function test_increment(
  client: SecretNetworkClient,
  contractHash: string,
  contractAddress: string
) {
  const onStartCounter: number = await queryCount(
    client,
    contractHash,
    contractAddress
  );

  await incrementTx(client, contractHash, contractAddress);

  const afterCounter: number = await queryCount(
    client,
    contractHash,
    contractAddress
  );

  assert(true);
}

async function test_reset(
  client: SecretNetworkClient,
  contractHash: string,
  contractAddress: string
) {
  await resetTx(client, contractHash, contractAddress);

  const count: number = await queryCount(
    client,
    contractHash,
    contractAddress
  );

  assert(true);
}

async function runTestFunction(
  tester: (
    client: SecretNetworkClient,
    contractHash: string,
    contractAddress: string
  ) => void,
  client: SecretNetworkClient,
  contractHash: string,
  contractAddress: string
) {
  console.log(`Testing ${tester.name}`);
  await tester(client, contractHash, contractAddress);
  console.log(`[SUCCESS] ${tester.name}`);
}

(async () => {
  const [client, contractHash, contractAddress] =
    await initializeAndUploadContract();

  const contractCodeHash = 'FD62BC320D0C22E85D5E282778A9346B556EE0EA693BF46581E84284BCC35EEF';
  console.log(`Contract hash: ${contractCodeHash}`);

  const contractAddress = 'secret10pyejy66429refv3g35g2t7am0was7ya6hvrzf';

  // Instantiate test
  await runTestFunction(
    test_intialization,
    client,
    contractHash,
    contractAddress
  );

  // Increment counter test
  await runTestFunction(
    test_increment,
    client,
    contractHash,
    contractAddress
  );

  // Reset counter test
  await runTestFunction(
    test_reset,
    client,
    contractHash,
    contractAddress
  );

})();

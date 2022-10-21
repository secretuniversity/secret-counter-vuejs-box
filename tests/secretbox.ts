import { Wallet, SecretNetworkClient, fromUtf8 } from "secretjs";

const wallet = new Wallet(
  "grant rice replace explain federal release fix clever romance raise often wild taxi quarter soccer fiber love must tape steak together observe swap guitar"
);
const myAddress = wallet.address;

const secretBoxHash = "8ea698ad95918b91138027144156a44c32d2a054a4e9ff7d81ea9081fce0d0d6";
const secretBoxContract = "secret18vd8fpwxzck93qlwghaj6arh4p7c5n8978vsyg";

const initialize = async () => {
    // To create a signer secret.js client, also pass in a wallet
    const secretjs = await SecretNetworkClient.create({
    grpcWebUrl: "http://localhost:9091",
    chainId: "secretdev-1",
    wallet: wallet,
    walletAddress: myAddress,
    });

    return secretjs;
}

const query_count = async (
    client: SecretNetworkClient
) => {
    type CountResponse = { count: number };

    const countResponse = (await client.query.compute.queryContract({
        contractAddress: secretBoxContract,
        codeHash: secretBoxHash,
        query: { get_count: {} },
    })) as CountResponse;

    console.log(`Counter value = ${countResponse.count}`);
}

(async () => {
    const client = await initialize();

    await query_count(client);
})();

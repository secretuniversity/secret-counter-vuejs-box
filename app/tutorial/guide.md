# Secret Counter Box Tutorial

## Introduction
This box is an introductory or beginner-level quickstart based on the [counter template contract](https://github.com/secretuniversity/secret-template-cw1). If you would like to work with this Secret Box your local environment, follow the "Getting Started" steps [here](https://github.com/secretuniversity/secret-counter-vuejs-box/blob/main/README.md).

_Secret Counter_ is a contract that illustrates how to handle basic query and state changes (e.g. transactions) on the Secret Network.

> You can think of a secret contract as smart, but in addition provides programmable privacy--meaning you decide what input, output and state data
is public or private, depending on your use case or scenario.

In the next sections, we'll take a look at the overall architecture and design of our smart contract, go through the creation of your contract, and then you'll get a chance to modify your contract and application code to:

- query the contract's counter value
- increment the counter's value
- and reset the counter

> While the frontend allows you to reset and click the '+' button to increment the counter, the contract's state is unchanged because we haven't "wired" the frontend to the backend contract yet.

At this point your _Secret Counter Box_ workspace should be setup and includes: 

* a running `LocalSecret` blockchain instance
* an initial version of the _Secret Counter_ contract has been uploaded to `LocalSecret`
* and _Simple Secret Counter_ has been launched, which includes this tutorial

You should have the following three terminal windows open in your local environment:

1. `LocalSecret` - the first terminal shows the blockchain starting up and producing blocks
2. `Secret Box Workspace` - the 2nd terminal is where your contract gets compiled, deployed, and is the window you'll use to enter commands as you go through this tutorial
3. `Secret Box Frontend` - the 3rd terminal is where your application server is launched, after `LocalSecret` is running and the _Secret Counter_ contract has been created

## Contract Architecture

The design of our _Secret Counter_ contract accounts for two possible users: 

- The contract owner (you) who instantiates the contract 
- The general user of our contract who can query, increment, and reset the counter.

![](https://i.imgur.com/z3R428U.png)

### Project Structure

The project structure includes an area for your contract logic, messages and state (`src/`), integration tests (`tests/`) and the _Simple Secret Counter_ DApp (`app/`). 

> We've marked the files you'll be modifying with red dots below.

![](https://i.imgur.com/wHKaV48.png)

### Understanding Basic CosmWasm

A Secret contract, which is based on [CosmWasm](https://docs.cosmwasm.com) smart contracts, contains **3 entry points** we are able to interact with:

- `instantiate()` - receives the `InstantiateMsg` and saves the initial value of the counter to the contract state. The instantiation of a CosmWasm smart contract is performed by the contract owner.

- `execute()` - handles transExercise which mutate or change the state of the contract. In our case, the `Increment` and `Reset` messages are handled here to update the counter's value.

- `query()` - handles messages which do **not** change the state of the contract. To recieve the counter's state we'll utilize the `QueryCount` message.

A good place to start when developing secret contracts is to design the messages, defined in the [msg.rs](), that will be handled by your contract's entry points.

**Entry Point: Instantiate**
We've defined our `InstantiateMsg` as:

```rust
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
pub struct InstantiateMsg {
      pub count: i32,
}
```

That means that when we create the contract, we can initialize it with the following JSON representation of the above message:

```
{ "count": Some i32 Number }
```
**Entry Point: Query**
Our `QueryMsg` definition contains the `GetCount` message, which is defined as an enum variant:

```rust
pub enum QueryMsg {
    // GetCount returns the current count as a json-encoded number
    GetCount {},
}
```

> Enum variants look like Rust structs and in the case of `GetCount` has no data or properties associated with it.

**Exercise**

From the `Secret Box Workspace` terminal, try querying the counter value by sending the `GetCount` message to your contract.

> While the message variants are defined in the _Secret Counter_ countract using camel-casing, all messages are actually sent in JSON
with the message name in snake-cased.

Below we're using the CLI (command-line interface) to interact with the contract. We do this by executing the `secretd` command in the docker
container that our `LocalSecret` is running in. 

```bash
docker exec localsecret secretd query compute query $VITE_SECRET_BOX_ADDRESS '{"get_count": {}}' | jq
```

The returned value is the `CountResponse` struct with the value of the counter.

```bash
{
  "count": 16876
}
```

**Entry Point: Execute**
To handle updating our counter's value we need to execute a transExercise and update our smart contract's state. The execute messages are defined as part of the `ExecuteMsg` enum:

```rust
pub enum ExecuteMsg {
    Increment {},
    Reset {
      count: i32
    },
}
```

You can see that the `Increment` message has no parameters. This is because the value of our counter is always incremented by 1, so there is no need to handle user input.

```sh
increment {} # No parameters
```

The `Reset` message takes a *count* parameter, allowing us to set the count to any number we provide as a parameter. `Reset` is sent to the `execute()` entry point as:

```sh
reset { "count": 56 } # Or any i32 value
```

## Setting Up Your Secret Counter

In the `Secret Box Workspace` terminal, you should see the output of the tasks that store and create your contract.

![](https://i.imgur.com/hQ1Bgg2.png)


> If you've done any object-oriented programming, the idea of instantiating an object from a class definition will be familiar to you.

You can think of Secret Contracts as class definitions that first need to get deployed to the blockchain. Once deployed, you can create an instance of your contract by sending
an `InstantiateMsg` using the identifier of your deployed contract.

When a contract is successfully stored on `LocalSecret`, it will be given an ID that uniquely identifies the uploaded contract.

Because this is a fresh development workspace, the contract ID is assigned a value of `1` in the above message:

```
secret counter code id: 1
```

Your uploaded contract is also assigned a unique "code hash":

```
secret counter contract code hash: 0xa92402fd34057f79f7af6101d25d20c05b960ed88c82932657d87889f046d2d2
```

After it's been uploaded, it is instantiated by sending the `InstantiateMsg` with the initial value for the counter:

```
sending init message: '{"count": 16876}'
```

The result of instantiating your contract is the contract's address, which you'll use to send messages to the contract from the frontend.

```
contract address: secret18vd8fpwxzck93qlwghaj6arh4p7c5n8978vsyg
```

Finally, the workspace stores this info as environment variable settings in the `.env` file. 

```bash
SECRET_BOX_CODE=1
SECRET_BOX_ADDRESS=secret18vd8fpwxzck93qlwghaj6arh4p7c5n8978vsyg
SECRET_BOX_HASH=0xa92402fd34057f79f7af6101d25d20c05b960ed88c82932657d87889f046d2d2
```

**Exercise**

Let's try to re-upload and instantiate the _Secret Counter_ contract.

In the `Secret Box Workspace` terminal, run the command:

```bash
./scripts/create_secret_box.sh
```

When the script has finished, update your current environment with the latest box settings:

```bash
source .env
echo $SECRET_BOX_CODE
echo $SECRET_BOX_ADDRESS
echo $SECRET_BOX_HASH
```

**Understanding Smart Contract Instantiation**

Here's a breakdown of what the `instantiate()` method in your contract does:

```rust
#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, StdError> {
   ...
}
```

As you can see there are multiple parameters sent on the creation of a secret contract and you can find more details on these in the [CosmWasm docs](https://docs.cosmwasm.com/docs/1.0/smart-contracts/entry-points), but to summarize:

- `deps: DepsMut` - contains references to your contract's `Storage`, an `Api` element that has functionality outside of the contract wasm such as the ability to
validate, canonicalize (*binary*) and humanize (*string*) Secret Network addresses, and a `Querier` to do things like getting the balance of a wallet address.

- `_env: Env` - this parameter, though unused as denoted by the `_` in front, has a `BlockInfo` element for getting the current block, `TransExerciseInfo` which has the index
of the transExercise this `InstantiateMsg` was executed in, and `ContractInfo` which has the address of the instantiated contract.

- `info` - `MessageInfo` contains the sender's address and any funds sent to the contract.

- `msg` - `InstantiateMsg` this is the message defined for the creation of the contract, which in our case is an 32-bit integer named `count`.

**Saving the State**

The first thing our `instantiate()` method does is declare and set the values for our `State` object, which is defined in [state.rs]().

You can see that the pieces of data we're storing in `State` are the initial
counter value (`msg.count`) and the contract owner `info.sender.clone()`. 

> If you're not familiar with Rust's `borrowing and referencing`, check out this [guide](https://doc.rust-lang.org/rust-by-example/scope/borrow.html), which will explain why we've had to set the `owner` to a `clone()` or copy of the sender's address.

```rust
    // Create initial state with count and contract owner
    let state = State {
        count: msg.count,
        owner: info.sender.clone(),
    };
```

The next bit of code saves the `state` to the contract's storage, prints a debug message showing who the contract was created by, in 
the node logs, and then returns the `Ok` enum with a default response.

```rust
    // Save the contract state
    config(deps.storage).save(&state)?;

    deps.api.debug(&format!("Contract was initialized by {}", info.sender));

    Ok(Response::default())
```

And in the `LocalSecret` terminal, we can see that the output from the debug message:

![](https://i.imgur.com/W7rnLVd.png)

**Next Steps**

We'll cover the exact steps to upload and instantiate your contract as part of the next steps to evolve your _Simple Secret Counter_ DApp. We'll also flesh out the details for the query, increment and reset functions.

## Querying the Counter's Value

In order to get the value of the counter from the _Secret Counter_ contract, we have to code the `query_count` function. Up until this point, 
we've had the `query_count` function return a hard-coded value:

```rust
Ok(CountResponse { count: 16876 })
```

**Exercise**

Begin by opening the [contract.rs]() file, and then finding the `query()` method:

```rust
#[entry_point]
pub fn query(
    deps: Deps,
    _env: Env,
    msg: QueryMsg,
) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetCount {} => to_binary(&query_count(deps)?),
    }
}
```

The `query` entry point is where all query messages are sent to your contract. Here you'll write a `match` statement on the message variant and call the appropriate query method in your contract.

Notice that we are returning query results as a `Binary` type:

```rust
pub fn query(...) -> StdResult<Binary>
```

by calling `query_count` and converting the response using the `to_binary` method:

```rust
to_binary(&query_count(deps)?)
```

> We apply the `?` panic operator so that if the query returns an error, it's handled properly.


All Cosmwasm query responses are the `Binary` type, which basically takes a vector of bytes and uses base64 encoding to create a string of text. 
Base64 encodings are also smaller than their `Binary` counterparts, which makes it more efficient to return data that way as opposed to the raw bytes.

Next, we need to implement the `query_count()` method so that it returns a response with the current counter value.

```rust
fn query_count(
    deps: Deps,
) -> StdResult<CountResponse> {
   // 1. load state
   let state = config_read(deps.storage).load()?;

   deps.api.debug("count incremented successfully");

   // 2. return count response
   Ok(CountResponse { count: state.count })
}
```

In order to return the count of our contract, we first need to load our contract's state. The counter contract uses a Singleton type for storage of the `State` data. The `config_read()` and `config()` methods are used to read and save to the contract's state respectively. Then we create the response and return our counter's value.

**Exercise**

Substitute the code in `query_count()` for this:

```rust
   // 1. load state
   let state = config_read(deps.storage).load()?;

   deps.api.debug("count incremented successfully");

   // 2. return count response
   Ok(CountResponse { count: state.count })
```

Finally, use the `Secret Box Workspace` terminal window to compile your contract changes:

```bash
make build
```

If successful, you'll see this output:

```sh
Finished release [optimized] target(s) in 0.02s
cp ./target/wasm32-unknown-unknown/release/*.wasm ./contract.wasm
cat ./contract.wasm | gzip -9 > ./contract.wasm.gz
```

**Unit Testing Your Query Message**

If you scroll down to the end of the [contract.rs]() code, you'll see the unit tests. We've already
implemented the `proper_initialization` unit test that includes a call to `query()`, passing the `QueryMsg::GetCount` 
message.

```rust
#[cfg(test)]
mod tests {
    use super::*;

    use cosmwasm_std::testing::{mock_dependencies, mock_env, mock_info};
    use cosmwasm_std::{coins, from_binary};

    #[test]
    fn proper_initialization() {
        let mut deps = mock_dependencies();

        let msg = InstantiateMsg { count: 16876 };
        let info = mock_info("creator", &coins(1000, "earth"));

        // we can just call .unwrap() to assert this was a success
        let res = instantiate(deps.as_mut(), mock_env(), info, msg).unwrap();
        assert_eq!(0, res.messages.len());

        // it worked, let's query the state
        let res = query(deps.as_ref(), mock_env(), QueryMsg::GetCount {}).unwrap();
        let value: CountResponse = from_binary(&res).unwrap();
        assert_eq!(16876, value.count);
    }
}
```
**Exercise**

Now, that we've modified the contract to return the actual value of the counter, we can change our `proper_initialization()` unit test so that it uses a different value from the hard-coded value of `16876`.

Change the `InstantiateMsg` from:

```rust
let msg = InstantiateMsg { count: 16876 };
```

to:

```rust
let msg = InstantiateMsg { count: 1000 };
```

And change the assertion statement from:

```rust
assert_eq!(16876, value.count);
```

to:

```rust
assert_eq!(1000, value.count);
```

Finally, back in your `Secret Box Workspace` terminal, run your unit tests with:

```bash
make test
```

If you've made the changes correctly, the unit test output will look like this.

```sh
Finished test [unoptimized + debuginfo] target(s) in 13.05s
Running unittests src/lib.rs (target/debug/deps/secret_counter_vuejs_box-23b8b0115ff1a222)

running 3 tests
test contract::tests::increment ... ok
test contract::tests::reset ... ok
test contract::tests::proper_initialization ... ok

test result: ok. 3 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

Nicely done. If you've made it this far, you should have a good understanding of how queries work in the context of secret contracts, and you even know how to properly test your queries!

## Incrementing and Reseting the Counter's Value

In the following steps, we'll work on coding the functions for the `Increment` and `Reset` messages, that are routed to the `execute()` entry point of our contract: 

- Increment - adds 1 to the counter
- Reset - set the value of the counter to _count_

You'll notice we've already completed the `match` statement for two `ExecuteMsg` variants:

```rust
#[entry_point]
pub fn execute(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::Increment {} => try_increment(deps),
        ExecuteMsg::Reset { count } => try_reset(deps, info, count),
    }
}
```

**Exercise**

Find the `try_increment` function and change the code from this:

```rust
pub fn try_increment(
    deps: DepsMut,
) -> Result<Response, ContractError> {

    // 1. load state
    // 2. increment the counter by 1
    // 3. save state

    deps.api.debug("count incremented successfully");
    Ok(Response::default())
}
```

to:

```rust
pub fn try_increment(
    deps: DepsMut,
) -> Result<Response, ContractError> {

    // Update state, incrementing counter by 1
    config(deps.storage).update(|mut state| -> Result<_, ContractError> {
        state.count += 1;
        Ok(state)
    })?;

    deps.api.debug("count incremented successfully");
    Ok(Response::default())
}
```

> Notice that we're able to load and update the state in one statement above. For more information on working with 
storage, check out the [Secret CosmWasm storage docs](https://docs.scrt.network/secret-network-documentation/development/secret-contracts/contract-components/storage).


**Exercise**

Find the `try_reset` function and change it from this:

```rust
pub fn try_reset(
    deps: DepsMut,
    info: MessageInfo,
    count: i32,
) -> Result<Response, ContractError> {

    // 1. load state
    // 2. if sender is not the contract owner, return error
    // 3. else, reset the counter to the value given

    deps.api.debug("count reset successfully");
    Ok(Response::default())
}
```

to:

```rust
pub fn try_reset(
    deps: DepsMut,
    info: MessageInfo,
    count: i32,
) -> Result<Response, ContractError> {

   // Update state, setting counter to value
    config(deps.storage).update(|mut state| -> Result<_, ContractError> {
        if info.sender != state.owner {
            return Err(ContractError::Unauthorized {});
        }
        state.count = count;
        Ok(state)
    })?;

    deps.api.debug("count reset successfully");
    Ok(Response::default())
}
```

When calling `update`, we're checking to make sure that the sender of the message is also the contract
owner because in our design we've decided that the `reset` transExercise is something only the contract owner
should be able send.

In the event that the caller of `reset` is *not* the contract owner, we return a `ContractError` enum variant stating the sender is unauthorized. 

> The [error.rs]() file is a great spot to put all of your contract-specific errors for the `execute` messages.

**Unit Testing Your Increment and Reset Messages**

Yay! Now we're ready to add unit tests for the `ExecuteMsg::Increment` and `ExecuteMsg::Reset` message variants.

**Exercise**

Change the increment and reset unit test functions from:

```rust
#[test]
fn increment() {
    assert!(true);
}

#[test]
fn reset() {
    assert!(true);
}
```

to:

```rust
#[test]
fn increment() {
    let mut deps = mock_dependencies();

    let msg = InstantiateMsg { count: 17 };
    let info = mock_info("creator", &coins(2, "token"));
    let _res = instantiate(deps.as_mut(), mock_env(), info, msg).unwrap();

    // anyone can increment
    let info = mock_info("anyone", &coins(2, "token"));
    let msg = ExecuteMsg::Increment {};
    let _res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();

    // should increase counter by 1
    let res = query(deps.as_ref(), mock_env(), QueryMsg::GetCount {}).unwrap();
    let value: CountResponse = from_binary(&res).unwrap();
    assert_eq!(18, value.count);
}

#[test]
fn reset() {
    let mut deps = mock_dependencies();

    let msg = InstantiateMsg { count: 17 };
    let info = mock_info("creator", &coins(2, "token"));
    let _res = instantiate(deps.as_mut(), mock_env(), info, msg).unwrap();

    // not anyone can reset
    let unauth_env = mock_info("anyone", &coins(2, "token"));
    let msg = ExecuteMsg::Reset { count: 5 };
    let res = execute(deps.as_mut(), mock_env(), unauth_env, msg);
    match res {
        Err(ContractError::Unauthorized {}) => {}
        _ => panic!("Must return unauthorized error"),
    }

    // only the original creator can reset the counter
    let auth_info = mock_info("creator", &coins(2, "token"));
    let msg = ExecuteMsg::Reset { count: 5 };
    let _res = execute(deps.as_mut(), mock_env(), auth_info, msg).unwrap();

    // should now be 5
    let res = query(deps.as_ref(), mock_env(), QueryMsg::GetCount {}).unwrap();
    let value: CountResponse = from_binary(&res).unwrap();
    assert_eq!(5, value.count);
}
```
**Exercise** 

Now, let's compile the contract and, if successful, run the units tests.

```bash
make build && make test
```

**Build and Unit Test Log**

```bash
RUSTFLAGS='-C link-arg=-s' cargo build --release --target wasm32-unknown-unknown
   Compiling secret-counter-vuejs-box v0.1.0 (/home/lori/source/repos/secret-counter-vuejs-box)
    Finished release [optimized] target(s) in 2.42s
cp ./target/wasm32-unknown-unknown/release/*.wasm ./contract.wasm
cat ./contract.wasm | gzip -9 > ./contract.wasm.gz
cargo unit-test
    Finished test [unoptimized + debuginfo] target(s) in 13.05s
     Running unittests src/lib.rs (target/debug/deps/secret_counter_vuejs_box-23b8b0115ff1a222)

running 3 tests
test contract::tests::increment ... ok
test contract::tests::reset ... ok
test contract::tests::proper_initialization ... ok

test result: ok. 3 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

## Deploying the Secret Counter Contract

Now that you've got all of your contract's functionality implemented, and the unit tests are passing, it's time to re-compile and
deploy the revised version of your _Secret Counter_ contract.

Use the `Secret Box Workspace` terminal to run the following command:

```bash
./scripts/create_secret_box.sh
```
> The `create_secretbox.sh` script compiles the contract, uploads it to `LocalSecret` and then saves the contract ID, hash and address to 
`.env` files to be used in your `Secret Box Workspace` terminal, the integration tests, and the `Simple Secret Counter` frontend.

## Running the Integration Tests

Now that you've got all of your contract's functionality implemented, and the unit tests are passing, it's time to
run the integration tests. These tests are written using [TypeScript](https://www.typescriptlang.org/) and [Secret.js](https://secretjs.scrt.network/), which is the library that you'll use to 
connect to `LocalSecret` and run your queries and transExercises.

> Writing integration tests is an important exercise as it involves having an external process interact with your contract. It's also helpful 
when it comes time to develop the frontend of a DApp because it provides the examples of sending the query and execute messages to your 
contract.

**Exercise**

In the `Secret Box Workspace` terminal window, run these commands:

```bash
cd tests
npx ts-node secretbox.ts
```
> As the test is running you'll start to see the activity in the `LocalSecret` terminal, as the integration tests.

![](https://i.imgur.com/MYhruE5.png)

The `secretbox.ts` perform these steps in order:

- initializes the *Secret.js* client
- queries the counter for its initial value
- increments the counter and queries the new value to verify it was incremented by `1`
- resets the counter to `56` and verifies by doing another counter query

Congratulations! You've successfully completed your first secret contract with both unit and integration tests.

**Next Steps**

In the next part of this tutorial, we'll modify the _Simple Secret Counter_ DApp to:

- get the actual counter value from the contract
- code the calls to the contract to increment and reset the counter 

Basically, you'll be connecting the frontend to your backend contract using the `Secret.js` client, a privacy-preserving Web3 library for Secret Network.

## Revising the Secret Counter Frontend

You might have noticed that when the _Secret Counter Box_ was launched, at the end of that process, you DApp or frontend was displayed in the browser window, 
with an initial counter value of _0_. 

> We'll be using [Secret.js](https://secretjs.scrt.network/) to interact with the contract. The docs cover the breadth of everything you can do with
> `secretjs` and we recommend taking a look at that information as you go through this tutorial.

At this point, the `SecretBox.vue` component has a hard-coded value of _0_ for the initial and reset value for the counter. 

**Exercise**

Go ahead and try out the counter now, clicking the _+_ button, and then click on the _Reset Counter?_.

### Add the Secret Network Client and Wallet

> You'll notice that the incrementing and resetting happens very quickly. After you've "wired" your frontend to the backend contract, it won't be
> as quick because the `localsecret` blockchain has a block time of approximately 5-6s, which is how long it takes to get your `increment` and 
> `reset` transExercises included in the next block that's committed to the network.

![](https://i.imgur.com/SDjq1Hv.png)

Now, let's modify the [SecretBox.vue]() component so that it:

- imports the `Wallet` and `SecretNetworkClient` modules
- defines the `secretjs` client variable that we'll use to establish a connection with our `localsecret` environment
- creates a _secret_ `Wallet` with the mnemonic that corresponds to one of the pre-defined [accounts](https://docs.scrt.network/secret-network-documentation/development/tools-and-libraries/local-secret#accounts) that `localsecret` comes with out of the box
- sets up our secret box environment variables for the identifier, contract hash value, and the contract address

> The _Simple Secret Counter_ frontend uses the settings published to `app/.env` to interact with the contract.
>
> The Vite frontend server automatically reads the `.env` file and makes environment variables prefixed with `VITE_` available to your frontend client via the `import.meta.env` object.
> ```bash
> VITE_SECRET_BOX_CODE=1
> VITE_SECRET_BOX_ADDRESS=secret18vd8fpwxzck93qlwghaj6arh4p7c5n8978vsyg
> VITE_SECRET_BOX_HASH=0xa92402fd34057f79f7af6101d25d20c05b960ed88c82932657d87889f046d2d2
> VITE_LOCALSECRET_GRPC=https://9091-secretunive-secretcount-j7shljm3sni.ws-us77.gitpod.io
> ```

**Exercise**

Change the following code at the top of [SecretBox.vue]():

```typescript
<script setup lang="ts">
import { onMounted, ref } from 'vue'
```

to:

```typescript
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Wallet, SecretNetworkClient } from "secretjs"

// Secret.js Client
let secretjs: SecretNetworkClient

const wallet = new Wallet(
  "grant rice replace explain federal release fix clever romance raise often wild taxi quarter soccer fiber love must tape steak together observe swap guitar"
)

// Get environment variables from .env
const localSecretUrl = import.meta.env.VITE_LOCALSECRET_GRPC
const secretBoxCode = import.meta.env.VITE_SECRET_BOX_CODE
const secretBoxHash = import.meta.env.VITE_SECRET_BOX_HASH
const secretBoxAddress = import.meta.env.VITE_SECRET_BOX_ADDRESS

console.log(`local gRPC = ${localSecretUrl}`)
console.log(`code id = ${secretBoxCode}`)
console.log(`contract hash = ${secretBoxHash}`)
console.log(`contract address = ${secretBoxAddress}`)
```


If you open the browser Dev Tools window (Ctrl+Shift+I), you should see the console log messages from above. 

![](https://i.imgur.com/bUSD7p3.png)

### Connect to LocalSecret

At this point we haven't actually connected to the `localsecret` network yet. Let's do that next.

**Exercise**

Change the `onMounted()` function from:

```typescript
onMounted(async () => {
  window.addEventListener('scroll', handleScroll)
})
```

to:

```typescript
onMounted(async () => {
  window.addEventListener('scroll', handleScroll)

  // To create a signer secret.js client, also pass in a wallet
  console.log("Initializing Secret.js client ...")
  secretjs = await SecretNetworkClient.create({
    //grpcWebUrl: "http://localhost:9091",
    grpcWebUrl: localSecretUrl,
    chainId: "secretdev-1",
    wallet: wallet,
    walletAddress: wallet.address,
  })

  console.log(`Created client for wallet address: ${wallet.address}`)

  count.value = await queryCounter()
})
```

In the code above, we're creating a client for `localsecret` using the wallet we setup. Once the DApp has connected to the network, you're ready
to start making queries and sending transExercises to the _Secret Counter_ contract.

> We're using the cloud-based Gitpod URL in the workspace, to talk to the `LocalSecret` blockchain, which runs on port 9091. If you're working with this _Secret Box_ in a local developer environment, change that to the line above `grpcWebUrl: "http://localhost:9091` instead.

### Query the Counter Value

At the end of the `onMounted` function above, you'll notice that as the last task we're calling the `queryCounter()` function to display
the initial value. But, it's not actually sending the query to your contract yet.

**Exercise**

Change the `queryCounter() function from:

```typescript
const queryCounter = () => {
  return count.value
}
```

to:

```typescript
const queryCounter = async () => {
  type CountResponse = { count: number }

  const response = (await secretjs.query.compute.queryContract({
    contractAddress: secretBoxAddress,
    codeHash: secretBoxHash,
    query: { get_count: {} },
  })) as CountResponse;

  if ('err"' in response) {
    throw new Error(
      `Query failed with the following err: ${JSON.stringify(response)}`
    )
  }

  return response.count
}
```

To send a query message to your contract, you specify the contract's address and it's hash (this is optional, but faster if you include the contract hash). 
Remember that we defined a `QueryCount` message for the contract and the way to send that is to convert it to it's snake case equivalent:

```typescript
GetCount: { }
```

is called from the DApp as:

```typescript
get_count: { }
```


> Remember that the `secret counter` contract was instantiated with an initial value of `16876`.

and back in the _Simple Counter_ frontend, you'll see it's picking up the actual counter value. We're on our way now!

![](https://i.imgur.com/Ll0i2fx.png)

### Increment the Counter

If you click the _+_ button to increment the counter, you'll notice that the counter is incremented, but if you reload the page, the counter value
that's displayed is still `16876`. That's because we haven't modified the `increment()` function to send the transExercise to `LocalSecret`. The counter 
value stored in the contract's state has not been changed yet.

**Exercise**

Change the `incrementCounter()` function from:

```typescript
const incrementCounter = () => {
  count.value++
}
```

to:

```typescript
const incrementCounter = async () => {
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
  })

  console.log("Increment by 1")
  count.value = await queryCounter()
}
```

In the code above, we send a transExercise that updates the contract's state by calling `secretjs.tx.compute.executeContract()`, supplying:

- sender's wallet address
- contract address
- contract hash
- the `Increment` message
- the gas limit for our transExercise sets a "meter" to limit the amount of gas paid for in fees

After the `increment` transExercise is executed in a block, we do another `queryCounter()` call to get the changed value.

**Exercise**

Now, try incrementing the counter and you should see the counter value has now changed.

> Because we're now connected to the `localsecret` blockchain, there's a slight delay between clicking the increment button, and the changed value
> in the frontend.

### Reset the Counter

At this point, since we haven't modified the `resetCounter()` function when you click the _Reset Counter?_ button, you'll see the value is reset
to _0_, but reloading the page will show that the counter is still at the last incremented value.

**Exercise**

Change the `resetCounter()` function from:

```typescript
const resetCounter = () => {
  count.value = 0
}
```

to:

```typescript
const resetCounter = async () => {
  const tx = await secretjs.tx.compute.executeContract(
  {
    sender: wallet.address,
    contractAddress: secretBoxAddress,
    codeHash: secretBoxHash,
    msg: {
      reset: { count: 56 },
    },
  },
  {
    gasLimit: 1_000_000,
  })

  console.log("Counter reset")
  count.value = await queryCounter()
}
```

The `resetCounter()` function is pretty much the same except that we're sending a `count` value of `56` to the contract.

Try clicking the _Reset Counter?_ button. 

> Notice that the `resetCounter()` function is sending the "reset" message with a value of `56` and the frontend should now be displaying that value.

![](https://i.imgur.com/ahBdkLp.png)

Congratulations on completing this introductory _Secret Counter Box_ tutorial!

We at [Secret University](https://scrt.university) hope you've not only enjoyed working through the **Exercise** steps, but that you've also learned a bit of what Secret Contracts are all about.

## Further Reading

- After going through this tutorial, we encourage you to go through this [Getting Started Guide](https://docs.scrt.network/secret-network-documentation/development/getting-started) for further learning on secret contracts and a breakdown on the Secret Millionaires' Problem contract.

- If you're new to the Rust programming language, check out the [Rust Book](https://doc.rust-lang.org/book/) or the [Rustlings](https://github.com/rust-lang/rustlings) course.

- Another fun way to learn Rust that's interactive is [Tour of Rust](https://tourofrust.com).

- Secret's CosmWasm is based on vanilla CosmWasm, but there are some differences due to the privacy capabilities of the network. However, the CosmWasm [docs](https://docs.cosmwasm.com/docs/1.0/) are still an excellent resource for anyone looking to develop smart contracts in the Cosmos ecosystem.

- For connecting the frontend to Secret Network and interacting, we recommend studying the [Secret.js](https://secretjs.scrt.network/) docs.

- If you're not familiar with Javascript or Typescript, we recommend these resources: 

    - [Learn Javascript Online](https://learnjavascript.online)
    - [Learn Typescript](https://www.typescriptlang.org/docs)



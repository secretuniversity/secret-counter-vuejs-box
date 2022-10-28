# Secret Counter Box Tutorial 

## Introduction
This box is an introductory or beginner-level quickstart based on the [counter template contract](https://github.com/secretuniversity/secret-template-cw1).

Secret Counter is a smart contract that illustrates how to handle basic query and state changes (e.g. transactions) on the Secret Network. 

You'll notice that when launching this Secret Box on Gitpod, a workspace is opened that immediately takes care of a few things for you; including: 
* setting up an online development environment for you to start coding
* starting a `LocalSecret` blockchain instance, 
* creating and deploying your smart contract to `LocalSecret`
* and finally, starting the the VueJS web application.

There should be three terminal windows in your Gitpod workspace:
1. `LocalSecret` - the first terminal shows the blockchain starting up and producing blocks
2. `Secret Box workspace` - the 2nd terminal is where your contract gets compiled, deployed, and is the window you'll use to enter commands as you go through this tutorial
3. `Secret Counter app` - the 3rd terminal is where your app server is launched, after the local network is running and the Secret Counter contract has been created

In the next sections, we'll take a look at the overall architecture and design of our smart contract, go through the creation of your contract, and then you'll get the chance to modify your contract and application code to:

- query the smart contract's counter value
- increment the counter's value
- and reset the counter

> While the frontend allows you to reset and click the '+' button to increment the counter, the contract's state isn't changed because we haven't "wired" the frontend to the backend contract yet.

## Secret Counter Architecture

The design of our Secret Counter smart contract accounts for two possible users: 

1) The contract owner (you) who instantiates the contract 
2) The general user of our contract who can query, increment, and reset the counter.

![](https://i.imgur.com/z3R428U.png)

### Understanding Basic CosmWasm

A Secret contract, which is based on [CosmWasm](https://docs.cosmwasm.com), contains **3 entry points** we are able to interact with:

1. `instantiate()` - receives the `InstantiateMsg` and saves the initial value of our counter to the contract state. The instantiation of a CosmWasm smart contract is performed by the contract owner.

2. `execute()` - handles transaction which mutate or change the state of our contract. In our case, the `Increment` and `Reset` messages are handled here to update our counter's value.

3. `query()` - handles messages which do **not** change the state of our contract. To recieve our counter's state we will utilize our `QueryCount` message.

A good place to start when developing secret contracts is to design the [messages](https://github.com/secretuniversity/secret-counter-vuejs-box/blob/main/src/msg.rs) that will be handled by your contract's entry points.

**Entry Point: Instantiate**
We've defined our `InstantiateMsg` as:

```rust
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
pub struct InstantiateMsg {
      pub count: i32,
}
```

That means that when we create our contract, we can initialize it with the following JSON representation of the above message:

```
{ "count": Some i32 Number }
```
**Entry Point: Query**
Our `QueryMsg`, which is used to get data from our smart contract, contains the `GetCount` message, which is defined as a `QueryMsg` enum variant:

```rust
pub enum QueryMsg {
    // GetCount returns the current count as a json-encoded number
    GetCount {},
}
```

We use `get_count {}` with no parameters to invoke our query and to get the value of the counter.

**Entry Point: Execute**
To handle updating our counter's value we need to execute a transaction and update our smart contract's state. The execute messages are defined as part of the `ExecuteMsg` enum:

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
reset { "count": 66 } # Or any i32 value
```

## Setting Up Your Secret Counter

In the `Secret Box workspace` terminal, you should see the output of the tasks that store and create your contract:

```
              <####> Create Secret Box contract <####>
secretcli version in the docker image is: 1.4.1-patch.3

waiting on tx: 52579697AC06F099C6C8F9A6368DA40B2E028FF04699ECD4E15FE30076DD8205
uploaded contract
got contract hash
sending init message: '{"count": 16876}'
waiting on tx: 79A35F71E99B2AFC049AC7AA8E2CC137DB2FA30BA4EE7E117A05C77F104BD81E

Secret Box created successfully!

secret counter code id: 1
secret counter contract address: secret18vd8fpwxzck93qlwghaj6arh4p7c5n8978vsyg
secret counter contract code hash: 0xa92402fd34057f79f7af6101d25d20c05b960ed88c82932657d87889f046d2d2

===
=== Use 'source .env' to set the SECRET BOX environment variables in your local bash shell
===

Returning environment variables for Gitpod workspace
```
If you've done any object-oriented programming, the idea of instantiating an object from a class definition will be familiar to you.

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

**ACTION** :muscle:
Let's try to re-upload and instantiate the Secret Counter contract.

In the `Secret Box workspace` terminal, run the command:

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
> The Secret Counter frontend reads the `.env` file to get these values in order to interact with the contract.

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

- `_env: Env` - this parameter, though unused as denoted by the `_` in front, has a `BlockInfo` element for getting the current block, `TransactionInfo` which has the index
of the transaction this `InstantiateMsg` was executed in, and `ContractInfo` which has the address of the instantiated contract.

- `info` - `MessageInfo` contains the sender's address and any funds sent to the contract.

- `msg` - `InstantiateMsg` this is the message defined for the creation of the contract, which in our case is an 32-bit integer named `count`.

**Saving the State**

The first thing our `instantiate()` method does is declare and set the values for our `State` object, which is defined in [state.rs](https://github.com/secretuniversity/secret-counter-vuejs-box/blob/main/src/state.rs).

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

Next, we'll save the `state` to the contract's storage, print a useful debug message in 
the node logs, and then return the `Ok` enum with a default response.

```rust
    // Save the contract state
    config(deps.storage).save(&state)?;

    deps.api.debug(&format!("Contract was initialized by {}", info.sender));

    Ok(Response::default())
```

And in the `LocalSecret` terminal, we can see that the output from the debug message:

![](https://i.imgur.com/W7rnLVd.png)

**NEXT STEPS** :rocket:
We'll cover the exact steps to upload and instantiate your contract as part of the next steps to evolve your Secret Counter application. We'll also flesh out
the details for the query, increment and reset functions.

## Querying the Counter's Value

In order to get the value of the counter from your secret contract, you must implement the `query_count` function.

**ACTION** :muscle:

Begin by opening the [contract.rs](https://github.com/secretuniversity/secret-counter-vuejs-box/blob/main/src/contract.rs) file and find the `query()` method:

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

Next, we need to implement the `query_count()` method so that it returns a response with the current counter value.

```rust
fn query_count(
    deps: Deps,
) -> StdResult<CountResponse> {

    // 1. load state
    // Your code here

    // 2. return count response
    // Your code here

    Ok(CountResponse { count: 16876 })
}
```

In order to return the count of our contract, we first need to load our contract's state. The counter contract uses a Singleton type for storage of the `State` data. The `config_read()` and `config()` methods are used to read and save to the contract's state respectively. Then we create the response and return our counter's value.

**ACTION** :muscle:

Substitute the code in `query_count()` for this:

```rust
   // 1. load state
   let state = config_read(deps.storage).load()?;

   deps.api.debug("count incremented successfully");

   // 2. return count response
   Ok(CountResponse { count: state.count })
```

Finally, use the `Secret Box workspace` terminal window to compile your contract changes:

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

If you scroll down to the end of the [contract](https://github.com/secretuniversity/secret-counter-vuejs-box/blob/main/src/contract.rs) code, you'll see the unit tests. We've already
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
**ACTION** :muscle:

Now, that we've modified the contract to return the actual value of the counter, we can change our initialization unit
test so that it uses a different value from the hard-coded `16876`.

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

Finally, back in your `Secret Box workspace` terminal, run your unit tests with:

```bash
make test
```

If you've made the changes correctly, the unit test output will look like this :tada:.

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
- Reset - set the value of the counter

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

**ACTION** :muscle: 

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


**ACTION** :muscle:

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
owner because in our design we've decided that the `reset` transaction is something only the contract owner
should be able send.

In the event that the caller of `reset` is *not* the contract owner, we return a `ContractError` enum variant stating the sender is unauthorized. 

> The [error.rs](https://github.com/secretuniversity/secret-counter-vuejs-box/blob/main/src/error.rs) file is a great spot to put all of your contract-specific errors for the `execute` messages.

**Unit Testing Your Increment and Reset Messages**

Yay! Now we're ready to add unit tests for the `ExecuteMsg::Increment` and `ExecuteMsg::Reset` message variants.

**ACTION** :muscle:

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

**ACTION** :muscle:

Now, let's run the unit tests and if successful, we'll see the initialization, increment and reset tests pass! 🎉

```bash
make test
```

**Unit Test Log**

```bash
Finished test [unoptimized + debuginfo] target(s) in 13.05s
Running unittests src/lib.rs (target/debug/deps/secret_counter_vuejs_box-23b8b0115ff1a222)

running 3 tests
test contract::tests::increment ... ok
test contract::tests::reset ... ok
test contract::tests::proper_initialization ... ok

test result: ok. 3 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

## Using Integration Tests

Now that you've got all of your contract's functionality implemented, and the unit tests are passing, it's time to
run the integration tests. These tests are written using [TypeScript](https://www.typescriptlang.org/) and [Secret.js](https://secretjs.scrt.network/), which is the library that you'll use to 
connect to `LocalSecret` and run your queries and transactions.

**ACTION** :muscle:

In the `Secret Box workspace` terminal window, run these commands:

```bash
cd tests
npx ts-node integration.ts
```
> As the test is running you'll start to see additional activity in the `LocalSecret` (1st) terminal, as the integration tests.

![](https://i.imgur.com/QV98fpR.png)

The integration tests perform these steps in order:

- initialize the *Secret.js* client
- get SCRT tokens from the `LocalSecret` *faucet*
- store and instantiate the counter contract
- run the increment and reset test functions

A successful integration test run will look like this:

```
Initialized client with wallet address: secret175pf7852wx842hke4lpdgn7wsk5juac7yk0fal
got tokens from faucet: 1000000000
Uploading contract
Contract codeId:  3
Contract hash: a92402fd34057f79f7af6101d25d20c05b960ed88c82932657d87889f046d2d2
Contract address: secret1sh36qn08g4cqg685cfzmyxqv2952q6r8vqktuh
Testing test_intialization
[SUCCESS] test_intialization
Testing test_increment
[SUCCESS] test_increment
Testing test_reset
[SUCCESS] test_reset
```

> The `contract codeId` is `3` because we already uploaded a version of the contract in the beginning of the workspace. And then again when you re-uploaded and instantiated the contract. Each time you store your revised contract on Secret Network, it gets a new identifier.

Congratulations, you've successfully completed your own _Secret Counter_ contract! :rocket:

**NEXT STEPS** :tada:

In the next part of this tutorial, we'll modify the Secret Counter app code so that we can actually try out
the increment and reset functions with a web interface. 

## Revise the Secret Counter Frontend

Let's modify the [SecretBox.vue](https://github.com/secretuniversity/secret-counter-vuejs-box/blob/main/app/src/components/SecretBox.vue) component and have it use the hash and address of our revised contract.

> You'll notice that you're able to use the Secret Counter app to increment and reset the counter--or at least it looks like it's doing that! We've actually hard-coded the desired behavior by setting the initial value of the `count` variable to `16876`, incrementing it by 1 and then resetting the value to `16876`.

## Further Reading

- After going through this tutorial, we encourage you to go through this [Getting Started Guide](https://docs.scrt.network/secret-network-documentation/development/getting-started) for further learning.

- If you're new to the Rust programming language, check out the [Rust Book](https://doc.rust-lang.org/book/) or the [Rustlings](https://github.com/rust-lang/rustlings) course.

- Another fun way to learn Rust that's interactive is [Tour of Rust](https://tourofrust.com).

- Secret's CosmWasm is based on vanilla CosmWasm, but there are some differences due to the privacy capabilities of the network. However, the CosmWasm [docs](https://docs.cosmwasm.com/docs/1.0/) are still an excellent resource for anyone looking to develop smart contracts in the Cosmos ecosystem.


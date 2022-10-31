# Secret Counter Box Tutorial 

## Introduction
This box is an introductory or beginner-level quickstart based on the [counter template contract](https://github.com/secretuniversity/secret-template-cw1).

_Secret Counter_ is a secret contract that illustrates how to handle basic query and state changes (e.g. transactions) on the Secret Network.

> You can think of a secret contract as smart, but in addition provides programmable privacy--meaning you decide what input, output and state data
is public or private, depending on your use case or scenario.

You'll notice that when launching this _Secret Couner Box_ on Gitpod, a workspace is opened that immediately takes care of a few things for you; including: 
* setting up an online development environment for you to start coding
* starting a `LocalSecret` blockchain instance, 
* creating and deploying your smart contract to `LocalSecret`
* and finally, starting the the VueJS web application: _Simple Secret Counter_.

There should be three terminal windows in your Gitpod workspace:
1. `LocalSecret` - the first terminal shows the blockchain starting up and producing blocks
2. `Secret Box workspace` - the 2nd terminal is where your contract gets compiled, deployed, and is the window you'll use to enter commands as you go through this tutorial
3. `Simple Secret Counter` - the 3rd terminal is where your application server is launched, after the local network is running and the _Secret Counter_ contract has been created

In the next sections, we'll take a look at the overall architecture and design of our smart contract, go through the creation of your contract, and then you'll get a chance to modify your contract and application code to:

- query the contract's counter value
- increment the counter's value
- and reset the counter

> While the frontend allows you to reset and click the '+' button to increment the counter, the contract's state is unchanged because we haven't "wired" the frontend to the backend contract yet.

## Contract Architecture

The design of our _Secret Counter_ contract accounts for two possible users: 

1) The contract owner (you) who instantiates the contract 
2) The general user of our contract who can query, increment, and reset the counter.

![](https://i.imgur.com/z3R428U.png)

### Project Structure

The project structure includes an area for your contract logic, messages and state (`src/`), integration tests (`tests/`) and
the _Simple Secret Counter_ application (`app/`). 

> We've marked the files you'll be modifying with red dots below.

![](https://i.imgur.com/wHKaV48.png)

### Understanding Basic CosmWasm

A Secret contract, which is based on [CosmWasm](https://docs.cosmwasm.com) smart contracts, contains **3 entry points** we are able to interact with:

1. `instantiate()` - receives the `InstantiateMsg` and saves the initial value of the counter to the contract state. The instantiation of a CosmWasm smart contract is performed by the contract owner.

2. `execute()` - handles transaction which mutate or change the state of the contract. In our case, the `Increment` and `Reset` messages are handled here to update the counter's value.

3. `query()` - handles messages which do **not** change the state of the contract. To recieve the counter's state we'll utilize the `QueryCount` message.

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

**ACTION**

From the `Secret Box` workspace terminal, try querying the counter value by sending the `GetCount` message to your contract.

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
reset { "count": 56 } # Or any i32 value
```

## Setting Up Your Secret Counter

In the `Secret Box workspace` terminal, you should see the output of the tasks that store and create your contract.

![](https://i.imgur.com/dQdv3s4.png)


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

**ACTION**
Let's try to re-upload and instantiate the _Secret Counter_ contract.

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

**NEXT STEPS**
We'll cover the exact steps to upload and instantiate your contract as part of the next steps to evolve your _Simple Secret Counter_ application. We'll also flesh out the details for the query, increment and reset functions.

## Querying the Counter's Value

In order to get the value of the counter from the _Secret Counter_ contract, we have to code the `query_count` function. Up until this point, 
we've had the `query_count` function return a hard-coded value:

```rust
Ok(CountResponse { count: 16876 })
```

**ACTION**

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

**ACTION**

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
**ACTION**

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

**ACTION**

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


**ACTION**

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

> The [error.rs]() file is a great spot to put all of your contract-specific errors for the `execute` messages.

**Unit Testing Your Increment and Reset Messages**

Yay! Now we're ready to add unit tests for the `ExecuteMsg::Increment` and `ExecuteMsg::Reset` message variants.

**ACTION**

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
**Action** 
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

```bash
./scripts/create_secretbox.sh
```
> The `create_secretbox.sh` script compiles the contract, uploads it to `LocalSecret` and then saves the contract ID, hash and address to 
`.env` files to be used in your `Secret Box workspace` terminal, the integration tests, and the `Simple Secret Counter` frontend.

## Running the Integration Tests

Now that you've got all of your contract's functionality implemented, and the unit tests are passing, it's time to
run the integration tests. These tests are written using [TypeScript](https://www.typescriptlang.org/) and [Secret.js](https://secretjs.scrt.network/), which is the library that you'll use to 
connect to `LocalSecret` and run your queries and transactions.

> Writing integration tests is an important exercise as it involves having an external process interact with your contract. It's also helpful 
when it comes time to develop the frontend of an application because it provides the examples of sending the query and execute messages to your 
contract.

**ACTION**

In the `Secret Box workspace` terminal window, run these commands:

```bash
cd tests
npx ts-node secretbox.ts
```
> As the test is running you'll start to see the activity in the `LocalSecret` terminal, as the integration tests.

![](https://i.imgur.com/QV98fpR.png)

The `secretbox.ts` perform these steps in order:

- initializes the *Secret.js* client
- queries the counter for its initial value
- increments the counter and queries the new value to verify it was incremented by `1`
- resets the counter to `56` and verifies by doing another counter query

Congratulations, you've successfully completed your own _Secret Counter_ contract with both unit and integration tests. :tada: 

**NEXT STEPS**

In the next part of this tutorial, we'll modify the _Simple Secret Counter_ application to:

- get the actual counter value from the contract
- code the calls to the contract to increment and reset the counter 

Basically, you'll be connecting the frontend to your backend contract using the `Secret.js` client, a privacy-preserving Web3 library for Secret Network.

## Revising the Secret Counter Frontend

Let's modify the [SecretBox.vue]() component.

> The _Simple Secret Counter_ frontend uses the settings published to `app/.env` to interact with the contract.
>
> The Vite frontend server automatically reads the `.env` file and makes environment variables prefixed with `VITE_` available to your frontend client via the `import.meta.env` object.
> ```bash
> VITE_SECRET_BOX_CODE=1
> VITE_SECRET_BOX_ADDRESS=secret18vd8fpwxzck93qlwghaj6arh4p7c5n8978vsyg
> VITE_SECRET_BOX_HASH=0xa92402fd34057f79f7af6101d25d20c05b960ed88c82932657d87889f046d2d2
> ```


## Further Reading

- After going through this tutorial, we encourage you to go through this [Getting Started Guide](https://docs.scrt.network/secret-network-documentation/development/getting-started) for further learning.

- If you're new to the Rust programming language, check out the [Rust Book](https://doc.rust-lang.org/book/) or the [Rustlings](https://github.com/rust-lang/rustlings) course.

- Another fun way to learn Rust that's interactive is [Tour of Rust](https://tourofrust.com).

- Secret's CosmWasm is based on vanilla CosmWasm, but there are some differences due to the privacy capabilities of the network. However, the CosmWasm [docs](https://docs.cosmwasm.com/docs/1.0/) are still an excellent resource for anyone looking to develop smart contracts in the Cosmos ecosystem.


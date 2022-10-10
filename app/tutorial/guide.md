# Secret Counter Box Tutorial 
 

## Introduction
This box is an introductory or beginner-level quickstart based on the [counter template contract](https://github.com/secretuniversity/secret-template-cw1).

Secret Counter is a contract that illustrates how to handle a basic query and state changes (e.g. transactions) on the Secret Network. 

You'll notice that on launching this Secret Box, a workspace is opened that does a few things for you initially, including setting up the development environment,
starting the `LocalSecret` blockchain, deploying and instantiating the contract and finally, starting the application.

In the next sections, we'll describe the contract design, walk you through the creation of your contract instance and then you'll modify the contract and application code to:

- query the counter value
- increment the counter
- reset the counter


### Further Reading

After going through this tutorial, we encourage you to go through this [Getting Started Guide](https://docs.scrt.network/secret-network-documentation/development/getting-started) for further learning.

If you're new to the Rust programming language, check out the [Rust Book](https://doc.rust-lang.org/book/) or the [Rustlings](https://github.com/rust-lang/rustlings) course.

Secret's CosmWasm is based on vanilla CosmWasm so there are differences due to the privacy aspects, but these [docs](https://docs.cosmwasm.com/docs/1.0/) are an excellent resource on developing smart contracts in the Cosmos eocsystem.

## Architecture

The design for the Secret Counter contract involves the contract owner, who instantiates, and the user of the contract who can query, increment and reset the counter.

![](/app/tutorial/illustrations/architecture.png)

### Entry Points

There are three entry points for a CosmWasm contract:

- `instantiate()` - receives the `InstantiateMsg` and saves the counter to the contract state

- `execute()` - the `Increment` and `Reset` messages are handled here (transactions that change state data)

- `query()` - the `QueryCount` message is sent to this entry point

One of the first things you'll do as a secret contract developer is to design the [messages](/src/msg.rs) handled by your contract. 

### Instantiate

We've defined our `InstantiateMsg` as:
```
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
pub struct InstantiateMsg {
      pub count: i32,
}
```

That means when we create the contract, we're sending the JSON representation of the above as:

```
{ "count": 1}
```
### Query

The `GetCount` message is defined as a `QueryMsg` enum:

```
pub enum QueryMsg {
    // GetCount returns the current count as a json-encoded number
    GetCount {},
}
```

We use `get_count {}` with no parameters to invoke the query to get the value of the counter.



## Creating the Contract Instance

If you've done any object-oriented programming, the idea of instantiating an object from a class definition will be familiar to you.

You can think of Secret Contracts as class definitions that first need to get deployed to the blockchain. Once deployed, you create an instance by sending
an `InstantiateMsg` to the deployed contract which results in the address of your secret contract.

In the Secret Box workspace, you should see the output of the tasks that store and create your contract:

```

uploaded contract #1
sending init message:
'{"count": 16876}'
waiting on tx: 21CA06685161CC55B6F7CA171005418E443A8696CA8879EDE18168A0C2E00446
contract address: secret18vd8fpwxzck93qlwghaj6arh4p7c5n8978vsyg
Secret Box created successfully
```


When stored on `LocalSecret`, the result is an ID that uniquely identifies the uploaded contract. Because it's a fresh workspace, the contract ID is assigned a value of `1`
in the above message:

```
uploaded contract #1
```

After it's been uploaded, it is instantiated by sending the `InstantiateMsg`:

```
'{"count": 16876}'
```

And the output of the instantiation includes the contract address, which is stored in the environment variable `SECRET_BOX_ADDRESS`:

```
contract address: secret18vd8fpwxzck93qlwghaj6arh4p7c5n8978vsyg
```

We'll cover the exact steps to upload and instantiate your contract as part of your next steps to evolve the Secret Counter application, fleshing out
the details for the query, increment and reset functions.

Here's a breakdown of what the `instantiate()` method in your contract does:

```
#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, StdError> {

    // create initial state with count and contract owner
    let state = State {
        count: msg.count,
        owner: info.sender.clone(),
    };

    // save the contract state
    config(deps.storage).save(&state)?;

    deps.api.debug(&format!("Contract was initialized by {}", info.sender));

    Ok(Response::default())
}
```

## Querying the Secret Counter Contract

To implement the `query_count` functionality, open the `src/contract.rs` file and find the `query()` method:


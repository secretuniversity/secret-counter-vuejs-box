# Setting Up Your Environment

Secret Contracts are written using the CosmWasm framework. CosmWasm contracts are written in Rust, which is later compiled to WebAssembly (or WASM for short). To write our first Secret Contract, we need to set up a development environment with all the tools required.

To get started developing Secret Contracts we'll use:

* `LocalSecret` - a local Secret Network chain set up for development purposes

And for connecting to the local network, we'll use `secret.js` which is a Javascript library created by SCRT Labs with docs [here](https://secretjs.scrt.network).

Follow the instructions below to manually install the environment tools, including Rust and `docker` if you don't already have it installed.

## Install Build Tools

There are a few tools you'll need to build Secret Contracts, including `git`, `make` and `rustup` (installs the Rust compiler and Cargo).

### Install Git and Make

To follow along with the guide, we will be using `git` and `make`

##### Linux/WSL
```bash
sudo apt-get install git make
```

##### MacOS

Install `git`:

1. Download the latest [Git for Mac installer](https://sourceforge.net/projects/git-osx-installer/files/).
2. Follow the prompts to install Git.
3. Open a terminal and verify the installation was successful by typing `git --version`

Install `make`:

```bash
brew install make
```

##### Windows

Install `git` (for Windows):

1. Go to [https://git-scm.com/download/win](https://git-scm.com/download/win) and the download will start automatically. Note that this is a project called Git for Windows, which is separate from Git itself; for more information on it, go to [https://gitforwindows.org](https://gitforwindows.org/).

**Note:**  We'll provide separate commands for Windows where necessary (support for `make` on Windows is not as robust as with Linux environments).

### Install Rust

We'll use `rustup` to install the Rust compiler and package manager, `cargo`. Cargo is the package manager for Rust and we use it manage Secret Contract builds.

> For more information on `rustup`, check out these [docs](https://rust-lang.github.io/rustup/index.html). Cargo info [here](https://doc.rust-lang.org/cargo).

##### Linux/WSL

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

##### MacOS

```bash
curl https://sh.rustup.rs -sSf | sh
```

##### PowerShell

Download and run [`rustup-init.exe`](https://static.rust-lang.org/rustup/dist/i686-pc-windows-gnu/rustup-init.exe).

##### Windows (GUI)

Download and run [the Rust .msi installer](https://static.rust-lang.org/dist/rust-1.62.1-aarch64-pc-windows-msvc.msi)


#### Add WASM build target

```
rustup target add wasm32-unknown-unknown
```

> **Having Trouble?** You might need to restart your terminal, or run a command like:
>
> _`source "$HOME/.cargo/env"`_
>
> After installing Rust to configure the current shell

## Install Docker

If you don't already have docker installed in your local environment, follow the instructions for your OS below.

##### Linux/WSL

https://docs.docker.com/desktop/linux

##### MacOS

https://hub.docker.com/editions/community/docker-ce-desktop-mac

##### Windows

https://hub.docker.com/editions/community/docker-ce-desktop-windows

## Install SecretCLI

SecretCLI is a command-line tool that helps us interact with the Secret Network blockchain. It is used to send and query data as well as manage user keys and wallets.

##### Linux

```bash
wget -O secretcli https://github.com/scrtlabs/SecretNetwork/releases/download/v1.5.0/secretcli-Linux
chmod +x secretcli
sudo mv secretcli /usr/local/bin/secretcli
```

##### PowerShell

```powershell
wget -O secretcli.exe https://github.com/scrtlabs/SecretNetwork/releases/download/v1.5.0/secretcli-Windows
```

> You'll need to add `secretcli.exe` to the PATH environment variable

##### MacOS (Intel)

Download `secretcli` for your system [here](https://github.com/scrtlabs/SecretNetwork/releases/download/v1.5.0/secretcli-macOS)

Set the file name to `secretcli` and set it as executable

```
mv secretcli-macOS secretcli
chmod 755 secretcli
```

##### MacOS (M1)

Download `secretcli` for your system [here](https://github.com/scrtlabs/SecretNetwork/releases/download/v1.5.0/secretcli-MacOS-arm64)

Set the file name to `secretcli` and set it as executable

```
mv secretcli-macOS secretcli
chmod 755 secretcli
```

For a more detailed and in-depth guide on SecretCLI installation and usage, check out the [documentation](https://docs.scrt.network/secret-network-documentation/development/secret-cli)

### Install the JSON Processor (JQ)

JQ is a JSON processor that is used by the script to create a secret box (you'll run that command as part of the tutorial).

##### Linux/WSL

```bash
sudo apt install jq
```

#### Powershell

Use the `chocolatey` package manager for Windows (information and installation [here](https://chocolatey.org) to install `jq`.

```bash
choco install jq
```

##### MacOS

Install the _Brew_ package manager for Mac:

```bash
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)" < /dev/null 2> /dev/null
```

Then, use `brew` to install `jq`:

```bash
brew install jq
```

Other options for dowloading `jq` can be found [here](https://stedolan.github.io/jq).

If you're interested in learning more, check out the docs [here](https://github.com/stedolan/jq/wiki/jq-Language-Description).

### Install LocalSecret

We recommend using a local chain for development purposes. `LocalSecret` is a complete Secret Network testnet and ecosystem containerized with Docker. It simplifies the way secret contract developers test their contracts in a sandbox before they deploy them on a testnet or mainnet.

> An instance of `LocalSecret` requires approximately 2.5 GB of RAM to run. You may need to increase the resources available in your Docker settings. The installation methods differ based on the processor architecture. This is because Secret Network makes use of Intel SGX to protect private data.

##### x86 (Intel/AMD)

```bash
docker run -it -p 9091:9091 -p 26657:26657 -p 1317:1317 -p 5000:5000 \
  --name localsecret ghcr.io/scrtlabs/localsecret
```

You'll need to configure SecretCLI to work with `LocalSecret`

```bash
secretcli config node http://localhost:26657
secretcli config chain-id secretdev-1
secretcli config keyring-backend test
secretcli config output json
```

##### ARM (Mac M1)

Unfortunately, even `LocalSecret` inside a docker cannot be run on an M1 Mac. As a workaround, we recommend using a LocalSecret instance in a Gitpod environment.

This environment is set up in such a way that can be accessed remotely as well.

To get started, simply click [here](https://gitpod.io/#https://github.com/scrtlabs/GitpodDevEnv).

To connect, prepend the port number with the Gitpod URL. e.g., if the workspace is at `https://secretunive-secretcount-2qzt9b9me7a.ws-us77.gitpod.io` then you would be able to connect to the RPC service at `https://26657-secretunive-secretcount-2qzt9b9me7a.ws-us77.gitpod.io`

To set up SecretCLI to connect to this environment, use the following commands

```bash
secretcli config node https://26657-<your-gitpod-workspace>.gitpod.io
secretcli config chain-id secret-testnet-1
secretcli config keyring-backend test
secretcli config output json
```

For more information, check the main repo at [https://github.com/scrtlabs/GitpodLocalSecret](https://github.com/scrtlabs/GitpodLocalSecret)

## Setup Development

Just a few more things are needed to complete the setup of your development environment for this _Secret Counter Box_.

##### Install Nodejs
Use the installer for your environment [here](https://nodejs.org/en/download/package-manager).

##### Install Yarn
You can find information on installing yarn, getting started, advanced topics and more [here](https://yarnpkg.com). 

##### Install ts-node
`ts-node` is a TypeScript engine for node.js and is used for the integration tests which are written in Typescript.

```bash
npm install -D ts-node
```

### Clone the Repository

Clone the _Secret Counter Box_ repo and then you'll use the build tools to get everything up and running!

```bash
git clone git@github.com:secretuniversity/secret-counter-vuejs-box.git

cd secret-counter-vuejs-box
```

### Launch `LocalSecret`

Open a terminal/powershell window (we'll call this window `LocalSecret`) and start the blockchain:

```bash
cd $HOME/secret-counter-vuejs-box
make localsecret
```

If it's started successfully, output in the terminal should look like this:

```bash
5:31PM INF indexed block exents height=3324 module=txindex
5:31PM INF Timed out dur=4988.420698 height=3325 module=consensus round=0 step=1
5:31PM INF received proposal module=consensus proposal={"Type":32,"block_id":{"hash":"9B4ECD2E92EEEAF887B234CFBC36A4DA6F5947C10AB866E852FEAFDA1483D732","parts":{"hash":"D5C734864617C2F698603CD5859D8D6117760B3D51A572BA65CB8B5E83B3F22F","total":1}},"height":3325,"pol_round":-1,"round":0,"signature":"v4PNeqnkYxKh95+PN75lfj8FSFLRReG7QS0dbyL6l/1WbHKG4u/EpNSTjkmwu7U34SSxNZ1B5sSMMPUtURUMBg==","timestamp":"2022-11-17T17:31:23.623541619Z"}
5:31PM INF received complete proposal block hash=9B4ECD2E92EEEAF887B234CFBC36A4DA6F5947C10AB866E852FEAFDA1483D732 height=3325 module=consensus
5:31PM INF finalizing commit of block hash={} height=3325 module=consensus num_txs=0 root=898C45C249545DA84F97D6935A5BE7D9DAD25687DFB8750E392ED4571159F7A6
5:31PM INF minted coins from module account amount=82438077487uscrt from=mint module=x/bank
5:31PM INF executed block height=3325 module=state num_invalid_txs=0 num_valid_txs=0
5:31PM INF commit synced commit=436F6D6D697449447B5B313337203233392031363520313536203230332031363820323436203620313532203132342032362032323520323330203230362032322031343220313932203131392031373420313333203839203439203733203234322032313920313831203232302039372038352031303620323034203132305D3A4346447D
5:31PM INF committed state app_hash=89EFA59CCBA8F606987C1AE1E6CE168EC077AE85593149F2DBB5DC61556ACC78 height=3325 module=state num_txs=0
```

### Compile and Deploy

Open a 2nd terminal window (we'll call this window `Secret Box Workspace`). This is where we'll build and deploy the initial version of the secret contract.

First, build the secret contract and if successful, run the unit tests.

```bash
cd $HOME/secret-counter-vuejs-box
make build && make test
```

Next, deploy the secret contract. The script below uploads the compiled `contract.wasm` to the `localsecret` and then creates an instance of the contract (assigns a contract address).

```bash
./scripts/create_secret_box.sh
```

If successful, the output should look like this:

```
              <####> Create Secret Box contract <####>
secretcli version in the docker image is: v0.0.0

LocalSecret gRPC: https://9091-secretunive-secretcount-2qzt9b9me7a.ws-us77.gitpod.io

waiting on tx: D9098C49321A18C7CDAC3AB12F7B1EF7FB61CCC17ABEA527E6E990F4E6A3D965
uploaded contract
got contract hash
sending init message: '{"count": 16876}'
waiting on tx: A74A2695F925A96116E955D7925A92AC8622241A1B6F40BA09A5ADE40D7AF4A6

Secret Box created successfully!

secret code id: 1
secret contract address: secret18vd8fpwxzck93qlwghaj6arh4p7c5n8978vsyg
secret contract code hash: 0x8a28d614a769a8b3f472cca3b379b2694c6b483713b22d2f82a33cf354e7e09e

Storing environment variables:

===
=== Use 'source .env' to set the SECRET BOX environment variables in your local bash shell
===

Returning environment variables for Gitpod workspace
```

#### Setup Integration Tests

The integration tests are run using Typescript. We'll install the dependencies **only** at this step.

In the `Secret Box Workspace` terminal, run the following comands:

```bash
cd $HOME/secret-counter-vuejs-box/tests
npm install
```

**Note**: The integration tests will be run after you've completed the contract code in the tutorial.

### Launch the Simple Counter DApp

Finally, in a 3rd terminal window (we'll call this window `Secret Box Frontend`) install the dependencies and launch the Vite dev server.

```bash
cd $HOME/secret-counter-vuejs-box/app
yarn install
yarn dev
```

### Setup Your IDE

There are a few options for your Integrated Development Environment (IDE):

- [VS Code](https://code.visualstudio.com) - Visual Studio Code from Microsoft and has extensions for Rust, Vue, etc.
- [Secret IDE](https://digiline.io) - for Secret Network developers and has pre-defined repos and templates. Plus, the Digiline team would love to get your feedback and suggestions as they build out the features on their roadmap <3.

Or you may prefer a simple editor, which is totally fine. Some of us still use `vi` and `emacs`.

Congratulations! You're now ready to begin the tutorial.

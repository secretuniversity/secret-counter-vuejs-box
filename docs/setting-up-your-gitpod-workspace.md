# Setting Up Your Gitpod Workspace

Your Gitpod workspace is pre-built with the `LocalSecret` docker container, `Rust`, and all the other necessary tools and frameworks needed for this _Secret Box_.

You'll notice that when launching this _Secret Counter Box_ on Gitpod, a terminal is already opened where you'll start the `LocalSecre` blockchain instance like below:

```
make localsecret
```

Then, open another split-screen terminal window to compile, deploy and create your `secret counter` contract:

```
make build && make test
./scripts/create_secret_box.sh
```

The last step is to get the Vite/Vue frontend launched:

```
cd app
yarn dev

```


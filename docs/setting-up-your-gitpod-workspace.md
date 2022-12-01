# Setting Up Your Gitpod Workspace

Your Gitpod workspace is pre-built with the `LocalSecret` docker container, `Rust`, and all the other necessary tools and frameworks needed for this _Secret Box_.

![](/docs/default-gitpod-configuration.png)

In the 1st terminal window, "LocalSecret" in your Gitpod workspace, start the `LocalSecre` blockchain instance:

```
make localsecret
```

You'll see the local blockchain startup and then messages indicating blocks are getting committed.

![](/docs/localsecret-launched.png)

Then, in the 2nd terminal window, "Secret Box Workspace," compile, run unit tests, deploy and create your `secret counter` contract:

```
make build && make test
./scripts/create_secret_box.sh
```
![](/docs/secret-box-setup.png)

The last step is to get the Vite/Vue frontend launched. In the 3rd terminal window, "Secret Box Frontend," launch the Vite server:

```
cd app
yarn dev

```

![](/docs/secret-box-frontend-launched.png)

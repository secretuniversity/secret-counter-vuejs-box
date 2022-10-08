# Secret Box Template ![secret box logo](/docs/logo-32x32.png)

[![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/secretuniversity/secret-box-vite-template)

The Secret Box Template is a Gitpod-enabled quickstart for dapp development on [Secret Network](https://scrt.network).
It consists of a frontend (Vue + Vite + Typescript) and a secret contract (Rust + Secret CosmWasm), based on the [secret counter template](https://github.com/secretuniversity/secret-template-cw1).

## What is a Secret Box?

Secret Boxes are quickstarts or blueprints that contain everything you need to start developing on Secret Network.

They are intended to be run in a developer sandbox so you don't have to worry about installing various tooling, frameworks, etc.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/secretuniversity/secret-box-vuejs-template)

There are a couple of things that make Secret Boxes special :rocket::

- In addition to the secret contract, each box comes with a professionally-designed and implemented frontend, which includes a UI/UX kit.

*This lets you, as the developer, focus on building and can reduce the time it takes to evolve and deploy it as your own Secret App because you don't have to worry about the design. If you are a developer that can also design and implement the UI/UX for your app, you are a special breed indeed. For many developers, this skillset isn't quite in their wheelhouse. One of the major goals for Secret Boxes is to address this need in the Secret Network developer community.*

- Because they're launched in a developer sandbox environment, they can be configured to perform automated tasks such as starting `localsecret` (dockerized Secret Network), compiling your secret contract, deploying and more.


When launched the following automated tasks are kicked off:

- launch an instance of `localsecret`
- build and deploy the secret contract to `localsecret`
- run unit-tests on the secret contract
- instantiate the secret contract
- install app dependencies and launch the frontend using Vite

# Creating a Secret Box

Creating a Secret Box involves one part coding and one part technical writing.

Each Secret Box has an accompanying tutorial hosted on the Secret University website. The tutorial is written in Markdown and can be found in the [tutorial](/app/tutorial/) directory of this repo.

See this [guide](/app/tutorial/guide.md) for more details.

## Setup Your Local Developer Environment

This [Setting Up Your Environment](https://docs.scrt.network/secret-network-documentation/development/getting-started/setting-up-your-environment) guide will help you get going on your journey developing a Secret Box.

In addition to the Secret Contract setup, you will also need to install `Nodejs` and `yarn` for the integration 
tests and frontend app.

### Install Nodejs

Use the installer for your environment [here](https://nodejs.dev/en/download).

### Install Yarn

You can find information on installing `yarn`, getting started, advanced topics and more [here](https://yarnpkg.com).

## Writing Your Guide

Secret Box tutorials are written using Markdown. The tutorial content is placed in `app/tutorial/guide.md` with any accompanying images kept in the `app/tutorial/illustrations` directory.

## Project Structure

```
/
.
├── app
│   ├── public
│   ├── src
│   │   ├── assets
│   │   ├── components
│   └── tutorial
│       └── illustrations
├── docs
├── examples
├── schema
├── scripts
├── src
└── tests
```
## Commands & Usage

### Secret Contract

After creating your own repository using this template, the following commands are run from the root of the project, from a terminal and apply to the secret contracts:

| Command                | Action                                                    |
|:---------------------  |:--------------------------------------------------------  |
| `make build`           | Compiles the secret contract                              |
| `make schema`          | Generates the JSON schema for messages and state files    |
| `make test`            | Runs the secret contract unit tests                       |
| `make localsecret`     | Launches the dockerized `localsecret` developer instance  |
| `make deploy`          | Stores the compiled/optimized contract on `localsecret`   |

## Integration Tests

The integration tests are located under the `tests` directory and uses `secret.js` to interact with the
deployed secret contract. These are great examples of interacting with the Secret Network and can be used
to bootstrap frontend development.

```
npx ts-node integration.ts
```

### Frontend App

These commands apply to the frontend of the Secret Box and are run from the `app` directory:


| Command           | Action                                       |
|:----------------  |:-------------------------------------------- |
| `yarn`         | Installs dependencies                        |
| `yarn dev`     | Starts local Vite dev server at `http://localhost:5173`  |
| `yarn build`   | Build your production site to `./dist/`      |
| `yarn preview` | Preview your build locally, before deploying |


### Connecting from outside Gitpod

To connect, prepend the port number with the gitpod url. e.g. if the workspace is at
`https://secretunive-secretboxvi-zyc1kppqbvk.ws-us69.gitpod.io` then you can connect to the LCD service at
`https://1317-secretunive-secretboxvi-zyc1kppqbvk.ws-us69.gitpod.io`.

# Resources
- [Secret Network docs](https://docs.scrt.network)
- [Secret IDE](https://www.digiline.io/)
- [Gitpod docs](https://www.gitpod.io/docs)

# Contributors
- Laura Weindorf [Github](https://github.com/secetchaingirl)
- Alex (sinplea) [Github](https://github.com/sinplea)
- DDT5 [Github](https://github.com/DDT5)


# Stake Manager

## Installation
To install the necessary dependencies, run the following command:

```bash
npm install
```

or 
```bash
yarn install
```

##Deploying the Contract
To deploy the contract to a local testnet, follow these steps:**

1. Start your local Ethereum testnet, for example using Hardhat Network or Ganache.

2. Deploy the contract:
   
```
npx hardhat run scripts/deploy.js --network localhost
```

Replace localhost with the network of your choice. 

##Testing the Contract
To run the unit tests for the contract:

```
npx hardhat test
```

##Upgrading the Contract
To upgrade your contract:

1. Make necessary changes to your Solidity contract.

2. Open the upgrade.ts file and replace the PROXY constant with the address of your deployed proxy contract. For example:

```
const PROXY = "0xYourDeployedProxyContractAddress";
```

3. Deploy the new contract version using the following command:

```
npx hardhat run scripts/upgrade.ts --network localhost
```
Replace localhost with the network of your choice.
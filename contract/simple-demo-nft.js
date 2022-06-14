

const fs = require('fs');
const path = require('path');
const Arweave = require('arweave');
const { SmartWeaveNodeFactory, LoggerFactory } = require('redstone-smartweave');
//const { default: ArLocal } = require('arlocal');
//const jwk = require("../arweave-key-88-FbW6-fGYKLFyfO5qKZ5xsg5HhUrr2gIt4aIuT_iM.json");

(async () => {
 
//Set up ArLocal
//  const arLocal = new ArLocal(1985, false);
//  await arLocal.start();

// Set up Arweave client
const arweave = Arweave.init({
  host: 'localhost',
  port: 1984,
  protocol: 'http',
});
const wallet = await arweave.wallets.generate();
const walletAddress = await arweave.wallets.getAddress(wallet);
 await arweave.api.get(`/mint/${walletAddress}/1000000000000000`);
 const mine = () => arweave.api.get('mine');

// Set up SmartWeave client
LoggerFactory.INST.logLevel('error');
const smartweave = SmartWeaveNodeFactory.forTesting(arweave);

const contractSrc = fs.readFileSync(
    './nft-contract.js',
    'utf8'
  );
  const initialState = fs.readFileSync(
    './initial-state-nft.json',
    'utf8'
  );
console.log("deploying contract")
  const contractTxId = await smartweave.createContract.deploy({
    wallet: wallet,
    initState: initialState,
    src: contractSrc,
  });
  await mine();

   const contract = smartweave.contract(contractTxId).connect(wallet);
   const state = await contract.readState();
   console.log("contract deployed")
  console.log("contract address", contractTxId)

await mine();


})();
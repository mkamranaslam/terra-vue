<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { Subscription } from 'rxjs';
import { ConnectedWallet, createLCDClient } from '@terra-money/wallet-controller';
import { MsgExecuteContract } from '@terra-money/terra.js';
import { getController } from 'controller';
import { NftTokenInfo } from 'Dtos';
import { create } from 'ipfs-http-client';

const controller = getController();

const connectedWallet = ref<ConnectedWallet | undefined>(undefined);
let tokenCount = ref<number | null>(null);

let subscription: Subscription | null = null;
let fileSelected: File;
let ipfsUrl = ref<any>();
let txResponse = ref<any>();
let showTxResponse = ref<boolean>(false);
let showError = ref<boolean>(false);
let errorMsg = ref<any>();
let showNfts = ref<boolean>(false);
let allNfts = ref<NftTokenInfo[]>(new Array());

onMounted(() => {
    subscription = controller.connectedWallet().subscribe((_connectedWallet) => {
        connectedWallet.value = _connectedWallet;

        if (_connectedWallet) {
            loadNfts();
        } else {
        }
    });
});

onUnmounted(() => {
    subscription?.unsubscribe();
    connectedWallet.value = undefined;
});

async function loadNfts() {
    if (connectedWallet.value) {
        const lcd = createLCDClient({ network: connectedWallet.value.network });
        var tokens_msg = { "tokens": { "owner": connectedWallet.value.terraAddress } };

        let tokens_result: any = [];
        tokens_result = await lcd.wasm.contractQuery('terra1d0ze9zrk77fvzwl46p8qh7ydgzgqdseakklhh2', tokens_msg);
        console.log(tokens_result);
        if (tokens_result) {
            for (var _tokenId of tokens_result.tokens) {
                var info_msg = { "all_nft_info": { "token_id": _tokenId.toString() } };
                let info_result: any = await lcd.wasm.contractQuery('terra1d0ze9zrk77fvzwl46p8qh7ydgzgqdseakklhh2', info_msg);
                allNfts.value.push({
                    tokenId: _tokenId,
                    ipfsUrl: info_result.info.extension.image
                });
            }
            showNfts.value = true;
        }

    }
}

async function mint() {
    const ipfsClient = create({ host: 'ipfs.infura.io', port: 5001, apiPath: '/api/v0', protocol: "https" });
    showError.value = false;
    showTxResponse.value = false;
    console.log(fileSelected.name);

    if (connectedWallet.value) {
        try {

            const lcd = createLCDClient({ network: connectedWallet.value.network });
            var query_msg = { "num_tokens": {} };
            await lcd.wasm.contractQuery(
                'terra1d0ze9zrk77fvzwl46p8qh7ydgzgqdseakklhh2',
                query_msg
            ).then((result: any) => {
                tokenCount.value = result.count;
                console.log(tokenCount);
            });

            const added = await ipfsClient.add(fileSelected)
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            // const url = "";
            ipfsUrl.value = url;

            let tokenId = tokenCount.value ?? 0;
            tokenId += 1;
            var address = connectedWallet.value.terraAddress;
            const mint_query = {
                "mint": {
                    "description": "This is the test nft",
                    "image": url,
                    "name": "test-nft",
                    "owner": address,
                    "token_id": tokenId.toString()
                }
            };

            const exec = [new MsgExecuteContract(address, "terra1d0ze9zrk77fvzwl46p8qh7ydgzgqdseakklhh2", mint_query, undefined)];
            const { result } = await connectedWallet.value.post({ msgs: exec });
            showTxResponse.value = true;
            txResponse.value = result;
            console.log(result);
        } catch (error) {
            console.log(error);
            showError.value = true;
            errorMsg.value = error;
            throw error;
        }
    }
}
function onFileSelected(event: any) {
    event.preventDefault();
    fileSelected = event.target.files[0];
}
</script>

<template>
    <h1>Mint Sample V3</h1>
    <p v-if="!connectedWallet">Wallet not connected!</p>

    <div v-if="connectedWallet">
        <input type="file" v-on:change="onFileSelected" />
        <button v-on:click="mint">Upload to IPFS and Mint</button>
        <p v-show="showTxResponse">IPFS Url: {{ ipfsUrl }}</p>
        <p v-show="showTxResponse">Tx Response: {{ JSON.stringify(txResponse) }}</p>
        <p v-show="showError">errorMsg: {{ errorMsg }}</p>
    </div>
    <br />
    <div v-if="showNfts">
        <h1>NFT's</h1>
        <img v-for="nft in allNfts" :src="nft.ipfsUrl" class height="100" width="100" />
    </div>
</template>

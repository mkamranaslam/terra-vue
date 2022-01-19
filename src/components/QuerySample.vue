<script setup lang="ts">
import { Coins } from '@terra-money/terra.js';
import {
  ConnectedWallet,
  createLCDClient,
} from '@terra-money/wallet-controller';
import { getController } from 'controller';
import { Subscription } from 'rxjs';
import { onMounted, onUnmounted, ref } from 'vue';

const controller = getController();

const connectedWallet = ref<ConnectedWallet | undefined>(undefined);
const balance = ref<Coins | null>(null);
let tokenCount = ref<number | null>(null);

let subscription: Subscription | null = null;

onMounted(() => {
  subscription = controller.connectedWallet().subscribe((_connectedWallet) => {
    connectedWallet.value = _connectedWallet;

    if (_connectedWallet) {
      const lcd = createLCDClient({ network: _connectedWallet.network });

      lcd.bank.balance(_connectedWallet.terraAddress).then(([coins]) => {
        balance.value = coins;
      });

      var query_msg = { "num_tokens": {} };
      lcd.wasm.contractQuery(
        'terra1d0ze9zrk77fvzwl46p8qh7ydgzgqdseakklhh2',
        query_msg
      ).then((result : any) => {
        tokenCount.value = result.count;
        console.log(tokenCount);
      });
    } else {
      balance.value = null;
    }
  });
});

onUnmounted(() => {
  subscription?.unsubscribe();
  connectedWallet.value = undefined;
});
</script>

<template>
  <h1>Query Sample</h1>
  <p v-if="!connectedWallet">Wallet not connected!</p>
  <pre v-else-if="!!balance">{{ balance.toString() }}</pre>
  <pre v-if="!!tokenCount">num_tokens {{ tokenCount.toString() }}</pre>
</template>

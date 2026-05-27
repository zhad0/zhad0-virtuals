# @zhad0/virtuals-adapter

[![Status](https://img.shields.io/badge/status-live-00d26a.svg)](https://zhad0.io) [![npm](https://img.shields.io/npm/v/@zhad0/virtuals-adapter.svg)](https://www.npmjs.com/package/@zhad0/virtuals-adapter) [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

ZHAD0 Protocol adapter for [Virtuals Protocol](https://github.com/Virtual-Protocol/virtuals-python) agents — privacy-preserving intent submission on Base L2.

Wraps any Virtuals `GameAgent` so its on-chain intents are encrypted with AES-256-GCM before submission, shielding agent strategies from MEV bots and on-chain observers.

---

## What works today vs what is coming

| Feature | Status |
|---------|--------|
| AES-256-GCM intent encryption | **Live** |
| Intent hash fingerprinting | **Live** |
| `withPrivacy()` one-line agent wrapper | **Live** |
| `zhad0Privacy` class adapter | **Live** |
| ZK validity proofs (RISC Zero) | Coming — mainnet launch |
| Ghost Relay network on Base | Coming — mainnet launch |
| On-chain execution | Coming — mainnet launch |

---

## Install

```bash
npm install @zhad0/virtuals-adapter @zhad0/sdk
```

> `@virtuals-protocol/game` must already be installed as a peer dependency.

---

## Usage

### Option A: `withPrivacy()` — one-line wrap

```ts
import { GameAgent } from "@virtuals-protocol/game";
import { withPrivacy } from "@zhad0/virtuals-adapter";

const agent = new GameAgent(process.env.VIRTUALS_API_KEY!, {
  name: "my-trading-agent",
  goal: "Maximize yield on Base while protecting strategy from MEV",
  description: "Trades on Base L2 using ZHAD0 private intent submission.",
});

// All agent.submitIntent() calls are now encrypted
const privateAgent = withPrivacy(agent, {
  network: "base-mainnet",
  relayerMode: "simulated", // "ghost" once mainnet is live
});

await privateAgent.init();
```

### Option B: `zhad0Privacy` class

```ts
import { zhad0Privacy } from "@zhad0/virtuals-adapter";

const zhad0 = new zhad0Privacy({
  network: "base-mainnet",
  relayerMode: "simulated",
  onEncrypt: (hash) => console.log("Encrypted intent:", hash),
});

// Submit a private SWAP intent
const receipt = await zhad0.submitIntent({
  action: "SWAP",
  tokenIn:  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
  tokenOut: "0x4200000000000000000000000000000000000006", // WETH on Base
  amountIn: "1000000000",  // 1000 USDC
  amountOutMin: "0",
});

console.log(receipt.intentHash); // 0x...
console.log(receipt.status);     // "SIMULATED_OK"

// Encrypt only (no submission)
const encrypted = await zhad0.encryptOnly({ action: "TRANSFER", target: "0x...", amountIn: "1000" });
console.log(encrypted.iv, encrypted.ciphertext);

// Check live capabilities
const status = zhad0.status();
// { encryption: true, zkProofs: false, ghostRelay: false }
```

---

## API

### `withPrivacy(agent, config?)`

Wraps an existing Virtuals `GameAgent` (or any object with `submitIntent`) with ZHAD0 privacy.

```ts
withPrivacy(agent: T, config?: Zhad0VirtualsConfig): T
```

Config options:

```ts
{
  relayerMode?: "ghost" | "simulated",           // default: "simulated"
  network?: "base-mainnet" | "base-sepolia",     // default: "base-mainnet"
  onEncrypt?: (intentHash: string) => void,      // called after encryption
}
```

### `zhad0Privacy`

```ts
new zhad0Privacy(config?)

.submitIntent(intent: Intent): Promise<SubmitReceipt>
.encryptOnly(intent: Intent): Promise<{ intentHash, ciphertext, iv }>
.status(): { encryption: boolean, zkProofs: boolean, ghostRelay: boolean }
```

### Intent type

```ts
{
  action: "SWAP" | "TRANSFER" | "LP_ADD" | "LP_REMOVE" | "BRIDGE" | "CUSTOM";
  tokenIn?: string;       // ERC-20 address
  tokenOut?: string;      // ERC-20 address
  amountIn?: string;      // wei string
  amountOutMin?: string;  // slippage floor
  target?: string;        // address for TRANSFER / CUSTOM
  calldata?: string;      // hex for CUSTOM
  metadata?: Record<string, unknown>;
}
```

---

## Architecture

```
Virtuals GameAgent
  └── withPrivacy() / zhad0Privacy
        └── Zhad0Client  (@zhad0/sdk)
              ├── encryptIntent()    AES-256-GCM  — LIVE
              ├── generateProof()    RISC Zero    — mainnet pending
              └── submitToRelay()    Ghost Relay  — mainnet pending
```

---

## Links

- [ZHAD0 Protocol](https://zhad0.io)
- [SDK (`@zhad0/sdk`)](https://github.com/zhad0/zhad0-sdk)
- [ElizaOS Plugin (`@zhad0/eliza-plugin`)](https://github.com/zhad0/zhad0-eliza)
- [REST API](https://github.com/zhad0/zhad0-api)
- [Documentation](https://github.com/zhad0/zhad0-docs)
- [Virtuals Protocol](https://github.com/Virtual-Protocol/virtuals-python)

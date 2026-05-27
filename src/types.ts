import type { Intent } from "@zhad0/sdk";

export interface Zhad0VirtualsConfig {
  /**
   * Relayer mode.
   * "simulated" (default) — encryption live, relay simulated until mainnet.
   * "ghost" — live Ghost Relay once Base mainnet is deployed.
   */
  relayerMode?: "ghost" | "simulated";

  /** Base network. Default: "base-mainnet" (chain ID 8453). */
  network?: "base-mainnet" | "base-sepolia";

  /** Called after each intent is encrypted, before relay submission. */
  onEncrypt?: (intentHash: string) => void;
}

/** Any object with a submitIntent method can be wrapped. */
export interface PrivateAgentFunction {
  submitIntent: (intent: Intent) => Promise<unknown>;
}

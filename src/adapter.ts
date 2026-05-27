import { Zhad0Client } from "@zhad0/sdk";
import type { Intent, SubmitReceipt } from "@zhad0/sdk";
import type { Zhad0VirtualsConfig } from "./types.js";

/**
 * ZHAD0 privacy adapter for Virtuals Protocol agents.
 *
 * Wraps any Virtuals agent function to encrypt intents with AES-256-GCM
 * before submission, hiding the agent's strategy from MEV bots and
 * on-chain observers.
 *
 * @example
 * ```ts
 * import { GameAgent } from "@virtuals-protocol/game";
 * import { zhad0Privacy } from "@zhad0/virtuals-adapter";
 *
 * const agent = new GameAgent(API_KEY, { name: "my-agent", goal: "..." });
 * const privateSubmit = zhad0Privacy();
 *
 * // Instead of submitting intents directly:
 * const receipt = await privateSubmit.submitIntent({
 *   action: "SWAP",
 *   tokenIn: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
 *   tokenOut: "0x4200000000000000000000000000000000000006",
 *   amountIn: "1000000000",
 * });
 * ```
 */
export class zhad0Privacy {
  private client: Zhad0Client;
  private config: Required<Zhad0VirtualsConfig>;

  constructor(config?: Zhad0VirtualsConfig) {
    this.config = {
      relayerMode: config?.relayerMode ?? "simulated",
      network: config?.network ?? "base-mainnet",
      onEncrypt: config?.onEncrypt ?? (() => undefined),
    };
    this.client = new Zhad0Client({
      relayerMode: this.config.relayerMode,
      network: this.config.network,
    });
  }

  /**
   * Encrypt and submit an intent privately via ZHAD0.
   *
   * Encryption: AES-256-GCM (live).
   * ZK proof + Ghost Relay: simulated until Base mainnet launch.
   */
  async submitIntent(intent: Intent): Promise<SubmitReceipt> {
    const receipt = await this.client.submitIntent(intent);
    this.config.onEncrypt(receipt.intentHash);
    return receipt;
  }

  /**
   * Encrypt an intent without submitting (useful for logging / testing).
   */
  async encryptOnly(intent: Intent): Promise<{ intentHash: string; ciphertext: string; iv: string }> {
    const { encryptIntent } = await import("@zhad0/sdk");
    const result = await encryptIntent(intent);
    return {
      intentHash: result.intentHash,
      ciphertext: result.ciphertext,
      iv: result.iv,
    };
  }

  /** Protocol status snapshot. */
  status(): { encryption: boolean; zkProofs: boolean; ghostRelay: boolean } {
    return {
      encryption: true,  // AES-256-GCM: live
      zkProofs: false,   // RISC Zero: coming
      ghostRelay: false, // Base mainnet: coming
    };
  }
}

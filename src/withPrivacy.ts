import { Zhad0Client, wrapAgent } from "@zhad0/sdk";
import type { Zhad0VirtualsConfig } from "./types.js";

/**
 * One-line wrapper: add ZHAD0 privacy to any Virtuals agent that
 * already has a `submitIntent` method.
 *
 * @example
 * ```ts
 * import { GameAgent } from "@virtuals-protocol/game";
 * import { withPrivacy } from "@zhad0/virtuals-adapter";
 *
 * const agent = new GameAgent(API_KEY, { name: "my-agent", goal: "trade" });
 * const privateAgent = withPrivacy(agent);
 *
 * // Now all agent.submitIntent() calls are encrypted:
 * await privateAgent.submitIntent({ action: "SWAP", ... });
 * ```
 */
export function withPrivacy<T extends object>(
  agent: T,
  config?: Zhad0VirtualsConfig,
): T {
  const client = new Zhad0Client({
    relayerMode: config?.relayerMode ?? "simulated",
    network: config?.network ?? "base-mainnet",
  });
  return wrapAgent(agent, client) as T;
}

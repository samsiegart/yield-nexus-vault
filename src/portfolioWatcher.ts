import { AgoricChainStoragePathKind as Kind } from "@agoric/rpc";
import { Position, usePortfolioStore } from "./store";

/**
 * Set up watchers to track the user's on-chain portfolio positions in real-data mode.
 *
 * @param offersMap Map from offer IDs to publicSubscriber info (from useAgoric().offerIdsToPublicSubscribers)
 * @param chainStorageWatcher Chain storage watcher (from useAgoric())
 * @returns A cleanup function that stops all active watchers
 */
export function setupPortfolioWatcher(
  offersMapInput:
    | Map<string, Record<string, string>>
    | Record<string, Record<string, string>>
    | undefined,
  chainStorageWatcherInput: unknown
) {
  // ChainStorageWatcher from @agoric/react-components is not exported with a TS type.
  // We treat it as unknown here and cast where required.
  const chainStorageWatcher = chainStorageWatcherInput as {
    watchLatest: <T>(
      path: [typeof Kind.Data | typeof Kind.Children, string],
      cb: (value: T) => void
    ) => () => void;
  };

  if (!chainStorageWatcher) {
    return () => {};
  }

  // Access zustand store outside React.
  const { setPositions } = usePortfolioStore.getState();

  // Fetch Noble APY once and cache
  let cachedNobleApy = 0;
  async function initNobleApy() {
    try {
      const res = await fetch("https://worker.dollar.noble.xyz/");
      if (res.ok) {
        const json = await res.json();
        const bps = Number(json.earner_rate);
        if (Number.isFinite(bps)) {
          cachedNobleApy = bps / 100;
        }
      }
    } catch (e) {
      // ignore
    }
  }
  initNobleApy();

  // --- Helper to convert chain data into UI Position object -------------
  const toPosition = (vstoragePath: string, raw: unknown): Position => {
    const data = raw as Record<string, unknown>;
    const tokenNameFromPath = vstoragePath.split(".").pop() ?? "Unknown";

    // Protocol from chain data (e.g. "USDN")
    const rawProtocol =
      (data.protocol as string | undefined) ?? tokenNameFromPath;

    // Normalize special cases
    let protocol: string = rawProtocol;
    let name: string = rawProtocol;
    let chain: string = "Agoric";
    let apyVal = 0;

    if (rawProtocol.toUpperCase() === "USDN") {
      // USDN positions live on Noble
      protocol = "Noble"; // For icon mapping
      name = "USDN"; // Pool token name
      chain = "Noble";
      apyVal = cachedNobleApy;
    }

    const netTransfers = data.netTransfers as
      | Record<string, unknown>
      | undefined;
    const amountRaw: number = Number((netTransfers?.value as unknown) ?? 0);
    // Assume 6-decimal stable-coins for now – adjust as needed.
    const value = amountRaw / 1_000_000;

    return {
      id: vstoragePath,
      protocol,
      name,
      apy: apyVal,
      chain,
      value,
      percentage: 0,
      targetPercentage: 0,
    };
  };

  // ------------------------------------------------------------
  // Step 1: Locate the portfolio vstorage path from walletConnection
  // ------------------------------------------------------------
  const offers = offersMapInput;

  console.debug("[PortfolioWatcher] offerIdsToPublicSubscribers:", offers);

  if (!offers) {
    // Nothing to watch yet
    return () => {};
  }

  let portfolioPath: string | undefined;

  const iterate =
    offers instanceof Map ? offers.values() : Object.values(offers);

  for (const entry of iterate) {
    if (entry && typeof entry === "object" && "portfolio" in entry) {
      portfolioPath = (entry as Record<string, string>).portfolio;
      console.debug(
        "[PortfolioWatcher] Found portfolio vstorage path:",
        portfolioPath
      );
      break;
    }
  }

  if (!portfolioPath) {
    console.debug(
      "[PortfolioWatcher] No portfolio path found – user may have no positions yet."
    );
    // No portfolio found – user likely has no positions yet.
    return () => {};
  }

  // ------------------------------------------------------------
  // Step 2: Watch children of the positions node to discover tokens
  // ------------------------------------------------------------
  // Keep inner watchers so we can clean them up.
  const innerStops: Array<() => void> = [];

  const positionsRoot = `${portfolioPath}.positions`;
  console.debug("[PortfolioWatcher] Watching positions root:", positionsRoot);
  let lastTokenPathSet = new Set<string>();

  const childWatcherStop = chainStorageWatcher.watchLatest<
    Array<[string, unknown]>
  >([Kind.Children, positionsRoot], (entries: unknown[]) => {
    console.debug(
      "[PortfolioWatcher] Child entries under positions root:",
      entries
    );

    const tokenPaths = entries.map((entry) => {
      const suffix = Array.isArray(entry)
        ? (entry[0] as string)
        : (entry as string);
      return `${positionsRoot}.${suffix}`;
    });

    console.debug("[PortfolioWatcher] Derived token paths:", tokenPaths);

    // Skip if token paths unchanged
    const newSet = new Set(tokenPaths);
    if (
      newSet.size === lastTokenPathSet.size &&
      [...newSet].every((p) => lastTokenPathSet.has(p))
    ) {
      return;
    }
    lastTokenPathSet = newSet;

    subscribeToPositionTokens(tokenPaths);
  });

  function subscribeToPositionTokens(tokenPaths: string[]) {
    // Clean up any previous token watchers
    innerStops.splice(0, innerStops.length).forEach((stop) => stop());

    const collected: Record<string, unknown> = {};

    tokenPaths.forEach((path) => {
      const stop = chainStorageWatcher.watchLatest<unknown>(
        [Kind.Data, path],
        (value) => {
          console.debug("[PortfolioWatcher] Received data for", path, value);
          collected[path] = value;

          // Convert collected map to positions array
          const positionsArr = Object.entries(collected).map(([p, v]) =>
            toPosition(p, v)
          );
          console.debug(
            "[PortfolioWatcher] Updating store positions:",
            positionsArr
          );
          setPositions(positionsArr);

          // Update overall balance
          const total = positionsArr.reduce((sum, p) => sum + p.value, 0);
          usePortfolioStore.getState().setCurrentBalance(total);

          // We no longer modify dataMode here. Real-data mode remains active; UI reacts to positions length.
        }
      );
      innerStops.push(stop);
    });
  }

  // Return cleanup function
  return () => {
    childWatcherStop();
    innerStops.forEach((stop) => stop());
  };
}

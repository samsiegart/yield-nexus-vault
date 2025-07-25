import { AgoricChainStoragePathKind as Kind } from "@agoric/rpc";
import { Position, usePortfolioStore } from "./store";
import { BASE_STRATEGIES } from "@/constants/strategies";

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
  const { setPositions, setTargetAllocations } = usePortfolioStore.getState();

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
  const toPosition = (
    vstoragePath: string,
    raw: unknown,
    targetAllocations: Record<string, number>
  ): Position => {
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

    const strategy = BASE_STRATEGIES.find(
      (s) => s.protocol.toUpperCase() === protocol.toUpperCase()
    );
    const targetPercentage =
      (strategy && targetAllocations[strategy.allocationKey]) ?? 0;

    const netTransfers = data.netTransfers as
      | Record<string, unknown>
      | undefined;
    const amountRaw: number = Number((netTransfers?.value as unknown) ?? 0);
    // Assume 6-decimal stable-coins for now – adjust as needed.
    const value = amountRaw / 1_000_000;

    return {
      id: vstoragePath,
      allocationKey: strategy?.allocationKey ?? "",
      protocol,
      name,
      apy: apyVal,
      chain,
      value,
      percentage: 0,
      targetPercentage,
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
  // Step 2: Watch the portfolio root for target allocations
  // ------------------------------------------------------------
  type RawAllocationValue =
    | number
    | bigint
    | string
    | { value: string | number | bigint };

  const rootWatcherStop = chainStorageWatcher.watchLatest<
    Record<string, unknown>
  >([Kind.Data, portfolioPath], (data) => {
    if (data && data.targetAllocation) {
      const rawAllocations = data.targetAllocation as Record<
        string,
        RawAllocationValue
      >;
      const allocations: Record<string, number> = {};
      for (const key in rawAllocations) {
        const rawValue = rawAllocations[key];
        let numVal: number | undefined;
        if (typeof rawValue === "number") {
          numVal = rawValue;
        } else if (typeof rawValue === "bigint") {
          numVal = Number(rawValue);
        } else if (typeof rawValue === "string") {
          const num = Number(rawValue);
          if (!isNaN(num)) {
            numVal = num;
          }
        } else if (rawValue && typeof rawValue.value !== "undefined") {
          const num = Number(rawValue.value);
          if (!isNaN(num)) {
            numVal = num;
          }
        }

        if (numVal !== undefined) {
          allocations[key] = numVal;
        }
      }
      console.debug(
        "[PortfolioWatcher] Received and parsed target allocations:",
        allocations
      );
      setTargetAllocations(allocations);
    }
  });

  // ------------------------------------------------------------
  // Step 3: Watch children of the positions node to discover tokens
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

          // Get latest target allocations from store
          const { targetAllocations } = usePortfolioStore.getState();

          // Convert collected map to positions array
          const positionsArr = Object.entries(collected).map(([p, v]) =>
            toPosition(p, v, targetAllocations)
          );
          console.debug(
            "[PortfolioWatcher] Updating store positions:",
            positionsArr
          );

          // Augment with strategies that have a target alloc but no position
          const existingAllocationKeys = new Set(
            positionsArr.map((p) => p.allocationKey)
          );
          Object.entries(targetAllocations).forEach(
            ([allocationKey, target]) => {
              if (target > 0 && !existingAllocationKeys.has(allocationKey)) {
                const strategy = BASE_STRATEGIES.find(
                  (s) => s.allocationKey === allocationKey
                );
                if (strategy) {
                  const vstoragePath = `${positionsRoot}.${strategy.id}`;
                  positionsArr.push({
                    id: vstoragePath,
                    allocationKey: strategy.allocationKey,
                    protocol: strategy.protocol,
                    name: strategy.name,
                    apy: 0, // No position, so no APY to fetch
                    chain: strategy.chain,
                    value: 0,
                    percentage: 0,
                    targetPercentage: target,
                  });
                }
              }
            }
          );

          // Update overall balance and calculate percentages
          const total = positionsArr.reduce((sum, p) => sum + p.value, 0);
          usePortfolioStore.getState().setCurrentBalance(total);

          const positionsWithPercentages = positionsArr.map((p) => ({
            ...p,
            percentage: total > 0 ? (p.value / total) * 100 : 0,
          }));

          setPositions(positionsWithPercentages);
        }
      );
      innerStops.push(stop);
    });
  }

  // Return cleanup function
  return () => {
    childWatcherStop();
    rootWatcherStop();
    innerStops.forEach((stop) => stop());
  };
}

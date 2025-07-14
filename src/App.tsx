import { AgoricProvider } from "@agoric/react-components";
import { wallets } from "cosmos-kit";
import { ThemeProvider, useTheme } from "@interchain-ui/react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useAgoric } from "@agoric/react-components";
import { setupPortfolioWatcher } from "./portfolioWatcher";
import { usePortfolioStore } from "./store";
import { fetchPortfolioData } from "./queries/portfolioQueries";
import { FeedbackButton } from "./components/FeedbackButton";
import "@agoric/react-components/dist/style.css";

const queryClient = new QueryClient();

const InnerApp = () => {
  const { themeClass } = useTheme();

  interface AgoricExtended {
    walletConnection?: unknown;
    chainStorageWatcher?: unknown;
    offerIdsToPublicSubscribers?:
      | Map<string, Record<string, string>>
      | Record<string, Record<string, string>>;
  }

  const { walletConnection, chainStorageWatcher, offerIdsToPublicSubscribers } =
    useAgoric() as AgoricExtended;
  const {
    setLoading,
    setError,
    setPortfolioData,
    reset,
    resetData,
    isLoaded,
    dataMode,
  } = usePortfolioStore();

  // Force reload when dataMode changes
  useEffect(() => {
    // Reset only data but preserve dataMode when dataMode changes to force reload
    resetData();
  }, [dataMode, resetData]);

  useEffect(() => {
    const loadPortfolioData = async () => {
      // In real-data mode, we'll rely on the portfolioWatcher for data instead of mock fetches.
      if (dataMode === "real-data") {
        return;
      }

      // Don't reload if already loaded
      if (isLoaded) {
        return;
      }

      try {
        setLoading(true);
        const data = await fetchPortfolioData(dataMode);
        setPortfolioData(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load portfolio data"
        );
      }
    };

    loadPortfolioData();
  }, [
    walletConnection,
    setLoading,
    setError,
    setPortfolioData,
    resetData,
    isLoaded,
    dataMode,
  ]);

  // --------------------------------------------------
  // On wallet connection (real-data mode) set up portfolio watchers
  // --------------------------------------------------
  useEffect(() => {
    if (
      dataMode !== "real-data" ||
      !offerIdsToPublicSubscribers ||
      !chainStorageWatcher
    ) {
      return;
    }
    console.debug("[App] Setting up portfolio watcher");

    const stop = setupPortfolioWatcher(
      offerIdsToPublicSubscribers,
      chainStorageWatcher
    );
    return () => {
      if (typeof stop === "function") {
        stop();
      }
    };
  }, [dataMode, offerIdsToPublicSubscribers, chainStorageWatcher]);

  return (
    <div className={themeClass}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <FeedbackButton />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </div>
  );
};

const App = () => (
  <ThemeProvider>
    <AgoricProvider
      wallets={wallets.extension}
      agoricNetworkConfigs={[
        {
          testChain: {
            chainId: "agoricdev-25",
            chainName: "agoric-devnet",
          },
          apis: {
            rest: ["https://devnet.api.agoric.net"],
            rpc: ["https://devnet.rpc.agoric.net"],
          },
        },
      ]}
      defaultChainName="agoric-devnet"
    >
      <InnerApp />
    </AgoricProvider>
  </ThemeProvider>
);

export default App;

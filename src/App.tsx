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
import { usePortfolioStore } from "./store";
import { fetchPortfolioData } from "./queries/portfolioQueries";
import "@agoric/react-components/dist/style.css";

const queryClient = new QueryClient();

const InnerApp = () => {
  const { themeClass } = useTheme();
  const { walletConnection } = useAgoric();
  const { setLoading, setError, setPortfolioData, reset, isLoaded } =
    usePortfolioStore();

  useEffect(() => {
    const loadPortfolioData = async () => {
      if (!walletConnection) {
        // Reset store when wallet disconnects
        reset();
        return;
      }

      // Don't reload if already loaded
      if (isLoaded) {
        return;
      }

      try {
        setLoading(true);
        const data = await fetchPortfolioData();
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
    reset,
    isLoaded,
  ]);

  return (
    <div className={themeClass}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
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

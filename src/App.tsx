import { AgoricProvider } from "@agoric/react-components";
import { wallets } from "cosmos-kit";
import { ThemeProvider, useTheme } from "@interchain-ui/react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import "@agoric/react-components/dist/style.css";

const queryClient = new QueryClient();

const InnerApp = () => {
  const { themeClass } = useTheme();

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

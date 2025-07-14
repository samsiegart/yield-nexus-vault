import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import WalletConnection from "@/components/WalletConnection";
import StrategyDashboard from "@/components/StrategyDashboard";
import DepositInterface from "@/components/DepositInterface";
import PerformanceView from "@/components/PerformanceView";
import OpportunitiesView from "@/components/OpportunitiesView";
import ActivityView from "@/components/ActivityView";
import CreatePortfolioView from "@/components/CreatePortfolioView";
import { useAgoric } from "@agoric/react-components";
import { usePortfolioStore, DataMode } from "@/store";
import {
  Wallet,
  TrendingUp,
  Shield,
  Zap,
  MessageCircle,
  X,
  Code,
  ChevronDown,
} from "lucide-react";
import { useLocation } from "react-router-dom";

const Index = () => {
  const [selectedStrategies, setSelectedStrategies] = useState([]);
  const [currentView, setCurrentView] = useState("dashboard");
  const [showChatbot, setShowChatbot] = useState(false);
  const chatIframeRef = useRef(null);
  const location = useLocation();
  const { address } = useAgoric();
  const { positions, dataMode, setDataMode } = usePortfolioStore();

  // Determine if we should show onboarding view
  const shouldShowOnboarding =
    !address ||
    dataMode === "no-positions" ||
    (dataMode === "real-data" && positions.length === 0);

  let queryParams = `?title=${encodeURIComponent("Max Chat")}`;
  queryParams += `&theme=${encodeURIComponent("dark-blue")}`;
  if (address) {
    queryParams += `&context=${encodeURIComponent(
      JSON.stringify({ address })
    )}`;
  }
  queryParams += `&hideReasoning=${encodeURIComponent("true")}`;

  // Sync view with navigation state if provided
  useEffect(() => {
    const view = (location.state as { view?: string } | null)?.view;
    if (
      view &&
      [
        "dashboard",
        "deposit",
        "performance",
        "opportunities",
        "activity",
      ].includes(view)
    ) {
      setCurrentView(view);
    }
  }, [location.state]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">YMax</h1>
            </div>
            <div className="flex items-center space-x-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50 hover:text-white"
                    variant="outline"
                    size="sm"
                  >
                    <Code className="w-4 h-4 mr-2" />
                    {dataMode === "no-positions" && "Mock Create Portfolio"}
                    {dataMode === "has-positions" && "Mock Portfolio"}
                    {dataMode === "real-data" && "Devnet"}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="bg-slate-800 border-slate-600 text-white"
                  align="end"
                >
                  <DropdownMenuRadioGroup
                    value={dataMode}
                    onValueChange={(value) => setDataMode(value as DataMode)}
                  >
                    <DropdownMenuRadioItem
                      value="no-positions"
                      className="text-white focus:bg-slate-700 focus:text-white"
                    >
                      Mock Create Portfolio
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="has-positions"
                      className="text-white focus:bg-slate-700 focus:text-white"
                    >
                      Mock Portfolio
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="real-data"
                      className="text-white focus:bg-slate-700 focus:text-white"
                    >
                      Devnet
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                onClick={() => setShowChatbot(!showChatbot)}
                className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50 hover:text-white"
                variant="outline"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Ask Max
              </Button>
              <WalletConnection />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {shouldShowOnboarding ? (
          <CreatePortfolioView />
        ) : (
          <>
            {/* Navigation */}
            <div className="flex space-x-4 mb-8">
              <Button
                variant={currentView === "dashboard" ? "default" : "outline"}
                onClick={() => setCurrentView("dashboard")}
                className={
                  currentView === "dashboard"
                    ? "bg-blue-600 hover:bg-blue-700 text-white border-0"
                    : "bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50 hover:text-white"
                }
              >
                Strategies
              </Button>
              <Button
                variant={currentView === "deposit" ? "default" : "outline"}
                onClick={() => setCurrentView("deposit")}
                className={
                  currentView === "deposit"
                    ? "bg-purple-600 hover:bg-purple-700 text-white border-0"
                    : "bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50 hover:text-white"
                }
              >
                Manage Positions
              </Button>
              <Button
                variant={
                  currentView === "opportunities" ? "default" : "outline"
                }
                onClick={() => setCurrentView("opportunities")}
                className={
                  currentView === "opportunities"
                    ? "bg-yellow-600 hover:bg-yellow-700 text-white border-0"
                    : "bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50 hover:text-white"
                }
              >
                All Opportunities
              </Button>
              <Button
                variant={currentView === "activity" ? "default" : "outline"}
                onClick={() => setCurrentView("activity")}
                className={
                  currentView === "activity"
                    ? "bg-green-600 hover:bg-green-700 text-white border-0"
                    : "bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50 hover:text-white"
                }
              >
                Activity
              </Button>
            </div>

            {/* Content */}
            {currentView === "dashboard" && (
              <StrategyDashboard
                onSelectStrategy={(strategy) => {
                  setSelectedStrategies([...selectedStrategies, strategy]);
                  setCurrentView("deposit");
                }}
                onSelectPresetStrategies={(strategies) => {
                  setSelectedStrategies(strategies);
                  setCurrentView("deposit");
                }}
                onNavigateToDeposit={() => setCurrentView("deposit")}
                onNavigateToOpportunities={() =>
                  setCurrentView("opportunities")
                }
              />
            )}

            {currentView === "deposit" && (
              <DepositInterface
                selectedStrategies={selectedStrategies}
                onUpdateStrategies={setSelectedStrategies}
              />
            )}

            {currentView === "performance" && <PerformanceView />}

            {currentView === "opportunities" && <OpportunitiesView />}

            {currentView === "activity" && <ActivityView />}
          </>
        )}
      </main>

      {/* Chatbot */}
      {showChatbot && (
        <div className="iframe-container">
          <div className="chat-header">
            <h3 className="chat-title">Ask Max</h3>
            <Button
              onClick={() => setShowChatbot(false)}
              variant="ghost"
              size="sm"
              className="chat-close-button"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <iframe
            ref={chatIframeRef}
            src={`https://chat.agoric.net${queryParams}`}
            title="Agoric Community Chat"
            className="chat-iframe"
            sandbox="allow-scripts allow-same-origin allow-forms"
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default Index;

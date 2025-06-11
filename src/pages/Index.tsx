
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import WalletConnection from '@/components/WalletConnection';
import StrategyDashboard from '@/components/StrategyDashboard';
import DepositInterface from '@/components/DepositInterface';
import { Wallet, TrendingUp, Shield, Zap } from 'lucide-react';

const Index = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [selectedStrategies, setSelectedStrategies] = useState([]);
  const [currentView, setCurrentView] = useState('dashboard');

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
              <h1 className="text-2xl font-bold text-white">YieldMax</h1>
            </div>
            <WalletConnection 
              isConnected={walletConnected} 
              onConnect={() => setWalletConnected(true)}
              onDisconnect={() => setWalletConnected(false)}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!walletConnected ? (
          <div className="text-center py-20">
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Wallet className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Maximize Your USDC Yield
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Access the best DeFi yield strategies across multiple chains. 
                Deposit, withdraw, and rebalance with a single transaction.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
              <Card className="bg-white/5 border-white/10 text-white">
                <CardHeader className="text-center">
                  <Shield className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <CardTitle className="text-white">Multi-Chain Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Deploy across Ethereum, Arbitrum, Polygon, Base, and more
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 text-white">
                <CardHeader className="text-center">
                  <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <CardTitle className="text-white">Optimized Yields</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Access Aave, Compound, Yearn, Beefy, and top protocols
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 text-white">
                <CardHeader className="text-center">
                  <Zap className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <CardTitle className="text-white">One-Click Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Deposit, withdraw, and rebalance in single transactions
                  </p>
                </CardContent>
              </Card>
            </div>

            <p className="text-gray-400 mb-8">
              Connect your wallet to get started
            </p>
          </div>
        ) : (
          <div>
            {/* Navigation */}
            <div className="flex space-x-4 mb-8">
              <Button 
                variant={currentView === 'dashboard' ? 'default' : 'outline'}
                onClick={() => setCurrentView('dashboard')}
                className={currentView === 'dashboard' 
                  ? "bg-blue-600 hover:bg-blue-700 text-white" 
                  : "border-white/20 text-white hover:bg-white/10"
                }
              >
                Strategies
              </Button>
              <Button 
                variant={currentView === 'deposit' ? 'default' : 'outline'}
                onClick={() => setCurrentView('deposit')}
                className={currentView === 'deposit' 
                  ? "bg-purple-600 hover:bg-purple-700 text-white" 
                  : "border-white/20 text-white hover:bg-white/10"
                }
              >
                Manage Positions
              </Button>
            </div>

            {/* Content */}
            {currentView === 'dashboard' && (
              <StrategyDashboard 
                onSelectStrategy={(strategy) => {
                  setSelectedStrategies([...selectedStrategies, strategy]);
                  setCurrentView('deposit');
                }}
              />
            )}

            {currentView === 'deposit' && (
              <DepositInterface 
                selectedStrategies={selectedStrategies}
                onUpdateStrategies={setSelectedStrategies}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;

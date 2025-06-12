
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import WalletConnection from '@/components/WalletConnection';
import StrategyDashboard from '@/components/StrategyDashboard';
import DepositInterface from '@/components/DepositInterface';
import PerformanceView from '@/components/PerformanceView';
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
        {/* Navigation */}
        <div className="flex space-x-4 mb-8">
          <Button 
            variant={currentView === 'dashboard' ? 'default' : 'outline'}
            onClick={() => setCurrentView('dashboard')}
            className={currentView === 'dashboard' 
              ? "bg-blue-600 hover:bg-blue-700 text-white border-0" 
              : "bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50 hover:text-white"
            }
          >
            Strategies
          </Button>
          <Button 
            variant={currentView === 'deposit' ? 'default' : 'outline'}
            onClick={() => setCurrentView('deposit')}
            className={currentView === 'deposit' 
              ? "bg-purple-600 hover:bg-purple-700 text-white border-0" 
              : "bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50 hover:text-white"
            }
          >
            Deposit
          </Button>
          <Button 
            variant={currentView === 'performance' ? 'default' : 'outline'}
            onClick={() => setCurrentView('performance')}
            className={currentView === 'performance' 
              ? "bg-green-600 hover:bg-green-700 text-white border-0" 
              : "bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50 hover:text-white"
            }
          >
            Performance
          </Button>
        </div>

        {/* Content */}
        {currentView === 'dashboard' && (
          <StrategyDashboard 
            onSelectStrategy={(strategy) => {
              setSelectedStrategies([...selectedStrategies, strategy]);
              setCurrentView('deposit');
            }}
            onSelectPresetStrategies={(strategies) => {
              setSelectedStrategies(strategies);
              setCurrentView('deposit');
            }}
            walletConnected={walletConnected}
          />
        )}

        {currentView === 'deposit' && (
          <DepositInterface 
            selectedStrategies={selectedStrategies}
            onUpdateStrategies={setSelectedStrategies}
            walletConnected={walletConnected}
            onConnectWallet={() => setWalletConnected(true)}
          />
        )}

        {currentView === 'performance' && (
          <PerformanceView 
            walletConnected={walletConnected}
            onConnectWallet={() => setWalletConnected(true)}
          />
        )}
      </main>
    </div>
  );
};

export default Index;

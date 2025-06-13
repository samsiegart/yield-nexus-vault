
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Wallet, TrendingUp } from 'lucide-react';
import PortfolioChart from './PortfolioChart';

interface Strategy {
  id: string;
  protocol: string;
  name: string;
  apy: number;
  tvl: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  chain: string;
  description: string;
  minDeposit: number;
}

const strategies: Strategy[] = [
  {
    id: 'aave-eth',
    protocol: 'Aave',
    name: 'Vault USDC',
    apy: 4.6,
    tvl: '$2.1B',
    riskLevel: 'Low',
    chain: 'Ethereum',
    description: 'Secure lending on Aave with stable returns',
    minDeposit: 100
  },
  {
    id: 'compound-eth',
    protocol: 'Compound',
    name: 'USDC Supply',
    apy: 8.1,
    tvl: '$890M',
    riskLevel: 'Low',
    chain: 'Ethereum',
    description: 'Conservative yield through Compound protocol',
    minDeposit: 50
  },
  {
    id: 'yearn-eth',
    protocol: 'Yearn v3',
    name: 'USDC Vault',
    apy: 6.3,
    tvl: '$450M',
    riskLevel: 'Medium',
    chain: 'Ethereum',
    description: 'Automated yield optimization strategies',
    minDeposit: 250
  },
  {
    id: 'beefy-polygon',
    protocol: 'Beefy',
    name: 'Auto-Compound',
    apy: 7.8,
    tvl: '$120M',
    riskLevel: 'Medium',
    chain: 'Polygon',
    description: 'Auto-compounding yield farming on Polygon',
    minDeposit: 25
  },
  {
    id: 'radiant-arbitrum',
    protocol: 'Radiant',
    name: 'USDC Lending',
    apy: 5.4,
    tvl: '$380M',
    riskLevel: 'Medium',
    chain: 'Arbitrum',
    description: 'Cross-chain lending with boosted rewards',
    minDeposit: 100
  },
  {
    id: 'notion-base',
    protocol: 'Notional',
    name: 'Liquidity Pool',
    apy: 8.9,
    tvl: '$95M',
    riskLevel: 'High',
    chain: 'Base',
    description: 'High-yield liquidity provision on Base',
    minDeposit: 500
  },
  {
    id: 'noble-usav',
    protocol: 'Noble',
    name: 'USAV',
    apy: 14.0,
    tvl: '$25M',
    riskLevel: 'High',
    chain: 'Noble',
    description: 'High-yield staking on Noble',
    minDeposit: 100
  }
];

interface StrategyDashboardProps {
  onSelectStrategy: (strategy: Strategy) => void;
  onSelectPresetStrategies: (strategies: Strategy[]) => void;
  walletConnected: boolean;
  onNavigateToDeposit: () => void;
  onConnectWallet: () => void;
}

const StrategyDashboard: React.FC<StrategyDashboardProps> = ({ 
  onSelectStrategy, 
  onSelectPresetStrategies,
  walletConnected,
  onNavigateToDeposit,
  onConnectWallet
}) => {
  const [currentPositions] = useState([
    { id: 'aave-eth', protocol: 'AAVE', name: 'USAV', spread: 30, apy: 14.0, chain: 'Ethereum' },
    { id: 'beefy-polygon', protocol: 'Beefy', name: 'USDC', spread: 0, apy: 10.0, chain: 'Polygon' },
    { id: 'compound-eth', protocol: 'Compound', name: '', spread: 40, apy: 4.0, chain: 'Ethereum' }
  ]);

  return (
    <div className="space-y-8">
      {/* Portfolio Balance Section */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-slate-800/60 border-slate-700 relative">
          <CardHeader>
            <CardTitle className="text-white">Your Portfolio Balance</CardTitle>
            <div className="text-3xl font-bold text-white">$144,789</div>
            <div className="text-green-400">+7.7% WoW</div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className={walletConnected ? '' : 'blur-sm'}>
                <PortfolioChart height="h-32" />
              </div>
              {!walletConnected && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button 
                    onClick={onConnectWallet}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>
                </div>
              )}
            </div>
            <div className="flex justify-between mt-4 text-sm text-slate-400">
              <span>D</span>
              <span>W</span>
              <span>M</span>
              <span>All</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Yield Opportunities */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Yield Opportunities</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {strategies.map((strategy) => (
            <Card key={strategy.id} className="bg-slate-800/60 border-slate-700 hover:bg-slate-700/60 transition-all cursor-pointer">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-white">{strategy.protocol}</div>
                  <div className="text-sm text-slate-300">{strategy.name}</div>
                  <div className="text-2xl font-bold text-green-400 mt-2">
                    {strategy.apy}%
                  </div>
                  <div className="text-xs text-slate-400">APY</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* AI Chat Section */}
      <Card className="bg-slate-800/60 border-slate-700">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">Choosing yield?</h3>
          <div className="bg-slate-700/30 rounded-lg p-4 mb-4">
            <p className="text-slate-300 text-sm">Ask me anything about yield strategies, risk assessment, or portfolio optimization...</p>
          </div>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            Start Conversation
          </Button>
        </CardContent>
      </Card>

      {/* Distribution (Your Positions) */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Your Active Positions</h2>
        
        {!walletConnected ? (
          <Card className="bg-slate-800/60 border-slate-700">
            <CardContent className="text-center py-12">
              <Wallet className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
              <p className="text-slate-300 mb-6">Connect your wallet to view and manage your positions</p>
              <Button 
                onClick={onConnectWallet}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-slate-800/60 border-slate-700">
            <CardContent className="p-6 space-y-4">
              {currentPositions.map((position) => (
                <div key={position.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-white">{position.protocol} {position.name}</div>
                  </div>
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="text-slate-300">{position.spread}%</div>
                    <div className="text-green-400">{position.apy}%</div>
                    <Button size="sm" variant="outline" className="bg-slate-600/50 border-slate-500 text-white hover:bg-slate-500/50">
                      Edit...
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="pt-4 border-t border-slate-600">
                <Button 
                  onClick={onNavigateToDeposit}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0"
                >
                  Manage Positions
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StrategyDashboard;

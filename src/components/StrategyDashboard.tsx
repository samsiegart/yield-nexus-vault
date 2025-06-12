
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TrendingUp, Shield, Zap, ArrowRight, Wallet, Plus } from 'lucide-react';

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
    name: 'USDC Lending',
    apy: 4.2,
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
    apy: 3.8,
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
    apy: 6.5,
    tvl: '$450M',
    riskLevel: 'Medium',
    chain: 'Ethereum',
    description: 'Automated yield optimization strategies',
    minDeposit: 250
  },
  {
    id: 'beefy-polygon',
    protocol: 'Beefy',
    name: 'USDC Auto-Compound',
    apy: 7.8,
    tvl: '$120M',
    riskLevel: 'Medium',
    chain: 'Polygon',
    description: 'Auto-compounding yield farming on Polygon',
    minDeposit: 25
  },
  {
    id: 'radiant-arbitrum',
    protocol: 'Radiant Capital',
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
    protocol: 'Notion',
    name: 'USDC Liquidity Pool',
    apy: 8.9,
    tvl: '$95M',
    riskLevel: 'High',
    chain: 'Base',
    description: 'High-yield liquidity provision on Base',
    minDeposit: 500
  }
];

interface StrategyDashboardProps {
  onSelectStrategy: (strategy: Strategy) => void;
  onSelectPresetStrategies: (strategies: Strategy[]) => void;
  walletConnected: boolean;
  onNavigateToDeposit: () => void;
}

const StrategyDashboard: React.FC<StrategyDashboardProps> = ({ 
  onSelectStrategy, 
  onSelectPresetStrategies,
  walletConnected,
  onNavigateToDeposit
}) => {
  const [filter, setFilter] = useState('all');
  const [currentPositions] = useState([
    { id: 'aave-eth', protocol: 'Aave', name: 'USDC Lending', amount: 2500, value: 2563.50, apy: 4.2, chain: 'Ethereum' },
    { id: 'yearn-eth', protocol: 'Yearn v3', name: 'USDC Vault', amount: 1800, value: 1847.20, apy: 6.5, chain: 'Ethereum' }
  ]);

  const filteredStrategies = filter === 'all' 
    ? strategies 
    : strategies.filter(s => s.riskLevel.toLowerCase() === filter);

  const WalletConnectPrompt = () => (
    <Card className="bg-slate-800/60 border-slate-700">
      <CardContent className="text-center py-12">
        <Wallet className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
        <p className="text-slate-300 mb-6">Connect your wallet to view and manage your positions</p>
        <Button 
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
        >
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Individual Strategies */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Strategies</h2>
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setFilter('all')}
              className={filter === 'all' 
                ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-500" 
                : "bg-slate-800/50 text-slate-200 border-slate-600 hover:bg-slate-700/50 hover:text-white"
              }
            >
              All
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setFilter('low')}
              className={filter === 'low' 
                ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-500" 
                : "bg-slate-800/50 text-slate-200 border-slate-600 hover:bg-slate-700/50 hover:text-white"
              }
            >
              Low Risk
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setFilter('medium')}
              className={filter === 'medium' 
                ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-500" 
                : "bg-slate-800/50 text-slate-200 border-slate-600 hover:bg-slate-700/50 hover:text-white"
              }
            >
              Medium Risk
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setFilter('high')}
              className={filter === 'high' 
                ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-500" 
                : "bg-slate-800/50 text-slate-200 border-slate-600 hover:bg-slate-700/50 hover:text-white"
              }
            >
              High Risk
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredStrategies.map((strategy) => (
            <Card key={strategy.id} className="bg-slate-800/60 border-slate-700 hover:bg-slate-700/60 transition-all cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <div className="text-lg font-semibold text-white">{strategy.protocol}</div>
                      <div className="text-sm text-slate-300">{strategy.name}</div>
                    </div>
                    <Badge className="bg-slate-700/50 text-slate-200 border-slate-600">
                      {strategy.chain}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-400">
                      {strategy.apy}%
                    </div>
                    <div className="text-xs text-slate-400">APY</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Your Positions */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Your Positions</h2>
        
        {!walletConnected ? (
          <WalletConnectPrompt />
        ) : (
          <Card className="bg-slate-800/60 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Active Positions</CardTitle>
              <CardDescription className="text-slate-300">
                Your current yield farming positions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentPositions.map((position) => (
                <div key={position.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div>
                    <div className="font-medium text-white">{position.protocol}</div>
                    <div className="text-sm text-slate-400">{position.name} • {position.chain}</div>
                    <div className="text-sm text-green-400">{position.apy}% APY</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-white">${position.value.toFixed(2)}</div>
                    <div className="text-sm text-slate-400">
                      Deposited: ${position.amount}
                    </div>
                    <div className="text-sm text-green-400">
                      +${(position.value - position.amount).toFixed(2)}
                    </div>
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


import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Shield, Zap, ArrowRight } from 'lucide-react';

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

const presetStrategies = [
  {
    id: 'max-yield',
    name: 'Max Yield',
    description: 'Highest APY strategies with balanced risk',
    strategies: ['notion-base', 'beefy-polygon', 'yearn-eth'],
    estimatedApy: 7.7,
    icon: TrendingUp
  },
  {
    id: 'safe-lp',
    name: 'Safe LP',
    description: 'Conservative strategies with stable returns',
    strategies: ['aave-eth', 'compound-eth', 'radiant-arbitrum'],
    estimatedApy: 4.5,
    icon: Shield
  }
];

interface StrategyDashboardProps {
  onSelectStrategy: (strategy: Strategy) => void;
}

const StrategyDashboard: React.FC<StrategyDashboardProps> = ({ onSelectStrategy }) => {
  const [filter, setFilter] = useState('all');

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-500';
      case 'Medium': return 'bg-yellow-500';
      case 'High': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredStrategies = filter === 'all' 
    ? strategies 
    : strategies.filter(s => s.riskLevel.toLowerCase() === filter);

  return (
    <div className="space-y-8">
      {/* Preset Strategies */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Preset Strategies</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {presetStrategies.map((preset) => {
            const Icon = preset.icon;
            return (
              <Card key={preset.id} className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 text-white hover:from-white/15 hover:to-white/10 transition-all cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{preset.name}</CardTitle>
                        <CardDescription className="text-gray-300">
                          {preset.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400">
                        {preset.estimatedApy}%
                      </div>
                      <div className="text-sm text-gray-400">Est. APY</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Deploy Strategy
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Individual Strategies */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Individual Strategies</h2>
          <div className="flex space-x-2">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className="text-white border-white/20"
            >
              All
            </Button>
            <Button 
              variant={filter === 'low' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('low')}
              className="text-white border-white/20"
            >
              Low Risk
            </Button>
            <Button 
              variant={filter === 'medium' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('medium')}
              className="text-white border-white/20"
            >
              Medium Risk
            </Button>
            <Button 
              variant={filter === 'high' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('high')}
              className="text-white border-white/20"
            >
              High Risk
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredStrategies.map((strategy) => (
            <Card key={strategy.id} className="bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{strategy.protocol}</CardTitle>
                    <CardDescription className="text-gray-300">
                      {strategy.name}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-white border-white/20">
                    {strategy.chain}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-400">
                      {strategy.apy}%
                    </div>
                    <div className="text-sm text-gray-400">APY</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">{strategy.tvl}</div>
                    <div className="text-sm text-gray-400">TVL</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getRiskColor(strategy.riskLevel)}`}></div>
                    <span className="text-sm">{strategy.riskLevel} Risk</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Min: ${strategy.minDeposit}
                  </div>
                </div>

                <p className="text-sm text-gray-300">
                  {strategy.description}
                </p>

                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => onSelectStrategy(strategy)}
                >
                  Select Strategy
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StrategyDashboard;

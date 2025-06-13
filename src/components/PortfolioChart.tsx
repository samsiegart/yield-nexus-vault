
import React from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

const portfolioData = [
  { date: '2024-01', totalBalance: 5000, totalDeposits: 5000 },
  { date: '2024-02', totalBalance: 5150, totalDeposits: 5000 },
  { date: '2024-03', totalBalance: 5280, totalDeposits: 5000 },
  { date: '2024-04', totalBalance: 5420, totalDeposits: 6000 },
  { date: '2024-05', totalBalance: 6680, totalDeposits: 6000 },
  { date: '2024-06', totalBalance: 6890, totalDeposits: 6000 },
];

const chartConfig = {
  totalBalance: {
    label: "Total Balance",
    color: "#10B981",
  },
  totalDeposits: {
    label: "Total Deposits", 
    color: "#3B82F6",
  },
};

interface PortfolioChartProps {
  showDeposits?: boolean;
  height?: string;
}

const PortfolioChart: React.FC<PortfolioChartProps> = ({ 
  showDeposits = false, 
  height = "h-32" 
}) => {
  return (
    <div className={`w-full ${height}`}>
      <ChartContainer config={chartConfig} className="w-full h-full">
        <LineChart data={portfolioData} width="100%" height="100%">
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9CA3AF"
            fontSize={12}
          />
          <YAxis 
            stroke="#9CA3AF"
            fontSize={12}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line 
            type="monotone" 
            dataKey="totalBalance" 
            stroke="#10B981" 
            strokeWidth={3}
            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
            name="Total Balance"
          />
          {showDeposits && (
            <Line 
              type="monotone" 
              dataKey="totalDeposits" 
              stroke="#3B82F6" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              name="Total Deposits"
            />
          )}
        </LineChart>
      </ChartContainer>
    </div>
  );
};

export default PortfolioChart;

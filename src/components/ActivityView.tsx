import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight } from "lucide-react";

interface InProgressActivity {
  id: string;
  title: string;
  timestamp: string;
  transfers: {
    from: string;
    to: string;
    amount: string;
  }[];
  totalAmount: string;
}

interface TransactionHistory {
  id: string;
  time: string;
  type: string;
  description: string;
  amount: string;
  status: "completed" | "failed" | "pending";
}

const ActivityView: React.FC = () => {
  // Mock data for In Progress activities
  const inProgressActivities: InProgressActivity[] = [
    {
      id: "1",
      title: "Rebalancing portfolio to target allocations",
      timestamp: "5m ago",
      transfers: [
        {
          from: "Aave USDC",
          to: "Compound USDT",
          amount: "$7,216",
        },
        {
          from: "Compound USDT",
          to: "Aave USDC",
          amount: "$0",
        },
      ],
      totalAmount: "$7,216",
    },
    {
      id: "2",
      title: "Deposit $5,000 using current allocation",
      timestamp: "2m ago",
      transfers: [
        {
          from: "Wallet",
          to: "Aave USDC (40%)",
          amount: "$2,000",
        },
        {
          from: "Wallet",
          to: "Compound USDT (35%)",
          amount: "$1,750",
        },
        {
          from: "Wallet",
          to: "Yearn DAI (25%)",
          amount: "$1,250",
        },
      ],
      totalAmount: "$5,000",
    },
  ];

  // Mock data for Transaction History
  const transactionHistory: TransactionHistory[] = [
    {
      id: "1",
      time: "2d ago",
      type: "Entry",
      description: "Entered Boost USDN position",
      amount: "$15,000",
      status: "completed",
    },
    {
      id: "2",
      time: "3d ago",
      type: "Optimization",
      description: "Shifted from Compound to Aave",
      amount: "$8,500",
      status: "completed",
    },
    {
      id: "3",
      time: "5d ago",
      type: "Withdrawal",
      description: "Withdrawal to agoricf1... failed",
      amount: "$2,000",
      status: "failed",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "completed";
      case "failed":
        return "failed";
      case "pending":
        return "pending";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* In Progress Section */}
      <Card className="bg-slate-800/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>In Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {inProgressActivities.map((activity) => (
            <div
              key={activity.id}
              className="bg-slate-900/50 border border-slate-700 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-medium">{activity.title}</h3>
                  <p className="text-slate-400 text-sm">{activity.timestamp}</p>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-slate-700 text-slate-300 border-slate-600"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                  In Progress
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-slate-300 text-sm font-medium">Transfers:</p>
                {activity.transfers.map((transfer, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2 text-sm text-slate-400">
                      <span>{transfer.from}</span>
                      <ArrowRight className="w-3 h-3" />
                      <span>{transfer.to}</span>
                    </div>
                    <span className="text-sm text-white font-medium">
                      {transfer.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Transaction History Section */}
      <Card className="bg-slate-800/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-left">
                <th className="py-3 pr-4">Time</th>
                <th className="py-3 pr-4">Type</th>
                <th className="py-3 pr-4">Description</th>
                <th className="py-3 pr-4">Amount</th>
                <th className="py-3 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactionHistory.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-slate-700 hover:bg-slate-700/50"
                >
                  <td className="py-3 pr-4 text-slate-300">
                    {transaction.time}
                  </td>
                  <td className="py-3 pr-4 text-slate-300">
                    {transaction.type}
                  </td>
                  <td className="py-3 pr-4 text-slate-300">
                    {transaction.description}
                  </td>
                  <td className="py-3 pr-4 text-white font-medium">
                    {transaction.amount}
                  </td>
                  <td className="py-3 pr-4">
                    <Badge
                      variant="secondary"
                      className={`${getStatusColor(
                        transaction.status
                      )} text-xs`}
                    >
                      {getStatusText(transaction.status)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityView;

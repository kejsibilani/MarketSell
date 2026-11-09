import { Lightbulb, TrendingUp, AlertCircle } from 'lucide-react';

interface Insight {
  type: 'suggestion' | 'opportunity' | 'warning';
  title: string;
  description: string;
}

interface InsightsPanelProps {
  insights: Insight[];
}

export function InsightsPanel({ insights }: InsightsPanelProps) {
  const getIcon = (type: Insight['type']) => {
    switch (type) {
      case 'suggestion':
        return <Lightbulb className="w-5 h-5 text-blue-600" />;
      case 'opportunity':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
    }
  };

  return (
    <div className="space-y-2">
      {insights.map((ins, i) => (
        <div key={i} className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-lg">
          <div className="flex-shrink-0">{getIcon(ins.type)}</div>
          <div>
            <div className="text-sm font-semibold text-gray-800">{ins.title}</div>
            <div className="text-xs text-gray-500 mt-0.5">{ins.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

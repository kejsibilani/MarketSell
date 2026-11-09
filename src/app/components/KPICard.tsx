import { LucideIcon } from 'lucide-react';
import { colors } from '../styles/designSystem';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
}

export function KPICard({ title, value, change, changeType = 'neutral', icon: Icon }: KPICardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold mt-2" style={{ color: colors.primary }}>{value}</p>
          {change && (
            <p className={`text-sm mt-2 ${
              changeType === 'positive' ? 'text-green-600' :
              changeType === 'negative' ? 'text-red-600' :
              'text-gray-600'
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className="p-3 rounded-lg" style={{ backgroundColor: colors.gray50 }}>
          <Icon className="w-6 h-6" style={{ color: colors.primary }} />
        </div>
      </div>
    </div>
  );
}

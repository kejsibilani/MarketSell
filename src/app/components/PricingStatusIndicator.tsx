import { CheckCircle, Clock, AlertCircle, Zap } from 'lucide-react';

type PricingStatus = 'set' | 'pending' | 'inactive' | 'promotion';

interface PricingStatusIndicatorProps {
  status: PricingStatus;
  promotionActive?: boolean;
  onConfigure: () => void;
  compact?: boolean;
}

export function PricingStatusIndicator({
  status,
  promotionActive = false,
  onConfigure,
  compact = false
}: PricingStatusIndicatorProps) {
  const statusConfig: Record<
    PricingStatus,
    {
      icon: React.ReactNode;
      title: string;
      subtitle: string;
      badge: string;
      badgeText: string;
      color: 'green' | 'amber' | 'gray' | 'purple';
    }
  > = {
    set: {
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      title: 'Pricing Set',
      subtitle: 'Ready for sales',
      badge: 'bg-green-50 text-green-700 border-green-200',
      badgeText: 'Active',
      color: 'green'
    },
    pending: {
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      title: 'Pending Review',
      subtitle: 'Awaiting activation',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      badgeText: 'Pending',
      color: 'amber'
    },
    promotion: {
      icon: <Zap className="w-5 h-5 text-purple-600" />,
      title: 'Promotion Active',
      subtitle: 'Special pricing in effect',
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
      badgeText: 'Active Promo',
      color: 'purple'
    },
    inactive: {
      icon: <AlertCircle className="w-5 h-5 text-gray-500" />,
      title: 'Not Configured',
      subtitle: 'Set pricing to enable sales',
      badge: 'bg-gray-50 text-gray-700 border-gray-200',
      badgeText: 'Inactive',
      color: 'gray'
    }
  };

  const config = statusConfig[status];

  if (compact) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {config.icon}
          <span className="font-medium text-sm">{config.badgeText}</span>
        </div>
        <button
          onClick={onConfigure}
          className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          Configure
        </button>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-4 ${config.badge} flex items-start gap-3`}>
      <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold">{config.title}</div>
        <p className="text-sm opacity-80">{config.subtitle}</p>
      </div>
      <button
        onClick={onConfigure}
        className="flex-shrink-0 px-3 py-1 text-sm font-medium bg-white rounded hover:bg-gray-100 transition whitespace-nowrap"
      >
        Configure →
      </button>
    </div>
  );
}

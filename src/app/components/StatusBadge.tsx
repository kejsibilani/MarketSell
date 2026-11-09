interface StatusBadgeProps {
  status: string;
  type?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

export function StatusBadge({ status, type = 'default' }: StatusBadgeProps) {
  const colors: Record<string, string> = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-orange-100 text-orange-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  };

  const cls = colors[type] ?? colors.default;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

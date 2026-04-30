import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export function StatsCard({ title, value, icon, trend, trendUp }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-border hover:shadow-lg transition-all group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-muted-foreground text-xs mb-1.5 font-medium uppercase tracking-wide">{title}</p>
          <h3 className="text-2xl font-bold text-foreground">{value}</h3>
          {trend && (
            <p className={`text-xs mt-2 font-medium flex items-center gap-1 ${
              trendUp === true ? 'text-green-600' :
              trendUp === false ? 'text-red-500' :
              'text-muted-foreground'
            }`}>
              {trendUp === true && '↑ '}
              {trendUp === false && '↓ '}
              {trend}
            </p>
          )}
        </div>
        <div className="p-2.5 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-all">
          {icon}
        </div>
      </div>
    </div>
  );
}

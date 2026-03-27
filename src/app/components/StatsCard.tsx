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
    <div className="bg-white rounded-xl p-6 shadow-md border border-border hover:shadow-xl transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm mb-2 font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-foreground">{value}</h3>
          {trend && (
            <p className={`text-sm mt-2 font-medium ${trendUp ? 'text-secondary' : 'text-destructive'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        <div className="p-3 bg-primary/10 rounded-lg text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}

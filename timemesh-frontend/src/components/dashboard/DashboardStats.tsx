import React from 'react';
import { Clock, Users, BarChart, Calendar } from 'lucide-react';

const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold mt-2 text-foreground">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-center mt-4">
        <span className="text-xs font-medium text-success-foreground bg-success/20 px-2 py-0.5 rounded-full">
          +14%
        </span>
        <span className="text-xs text-muted-foreground ml-2">vs last month</span>
      </div>
    </div>
  );
};

export const DashboardStats = () => {
  const stats = [
    {
      title: 'Total Hours',
      value: '158.3',
      icon: <Clock className="h-5 w-5 text-blue-500" />,
      color: 'bg-blue-100/10',
    },
    {
      title: 'Active Projects',
      value: '12',
      icon: <BarChart className="h-5 w-5 text-emerald-500" />,
      color: 'bg-emerald-100/10',
    },
    {
      title: 'Team Members',
      value: '24',
      icon: <Users className="h-5 w-5 text-violet-500" />,
      color: 'bg-violet-100/10',
    },
    {
      title: 'Upcoming Deadlines',
      value: '7',
      icon: <Calendar className="h-5 w-5 text-amber-500" />,
      color: 'bg-amber-100/10',
    },
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};
import React from 'react';
import { BarChart2, FileText, Users, Clock, MoreHorizontal } from 'lucide-react';

const activities = [
  {
    id: 1,
    title: 'Project Alpha updated',
    description: 'New milestones added to the project timeline',
    time: '2 hours ago',
    icon: <FileText className="h-4 w-4 text-emerald-500" />,
    iconBg: 'bg-emerald-100/10',
  },
  {
    id: 2,
    title: 'Team meeting scheduled',
    description: 'Weekly standup on Thursday at 10:00 AM',
    time: '4 hours ago',
    icon: <Users className="h-4 w-4 text-blue-500" />,
    iconBg: 'bg-blue-100/10',
  },
  {
    id: 3,
    title: 'Time report generated',
    description: 'May 2025 time report is now available',
    time: 'Yesterday',
    icon: <Clock className="h-4 w-4 text-amber-500" />,
    iconBg: 'bg-amber-100/10',
  },
  {
    id: 4,
    title: 'Dashboard analytics updated',
    description: 'New productivity metrics have been added',
    time: '2 days ago',
    icon: <BarChart2 className="h-4 w-4 text-violet-500" />,
    iconBg: 'bg-violet-100/10',
  },
];

export const RecentActivity = () => {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden h-full">
      <div className="p-5 border-b border-border flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        <button className="p-1 rounded-md hover:bg-secondary/20 transition-colors">
          <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>
      
      <div className="p-2">
        {activities.map((activity) => (
          <div 
            key={activity.id} 
            className="p-3 hover:bg-secondary/10 rounded-lg transition-colors flex items-start gap-3"
          >
            <div className={`p-2 rounded-lg ${activity.iconBg} mt-1`}>
              {activity.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-foreground">{activity.title}</h4>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{activity.time}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{activity.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-3 border-t border-border text-center">
        <button className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
          View All Activity
        </button>
      </div>
    </div>
  );
};
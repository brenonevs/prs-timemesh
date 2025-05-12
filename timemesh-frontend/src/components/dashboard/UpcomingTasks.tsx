import React from 'react';
import { CheckCircle2, Clock, Plus } from 'lucide-react';

const tasks = [
  {
    id: 1,
    title: 'Complete project proposal',
    dueTime: 'Today, 5:00 PM',
    priority: 'high',
  },
  {
    id: 2,
    title: 'Review frontend design changes',
    dueTime: 'Tomorrow, 11:00 AM',
    priority: 'medium',
  },
  {
    id: 3,
    title: 'Team standup meeting',
    dueTime: 'Tomorrow, 10:00 AM',
    priority: 'medium',
  },
  {
    id: 4,
    title: 'Update documentation',
    dueTime: 'Friday, 3:00 PM',
    priority: 'low',
  },
];

const priorityClasses = {
  high: 'bg-destructive/10 text-destructive',
  medium: 'bg-amber-100/10 text-amber-500',
  low: 'bg-emerald-100/10 text-emerald-500',
};

export const UpcomingTasks = () => {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden h-full">
      <div className="p-5 border-b border-border flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Upcoming Tasks</h3>
        <button className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors">
          <Plus className="h-4 w-4" />
        </button>
      </div>
      
      <div className="p-2">
        {tasks.map((task) => (
          <div 
            key={task.id} 
            className="p-3 hover:bg-secondary/10 rounded-lg transition-colors"
          >
            <div className="flex gap-3">
              <div className="mt-0.5">
                <CheckCircle2 className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              </div>
              
              <div className="flex-1">
                <h4 className="font-medium text-foreground">{task.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{task.dueTime}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${priorityClasses[task.priority]} ml-1 capitalize`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-3 border-t border-border text-center">
        <button className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
          View All Tasks
        </button>
      </div>
    </div>
  );
};
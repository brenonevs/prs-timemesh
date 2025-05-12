import React from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { DashboardStats } from '../../components/dashboard/DashboardStats';
import { RecentActivity } from '../../components/dashboard/RecentActivity';
import { UpcomingTasks } from '../../components/dashboard/UpcomingTasks';

export const Dashboard = () => {
  return (
    <MainLayout>
      <div className="flex flex-col gap-6 animate-fadeIn">
        <DashboardHeader />
        <DashboardStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>
          <div>
            <UpcomingTasks />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
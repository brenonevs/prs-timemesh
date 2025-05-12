import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  BarChart2, 
  Users, 
  ClipboardList, 
  Settings, 
  LogOut,
  X 
} from 'lucide-react';
import { Logo } from '../ui/Logo';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  onClose?: () => void;
}

const navItems = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard', to: '/dashboard' },
  { icon: <Calendar size={20} />, label: 'Calendar', to: '/calendar' },
  { icon: <BarChart2 size={20} />, label: 'Analytics', to: '/analytics' },
  { icon: <ClipboardList size={20} />, label: 'Projects', to: '/projects' },
  { icon: <Users size={20} />, label: 'Team', to: '/team' },
  { divider: true },
  { icon: <Settings size={20} />, label: 'Settings', to: '/settings' },
];

export const Sidebar = ({ onClose }: SidebarProps = {}) => {
  const { logout } = useAuth();
  
  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      <div className="flex items-center justify-between py-4 px-4">
        <Logo />
        
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/20 focus:outline-none"
          >
            <X size={20} />
          </button>
        )}
      </div>
      
      <div className="flex-1 py-2 overflow-y-auto">
        <nav className="px-2 space-y-1">
          {navItems.map((item, index) => (
            item.divider ? (
              <div key={`divider-${index}`} className="border-t border-border/60 my-4 mx-3" />
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:bg-secondary/20 hover:text-foreground'
                  }
                `}
                onClick={onClose}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            )
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-border">
        <button 
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-destructive/90 hover:bg-destructive/10 transition-colors"
          onClick={logout}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};
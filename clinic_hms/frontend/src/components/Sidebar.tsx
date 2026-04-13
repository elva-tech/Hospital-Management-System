import { LogOut, LayoutDashboard, Users, Activity, Pill, CreditCard, Beaker } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const { user, logout } = useAuthStore();

  const getNavLinks = () => {
    switch (user?.role) {
      case 'ADMIN':
        return [
          { name: 'Dashboard', to: '/', icon: LayoutDashboard },
          { name: 'Reception', to: '/reception', icon: Users },
          { name: 'Doctor', to: '/doctor', icon: Activity },
          { name: 'Pharmacy', to: '/pharmacy', icon: Pill },
          { name: 'Laboratory', to: '/laboratory', icon: Beaker },
          { name: 'Billing', to: '/billing', icon: CreditCard },
        ];
      case 'RECEPTIONIST':
        return [
          { name: 'Reception', to: '/reception', icon: Users },
          { name: 'Laboratory', to: '/laboratory', icon: Beaker },
          { name: 'Billing', to: '/billing', icon: CreditCard },
        ];
      case 'DOCTOR':
        return [
          { name: 'Doctor Dashboard', to: '/doctor', icon: Activity },
        ];
      case 'PHARMACIST':
        return [
          { name: 'Pharmacy', to: '/pharmacy', icon: Pill },
        ];
      default:
        return [];
    }
  };

  const links = getNavLinks();

  return (
    <div className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col text-slate-300 shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
        <Activity className="h-6 w-6 text-blue-500 mr-2" />
        <span className="text-lg font-bold text-white tracking-wide">HMS Clinic</span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white hover:pl-4'
                }`
              }
            >
              <Icon className="h-5 w-5 mr-3 shrink-0" />
              <span className="font-medium text-sm">{link.name}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center mb-4 px-2">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-400 hover:bg-slate-800 hover:text-red-300 rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

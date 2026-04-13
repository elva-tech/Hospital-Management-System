import React from 'react';
import Sidebar from '../components/Sidebar';

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        <main className="p-8 w-full max-w-7xl mx-auto flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

import { Outlet } from 'react-router-dom';
import { Sidebar } from '@components/navigation/Sidebar';
import { Header } from '@components/navigation/Header';

/**
 * DashboardLayout - Main layout wrapper for authenticated dashboard pages
 */
export function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <Header />
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;


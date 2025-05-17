import { Sidebar } from '@/components/sidebar';
import { DashboardProvider } from '@/contexts/DashboardContext';
import { Dashboard } from '@/components/dashboard/Dashboard';

export default async function MyUI() {
  return (
    <>
      <div className="w-full h-[calc(100vh-56px)] flex flex-col md:flex-row items-stretch justify-between relative px-1">
        {/* Main content area */}
        <div className="w-full h-full flex flex-col justify-center pt-2 px-1">
          <div className="w-full h-full bg-white/5 backdrop-blur-sm rounded-lg">
            <DashboardProvider>
              <Dashboard />
            </DashboardProvider>
          </div>
        </div>

        {/* Sidebar - positioned at the edge of the screen */}
        <div className="h-[calc(100vh-56px)] z-10">
          <Sidebar />
        </div>
      </div>
    </>
  );
}

import AppNav from './AppNav';
import PerformanceSidebar from './PerformanceSidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export default function AppLayout({ children, showSidebar = true }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppNav />
      <div className="flex flex-1">
        <main className="flex-1 overflow-auto">
          {children}
        </main>
        {showSidebar && <PerformanceSidebar />}
      </div>
    </div>
  );
}

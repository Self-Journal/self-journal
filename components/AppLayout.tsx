import AppNav from './AppNav';
import QuickStatsSidebar from './QuickStatsSidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export default function AppLayout({ children, showSidebar = true }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppNav />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-auto min-w-0">
          {children}
        </main>
        {showSidebar && <QuickStatsSidebar />}
      </div>
    </div>
  );
}

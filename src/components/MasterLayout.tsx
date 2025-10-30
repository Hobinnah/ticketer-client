{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}


import React from 'react';
import '../themes/theme.css';
import AppLayout from './Layout';
import Header from './Header';
import Sidebar from './Sidebar';
import CommandPalette from './CommandPalette';
import ToastContainer from './Toast';
import Footer from './Footer';
import type { Toast } from './Toast';
import useCustomTooltips from '../hooks/useCustomTooltips';
import { useAuth } from '../hooks/useAuth';

// TypeScript interface for component props
export interface MasterLayoutProps {
  children?: React.ReactNode[];
  showFooter?: boolean;
}

// Master layout component providing centralized app structure
const MasterLayout: React.FC<MasterLayoutProps> = ({
  children = [],
  showFooter = false
}) => {
  // Get user info from auth context
  const { currentUser } = useAuth();
  const clientName = currentUser?.user?.clientName || "Netvilleplus";
  const branchName = currentUser?.user?.branchName || "Head Office";

  // Component state management
  useCustomTooltips();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  
  // Responsive sidebar behavior
  React.useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setSidebarCollapsed(isMobile);
      setDrawerOpen(isMobile);
    };
    
    // Set initial state
    handleResize();
    
    // Listen for window resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toast notification system
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const removeToast = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  // Command palette reference
  const paletteRef = React.useRef<{ openPalette: () => void }>(null);

  // Component render
  return (
    <>
      <AppLayout
        sidebarCollapsed={sidebarCollapsed}
        drawerOpen={drawerOpen}
        sidebar={<Sidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed((v) => !v)} />}
        header={
          <Header
            onHamburger={() => setSidebarCollapsed((v) => !v)}
            theme="system"
            setTheme={() => {}}
            primary="#6366f1"
            setPrimary={() => {}}
            density="comfortable"
            setDensity={() => {}}
            reducedMotion={false}
            setReducedMotion={() => {}}
            clientName={clientName}
            branchName={branchName}
            setClientName={() => {}}
            setBranchName={() => {}}
            onSearch={() => paletteRef.current?.openPalette()}
            onNotify={() => {}}
          />
        }
        footer={showFooter ? <Footer /> : undefined}
      >
        {children}
      </AppLayout>
      <CommandPalette ref={paletteRef} />
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
};

export default MasterLayout;
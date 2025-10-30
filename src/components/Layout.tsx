{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}


import React from 'react';

export default function AppLayout({
  sidebarCollapsed,
  drawerOpen,
  sidebar,
  header,
  footer,
  children,
}: React.PropsWithChildren<{
  sidebarCollapsed: boolean;
  drawerOpen: boolean;
  sidebar: React.ReactNode;
  header: React.ReactNode;
  footer?: React.ReactNode;
}>) {
  return (
    <div className={`layout ${sidebarCollapsed ? 'layout-collapsed' : ''}`}>
      <aside className={`sidebar ${drawerOpen ? 'sidebar-open' : ''}`}>{sidebar}</aside>
      <div className="content" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {header}
        <main className="main" style={{ flex: 1, overflow: 'auto' }}>{children}</main>
        {footer}
      </div>
    </div>
  );
}
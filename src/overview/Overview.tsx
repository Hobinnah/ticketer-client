{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}

import MasterLayout from '../components/MasterLayout';

export default function Overview() {
  // Example content components that will be rendered in the master layout
  const pageContent = [
    <div key="welcome" style={{ padding: '20px' }}>
      <h1>Welcome to Overview</h1>
      <p>This is the overview page content.</p>
    </div>,
    <div key="stats" style={{ padding: '20px' }}>
      <h2>Statistics</h2>
      <p>Your statistics and metrics will appear here.</p>
    </div>
  ];

  return (
    <MasterLayout showFooter={true}>
      {pageContent}
    </MasterLayout>
  );
}

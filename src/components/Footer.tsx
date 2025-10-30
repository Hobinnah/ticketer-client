{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}


import React from 'react';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="topbar" style={{
      justifyContent: 'center',
      borderTop: '1px solid var(--border)',
      borderBottom: 'none',
      marginTop: 'auto',
      marginBottom: 0,
      flexShrink: 0
    }}>
      <span style={{ fontSize: '14px', color: 'var(--text-2)' }}>
        © {year} Netvilleplus | Terms & Conditions
      </span>
    </footer>
  );
};

export default Footer;
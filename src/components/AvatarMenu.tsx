{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}


import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface AvatarMenuProps {
  theme: 'system'|'light'|'dark'|'nord'|'graphite'|'turquoise';
  setTheme: (t: any) => void;
  density: 'comfortable'|'compact';
  setDensity: (v: any) => void;
}

const AvatarMenu: React.FC<AvatarMenuProps> = ({ theme, setTheme, density, setDensity }) => {
  const { currentUser } = useAuth();

  return (
  <div className="dropdown avatar-menu" role="menu" style={{width:'280px', minWidth:'240px', padding:'0', maxHeight:'80vh', overflowY:'auto', overflowX:'hidden', boxSizing:'border-box'}}>
    <div className="avatar-menu-header" style={{textAlign:'center', padding:'14px 0 6px 0'}}>
      <img
        src="../src/assets/face.jpg"
        alt="User Avatar"
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          objectFit: 'cover',
          border: '2px solid var(--border)',
          background: 'var(--surface-2)',
          marginBottom: '8px'
        }}
      />
      <div style={{fontWeight:600, fontSize:16, color:'var(--fg)'}}>
        {currentUser?.name || `${currentUser?.user?.firstName || ''} ${currentUser?.user?.lastName || ''}`.trim() || 'User'}
      </div>
      <div style={{fontSize:13, color:'var(--muted)', marginTop:2}}>
        {currentUser?.user?.email || 'Network Manager User'}
      </div>
    </div>
    <div className="avatar-menu-list" style={{fontSize:'13px', fontWeight:500}}>
      <NavLink to="/profile" className="avatar-menu-item" style={{display:'flex',alignItems:'center',gap:10,padding:'10px 18px',background:'none',border:'none',width:'100%',fontSize:'13px',fontWeight:500,cursor:'pointer'}}>
        <span style={{color:'#8b5cf6',fontSize:18, paddingRight:6}}><svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" fill="currentColor"/></svg></span>
        Profile
      </NavLink>
      <NavLink to="/change-password" className="avatar-menu-item" style={{display:'flex',alignItems:'center',gap:10,padding:'10px 18px',background:'none',border:'none',width:'100%',fontSize:'13px',fontWeight:500,cursor:'pointer'}}>
        <span style={{color:'#0891b2',fontSize:18, paddingRight:6}}><svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><circle cx="12" cy="16" r="1"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
        Change Password
      </NavLink>
      <NavLink to="/settings" className="avatar-menu-item" style={{display:'flex',alignItems:'center',gap:10,padding:'10px 18px',background:'none',border:'none',width:'100%',fontSize:'13px',fontWeight:500,cursor:'pointer'}}>
        <span style={{color:'#3b82f6',fontSize:18, paddingRight:6}}><svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/></svg></span>
        Settings
      </NavLink>
      <NavLink to="/support" className="avatar-menu-item" style={{display:'flex',alignItems:'center',gap:10,padding:'10px 18px',background:'none',border:'none',width:'100%',fontSize:'13px',fontWeight:500,cursor:'pointer'}}>
        <span style={{color:'#f59e42',fontSize:18, paddingRight:6}}><svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/></svg></span>
        Support
      </NavLink>
    </div>
    <div className="dropdown-section">
      <div className="dropdown-title">Theme</div>
      <select className="select" value={theme} onChange={(e)=>setTheme(e.target.value as any)}>
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="nord">Nord</option>
        <option value="dark">Dark</option>
        <option value="graphite">Graphite</option>
        <option value="turquoise">Turquoise</option>
      </select>
      <label className="muted" style={{fontSize:12}}>Primary</label>
      <div className="seg" style={{fontSize:'15px', marginBottom: '25px'}}>
        <button className={`seg-btn ${density==='comfortable'?'is-active':''}`} style={{fontSize:'12px',padding:'6px 14px',borderRadius:'8px'}} onClick={()=>setDensity('comfortable')}>Comfort</button>
        <button className={`seg-btn ${density==='compact'?'is-active':''}`} style={{fontSize:'12px',padding:'6px 14px',borderRadius:'8px'}} onClick={()=>setDensity('compact')}>Compact</button>
      </div>
    </div>
  </div>
  );
};

export default AvatarMenu;

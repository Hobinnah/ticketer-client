{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}


import React from 'react';
import faceImg from '../assets/face.jpg';
import { HamburgerIcon, SearchIcon, GlobeIcon, BellIcon, PadlockIcon } from './Icons';
import AvatarMenu from './AvatarMenu';
import { useNavigate } from 'react-router-dom';

export interface HeaderProps {
  onHamburger: ()=>void;
  theme: 'system'|'light'|'dark'|'nord'|'graphite'|'turquoise';
  setTheme: (t:any)=>void;
  primary: string; setPrimary:(v:string)=>void;
  density:'comfortable'|'compact'; setDensity:(v:any)=>void;
  reducedMotion:boolean; setReducedMotion:(v:boolean)=>void;
  onSearch:()=>void; onNotify:()=>void;
  clientName:string; branchName:string; setClientName:(v:string)=>void; setBranchName:(v:string)=>void;
}

const Header: React.FC<HeaderProps> = (props) => {
  const {
    onHamburger, onSearch, onNotify, clientName, branchName
  } = props;
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  const handleLogout = () => {
    navigate('/logout');
  };
  const [theme, setTheme] = React.useState<'system'|'light'|'dark'|'nord'|'graphite'|'turquoise'>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem('app-theme');
    return saved === 'system' || saved === 'light' || saved === 'dark' || saved === 'nord' || saved === 'graphite' || saved === 'turquoise' ? (saved as any) : 'system';
  });
  const [density, setDensity] = React.useState<'comfortable'|'compact'>(() => {
    if (typeof window === 'undefined') return 'comfortable';
    return (localStorage.getItem('app-density') as any) || 'comfortable';
  });
  React.useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-density', density);
    localStorage.setItem('app-density', density);
  }, [density]);
  React.useEffect(() => {
    const html = document.documentElement;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const next = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme;
    html.setAttribute('data-theme', next);
    localStorage.setItem('app-theme', theme);
    const mm = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : (null as any);
    const onChange = () => theme === 'system' && html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    mm?.addEventListener?.('change', onChange);
    return () => mm?.removeEventListener?.('change', onChange);
  }, [theme]);
  React.useEffect(() => {
    if (!userMenuOpen) return;
    const onDown = (e: MouseEvent) => {
      const menu = document.querySelector('.dropdown.avatar-menu');
      const avatar = document.querySelector('.avatar');
      if (menu && !menu.contains(e.target as Node) && avatar && !avatar.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [userMenuOpen]);


  return (
    <div className="topbar">
      <button className="icon-btn" title="Menu" onClick={onHamburger}><HamburgerIcon /></button>
      <div className="top-identity"><span className="top-app">{clientName}</span><span className="top-sep"> : </span><span className="top-tenant">{branchName}</span></div>
      <div style={{ flex: 1 }} />
      <button className="icon-btn" title="Command palette (Ctrl/Cmd+K)" onClick={onSearch}><SearchIcon /></button>
      <button className="icon-btn" title="Language"><GlobeIcon /></button>
      <button className="icon-btn" title="Notifications" onClick={onNotify}><BellIcon /></button>
      <button className="icon-btn" title="Logout" onClick={handleLogout}><PadlockIcon /></button>
      <div
        className="avatar"
        onClick={() => setUserMenuOpen((v:boolean)=>!v)}
        role="button"
        aria-haspopup="true"
        aria-expanded={userMenuOpen}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '44px',
          height: '44px',
          overflow: 'hidden',
          borderRadius: '50%'
        }}
      >
        <img
          src={faceImg}
          alt="User Avatar"
          style={{
            width: '40px',
            height: '40px',
            maxWidth: '100%',
            maxHeight: '100%',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid var(--border)',
            background: 'var(--surface-2)'
          }}
        />
      </div>
      {userMenuOpen && (
        <AvatarMenu
          theme={theme}
          setTheme={setTheme}
          density={density}
          setDensity={setDensity}
        />
      )}
    </div>
  );
};

export default Header;
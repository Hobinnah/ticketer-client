{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}


import React, { useState } from 'react';
import { Logo, DotIcon, ChevIcon, HomeIcon, TableIcon } from './Icons';
import { NavLink } from 'react-router-dom';

export default function Sidebar({ collapsed, onToggleCollapse: _onToggleCollapse }: { collapsed: boolean; onToggleCollapse: () => void }) {
  return (
    <>
      <div className="brand"><Logo /><span className="brand-name">Ticketer</span></div>
      <nav className="nav">
        <NavGroup title="DASHBOARDS" defaultOpen isCollapsed={collapsed}>
          <NavItemLink to="/overview" icon={HomeIcon} label="Overview" highlight active />
        </NavGroup>
        <NavGroup title="TABLES" defaultOpen isCollapsed={collapsed}>
          
                  <NavItemLink to="/tickets" icon={DotIcon} label="Tickets" />
</NavGroup>
      </nav>
    </>
  );
}

export function NavGroup({ title, children, defaultOpen=false, isCollapsed=false }: React.PropsWithChildren<{ title: string; defaultOpen?: boolean; isCollapsed?: boolean }>) {
  const [open, setOpen] = useState(defaultOpen);
  const show = isCollapsed || open;
  return (
    <div className={`nav-group ${open ? 'open' : 'closed'}`}>
      <button type="button" className="nav-group-header" aria-expanded={open} onClick={()=>setOpen(o=>!o)}>
        <span className="section-title" style={{padding:0}}>{title}</span>
        <span className="chev"><ChevIcon /></span>
      </button>
      <div className="nav-group-body" style={{display: show ? 'grid' : 'none'}}>{children}</div>
    </div>
  );
}

export function NavItemLink({ to, label, icon: Icon = DotIcon, active, highlight }: { to: string; label: string; icon?: React.FC<any>; active?: boolean; highlight?: boolean }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `nav-btn${isActive || active ? ' active' : ''}${highlight ? ' highlight' : ''}`}
      title={label}
      aria-current={active ? "page" : undefined}
      >
    
      <span className="nav-left">{Icon && <Icon />}<span className="nav-label">{label}</span></span>
      <span className="nav-arrow"><ChevIcon/></span>
    </NavLink>
  );
}
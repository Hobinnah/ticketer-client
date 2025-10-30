{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}


import React from 'react';
import { useNavigate } from 'react-router-dom';

// TypeScript interface for component props
interface BreadCrumProps {
  title: string; 
  trail: { label: string; active?: boolean; href?: string; onClick?: () => void }[];
  actions: { label: string; variant?: 'soft'|'warning'; onClick: ()=>void; icon?: React.ReactNode }[]
}

// Breadcrumb navigation component with actions
export default function BreadCrum({ title, trail, actions }: BreadCrumProps) {
  const navigate = useNavigate();

  // Navigation handler for breadcrumb items
  const handleTrailClick = (item: { label: string; active?: boolean; href?: string; onClick?: () => void }) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      navigate(item.href);
    }
  };

  // Component render with title, breadcrumbs, and actions
  return (
    <div className="header container">
      <div>
        <h1 className="pagetitle">{title}</h1>
        <div className="breadcrumbs">
          {trail.map((t,i)=> (
            <span key={i} className={`crumb ${t.active? 'active':''}`}>
              {(t.href || t.onClick) && !t.active ? (
                <button 
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    padding: 0, 
                    color: 'inherit', 
                    textDecoration: 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleTrailClick(t)}
                >
                  {t.label}
                </button>
              ) : (
                t.label
              )}
              {i < trail.length-1 && <span className="sep"> » </span>}
            </span>
          ))}
        </div>
      </div>
      <div className="actions">
        {actions.map((a,i)=> (
          <button key={i} className={`btn ${a.variant==='soft'? 'btn-soft':''} ${a.variant==='warning'? 'btn-warning':''}`} onClick={a.onClick}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {a.icon}
              {a.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
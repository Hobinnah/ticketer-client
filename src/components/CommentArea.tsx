{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}


import React from 'react';

export interface CommentAreaProps {
  text: string;
  placeholder?: string;
  rows?: number;
  className?: string;
  style?: React.CSSProperties;
}

const CommentArea: React.FC<CommentAreaProps> = ({
  text,
  placeholder = '',
  rows = 4,
  className = '',
  style = {}
}) => {
  return (
    <textarea
      value={text}
      placeholder={placeholder}
      rows={rows}
      readOnly
      className={`textarea ${className}`}
      style={{
        marginTop: '10px',
        width: '100%',
        maxWidth: '100%',
        resize: 'vertical',
        fontFamily: 'inherit',
        fontSize: '14px',
        padding: '8px 12px',
        border: '1px solid var(--border, #e5e7eb)',
        borderRadius: '6px',
        backgroundColor: 'var(--surface, white)',
        color: 'var(--text, #374151)',
        cursor: 'default',
        boxSizing: 'border-box',
        ...style
      }}
    />
  );
};

export default CommentArea;
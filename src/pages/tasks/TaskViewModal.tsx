import React from 'react';
import { XIcon } from '../../components/Icons';
import type Task from '../../types/Task';
import '../../themes/theme.css';

interface TaskViewModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TaskViewModal({ task, isOpen, onClose }: TaskViewModalProps) {
  // Handle escape key to close modal - ALL HOOKS FIRST
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle backdrop click to close modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Get theme-aware status colors
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Completed':
        return {
          backgroundColor: '#dcfce7',
          color: '#166534'
        };
      case 'In Progress':
        return {
          backgroundColor: '#fef3c7',
          color: '#92400e'
        };
      default:
        return {
          backgroundColor: 'var(--surface)',
          color: 'var(--muted)'
        };
    }
  };

  // Don't render if modal is not open or no task is provided - AFTER ALL HOOKS
  if (!isOpen || !task) return null;

  return (
    <div 
      className="modal-backdrop" 
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
    >
      <div 
        className="card modal-content"
        style={{
          padding: '0',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="card-header">
          <h3 className="card-title" style={{ fontSize: '1.25rem', textTransform: 'none', color: 'var(--fg)' }}>
            Task Details
          </h3>
          <button
            className="icon-btn close"
            onClick={onClose}
          >
            <XIcon />
          </button>
        </div>

        {/* Modal Body */}
        <div className="form">
          <div style={{ display: 'grid', gap: '16px' }}>
            {/* Task Title */}
            <div className="field">
              <label className="field-label">Title</label>
              <div className="input" style={{ 
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                backgroundColor: 'var(--surface-2)',
                cursor: 'default',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {task.title || 'N/A'}
              </div>
            </div>

            {/* Task Description */}
            <div className="field">
              <label className="field-label">Description</label>
              <div className="input" style={{ 
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                minHeight: '80px',
                whiteSpace: 'pre-wrap',
                backgroundColor: 'var(--surface-2)',
                cursor: 'default',
                overflow: 'auto'
              }}>
                {task.description || 'N/A'}
              </div>
            </div>

            {/* Task Details Grid */}
            <div className="grid2">
              {/* Status */}
              <div className="field">
                <label className="field-label">Status</label>
                <div className="input" style={{ 
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  backgroundColor: 'var(--surface-2)',
                  cursor: 'default'
                }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    ...getStatusStyle(task.status || '')
                  }}>
                    {task.status || 'N/A'}
                  </span>
                </div>
              </div>

              {/* User ID */}
              <div className="field">
                <label className="field-label">User ID</label>
                <div className="input" style={{ 
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  backgroundColor: 'var(--surface-2)',
                  cursor: 'default'
                }}>
                  {task.userID || 'N/A'}
                </div>
              </div>

              {/* Created By */}
              <div className="field">
                <label className="field-label">Created By</label>
                <div className="input" style={{ 
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  backgroundColor: 'var(--surface-2)',
                  cursor: 'default'
                }}>
                  {task.createdBy || 'N/A'}
                </div>
              </div>

              {/* Created Date */}
              <div className="field">
                <label className="field-label">Created Date</label>
                <div className="input" style={{ 
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  backgroundColor: 'var(--surface-2)',
                  cursor: 'default'
                }}>
                  {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>

              {/* Due Date */}
              <div className="field">
                <label className="field-label">Due Date</label>
                <div className="input" style={{ 
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  backgroundColor: 'var(--surface-2)',
                  cursor: 'default'
                }}>
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                </div>
              </div>

              {/* Completed Date */}
              <div className="field">
                <label className="field-label">Completed Date</label>
                <div className="input" style={{ 
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  backgroundColor: 'var(--surface-2)',
                  cursor: 'default'
                }}>
                  {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>

            {/* Task ID */}
            <div className="field">
              <label className="field-label">Task ID</label>
              <div className="input" style={{ 
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                backgroundColor: 'var(--surface-2)',
                cursor: 'default',
                fontFamily: 'monospace',
                color: 'var(--muted)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {task.taskID || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="card-footer">
          <div></div>
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
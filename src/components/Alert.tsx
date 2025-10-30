{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}


import React from 'react';

// TypeScript interface for component props
interface AlertProps {
  message: string;
  type: 'success' | 'error' | 'info';
  id?: number | string;
  onRemove?: (id: number | string) => void;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
  showCloseButton?: boolean;
}

// Alert component with auto-close functionality
export default function Alert({ 
  message, 
  type, 
  id,
  onRemove,
  onClose,
  autoClose = true,
  duration = 5000,
  showCloseButton = true 
}: AlertProps) {

  // Component state management
  const [isVisible, setIsVisible] = React.useState(true);

  // Auto-close timer effect
  React.useEffect(() => {
    if (autoClose && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration]);

  // Close handler logic
  const handleClose = () => {
    setIsVisible(false);
    
    // Call parent's remove function if provided
    if (id && onRemove) {
      onRemove(id);
    }
    
    // Call additional close callback if provided
    onClose?.();
  };

  // Early return for hidden alerts
  if (!isVisible) {
    return null;
  }

  // Alert styling logic
  const getAlertStyles = (alertType: 'success' | 'error' | 'info') => {
    const baseStyles = {
      padding: '3px 8px',
      borderRadius: '8px',
      marginBottom: '12px',
      border: '1px solid',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    };

    switch (alertType) {
      case 'success':
        return {
          ...baseStyles,
          backgroundColor: '#d1fae5',
          borderColor: '#10b981',
          color: '#065f46'
        };
      case 'error':
        return {
          ...baseStyles,
          backgroundColor: '#fee2e2',
          borderColor: '#ef4444',
          color: '#991b1b'
        };
      case 'info':
        return {
          ...baseStyles,
          backgroundColor: '#dbeafe',
          borderColor: '#3b82f6',
          color: '#1e40af'
        };
      default:
        return baseStyles;
    }
  };

  // Component render
  return (
    <div className="container" style={getAlertStyles(type)}>
      <div style={{ fontSize: '14px' }}>{message}</div>
      {showCloseButton && (
        <button 
          className="close" 
          aria-label="Close alert" 
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            color: 'inherit'
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
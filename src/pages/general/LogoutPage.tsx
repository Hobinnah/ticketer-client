{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}

import { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function LogoutPage() {
  const { handleLogout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // console.log('🔄 Logout page: Starting logout...'); // SECURITY: Logout flow logging
        await handleLogout();
        // console.log('✅ Logout page: Success, redirecting...'); // SECURITY: Logout flow logging
      } catch (error) {
        console.error('❌ Logout page: Error during logout:', error);
      } finally {
        // Always navigate to login regardless of success/failure
        navigate('/login', { replace: true });
      }
    };

    performLogout();
  }, [handleLogout, navigate]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div style={{ fontSize: '18px' }}>Logging out...</div>
      <div style={{ 
        width: '40px', 
        height: '40px', 
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
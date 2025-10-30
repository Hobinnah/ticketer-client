{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}

import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthProvider from './contexts/AuthProvider.tsx';
import NotFoundPage from './pages/general/NotFoundPage.tsx';
import AccessDeniedPage from './pages/general/AccessDeniedPage.tsx';
import TaskList from './pages/tasks/TaskList.tsx';
import TaskDetails from './pages/tasks/TaskDetails.tsx';
import LoginPage from './pages/general/LoginPage.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import ChangePasswordPage from './pages/general/ChangePasswordPage.tsx';
import ForgotPasswordPage from './pages/general/ForgotPasswordPage.tsx';
import ResetPasswordPage from './pages/general/ResetPasswordPage.tsx';
import ConfirmEmailPage from './pages/general/ConfirmEmailPage.tsx';
import RegistrationPage from './pages/general/RegistrationPage.tsx';
import HooksErrorBoundary from './components/HooksErrorBoundary.tsx';
import LogoutPage from './pages/general/LogoutPage.tsx';
import TicketList from './pages/tickets/TicketList.tsx';
import TicketDetails from './pages/tickets/TicketDetails.tsx';



const router = createBrowserRouter([

  { path: "/", element: <LoginPage />,  errorElement: <NotFoundPage />  },
  { path: "/overview", element: ( <ProtectedRoute allowedRoles={['viewer', 'user', 'admin']}> <App />  </ProtectedRoute> ) },
  { path: "/login", element: <LoginPage />  },
  { path: "/logout", element: <LogoutPage />  },
  { path: "/register", element: <RegistrationPage />  },
  { path: "/forgot-password", element: <ForgotPasswordPage />  },
  { path: "/reset-password", element: <ResetPasswordPage />  },
  { path: "/confirm-email", element: <ConfirmEmailPage />  },
  { path: "/access-denied", element: <AccessDeniedPage />  },
  { path: "/change-password", element: ( <ProtectedRoute allowedRoles={['viewer', 'user', 'admin']}> <ChangePasswordPage />  </ProtectedRoute> ) },
  { path: "/tasks", element: ( <ProtectedRoute allowedRoles={['viewer', 'user', 'admin']}> <TaskList />  </ProtectedRoute> ) },
  { path: "/tasks/:id", element: ( <ProtectedRoute allowedRoles={['user', 'admin']}> <TaskDetails />  </ProtectedRoute> ) },

  { path: "/tickets", element: ( <ProtectedRoute allowedRoles={['viewer','user','admin']}> <TicketList />  </ProtectedRoute> ) },
  { path: "/tickets/:id", element: ( <ProtectedRoute allowedRoles={['user','admin']}> <TicketDetails />  </ProtectedRoute> ) },])

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <HooksErrorBoundary onError={(error, info) => {
    console.error('🚨 Main Error Boundary Caught Hooks Violation:', error);
    console.log('Component Stack:', info.componentStack);
  }}>
    <AuthProvider> 
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
         </QueryClientProvider>
    </AuthProvider> 
  </HooksErrorBoundary>
)

import { Outlet } from 'react-router-dom';
import './AuthLayout.css';

/**
 * AuthLayout - Layout wrapper for authentication pages (login, callback)
 */
export function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-background">
        <div className="auth-grid"></div>
        <div className="auth-glow auth-glow--1"></div>
        <div className="auth-glow auth-glow--2"></div>
      </div>
      
      <div className="auth-container">
        <div className="auth-brand">
          <div className="auth-logo">
            <span className="auth-logo-mark">T</span>
          </div>
          <h1 className="auth-title">HelixGuard</h1>
          <p className="auth-subtitle">Clinical Decision Intelligence</p>
        </div>
        
        <div className="auth-card">
          <Outlet />
        </div>
        
        <footer className="auth-footer">
          <p>© {new Date().getFullYear()} HelixGuard. Clinical AI Governance.</p>
        </footer>
      </div>
    </div>
  );
}

export default AuthLayout;


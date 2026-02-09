import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { env } from '@config/env';
import { useAuth } from '@hooks/useAuth';
import { Button } from '@components/common/Button';
import './Login.css';

/**
 * Login - Authentication entry point page
 * 
 * When auth is enabled, redirects to SSO
 * When auth is bypassed (default), redirects to dashboard
 */
export function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, login } = useAuth();

  // If already authenticated or auth is bypassed, redirect to dashboard
  useEffect(() => {
    if (env.auth.bypassAuth || isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [navigate, isAuthenticated]);

  // Handle SSO login
  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // Auth bypassed - show redirect message
  if (env.auth.bypassAuth) {
    return (
      <div className="login-content">
        <h2 className="login-title">Development Mode</h2>
        <p className="login-description">
          Authentication is disabled. Redirecting to dashboard...
        </p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="login-content">
        <h2 className="login-title">Loading...</h2>
        <p className="login-description">
          Checking authentication status...
        </p>
      </div>
    );
  }

  // Login page
  return (
    <div className="login-content">
      <h2 className="login-title">Sign In</h2>
      <p className="login-description">
        Access your executive dashboard with your organization credentials.
      </p>

      <Button
        variant="primary"
        size="lg"
        onClick={handleLogin}
        className="login-button"
      >
        Continue with SSO
      </Button>

      <div className="login-divider">
        <span>Secure enterprise authentication</span>
      </div>

      <ul className="login-features">
        <li>• Enterprise-grade security</li>
        <li>• Single Sign-On enabled</li>
        <li>• Multi-factor authentication</li>
      </ul>
    </div>
  );
}

export default Login;

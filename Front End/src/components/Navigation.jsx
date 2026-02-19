import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HomeIcon, UserIcon, FileIcon, TargetIcon, TrendingUpIcon, SearchIcon, LogoutIcon } from './Icons';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav>
      <Link to="/" className={isActive('/') || isActive('/home') ? 'active' : ''}>
        <HomeIcon size={18} color="currentColor" style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
        Home
      </Link>
      <Link to="/profile" className={isActive('/profile')}>
        <UserIcon size={18} color="currentColor" style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
        Profile
      </Link>
      <Link to="/assessment" className={isActive('/assessment')}>
        <FileIcon size={18} color="currentColor" style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
        Assessment
      </Link>
      <Link to="/recommendation" className={isActive('/recommendation')}>
        <TargetIcon size={18} color="currentColor" style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
        Recommendation
      </Link>
      <Link to="/dashboard" className={isActive('/dashboard')}>
        <TrendingUpIcon size={18} color="currentColor" style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
        Market Trends
      </Link>
      <Link to="/jobsearch" className={isActive('/jobsearch')}>
        <SearchIcon size={18} color="currentColor" style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
        Job Search
      </Link>
      <div className="nav-user-section">
        {user && (
          <span className="nav-user-name">
            {user.name || user.email}
          </span>
        )}
        <button onClick={handleLogout} className="nav-logout-btn">
          <LogoutIcon size={16} color="currentColor" style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navigation;

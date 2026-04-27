// src/components/StatCard.jsx
import React from 'react';
import './StatCard.css';

const StatCard = ({ 
  icon, 
  value, 
  label, 
  trend, 
  trendValue, 
  color = 'primary',
  onClick,
  loading = false 
}) => {
  const getColorClass = () => {
    switch (color) {
      case 'blue':
        return 'stat-card-blue';
      case 'green':
        return 'stat-card-green';
      case 'orange':
        return 'stat-card-orange';
      case 'purple':
        return 'stat-card-purple';
      case 'teal':
        return 'stat-card-teal';
      case 'pink':
        return 'stat-card-pink';
      default:
        return 'stat-card-primary';
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    return trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️';
  };

  const getTrendColor = () => {
    if (!trend) return '';
    return trend === 'up' ? 'trend-up' : trend === 'down' ? 'trend-down' : 'trend-neutral';
  };

  return (
    <div className={`stat-card ${getColorClass()}`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      {loading ? (
        <div className="stat-card-loading">
          <div className="loading-skeleton"></div>
          <div className="loading-skeleton"></div>
        </div>
      ) : (
        <>
          <div className="stat-card-header">
            <span className="stat-icon">{icon}</span>
            {trend && (
              <div className={`stat-trend ${getTrendColor()}`}>
                <span className="trend-icon">{getTrendIcon()}</span>
                <span className="trend-value">{trendValue}</span>
              </div>
            )}
          </div>
          <div className="stat-card-body">
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
          <div className="stat-card-footer">
            <div className="stat-progress">
              <div className="stat-progress-bar" style={{ width: `${Math.min(100, (value / 1000) * 100)}%` }}></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StatCard;
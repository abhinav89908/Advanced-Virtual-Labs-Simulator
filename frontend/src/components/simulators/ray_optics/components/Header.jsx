import React from 'react';
import './Header.css';

const Header = ({ title, explanationTip }) => {
  return (
    <header className="simulator-header">
      <h1>{title}</h1>
      <div className="tip-container">
        <div className="bulb-tooltip">
          <span className="bulb-icon">💡</span>
          <span className="tooltip-text">{explanationTip}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;

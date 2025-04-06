import React from 'react';
import './Header.css';

const Header = ({ isConnected, isConnecting, navigateToHome }) => {
  return (
    <header className="main-header">
      <div 
        className="logo" 
        onClick={navigateToHome}
      >
        <img src="/logo.svg" alt="Virtual Labs Logo" />
        <h1>Virtual Labs Simulator</h1>
      </div>
      
      <div className="connection-status">
        {isConnecting ? (
          <span className="connecting">
            <span className="dot-animation"></span>
            Connecting...
          </span>
        ) : isConnected ? (
          <span className="connected">
            <span className="status-dot"></span>
            Connected
          </span>
        ) : (
          <span className="disconnected">
            <span className="status-dot"></span>
            Disconnected
          </span>
        )}
      </div>
    </header>
  );
};

export default Header;

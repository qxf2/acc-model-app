import React from 'react';
import { Link } from 'react-router-dom';

function Layout({ children }) {
  return (
    <div>
      <header>
        <nav>
          <ul>
          <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/acc-models">ACC Models</Link></li>
            <li><Link to="/components">Components</Link></li>
            <li><Link to="/capabilities">Capabilities</Link></li>
            <li><Link to="/attributes">Attributes</Link></li>
          </ul>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}

export default Layout;

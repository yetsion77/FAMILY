import React from 'react';
import { Network } from 'lucide-react';

const Topbar = () => {
  return (
    <div className="topbar glass-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <Network color="var(--primary-color)" size={28} />
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary-color)' }}>עץ משפחה</h1>
      </div>
      <div>
        {/* Global mode toggle removed. Application is now purely dynamic. */}
        <span style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>שורש אילן יוחסין</span>
      </div>
    </div>
  );
};

export default Topbar;

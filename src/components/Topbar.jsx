import React from 'react';
import { Edit2, Eye } from 'lucide-react';

const Topbar = ({ isEditMode, setIsEditMode }) => {
  return (
    <header className="topbar glass-card">
      <h2>עץ המשפחה שלנו</h2>
      <button 
        className="mode-toggle"
        onClick={() => setIsEditMode(!isEditMode)}
      >
        {isEditMode ? <><Eye size={18} /> מצב תצוגה</> : <><Edit2 size={18} /> מצב עריכה</>}
      </button>
    </header>
  );
};

export default Topbar;

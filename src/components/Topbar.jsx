import React, { useState, useRef, useEffect } from 'react';
import { Network, Search } from 'lucide-react';

const Topbar = ({ people = [], onFocusTarget }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const filteredPeople = searchTerm.trim() 
    ? people.filter(p => p.name && p.name.includes(searchTerm)).slice(0, 8) 
    : [];

  const handleSelect = (id) => {
    setSearchTerm('');
    setShowResults(false);
    if (onFocusTarget) onFocusTarget(id);
  };

  const handleExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(people, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadAnchorNode.setAttribute("download", `family_backup_${dateStr}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    setLogoClicks(0); // Optional: hide the button after downloading
  };

  return (
    <div className="topbar glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', userSelect: 'none' }} 
        onClick={() => setLogoClicks(prev => prev + 1)}
      >
        <Network color="var(--primary-color)" size={28} />
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary-color)' }}>עץ משפחה</h1>
      </div>
      
      <div ref={wrapperRef} style={{ position: 'relative', width: '300px', maxWidth: '50%' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={18} style={{ position: 'absolute', right: '12px', color: '#a0aec0' }} />
          <input 
            type="text" 
            placeholder="חיפוש דמות (לפי שם)..." 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setShowResults(true); }}
            onFocus={() => setShowResults(true)}
            style={{ 
              width: '100%', padding: '0.6rem 2.5rem 0.6rem 0.6rem', 
              borderRadius: '20px', border: '1px solid #cbd5e0', 
              outline: 'none', fontSize: '1rem',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
            }}
          />
        </div>
        
        {showResults && filteredPeople.length > 0 && (
          <div style={{ 
            position: 'absolute', top: '100%', left: 0, right: 0, 
            marginTop: '0.5rem', background: 'white', borderRadius: '12px', 
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 100, border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            {filteredPeople.map(person => (
              <div 
                key={person.id} 
                onClick={() => handleSelect(person.id)}
                style={{ 
                  padding: '0.8rem 1rem', cursor: 'pointer', borderBottom: '1px solid #f1f5f9',
                  display: 'flex', alignItems: 'center', gap: '0.8rem',
                  transition: 'background 0.2s',
                  color: 'var(--text-color)'
                }}
                onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseOut={e => e.currentTarget.style.background = 'white'}
              >
                {person.photoUrl ? (
                   <img src={person.photoUrl} alt={person.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                   <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>👤</div>
                )}
                <span style={{ fontWeight: 500 }}>{person.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {logoClicks >= 5 && (
        <button 
          onClick={handleExportBackup} 
          style={{ 
            background: '#48bb78', color: 'white', border: 'none', 
            padding: '0.6rem 1rem', borderRadius: '8px', 
            cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
          title="הורד גיבוי של מסד הנתונים"
        >
          💾 לשמור גיבוי גיטהאב
        </button>
      )}
    </div>
  );
};

export default Topbar;

import React from 'react';

const PersonCard = ({ person, onClick, isFocus }) => {
  return (
    <div 
      className="person-node glass-card" 
      style={{ 
        padding: '1rem', 
        transform: isFocus ? 'scale(1.05)' : 'scale(1)',
        border: isFocus ? '2px solid var(--secondary-color)' : '1px solid var(--card-border)',
        boxShadow: isFocus ? '0 10px 25px rgba(230, 126, 34, 0.2)' : 'var(--shadow-sm)'
      }} 
      onClick={onClick}
    >
      <img 
        src={person.photoUrl || "https://api.dicebear.com/7.x/initials/svg?seed=" + person.name} 
        alt={person.name} 
        className="person-avatar"
      />
      <div className="person-name">{person.name || "שם חסר"}</div>
      {(person.birthYear || person.deathYear) && (
        <div className="person-dates">
          {person.birthYear} - {person.deathYear || 'היום'}
        </div>
      )}
    </div>
  );
};

export default PersonCard;

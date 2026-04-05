import React from 'react';

const PersonCard = ({ person, onClick }) => {
  return (
    <div className="person-node glass-card" style={{ padding: '1rem', margin: '0.5rem' }} onClick={onClick}>
      <img 
        src={person.photoUrl || "https://api.dicebear.com/7.x/initials/svg?seed=" + person.name} 
        alt={person.name} 
        className="person-avatar"
      />
      <div className="person-name">{person.name}</div>
      {(person.birthYear || person.deathYear) && (
        <div className="person-dates">
          {person.birthYear} - {person.deathYear || 'היום'}
        </div>
      )}
    </div>
  );
};

export default PersonCard;

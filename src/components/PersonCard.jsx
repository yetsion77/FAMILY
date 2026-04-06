import React from 'react';

const PersonCard = ({ person, onClick, isFocus }) => {
  let genderClass = '';
  if (person.gender === 'male') genderClass = 'gender-male';
  if (person.gender === 'female') genderClass = 'gender-female';

  // Seed avatar generation based on gender if no photo exists
  const seedPrefix = person.gender === 'female' ? 'adventurer' : 'avataaars';
  const fallbackAvatar = `https://api.dicebear.com/7.x/${seedPrefix}/svg?seed=${person.name}&backgroundColor=transparent`;

  return (
    <div 
      className={`person-node glass-card ${genderClass}`} 
      style={{ 
        padding: '1rem', 
        transform: isFocus ? 'scale(1.05)' : 'scale(1)',
        border: isFocus && !genderClass ? '2px solid var(--secondary-color)' : '',
        boxShadow: isFocus ? '0 10px 25px rgba(230, 126, 34, 0.2)' : 'var(--shadow-sm)'
      }} 
      onClick={onClick}
    >
      <img 
        src={person.photoUrl || fallbackAvatar} 
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

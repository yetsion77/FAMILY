import React from 'react';

const PersonCard = ({ person, onClick, isFocus, hasChildrenIndicator }) => {
  let genderClass = '';
  if (person.gender === 'male') genderClass = 'gender-male';
  if (person.gender === 'female') genderClass = 'gender-female';

  return (
    <div 
      className={`person-node glass-card ${genderClass}`} 
      style={{ 
        padding: '1.2rem 1rem', 
        transform: isFocus ? 'scale(1.15)' : 'scale(1)',
        border: isFocus && !genderClass ? '2px solid var(--secondary-color)' : '',
        boxShadow: isFocus ? '0 10px 25px rgba(230, 126, 34, 0.2)' : 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80px',
        position: 'relative'
      }} 
      onClick={onClick}
    >
      <div className="person-name">{person.name || "שם חסר"}</div>
      {(person.birthYear || person.deathYear) && (
        <div className="person-dates" style={{ marginTop: '0.5rem' }}>
          {person.birthYear} - {person.deathYear || 'היום'}
        </div>
      )}

      {hasChildrenIndicator && (
         <div style={{ 
            position: 'absolute', bottom: '-10px', 
            background: 'var(--card-bg)', border: '2px solid #cbd5e0', 
            borderRadius: '50%', width: '24px', height: '24px', 
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            color: 'var(--primary-color)', fontSize: '1.2rem', lineHeight: 1, zIndex: 10
         }} title="לחץ כדי להתמקד בענף ובקשרים של דמות זו">
            +
         </div>
      )}
    </div>
  );
};

export default PersonCard;

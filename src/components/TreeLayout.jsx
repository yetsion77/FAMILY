import React from 'react';
import PersonCard from './PersonCard';

const TreeLayout = ({ people, onPersonClick, focusId }) => {
  if (people.length === 0) return null;

  // השתמש בדמות הממוקדת או בראשונה כברירת מחדל
  const focusPerson = people.find(p => p.id === focusId) || people[0];
  if (!focusPerson) return null;

  // חילוץ קשרים
  const parents = people.filter(p => p.id === focusPerson.fatherId || p.id === focusPerson.motherId || p.id === focusPerson.parentId);
  const spouses = people.filter(p => focusPerson.spouseId && p.id === focusPerson.spouseId);
  const siblings = people.filter(p => 
    p.id !== focusPerson.id && 
    ((p.fatherId && p.fatherId === focusPerson.fatherId) || (p.motherId && p.motherId === focusPerson.motherId) || (p.parentId && p.parentId === focusPerson.parentId))
  );
  
  // חילוץ ילדים
  const spouseIds = spouses.map(s => s.id);
  const targetParentIds = [focusPerson.id, ...spouseIds];
  const children = people.filter(p => 
    targetParentIds.includes(p.fatherId) || 
    targetParentIds.includes(p.motherId) || 
    targetParentIds.includes(p.parentId)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4rem', padding: '2rem' }}>
      
      {/* שורת הורים */}
      {parents.length > 0 && (
        <div style={{ display: 'flex', gap: '3rem', position: 'relative' }}>
          {parents.map(parent => (
            <PersonCard key={parent.id} person={parent} onClick={() => onPersonClick(parent)} />
          ))}
          {/* פס מחבר למטה לילד המרכזי */}
          <div style={{ position: 'absolute', bottom: '-2rem', left: '50%', width: '2px', height: '2rem', background: '#cbd5e0' }} />
        </div>
      )}

      {/* שורת המרכז: אחים + דמות מרכזית + בני זוג */}
      <div style={{ display: 'flex', gap: '3rem', alignItems: 'center', position: 'relative' }}>
        
        {/* אחים */}
        {siblings.length > 0 && (
          <div style={{ display: 'flex', gap: '2rem', borderRight: '2px dashed #cbd5e0', paddingRight: '2rem' }}>
            {siblings.map(sibling => (
               <PersonCard key={sibling.id} person={sibling} onClick={() => onPersonClick(sibling)} />
            ))}
          </div>
        )}

        {/* המרכז ובני הזוג */}
        <div style={{ 
          display: 'flex', gap: '1.5rem', background: 'rgba(230, 126, 34, 0.08)', 
          padding: '1.5rem', borderRadius: '1.5rem', border: '2px solid rgba(230, 126, 34, 0.3)',
          boxShadow: '0 4px 15px rgba(230, 126, 34, 0.1)' 
        }}>
          <PersonCard person={focusPerson} onClick={() => onPersonClick(focusPerson)} isFocus={true} />
          
          {spouses.map(spouse => (
            <React.Fragment key={spouse.id}>
              <div style={{ width: '20px', display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '100%', height: '3px', background: '#e67e22' }} />
              </div>
              <PersonCard person={spouse} onClick={() => onPersonClick(spouse)} />
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* שורת ילדים */}
      {children.length > 0 && (
        <div style={{ display: 'flex', gap: '2rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-2rem', left: '50%', width: '2px', height: '2rem', background: '#cbd5e0' }} />
          
          {children.length > 1 && (
            <div className="tree-line-horizontal" style={{ top: '-2rem', left: `calc(50% / ${children.length})`, width: `calc(100% - 100% / ${children.length})`, height: '2px', background: '#cbd5e0' }} />
          )}

          {children.map(child => (
            <div key={child.id} style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-2rem', left: '50%', width: '2px', height: '2rem', background: '#cbd5e0' }} />
              <PersonCard person={child} onClick={() => onPersonClick(child)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeLayout;

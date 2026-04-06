import React from 'react';
import PersonCard from './PersonCard';

const AncestorsTree = ({ personId, people, onPersonClick, level = 0 }) => {
  const person = people.find(p => p.id === personId);
  if (!person) return null;

  const father = people.find(p => p.id === person.fatherId);
  const mother = people.find(p => p.id === person.motherId);
  
  if (!father && !mother) return null;

  // הקטנת הפרופורציה בכל דור עליון ב-12%
  const scale = Math.max(0.65, 1 - level * 0.12);
  const opacity = Math.max(0.6, 1 - level * 0.15);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <div style={{ display: 'flex', gap: `${4 * scale}rem`, position: 'relative', paddingBottom: `${3 * scale}rem` }}>
        {father && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <AncestorsTree personId={father.id} people={people} onPersonClick={onPersonClick} level={level + 1} />
            <div style={{ transform: `scale(${scale})`, opacity, transformOrigin: 'bottom center', zIndex: 10 }}>
              <PersonCard person={father} onClick={() => onPersonClick(father)} />
            </div>
          </div>
        )}
        
        {mother && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <AncestorsTree personId={mother.id} people={people} onPersonClick={onPersonClick} level={level + 1} />
            <div style={{ transform: `scale(${scale})`, opacity, transformOrigin: 'bottom center', zIndex: 10 }}>
              <PersonCard person={mother} onClick={() => onPersonClick(mother)} />
            </div>
          </div>
        )}

        {/* קו מחבר בין ההורים */}
        {father && mother && (
          <div className="tree-line-horizontal" style={{ bottom: `${3 * scale}rem`, left: '25%', width: '50%', height: '2px', zIndex: 1 }} />
        )}
      </div>

      {/* קו היורד מההורים (או הורה בודד) למטה אל הילד */}
      <div className="tree-line-vertical" style={{ position: 'absolute', bottom: 0, height: `${3 * scale}rem`, left: '50%', zIndex: 1 }} />
    </div>
  );
};

const TreeLayout = ({ people, onPersonClick, focusId }) => {
  if (people.length === 0) return null;

  const focusPerson = people.find(p => p.id === focusId) || people[0];
  if (!focusPerson) return null;

  const spouses = people.filter(p => focusPerson.spouseId && p.id === focusPerson.spouseId);
  const siblings = people.filter(p => 
    p.id !== focusPerson.id && 
    ((p.fatherId && p.fatherId === focusPerson.fatherId) || (p.motherId && p.motherId === focusPerson.motherId) || (p.parentId && p.parentId === focusPerson.parentId))
  );
  
  const spouseIds = spouses.map(s => s.id);
  const targetParentIds = [focusPerson.id, ...spouseIds];
  const children = people.filter(p => 
    targetParentIds.includes(p.fatherId) || targetParentIds.includes(p.motherId) || targetParentIds.includes(p.parentId)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '1rem' }}>
      
      {/* 1. עץ השורשים הרקורסיבי מלמעלה */}
      <div style={{ marginBottom: '0' }}>
         <AncestorsTree personId={focusPerson.id} people={people} onPersonClick={onPersonClick} />
      </div>

      {/* 2. שורת המרכז: אחים + דמות מרכזית + בני זוג */}
      <div style={{ display: 'flex', gap: '3rem', alignItems: 'center', position: 'relative', marginTop: '2.5rem' }}>
        
        {/* אחים בצד ימין (RTL) */}
        {siblings.length > 0 && (
          <div style={{ display: 'flex', gap: '2rem', borderRight: '2px dashed #cbd5e0', paddingRight: '2rem' }}>
            {siblings.map(sibling => (
               <div key={sibling.id} style={{transform: 'scale(0.85)', opacity: 0.8}}><PersonCard person={sibling} onClick={() => onPersonClick(sibling)} /></div>
            ))}
          </div>
        )}

        {/* תא משפחתי מלא (מוקד + נישואים) */}
        <div style={{ 
          display: 'flex', gap: '1.5rem', background: 'var(--card-bg)', 
          padding: '1.5rem', borderRadius: '1.5rem', border: '2px solid rgba(44, 62, 80, 0.1)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)' 
        }}>
          <PersonCard person={focusPerson} onClick={() => onPersonClick(focusPerson)} isFocus={true} />
          
          {spouses.map(spouse => (
            <React.Fragment key={spouse.id}>
              <div style={{ width: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', height: '3px', background: 'var(--primary-color)', opacity: 0.5 }} />
              </div>
              <PersonCard person={spouse} onClick={() => onPersonClick(spouse)} />
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 3. שורת ילדים יורדת מהתא המשפחתי */}
      {children.length > 0 && (
        <div style={{ display: 'flex', gap: '3rem', position: 'relative', marginTop: '4rem' }}>
          {/* קו עליון שיורד מהתא המשפחתי */}
          <div style={{ position: 'absolute', top: '-4rem', left: '50%', width: '2px', height: '4rem', background: '#cbd5e0' }} />
          
          {children.length > 1 && (
            <div className="tree-line-horizontal" style={{ top: '-1.5rem', left: `calc(50% / ${children.length})`, width: `calc(100% - 100% / ${children.length})`, height: '2px', background: '#cbd5e0' }} />
          )}

          {children.map(child => {
            const childSpouses = people.filter(p => child.spouseId && p.id === child.spouseId);
            return (
              <div key={child.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ position: 'absolute', top: '-2.5rem', left: '50%', width: '2px', height: '2.5rem', background: '#cbd5e0' }} />
                  <div style={{transform: 'scale(0.95)'}}>
                    <PersonCard person={child} onClick={() => onPersonClick(child)} />
                  </div>
                </div>
                
                {childSpouses.map(sp => (
                  <React.Fragment key={sp.id}>
                    <div style={{ width: '15px', height: '2px', background: '#cbd5e0', marginRight: '-0.5rem', marginLeft: '-0.5rem' }} />
                    <div style={{transform: 'scale(0.85)', opacity: 0.9}}>
                      <PersonCard person={sp} onClick={() => onPersonClick(sp)} />
                    </div>
                  </React.Fragment>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TreeLayout;

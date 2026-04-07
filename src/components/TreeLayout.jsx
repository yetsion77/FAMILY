import React from 'react';
import PersonCard from './PersonCard';

const checkHasSubtree = (personId, people) => {
  const person = people.find(p => p.id === personId);
  if (!person) return false;
  if (person.fatherId || person.motherId || person.spouseId) return true;
  return people.some(p => p.fatherId === personId || p.motherId === personId);
};

const AncestorsTree = ({ personId, people, onPersonClick, level = 0 }) => {
  const person = people.find(p => p.id === personId);
  if (!person) return null;

  const father = people.find(p => p.id === person.fatherId);
  const mother = people.find(p => p.id === person.motherId);
  
  if (!father && !mother) return null;

  const scale = Math.max(0.65, 1 - level * 0.12);
  const opacity = Math.max(0.6, 1 - level * 0.15);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <div style={{ display: 'flex', gap: `${4 * scale}rem`, position: 'relative', paddingBottom: `${3 * scale}rem` }}>
        {father && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <AncestorsTree personId={father.id} people={people} onPersonClick={onPersonClick} level={level + 1} />
            <div style={{ transform: `scale(${scale})`, opacity, transformOrigin: 'bottom center', zIndex: 10 }}>
              <PersonCard person={father} onClick={() => onPersonClick(father)} hasChildrenIndicator={checkHasSubtree(father.id, people)} />
            </div>
          </div>
        )}
        
        {mother && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <AncestorsTree personId={mother.id} people={people} onPersonClick={onPersonClick} level={level + 1} />
            <div style={{ transform: `scale(${scale})`, opacity, transformOrigin: 'bottom center', zIndex: 10 }}>
              <PersonCard person={mother} onClick={() => onPersonClick(mother)} hasChildrenIndicator={checkHasSubtree(mother.id, people)} />
            </div>
          </div>
        )}

        {father && mother && (
          <div className="tree-line-horizontal" style={{ bottom: `${3 * scale}rem`, left: '25%', width: '50%', height: '2px', zIndex: 1 }} />
        )}
      </div>

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

  const focusRowItems = [
     ...siblings.map(sib => ({ type: 'sibling', node: sib })),
     { type: 'focus', node: focusPerson }
  ];

  const hasParentsFlag = focusPerson.fatherId || focusPerson.motherId;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '1rem', margin: '0 auto', minWidth: 'max-content' }}>
      
      {/* 1. Ancestors row */}
      <div style={{ marginBottom: '0' }}>
         <AncestorsTree personId={focusPerson.id} people={people} onPersonClick={onPersonClick} />
      </div>

      {/* 2. Focus Row (Siblings + Focus Person) with precise crossbar aligned with Ancestors stem */}
      <div style={{ position: 'relative', marginTop: '0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {focusRowItems.map((item, index) => {
            const isFirst = index === 0;
            const isLast = index === focusRowItems.length - 1;
            const isOnly = focusRowItems.length === 1;

            return (
              <div key={item.node.id} style={{ display: 'flex', position: 'relative', padding: hasParentsFlag ? '2rem 1.5rem 0' : '0 1.5rem', minWidth: '160px', justifyContent: 'center' }}>
                
                {hasParentsFlag && (
                  <div style={{ position: 'absolute', top: '0', left: '50%', width: '2px', height: '2rem', background: '#cbd5e0' }} />
                )}
                
                {hasParentsFlag && !isOnly && (
                   <div style={{ 
                      position: 'absolute', top: 0, height: '2px', background: '#cbd5e0',
                      left: isLast ? '50%' : '0', 
                      width: isFirst || isLast ? '50%' : '100%',
                      zIndex: 0
                   }} />
                )}

                {item.type === 'sibling' ? (
                  <div style={{ display: 'flex', alignItems: 'flex-start', zIndex: 2 }}>
                    <div style={{transform: 'scale(0.85)', opacity: 0.8}}>
                       <PersonCard person={item.node} onClick={() => onPersonClick(item.node)} hasChildrenIndicator={checkHasSubtree(item.node.id, people)} />
                    </div>
                  </div>
                ) : (
                  <div style={{ 
                    display: 'flex', gap: '1rem', background: 'var(--card-bg)', 
                    padding: '1.2rem', borderRadius: '1.5rem', border: '2px solid rgba(44, 62, 80, 0.1)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)', zIndex: 2
                  }}>
                    <PersonCard person={item.node} onClick={() => onPersonClick(item.node)} isFocus={true} hasChildrenIndicator={checkHasSubtree(item.node.id, people)} />
                    
                    {spouses.map(spouse => (
                      <React.Fragment key={spouse.id}>
                        <div style={{ width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: '100%', height: '3px', background: 'var(--primary-color)', opacity: 0.5 }} />
                        </div>
                        <PersonCard person={spouse} onClick={() => onPersonClick(spouse)} hasChildrenIndicator={checkHasSubtree(spouse.id, people)} />
                      </React.Fragment>
                    ))}
                  </div>
                )}

              </div>
            )
          })}
        </div>
      </div>

      {/* 3. Descendants row perfectly aligned flex lines */}
      {children.length > 0 && (
        <div style={{ position: 'relative', marginTop: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <div style={{ width: '2px', height: '3rem', background: '#cbd5e0' }} />
          
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {children.map((child, index) => {
              const isFirst = index === 0;
              const isLast = index === children.length - 1;
              const isOnly = children.length === 1;

              const childSpouses = people.filter(p => child.spouseId && p.id === child.spouseId);

              return (
                <div key={child.id} style={{ display: 'flex', position: 'relative', padding: '2rem 1.5rem 0', minWidth: '160px', justifyContent: 'center' }}>
                  
                  <div style={{ position: 'absolute', top: '0', left: '50%', width: '2px', height: '2rem', background: '#cbd5e0' }} />
                  
                  {!isOnly && (
                     <div style={{ 
                        position: 'absolute', top: 0, height: '2px', background: '#cbd5e0',
                        left: isLast ? '50%' : '0', 
                        width: isFirst || isLast ? '50%' : '100%',
                        zIndex: 0
                     }} />
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', zIndex: 2 }}>
                    <div style={{transform: 'scale(0.95)'}}>
                       <PersonCard person={child} onClick={() => onPersonClick(child)} hasChildrenIndicator={checkHasSubtree(child.id, people)} />
                    </div>
                    
                    {childSpouses.map(sp => (
                      <React.Fragment key={sp.id}>
                        <div style={{ width: '15px', height: '2px', background: '#cbd5e0', marginRight: '-0.5rem', marginLeft: '-0.5rem', zIndex: 1 }} />
                        <div style={{transform: 'scale(0.85)', opacity: 0.9}}>
                           <PersonCard person={sp} onClick={() => onPersonClick(sp)} hasChildrenIndicator={checkHasSubtree(sp.id, people)} />
                        </div>
                      </React.Fragment>
                    ))}
                  </div>

                </div>
              )
            })}
          </div>

        </div>
      )}
    </div>
  );
};

export default TreeLayout;

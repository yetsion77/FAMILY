import React from 'react';
import PersonCard from './PersonCard';

const hasHiddenLinks = (personId, people, renderedIds) => {
  if (!renderedIds) return false;
  const person = people.find(p => p.id === personId);
  if (!person) return false;

  if (person.fatherId && !renderedIds.has(person.fatherId)) return true;
  if (person.motherId && !renderedIds.has(person.motherId)) return true;
  if (person.parentId && !renderedIds.has(person.parentId)) return true;

  const hasUnrenderedSpouse = people.some(p => 
    (person.spouseId === p.id || p.spouseId === person.id) && !renderedIds.has(p.id)
  );
  if (hasUnrenderedSpouse) return true;

  const hasUnrenderedChild = people.some(p => 
    (p.fatherId === personId || p.motherId === personId || p.parentId === personId) && !renderedIds.has(p.id)
  );
  if (hasUnrenderedChild) return true;

  return false;
};
const AncestorsTree = ({ personId, people, onPersonClick, level = 0, renderedIds }) => {
  const person = people.find(p => p.id === personId);
  if (!person) return null;

  const father = people.find(p => p.id === person.fatherId);
  const mother = people.find(p => p.id === person.motherId);
  
  if (!father && !mother) return null;

  const scale = Math.max(0.65, 1 - level * 0.12);
  const opacity = Math.max(0.6, 1 - level * 0.15);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: `${4 * scale}rem`, position: 'relative', paddingBottom: `${3 * scale}rem` }}>
        {father && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            <AncestorsTree personId={father.id} people={people} onPersonClick={onPersonClick} level={level + 1} renderedIds={renderedIds} />
            <div style={{ transform: `scale(${scale})`, opacity, transformOrigin: 'bottom center', zIndex: 10 }}>
              <PersonCard person={father} onClick={() => onPersonClick(father)} hasChildrenIndicator={hasHiddenLinks(father.id, people, renderedIds)} />
            </div>
            {mother && (
              <div className="tree-line-horizontal" style={{ position: 'absolute', bottom: `${3 * scale}rem`, right: '50%', width: `calc(50% + ${2 * scale}rem)`, height: '2px', zIndex: 1 }} />
            )}
          </div>
        )}
        
        {mother && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            <AncestorsTree personId={mother.id} people={people} onPersonClick={onPersonClick} level={level + 1} renderedIds={renderedIds} />
            <div style={{ transform: `scale(${scale})`, opacity, transformOrigin: 'bottom center', zIndex: 10 }}>
              <PersonCard person={mother} onClick={() => onPersonClick(mother)} hasChildrenIndicator={hasHiddenLinks(mother.id, people, renderedIds)} />
            </div>
            {father && (
              <div className="tree-line-horizontal" style={{ position: 'absolute', bottom: `${3 * scale}rem`, left: '50%', width: `calc(50% + ${2 * scale}rem)`, height: '2px', zIndex: 1 }} />
            )}
          </div>
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

  const siblingsBefore = siblings.slice(0, Math.ceil(siblings.length / 2));
  const siblingsAfter = siblings.slice(Math.ceil(siblings.length / 2));

  const focusRowItems = [
     ...siblingsBefore.map(sib => ({ type: 'sibling', node: sib })),
     { type: 'focus', node: focusPerson },
     ...siblingsAfter.map(sib => ({ type: 'sibling', node: sib }))
  ];

  const renderedIds = new Set();
  const markRendered = id => { if(id) renderedIds.add(id); };
  
  markRendered(focusPerson.id);
  spouses.forEach(s => markRendered(s.id));
  siblings.forEach(s => markRendered(s.id));
  children.forEach(c => {
    markRendered(c.id);
    const cSpouses = people.filter(p => c.spouseId && p.id === c.spouseId);
    cSpouses.forEach(csp => markRendered(csp.id));
  });

  const addAncestorsToSet = (personId) => {
    const p = people.find(x => x.id === personId);
    if (!p) return;
    if (p.fatherId) { markRendered(p.fatherId); addAncestorsToSet(p.fatherId); }
    if (p.motherId) { markRendered(p.motherId); addAncestorsToSet(p.motherId); }
  };
  addAncestorsToSet(focusPerson.id);

  const hasParentsFlag = focusPerson.fatherId || focusPerson.motherId;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '1rem', margin: '0 auto', minWidth: 'max-content' }}>
      
      {/* 1. Ancestors row */}
      <div style={{ marginBottom: '0' }}>
         <AncestorsTree personId={focusPerson.id} people={people} onPersonClick={onPersonClick} renderedIds={renderedIds} />
      </div>

      {/* 2. Focus Row (Siblings + Focus Person) and Descendants inside Focus Node */}
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
                       <PersonCard person={item.node} onClick={() => onPersonClick(item.node)} hasChildrenIndicator={hasHiddenLinks(item.node.id, people, renderedIds)} />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {spouses.length > 0 && (
                         <div style={{ display: 'flex', gap: '1rem', visibility: 'hidden', pointerEvents: 'none' }}>
                           {spouses.map(sp => (
                             <React.Fragment key={`spacer-${sp.id}`}>
                               <div style={{ width: '20px' }}></div>
                               <PersonCard person={sp} />
                             </React.Fragment>
                           ))}
                           <div style={{ width: 0 }}></div>
                         </div>
                      )}

                      <div style={{ 
                        display: 'flex', gap: '1rem', background: 'var(--card-bg)', 
                        padding: '1.2rem', borderRadius: '1.5rem', border: '2px solid rgba(44, 62, 80, 0.1)',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)', zIndex: 2
                      }}>
                        <PersonCard person={item.node} onClick={() => onPersonClick(item.node)} isFocus={true} hasChildrenIndicator={hasHiddenLinks(item.node.id, people, renderedIds)} />
                        
                        {spouses.map(spouse => (
                          <React.Fragment key={spouse.id}>
                            <div style={{ width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <div style={{ width: '100%', height: '3px', background: 'var(--primary-color)', opacity: 0.5 }} />
                            </div>
                            <PersonCard person={spouse} onClick={() => onPersonClick(spouse)} hasChildrenIndicator={hasHiddenLinks(spouse.id, people, renderedIds)} />
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    {/* 3. Descendants row placed directly under Focus capsule */}
                    {children.length > 0 && (
                      <div style={{ position: 'relative', marginTop: '0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        
                        <div style={{ width: '2px', height: '3rem', background: '#cbd5e0' }} />
                        
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          {children.map((child, index) => {
                            const childIsFirst = index === 0;
                            const childIsLast = index === children.length - 1;
                            const childIsOnly = children.length === 1;

                            const childSpouses = people.filter(p => child.spouseId && p.id === child.spouseId);

                            return (
                              <div key={child.id} style={{ display: 'flex', position: 'relative', padding: '2rem 1.5rem 0', minWidth: '160px', justifyContent: 'center' }}>
                                
                                <div style={{ position: 'absolute', top: '0', left: '50%', width: '2px', height: '2rem', background: '#cbd5e0' }} />
                                
                                {!childIsOnly && (
                                   <div style={{ 
                                      position: 'absolute', top: 0, height: '2px', background: '#cbd5e0',
                                      left: childIsLast ? '50%' : '0', 
                                      width: childIsFirst || childIsLast ? '50%' : '100%',
                                      zIndex: 0
                                   }} />
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', zIndex: 2 }}>
                                  
                                  {childSpouses.length > 0 && (
                                    <div style={{ display: 'flex', visibility: 'hidden', pointerEvents: 'none' }}>
                                      {childSpouses.map(sp => (
                                        <React.Fragment key={`spacer-${sp.id}`}>
                                          <div style={{ transform: 'scale(0.85)' }}>
                                             <PersonCard person={sp} />
                                          </div>
                                          <div style={{ width: '15px', height: '2px', marginRight: '-0.5rem', marginLeft: '-0.5rem' }} />
                                        </React.Fragment>
                                      ))}
                                    </div>
                                  )}

                                  <div style={{transform: 'scale(0.95)'}}>
                                     <PersonCard person={child} onClick={() => onPersonClick(child)} hasChildrenIndicator={hasHiddenLinks(child.id, people, renderedIds)} />
                                  </div>
                                  
                                  {childSpouses.map(sp => (
                                    <React.Fragment key={sp.id}>
                                      <div style={{ width: '15px', height: '2px', background: '#cbd5e0', marginRight: '-0.5rem', marginLeft: '-0.5rem', zIndex: 1 }} />
                                      <div style={{transform: 'scale(0.85)', opacity: 0.9}}>
                                         <PersonCard person={sp} onClick={() => onPersonClick(sp)} hasChildrenIndicator={hasHiddenLinks(sp.id, people, renderedIds)} />
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
                )}

              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default TreeLayout;

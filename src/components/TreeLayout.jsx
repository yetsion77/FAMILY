import React from 'react';
import PersonCard from './PersonCard';

const TreeLayout = ({ people, onPersonClick }) => {
  // Map logic to render a basic top-down structure
  // Simple algorithm: Roots first, then children side by side below them
  const roots = people.filter(p => !p.parentId);

  const renderNode = (person) => {
    const children = people.filter(p => p.parentId === person.id);
    
    return (
      <div key={person.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 2rem' }}>
        <PersonCard person={person} onClick={() => onPersonClick(person)} />
        
        {children.length > 0 && (
          <div style={{ display: 'flex', position: 'relative', marginTop: '1.5rem', paddingTop: '1.5rem' }}>
             {/* Horizontal connector line */}
             {children.length > 1 && (
               <div className="tree-line-horizontal" style={{ 
                 top: 0, 
                 left: `calc(50% / ${children.length})`, 
                 width: `calc(100% - 100% / ${children.length})` 
               }} />
             )}
             
             {/* Vertical connector to parent */}
             <div className="tree-line-vertical" style={{ top: 0, left: '50%', height: '1.5rem', transform: 'translateY(-1.5rem)' }} />
             
             {children.map(child => (
               <div key={child.id} style={{ position: 'relative' }}>
                 {/* Vertical connector to child */}
                 <div className="tree-line-vertical" style={{ top: 0, left: '50%', height: '1.5rem' }} />
                 {renderNode(child)}
               </div>
             ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '2rem' }}>
      {roots.map(root => renderNode(root))}
    </div>
  );
};

export default TreeLayout;

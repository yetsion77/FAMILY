import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import Topbar from './components/Topbar';
import TreeLayout from './components/TreeLayout';
import DetailsModal from './components/DetailsModal';
import { getFamilyMembers, addFamilyMember, updateFamilyMember, deleteFamilyMember } from './firebase/api';
import './index.css';

function App() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [people, setPeople] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [focusId, setFocusId] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const data = await getFamilyMembers();
    setPeople(data);
    
    if (!focusId && data.length > 0) setFocusId(data[0].id);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePersonClick = (person) => setSelectedPerson(person);
  const handleCloseModal = () => setSelectedPerson(null);
  
  const handleFocusTarget = (id) => {
    setFocusId(id);
  }

  const handleSavePerson = async (updatedData) => {
    let savedPerson;
    if (updatedData.id && people.find(p => p.id === updatedData.id)) {
      savedPerson = await updateFamilyMember(updatedData.id, updatedData);
    } else {
      savedPerson = await addFamilyMember(updatedData);
      
      if (savedPerson.spouseId) {
        const spouseObj = people.find(p => p.id === savedPerson.spouseId);
        if (spouseObj) {
          spouseObj.spouseId = savedPerson.id;
          await updateFamilyMember(spouseObj.id, spouseObj);
        }
      }
    }
    await loadData();
    setSelectedPerson(null);
    setFocusId(savedPerson.id);
  };

  const handleDeletePerson = async (id) => {
    const isConfirmed = window.confirm("האם אתה בטוח שברצונך למחוק דמות זו ולנתק אותה מהעץ לצמיתות?");
    if (!isConfirmed) return;
    
    const personToDelete = people.find(p => p.id === id);
    if (!personToDelete) return;

    // 1. Unlink Spouse
    if (personToDelete.spouseId) {
      const spouse = people.find(p => p.id === personToDelete.spouseId);
      if (spouse) {
        let updatedSpouse = { ...spouse };
        updatedSpouse.spouseId = null; // Unlink
        await updateFamilyMember(spouse.id, updatedSpouse);
      }
    }

    // 2. Unlink Children
    const children = people.filter(p => p.fatherId === id || p.motherId === id);
    for (const child of children) {
      let updatedChild = { ...child };
      if (updatedChild.fatherId === id) updatedChild.fatherId = null;
      if (updatedChild.motherId === id) updatedChild.motherId = null;
      await updateFamilyMember(child.id, updatedChild);
    }

    // Delete logically
    await deleteFamilyMember(id);
    
    setSelectedPerson(null);
    
    // Switch focus if we deleted the focused person
    if (focusId === id) {
       // Just pick the first available
       const remaining = people.filter(p => p.id !== id);
       setFocusId(remaining.length > 0 ? remaining[0].id : null);
    }
    
    await loadData();
  };

  const handleAddOriginPerson = () => {
    setSelectedPerson({
      name: '', gender: 'male', birthYear: '', deathYear: '', details: '', photoUrl: '',
      fatherId: null, motherId: null, spouseId: null, parentId: null
    });
  };

  const handleAddSpecificRelative = async (sourceId, relationType, newPersonData) => {
    const sourcePerson = people.find(p => p.id === sourceId);
    if (!sourcePerson) return;
    
    let newDoc = await addFamilyMember(newPersonData);
    let updatedSource = { ...sourcePerson };
    
    if (relationType === 'father') {
      updatedSource.fatherId = newDoc.id;
      await updateFamilyMember(updatedSource.id, updatedSource);
    } 
    else if (relationType === 'mother') {
      updatedSource.motherId = newDoc.id;
      await updateFamilyMember(updatedSource.id, updatedSource);
    }
    else if (relationType === 'spouse') {
      updatedSource.spouseId = newDoc.id;
      await updateFamilyMember(updatedSource.id, updatedSource);
      
      let updatedNewDoc = { ...newDoc, spouseId: updatedSource.id };
      await updateFamilyMember(updatedNewDoc.id, updatedNewDoc);
      
      const childrenToUpdate = people.filter(p => p.fatherId === sourceId || p.motherId === sourceId);
      for (const child of childrenToUpdate) {
        let childUpdated = { ...child };
        let madeChange = false;
        
        if (child.fatherId === sourceId && !child.motherId && newPersonData.gender === 'female') {
          childUpdated.motherId = newDoc.id; madeChange = true;
        } else if (child.motherId === sourceId && !child.fatherId && newPersonData.gender === 'male') {
          childUpdated.fatherId = newDoc.id; madeChange = true;
        } else if (child.fatherId === sourceId && !child.motherId) {
          childUpdated.motherId = newDoc.id; madeChange = true;
        } else if (child.motherId === sourceId && !child.fatherId) {
          childUpdated.fatherId = newDoc.id; madeChange = true;
        }

        if (madeChange) await updateFamilyMember(childUpdated.id, childUpdated);
      }
    }
    else if (relationType === 'child') {
      let childUpdate = { ...newDoc };
      if (sourcePerson.gender === 'male') {
        childUpdate.fatherId = sourceId;
        if (sourcePerson.spouseId) childUpdate.motherId = sourcePerson.spouseId;
      } else if (sourcePerson.gender === 'female') {
        childUpdate.motherId = sourceId;
        if (sourcePerson.spouseId) childUpdate.fatherId = sourcePerson.spouseId;
      } else {
        childUpdate.fatherId = sourceId;
      }
      await updateFamilyMember(childUpdate.id, childUpdate);
    }
    else if (relationType === 'sibling') {
      let siblingUpdate = { ...newDoc };
      if (sourcePerson.fatherId) siblingUpdate.fatherId = sourcePerson.fatherId;
      if (sourcePerson.motherId) siblingUpdate.motherId = sourcePerson.motherId;
      await updateFamilyMember(siblingUpdate.id, siblingUpdate);
    }

    await loadData();
    setSelectedPerson(null);
  };

  return (
    <div className="app-container">
      <Topbar isEditMode={isEditMode} setIsEditMode={setIsEditMode} />
      
      {isEditMode && people.length === 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <button className="primary-btn" onClick={handleAddOriginPerson}>
            <UserPlus size={18} /> התחל את עץ המשפחה החדש
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <h3>טוען את עץ המשפחה...</h3>
        </div>
      ) : (
        <section className="tree-container glass-card" style={{ overflow: 'auto' }}>
          {people.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              <h3>העץ ריק כרגע</h3>
              {isEditMode && <p>לחץ על "התחל" כדי להוסיף את הדמות הראשונה.</p>}
            </div>
          ) : (
            <TreeLayout people={people} onPersonClick={handlePersonClick} focusId={focusId} />
          )}
        </section>
      )}

      {selectedPerson && (
        <DetailsModal 
          person={selectedPerson} 
          onClose={handleCloseModal} 
          onSave={handleSavePerson}
          onDelete={handleDeletePerson}
          onQuickAdd={handleAddSpecificRelative}
          onFocusTarget={handleFocusTarget}
          isEditMode={isEditMode}
        />
      )}
    </div>
  );
}

export default App;

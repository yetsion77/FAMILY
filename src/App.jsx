import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import Topbar from './components/Topbar';
import TreeLayout from './components/TreeLayout';
import DetailsModal from './components/DetailsModal';
import { getFamilyMembers, addFamilyMember, updateFamilyMember } from './firebase/api';
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

  const handleAddOriginPerson = () => {
    setSelectedPerson({
      name: '', gender: 'male', birthYear: '', deathYear: '', details: '', photoUrl: '',
      fatherId: null, motherId: null, spouseId: null, parentId: null
    });
  };

  // מנגנון הוספת קרובים משודרג עם Smart Adoption
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
      // 1. קשר את בן הזוג המקורי לחדש
      updatedSource.spouseId = newDoc.id;
      await updateFamilyMember(updatedSource.id, updatedSource);
      
      // 2. קשר את בן הזוג החדש בחזרה למקורי
      let updatedNewDoc = { ...newDoc, spouseId: updatedSource.id };
      await updateFamilyMember(updatedNewDoc.id, updatedNewDoc);
      
      // 3. אימוץ שיוך אוטומטי - ילדים של המקור מקבלים את בן הזוג החדש
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
          onQuickAdd={handleAddSpecificRelative}
          onFocusTarget={handleFocusTarget}
          isEditMode={isEditMode}
        />
      )}
    </div>
  );
}

export default App;

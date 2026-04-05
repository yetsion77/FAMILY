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
    
    // Default focus to the first person if none set
    if (!focusId && data.length > 0) setFocusId(data[0].id);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePersonClick = (person) => {
    setSelectedPerson(person);
  };

  const handleCloseModal = () => {
    setSelectedPerson(null);
  };

  const handleFocusTarget = (id) => {
    setFocusId(id);
    setSelectedPerson(null);
  }

  const handleSavePerson = async (updatedData) => {
    let savedPerson;
    if (updatedData.id && people.find(p => p.id === updatedData.id)) {
      savedPerson = await updateFamilyMember(updatedData.id, updatedData);
    } else {
      savedPerson = await addFamilyMember(updatedData);
      
      // Update spouse bi-directionally if required
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
    setFocusId(savedPerson.id); // focus on newly edited person
  };

  const handleAddOriginPerson = () => {
    setSelectedPerson({
      name: '', birthYear: '', deathYear: '', details: '', photoUrl: '',
      fatherId: null, motherId: null, spouseId: null, parentId: null
    });
  };

  const handleQuickAdd = (sourcePersonId, relationType) => {
    const sourcePerson = people.find(p => p.id === sourcePersonId);
    let template = { name: '', birthYear: '', deathYear: '', details: '', photoUrl: '' };

    if (relationType === 'father') {
      // Create a father for source, so source's fatherId becomes the new id
      // Since new person needs to be created first, we provide a hook or we save directly?
      // Better: Create an empty instance ready to save. 
      // Link logic: When this template is saved, we must THEN update the sourcePerson. 
      // This requires special flag, so for simplicity we just auto-create a placeholder and then edit it!
      const doAutoLink = async async () => {
        const newDoc = await addFamilyMember({name: 'אבא של ' + sourcePerson.name, gender: 'male'});
        sourcePerson.fatherId = newDoc.id;
        await updateFamilyMember(sourcePerson.id, sourcePerson);
        await loadData();
        setSelectedPerson(newDoc); // open modal to fill details
      }
      doAutoLink();
      return;
    }

    if (relationType === 'mother') {
      const doAutoLink = async async () => {
        const newDoc = await addFamilyMember({name: 'אמא של ' + sourcePerson.name, gender: 'female'});
        sourcePerson.motherId = newDoc.id;
        await updateFamilyMember(sourcePerson.id, sourcePerson);
        await loadData();
        setSelectedPerson(newDoc);
      }
      doAutoLink();
      return;
    }

    if (relationType === 'spouse') {
      const doAutoLink = async async () => {
        const newDoc = await addFamilyMember({name: 'בן/בת זוג של ' + sourcePerson.name, spouseId: sourcePerson.id});
        sourcePerson.spouseId = newDoc.id;
        await updateFamilyMember(sourcePerson.id, sourcePerson);
        await loadData();
        setSelectedPerson(newDoc);
      }
      doAutoLink();
      return;
    }

    if (relationType === 'child') {
      const parentIsMale = true; // simplifying logic
      // In a real app we'd check gender, but let's just assign fatherId for now based on whoever clicked it.
      // Better: we can just use parentId legacy field, or fatherId arbitrarily.
      template.fatherId = sourcePerson.id;
      if (sourcePerson.spouseId) template.motherId = sourcePerson.spouseId; // assign both!
      setSelectedPerson(template); // opens modal for the child directly
      return;
    }

    if (relationType === 'sibling') {
      template.fatherId = sourcePerson.fatherId;
      template.motherId = sourcePerson.motherId;
      setSelectedPerson(template);
      return;
    }
  };

  return (
    <div className="app-container">
      <Topbar isEditMode={isEditMode} setIsEditMode={setIsEditMode} />
      
      {isEditMode && people.length === 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <button className="primary-btn" onClick={handleAddOriginPerson}>
            <UserPlus size={18} /> התחל את עץ המשפחה
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
          onQuickAdd={handleQuickAdd}
          onFocusTarget={handleFocusTarget}
          isEditMode={isEditMode}
        />
      )}
    </div>
  );
}

export default App;

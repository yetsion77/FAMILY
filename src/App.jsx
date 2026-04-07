import React from 'react';
import { UserPlus, Leaf } from 'lucide-react';
import Topbar from './components/Topbar';
import TreeLayout from './components/TreeLayout';
import DetailsModal from './components/DetailsModal';
import { getFamilyMembers, addFamilyMember, updateFamilyMember, deleteFamilyMember } from './firebase/api';
import './index.css';

function App() {
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
    }
    await loadData();
    // After creating a completely new initial person, just set focus
    if (!focusId) setFocusId(savedPerson.id);
    
    // We intentionally don't close the modal if they are just editing details, 
    // but the modal will manage its own internal visual state.
    // For origin person creation, we close it.
    if (!updatedData.id) setSelectedPerson(null);
  };

  const handleDeletePerson = async (id) => {
    const isConfirmed = window.confirm("האם אתה בטוח שברצונך למחוק דמות זו ולנתק אותה מהעץ לצמיתות?");
    if (!isConfirmed) return;
    
    const personToDelete = people.find(p => p.id === id);
    if (!personToDelete) return;

    if (personToDelete.spouseId) {
      const spouse = people.find(p => p.id === personToDelete.spouseId);
      if (spouse) {
        let updatedSpouse = { ...spouse };
        updatedSpouse.spouseId = null; 
        await updateFamilyMember(spouse.id, updatedSpouse);
      }
    }

    const children = people.filter(p => p.fatherId === id || p.motherId === id);
    for (const child of children) {
      let updatedChild = { ...child };
      if (updatedChild.fatherId === id) updatedChild.fatherId = null;
      if (updatedChild.motherId === id) updatedChild.motherId = null;
      await updateFamilyMember(child.id, updatedChild);
    }

    await deleteFamilyMember(id);
    setSelectedPerson(null);
    
    if (focusId === id) {
       const remaining = people.filter(p => p.id !== id);
       setFocusId(remaining.length > 0 ? remaining[0].id : null);
    }
    
    await loadData();
  };

  const handleAddOriginPerson = () => {
    // Open modal directly in "edit" mode for the very first person in the tree
    setSelectedPerson({
      name: '', gender: 'male', birthYear: '', deathYear: '', details: '', photoUrl: '',
      fatherId: null, motherId: null, spouseId: null, parentId: null,
      _isNewOrigin: true
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
    // Refresh selected person data so modal updates perfectly without closing
    setSelectedPerson({ ...updatedSource });
  };

  return (
    <div className="app-container">
      <Topbar />
      
      {people.length === 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <button className="primary-btn" onClick={handleAddOriginPerson} style={{ padding: '1rem 3rem', fontSize: '1.2rem' }}>
            <UserPlus size={24} /> יצירת שורש לעץ משפחה
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <Leaf size={48} className="spin-animation" style={{ marginBottom: '1rem' }} />
            <h3>טוען את עץ המשפחה...</h3>
          </div>
        </div>
      ) : (
        <section className="tree-container glass-card" style={{ overflow: 'auto' }}>
          {people.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '3rem' }}>
              <h3>העץ ריק כרגע</h3>
              <p>לחץ על הכפתור למעלה כדי להתחיל.</p>
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
        />
      )}
    </div>
  );
}

export default App;

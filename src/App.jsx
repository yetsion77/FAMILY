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
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const data = await getFamilyMembers();
    setPeople(data);
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

  const handleSavePerson = async (updatedData) => {
    if (updatedData.id && people.find(p => p.id === updatedData.id)) {
      await updateFamilyMember(updatedData.id, updatedData);
    } else {
      await addFamilyMember(updatedData);
    }
    await loadData();
    setSelectedPerson(null);
  };

  const handleAddPerson = () => {
    setSelectedPerson({
      name: '',
      birthYear: '',
      deathYear: '',
      details: '',
      photoUrl: '',
      parentId: null
    });
  };

  return (
    <div className="app-container">
      <Topbar isEditMode={isEditMode} setIsEditMode={setIsEditMode} />
      
      {isEditMode && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <button className="primary-btn" onClick={handleAddPerson}>
            <UserPlus size={18} /> הוסף איש חדש לעץ
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <h3>טוען את עץ המשפחה...</h3>
        </div>
      ) : (
        <section className="tree-container glass-card">
          {people.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              <h3>אין אנשים בעץ המשפחה עדיין.</h3>
              {isEditMode && <p>הוסיפו מישהו כדי להתחיל!</p>}
            </div>
          ) : (
            <TreeLayout people={people} onPersonClick={handlePersonClick} />
          )}
        </section>
      )}

      {selectedPerson && (
        <DetailsModal 
          person={selectedPerson} 
          onClose={handleCloseModal} 
          onSave={handleSavePerson}
          isEditMode={isEditMode}
        />
      )}
    </div>
  );
}

export default App;

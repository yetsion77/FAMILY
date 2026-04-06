import React, { useState } from 'react';
import { X, Save, Eye } from 'lucide-react';
import { uploadPhoto } from '../firebase/api';

const DetailsModal = ({ person, onClose, onSave, onQuickAdd, onFocusTarget, isEditMode }) => {
  const [formData, setFormData] = useState({ ...person });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // States for Quick Add Sub-form
  const [addingType, setAddingType] = useState(null);
  const [newRelData, setNewRelData] = useState({ name: '', gender: 'male' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoSelect = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    let updatedData = { ...formData };
    
    if (imageFile) {
      try {
        const url = await uploadPhoto(imageFile);
        updatedData.photoUrl = url;
      } catch (err) {
        alert("שגיאה בהעלאת התמונה");
      }
    }
    
    onSave(updatedData);
  };

  const initiateQuickAdd = (type, defaultGender) => {
    setAddingType(type);
    setNewRelData({ name: '', gender: defaultGender });
  };

  const submitQuickAdd = () => {
    if (!newRelData.name.trim()) return alert("חובה להזין שם");
    onQuickAdd(person.id, addingType, newRelData);
    setAddingType(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}><X /></button>
        
        {isEditMode ? (
          <div>
            <form onSubmit={handleSubmit}>
              <h2 style={{marginTop: '1rem', marginBottom: '1.5rem'}}>עריכת קרובים ופרטים</h2>
              
              <div className="form-group">
                <label className="form-label">שם מלא</label>
                <input type="text" name="name" className="form-input" value={formData.name || ''} onChange={handleChange} required />
              </div>
              
              <div className="form-group">
                <label className="form-label">מגדר (ישפיע צבע המסגרת)</label>
                <select name="gender" className="form-select" value={formData.gender || 'male'} onChange={handleChange}>
                  <option value="male">זכר</option>
                  <option value="female">נקבה</option>
                </select>
              </div>
              
              <div style={{display: 'flex', gap: '1rem', marginBottom: '1.5rem'}}>
                <div style={{flex: 1}}>
                  <label className="form-label">שנת לידה</label>
                  <input type="text" name="birthYear" className="form-input" value={formData.birthYear || ''} onChange={handleChange} />
                </div>
                <div style={{flex: 1}}>
                  <label className="form-label">שנת פטירה (אם רלוונטי)</label>
                  <input type="text" name="deathYear" className="form-input" value={formData.deathYear || ''} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">פרטים וסיפור חיים</label>
                <textarea name="details" className="form-textarea" rows="4" value={formData.details || ''} onChange={handleChange}></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">העלאת תמונה</label>
                <input type="file" accept="image/*" onChange={handlePhotoSelect} />
                {imageFile && <p style={{marginTop: '0.5rem', fontSize: '0.9rem', color: 'green'}}>תמונה נבחרה בהצלחה</p>}
              </div>

              <button type="submit" className="primary-btn" disabled={saving}>
                <Save size={18} /> {saving ? 'שומר...' : 'שמור איש זה'}
              </button>
            </form>

            {person.id && !addingType && (
               <div style={{ marginTop: '2.5rem', borderTop: '1px solid #cbd5e0', paddingTop: '1.5rem' }}>
                 <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>בניית העץ והוספת קרובים</h3>
                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                   <button type="button" className="mode-toggle" style={{background: '#718096'}} onClick={() => initiateQuickAdd('father', 'male')}>+ אבא</button>
                   <button type="button" className="mode-toggle" style={{background: '#718096'}} onClick={() => initiateQuickAdd('mother', 'female')}>+ אמא</button>
                   <button type="button" className="mode-toggle" style={{background: '#718096'}} onClick={() => initiateQuickAdd('spouse', person.gender === 'male' ? 'female' : 'male')}>+ בן/בת זוג</button>
                   <button type="button" className="mode-toggle" style={{background: '#718096'}} onClick={() => initiateQuickAdd('child', 'male')}>+ צאצא/ית</button>
                   <button type="button" className="mode-toggle" style={{background: '#718096'}} onClick={() => initiateQuickAdd('sibling', 'male')}>+ אח/ות</button>
                 </div>
               </div>
            )}

            {addingType && (
               <div style={{ marginTop: '2.5rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #cbd5e0', animation: 'scaleUp 0.2s forwards' }}>
                 <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>
                   יצירת {addingType === 'father' ? 'אבא' : addingType === 'mother' ? 'אמא' : addingType === 'spouse' ? 'בן/בת זוג' : addingType === 'child' ? 'ילד/ה' : 'אח/ות'}
                 </h3>
                 <div className="form-group">
                   <label className="form-label">שם</label>
                   <input type="text" className="form-input" value={newRelData.name} onChange={e => setNewRelData({...newRelData, name: e.target.value})} autoFocus placeholder="לדוגמה: משה כהן" />
                 </div>
                 
                 {/* Only show gender for sibling and child */}
                 {['child', 'sibling'].includes(addingType) && (
                   <div className="form-group">
                     <label className="form-label">מגדר</label>
                     <select className="form-select" value={newRelData.gender} onChange={e => setNewRelData({...newRelData, gender: e.target.value})}>
                       <option value="male">זכר</option>
                       <option value="female">נקבה</option>
                     </select>
                   </div>
                 )}
                 
                 <div style={{ display: 'flex', gap: '1rem' }}>
                   <button type="button" className="primary-btn" onClick={submitQuickAdd}>שמור וחבר לאילן</button>
                   <button type="button" className="mode-toggle" style={{ background: '#a0aec0' }} onClick={() => setAddingType(null)}>ביטול</button>
                 </div>
               </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{textAlign: 'center', marginBottom: '2rem'}}>
               <img 
                src={person.photoUrl || (person.gender === 'female' ? "https://api.dicebear.com/7.x/adventurer/svg?seed=" + person.name : "https://api.dicebear.com/7.x/avataaars/svg?seed=" + person.name)} 
                alt={person.name} 
                style={{
                  width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', 
                  border: person.gender === 'female' ? '6px solid pink' : person.gender === 'male' ? '6px solid lightblue' : '6px solid #e67e22'
                }}
              />
              <h2 style={{fontSize: '2rem', marginTop: '1rem'}}>{person.name}</h2>
              <p className="person-dates" style={{fontSize: '1rem', marginBottom: '1rem'}}>{person.birthYear} - {person.deathYear || 'עד 120'}</p>
              
              <button 
                onClick={() => { onFocusTarget(person.id); onClose(); }} 
                className="primary-btn" 
                style={{margin: '0 auto', display: 'flex', alignItems: 'center'}}
              >
                <Eye size={18} /> התמקד בעץ שלו
              </button>
            </div>
            
            <div style={{background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', lineHeight: '1.8'}}>
              <h3 style={{fontSize: '1.2rem', marginBottom: '1rem'}}>קריאה נוספת</h3>
              <p style={{whiteSpace: 'pre-wrap'}}>{person.details || "לא הוזנו פרטים עליו."}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailsModal;

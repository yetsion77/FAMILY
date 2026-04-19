import React, { useState } from 'react';
import { X, Save, Eye, Edit3 } from 'lucide-react';
import { uploadPhoto } from '../firebase/api';

const DetailsModal = ({ person, onClose, onSave, onDelete, onQuickAdd, onFocusTarget, onRemoveRelation }) => {
  const [formData, setFormData] = useState({ ...person });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [isEditingDetails, setIsEditingDetails] = useState(!person.id || person._isNewOrigin);

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
    setSaving(false);
    setIsEditingDetails(false);
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
        
        {/* UPPER VIEW: Personal Information Toggle */}
        <div style={{ marginBottom: '2.5rem' }}>
          {isEditingDetails ? (
            <form onSubmit={handleSubmit} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #cbd5e0' }}>
              <h2 style={{marginTop: '0', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>עריכת פרטי דמות</h2>
              
              <div className="form-group" style={{ textAlign: 'center', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                <label className="form-label">תמונה (אופציונלי)</label>
                {(imageFile || formData.photoUrl) && (
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', margin: '0.5rem auto 1rem', border: '2px solid #cbd5e0' }}>
                    <img src={imageFile ? URL.createObjectURL(imageFile) : formData.photoUrl} alt="תצוגה מקדימה" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handlePhotoSelect} className="form-input" style={{ padding: '0.5rem' }} />
              </div>

              <div className="form-group">
                <label className="form-label">שם מלא</label>
                <input type="text" name="name" className="form-input" value={formData.name || ''} onChange={handleChange} required />
              </div>
              
              <div className="form-group">
                <label className="form-label">מגדר (משפיע על עיצוב התא)</label>
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
                  <label className="form-label">שנת פטירה (השאר ריק אם חי)</label>
                  <input type="text" name="deathYear" className="form-input" value={formData.deathYear || ''} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">קורות חיים / מידע</label>
                <textarea name="details" className="form-textarea" rows="4" value={formData.details || ''} onChange={handleChange}></textarea>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                <input 
                  type="checkbox" 
                  id="preventAutoSpouseAssign"
                  style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
                  checked={formData.preventAutoSpouseAssign || false} 
                  onChange={(e) => setFormData({ ...formData, preventAutoSpouseAssign: e.target.checked })} 
                />
                <label htmlFor="preventAutoSpouseAssign" style={{ margin: 0, color: 'var(--text-color)', fontSize: '0.95rem', cursor: 'pointer' }}>
                  למקרים נדירים: מנע שיוך אוטומטי של בן/בת הזוג של ההורים כהורה לדמות זו
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1.5rem' }}>
                <button type="submit" className="primary-btn" disabled={saving}>
                  <Save size={18} /> {saving ? 'שומר...' : 'שמור שינויים לפרטים'}
                </button>
                {person.id && !person._isNewOrigin && (
                   <button type="button" className="mode-toggle" style={{ background: '#a0aec0' }} onClick={() => { setFormData({...person}); setIsEditingDetails(false); }}>ביטול</button>
                )}
                
                {person.id && !person._isNewOrigin && (
                  <button type="button" className="mode-toggle" style={{ background: '#e74c3c', marginLeft: 'auto' }} onClick={() => onDelete(person.id)}>
                    🗑️ הסר דמות
                  </button>
                )}
              </div>
            </form>
          ) : (
            <div style={{textAlign: 'center'}}>
              {person.photoUrl && (
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 1rem', border: '4px solid var(--card-bg)', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)' }}>
                  <img src={person.photoUrl} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <h2 style={{fontSize: '2.5rem', marginTop: '1rem', color: 'var(--primary-color)'}}>{person.name}</h2>
              {(person.birthYear?.trim() || person.deathYear?.trim()) ? (
                <p className="person-dates" style={{fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-muted)', direction: 'rtl'}}>
                  {person.birthYear?.trim() && !person.deathYear?.trim() ? 
                    `${person.gender === 'female' ? 'נולדה' : 'נולד'}: ${person.birthYear.trim()}` : 
                    `${person.birthYear?.trim() || '?'} - ${person.deathYear?.trim() || '?'}`
                  }
                </p>
              ) : null}
              
              {person.details && (
                <div style={{background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', lineHeight: '1.8', maxWidth: '600px', margin: '1rem auto' }}>
                  <p style={{whiteSpace: 'pre-wrap', textAlign: 'right'}}>{person.details}</p>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                <button 
                  onClick={() => { onFocusTarget(person.id); onClose(); }} 
                  className="primary-btn" 
                  style={{ display: 'flex', alignItems: 'center'}}
                >
                  <Eye size={18} /> התמקד בעץ שלו בצורה מורחבת
                </button>
                <button 
                  onClick={() => setIsEditingDetails(true)} 
                  className="mode-toggle" 
                  style={{ background: '#a0aec0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)'}}
                >
                  <Edit3 size={18} /> ערוך קורות חייו
                </button>
              </div>
            </div>
          )}
        </div>

        {/* LOWER VIEW: Relationship Building Hub */}
        {person.id && !person._isNewOrigin && (
           <div style={{ borderTop: '2px dashed #cbd5e0', paddingTop: '1.5rem' }}>
             <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)', textAlign: 'center' }}>בניית העץ: עורק קשרים</h3>
             <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
               {!person.fatherId ? (
                 <button type="button" className="mode-toggle" style={{background: '#718096'}} onClick={() => initiateQuickAdd('father', 'male')}>+ אבא</button>
               ) : (
                 <button type="button" className="mode-toggle" style={{background: '#e53e3e', fontSize: '0.85rem'}} onClick={() => onRemoveRelation(person.id, 'father')}>- נתק אבא</button>
               )}
               
               {!person.motherId ? (
                 <button type="button" className="mode-toggle" style={{background: '#718096'}} onClick={() => initiateQuickAdd('mother', 'female')}>+ אמא</button>
               ) : (
                 <button type="button" className="mode-toggle" style={{background: '#e53e3e', fontSize: '0.85rem'}} onClick={() => onRemoveRelation(person.id, 'mother')}>- נתק אמא</button>
               )}

               {!person.spouseId ? (
                 <button type="button" className="mode-toggle" style={{background: '#718096'}} onClick={() => initiateQuickAdd('spouse', person.gender === 'male' ? 'female' : 'male')}>+ בן/בת זוג</button>
               ) : (
                 <button type="button" className="mode-toggle" style={{background: '#e53e3e', fontSize: '0.85rem'}} onClick={() => onRemoveRelation(person.id, 'spouse')}>- נתק בן/בת זוג</button>
               )}
               
               <button type="button" className="mode-toggle" style={{background: '#718096'}} onClick={() => initiateQuickAdd('child', 'male')}>+ ילד/ה</button>
               <button type="button" className="mode-toggle" style={{background: '#718096'}} onClick={() => initiateQuickAdd('sibling', 'male')}>+ אח/ות</button>
             </div>
           </div>
        )}

        {addingType && (
           <div style={{ marginTop: '1.5rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #cbd5e0', animation: 'scaleUp 0.2s forwards' }}>
             <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>
               הוספת {addingType === 'father' ? 'אבא' : addingType === 'mother' ? 'אמא' : addingType === 'spouse' ? 'בן/בת זוג' : addingType === 'child' ? 'ילד/ה' : 'אח/ות'}
             </h3>
             <div className="form-group">
               <label className="form-label">שם הדמות</label>
               <input type="text" className="form-input" value={newRelData.name} onChange={e => setNewRelData({...newRelData, name: e.target.value})} autoFocus placeholder="הזן שם מלא..." />
             </div>
             
             {['child', 'sibling'].includes(addingType) && (
               <div className="form-group">
                 <label className="form-label">מגדר (להתאמת העיצוב)</label>
                 <select className="form-select" value={newRelData.gender} onChange={e => setNewRelData({...newRelData, gender: e.target.value})}>
                   <option value="male">זכר</option>
                   <option value="female">נקבה</option>
                 </select>
               </div>
             )}
             
             <div style={{ display: 'flex', gap: '1rem' }}>
               <button type="button" className="primary-btn" onClick={submitQuickAdd}>ייצר וחבר אוטומטית לעץ הקשרים</button>
               <button type="button" className="mode-toggle" style={{ background: '#a0aec0' }} onClick={() => setAddingType(null)}>ביטול</button>
             </div>
           </div>
        )}

      </div>
    </div>
  );
};

export default DetailsModal;

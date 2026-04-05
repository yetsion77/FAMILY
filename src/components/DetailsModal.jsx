import React, { useState } from 'react';
import { X, Save, Image as ImageIcon } from 'lucide-react';
import { uploadPhoto } from '../firebase/api';

const DetailsModal = ({ person, onClose, onSave, isEditMode }) => {
  const [formData, setFormData] = useState({ ...person });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

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
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}><X /></button>
        
        {isEditMode ? (
          <form onSubmit={handleSubmit}>
            <h2 style={{marginTop: '1rem', marginBottom: '1.5rem'}}>עריכת פרטים</h2>
            
            <div className="form-group">
              <label className="form-label">שם מלא</label>
              <input type="text" name="name" className="form-input" value={formData.name || ''} onChange={handleChange} required />
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
              <Save size={18} /> {saving ? 'שומר...' : 'שמור שינויים'}
            </button>
          </form>
        ) : (
          <div>
            <div style={{textAlign: 'center', marginBottom: '2rem'}}>
               <img 
                src={person.photoUrl || "https://api.dicebear.com/7.x/initials/svg?seed=" + person.name} 
                alt={person.name} 
                style={{width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--secondary-color)'}}
              />
              <h2 style={{fontSize: '2rem', marginTop: '1rem'}}>{person.name}</h2>
              <p className="person-dates" style={{fontSize: '1rem'}}>{person.birthYear} - {person.deathYear || 'ממשיך/ה לחיות'}</p>
            </div>
            
            <div style={{background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', lineHeight: '1.8'}}>
              <h3 style={{fontSize: '1.2rem', marginBottom: '1rem'}}>סיפור חיים</h3>
              <p>{person.details || "לא הוזנו פרטים עליו."}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailsModal;

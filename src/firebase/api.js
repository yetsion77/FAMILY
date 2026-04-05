import { db, storage } from './config';
import { ref as dbRef, get, set, push, update, child } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

export const getFamilyMembers = async () => {
  if (!db) return [];
  
  try {
    const snapshot = await get(child(dbRef(db), 'familyMembers'));
    if (snapshot.exists()) {
      const data = snapshot.val();
      // Convert object of keys to an array
      return Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};

export const addFamilyMember = async (memberData) => {
  if (!db) return null;

  try {
    const listRef = dbRef(db, 'familyMembers');
    const newMemberRef = push(listRef); // creates a unique ID
    await set(newMemberRef, memberData);
    return { id: newMemberRef.key, ...memberData };
  } catch (error) {
    console.error("Error adding member:", error);
    throw error;
  }
};

export const updateFamilyMember = async (id, updatedData) => {
  if (!db) return null;

  try {
    // Avoid saving the 'id' field to the database explicitly since the key itself is the id
    const dataToSave = { ...updatedData };
    delete dataToSave.id;

    const updates = {};
    updates['/familyMembers/' + id] = dataToSave;
    
    await update(dbRef(db), updates);
    return { id, ...dataToSave };
  } catch (error) {
    console.error("Error updating member:", error);
    throw error;
  }
};

export const uploadPhoto = async (file) => {
  if (!storage) return URL.createObjectURL(file);

  try {
    const sRef = storageRef(storage, `photos/${Date.now()}_${file.name}`);
    await uploadBytes(sRef, file);
    return await getDownloadURL(sRef);
  } catch (error) {
    console.error("Error uploading photo:", error);
    throw error;
  }
};

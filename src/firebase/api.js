import { db, storage } from './config';
import { ref as dbRef, get, set, push, update, child, remove } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

export const getFamilyMembers = async () => {
  if (!db) return [];
  try {
    const snapshot = await get(child(dbRef(db), 'familyMembers'));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};

export const addFamilyMember = async (memberData) => {
  if (!db) return null;
  try {
    const listRef = dbRef(db, 'familyMembers');
    const newMemberRef = push(listRef);
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

export const deleteFamilyMember = async (id) => {
  if (!db) return false;
  try {
    await remove(child(dbRef(db), 'familyMembers/' + id));
    return true;
  } catch (error) {
    console.error("Error deleting member:", error);
    throw error;
  }
};

const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = event => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          blob => {
            if (!blob) {
              reject(new Error('Canvas is empty'));
              return;
            }
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpeg", {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = error => reject(error);
    };
    reader.onerror = error => reject(error);
  });
};

export const uploadPhoto = async (file) => {
  try {
    const compressedFile = await compressImage(file);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result); // Returns base64 Data URL
      reader.onerror = reject;
      reader.readAsDataURL(compressedFile);
    });
  } catch (error) {
    console.error("Error converting photo to base64:", error);
    throw error;
  }
};

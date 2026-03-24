import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Uploads a file to Firebase Storage and returns the download URL
 * @param file The file object from input
 * @param userId The UID of the current user
 * @param folder The folder to upload to ('audio' or 'video')
 * @returns Promise with the download URL
 */
export async function uploadFile(file: File, userId: string, folder: 'audio' | 'video'): Promise<string> {
  const fileName = `${Date.now()}-${file.name}`;
  const fileRef = ref(storage, `users/${userId}/${folder}/${fileName}`);
  
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}

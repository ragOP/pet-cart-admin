
import { EncryptStorage } from "encrypt-storage";

const encryptionKey = import.meta.env.VITE_ENCRYPTION_KEY;

export const encryptStorage = new EncryptStorage(encryptionKey);

export const setItem = (payload) => {
  if (Object.keys(payload).length > 0) {
    let keys = Object.keys(payload);

    for (let i = 0; i < keys.length; i++) {
      encryptStorage.setItem(keys[i], payload[keys[i]]);
    }
  }
};

export const getItem = (string) => {
  try {
    return encryptStorage.getItem(string);
  } catch (error) {
    console.error(error);
  }
};

export const removeItem = (string) => {
  return encryptStorage.removeItem(string);
};
